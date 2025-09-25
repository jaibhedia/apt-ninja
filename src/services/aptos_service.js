import { Aptos, AptosConfig, Network, Account, AccountAddress, Hex, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { useWallet } from "../components/AptosWalletProvider";
import { useState, useEffect } from "react";

const APTOS_CONFIG = new AptosConfig({ network: Network.DEVNET });
const aptos = new Aptos(APTOS_CONFIG);

// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x28c71a033cda51eed025d933ae1627dd50541d548206523643d9114b3aad3efa";

// Hit type constants matching the Move contract
const HIT_TYPE_CORRECT = 0;
const HIT_TYPE_WRONG = 1;
const HIT_TYPE_MISS = 2;

// IMPORTANT: For a true gasless experience, a separate, funded account must pay for gas.
// This secret key should be stored securely on a backend server, not in the frontend.
// For testing, you can paste a private key here.

const FEE_PAYER_SECRET_KEY = process.env.REACT_APP_FEE_PAYER_SECRET_KEY; // Note: REACT_APP_ prefix for client-side env vars

// Initialize fee payer outside the hook
let feePayer = null;

console.log('Environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    FEE_PAYER_KEY_EXISTS: !!FEE_PAYER_SECRET_KEY,
    FEE_PAYER_KEY_LENGTH: FEE_PAYER_SECRET_KEY ? FEE_PAYER_SECRET_KEY.length : 0
});

try {
    if (FEE_PAYER_SECRET_KEY) {
        // Remove '0x' prefix if present and 'ed25519-priv-' prefix if present
        const cleanedKey = FEE_PAYER_SECRET_KEY.replace(/^(0x|ed25519-priv-0x|ed25519-priv-)/, '');
        console.log('Cleaned private key length:', cleanedKey.length);
        
        const privateKeyBytes = Hex.fromHexString(cleanedKey).toUint8Array();
        const privateKey = new Ed25519PrivateKey(privateKeyBytes);
        feePayer = Account.fromPrivateKey({ privateKey });
        console.log("Fee payer initialized:", feePayer.accountAddress.toString());
    } else {
        console.warn("FEE_PAYER_SECRET_KEY environment variable is not set.");
    }
} catch (error) {
    console.error("Failed to initialize fee payer:", error);
}

export const useAptosService = () => {
    const walletContext = useWallet();
    const { account, signAndSubmitTransaction } = walletContext;
    
    // Initialize state from localStorage to persist across re-renders
    const [sessionKey, setSessionKey] = useState(() => {
        try {
            const stored = localStorage.getItem('aptNinja_sessionKey');
            if (stored) {
                const keyData = JSON.parse(stored);
                console.log('Reconstructing session key from localStorage:', keyData);
                // Reconstruct the Account object from stored private key
                const privateKeyBytes = new Uint8Array(keyData.privateKey);
                const privateKey = new Ed25519PrivateKey(privateKeyBytes);
                const account = Account.fromPrivateKey({ privateKey });
                console.log('Successfully reconstructed session key:', account.accountAddress.toString());
                return account;
            }
        } catch (error) {
            console.error('Error loading session key from localStorage:', error);
            // Clear corrupted data
            localStorage.removeItem('aptNinja_sessionKey');
            localStorage.removeItem('aptNinja_isSessionAuthorized');
        }
        return null;
    });
    
    const [isSessionAuthorized, setIsSessionAuthorized] = useState(() => {
        return localStorage.getItem('aptNinja_isSessionAuthorized') === 'true';
    });

    // Effect to ensure state is properly synchronized on mount and account changes
    useEffect(() => {
        console.log('useEffect triggered - checking localStorage state');
        
        // Re-sync session authorization state
        const storedAuth = localStorage.getItem('aptNinja_isSessionAuthorized') === 'true';
        if (storedAuth !== isSessionAuthorized) {
            console.log('Syncing authorization state from localStorage:', storedAuth);
            setIsSessionAuthorized(storedAuth);
        }
        
        // Re-sync session key if missing but exists in localStorage
        if (!sessionKey && localStorage.getItem('aptNinja_sessionKey')) {
            console.log('Re-syncing session key from localStorage');
            try {
                const stored = localStorage.getItem('aptNinja_sessionKey');
                const keyData = JSON.parse(stored);
                const privateKeyBytes = new Uint8Array(keyData.privateKey);
                const privateKey = new Ed25519PrivateKey(privateKeyBytes);
                const account = Account.fromPrivateKey({ privateKey });
                console.log('Re-synced session key:', account.accountAddress.toString());
                setSessionKey(account);
            } catch (error) {
                console.error('Error re-syncing session key:', error);
                localStorage.removeItem('aptNinja_sessionKey');
                localStorage.removeItem('aptNinja_isSessionAuthorized');
            }
        }
        
        console.log('Current state after sync:', { 
            sessionKey: sessionKey ? sessionKey.accountAddress.toString() : null, 
            isSessionAuthorized,
            account: account ? account.address : null
        });
    }, [account, sessionKey, isSessionAuthorized]);

    /**
     * Creates a player profile on-chain if it doesn't exist.
     */
    const handleCreateProfile = async () => {
        console.log('handleCreateProfile called, account:', account);
        
        if (!account) {
            console.log('No account available, cannot create profile');
            alert('Please connect your wallet first before creating profile');
            return false;
        }

        try {
            // Check if profile already exists
            const profileExists = await checkProfileExists();
            if (profileExists) {
                console.log('Profile already exists for this account');
                return true;
            }

            const payload = {
                type: "entry_function_payload",
                function: `${CONTRACT_ADDRESS}::game::create_profile`,
                type_arguments: [],
                arguments: [],
            };

            console.log('Creating profile...');
            console.log('Transaction payload:', payload);
            
            const result = await signAndSubmitTransaction({ payload });
            
            console.log('Profile creation transaction submitted, hash:', result.hash);
            
            // Wait for transaction confirmation
            await aptos.waitForTransaction({ transactionHash: result.hash });
            
            console.log("Profile created successfully! Txn hash:", result.hash);
            return true;
            
        } catch (error) {
            console.error("Profile creation failed:", error);
            
            // Check if error is because profile already exists
            if (error.message && error.message.includes('PROFILE_ALREADY_EXISTS')) {
                console.log('Profile already exists (caught from error)');
                return true;
            }
            
            // Show user-friendly error message
            alert(`Profile creation failed: ${error.message || 'Unknown error'}`);
            return false;
        }
    };

    /**
     * Checks if a profile exists for the current account.
     */
    const checkProfileExists = async () => {
        if (!account) return false;

        try {
            const resource = await aptos.getAccountResource({
                accountAddress: account.address,
                resourceType: `${CONTRACT_ADDRESS}::game::Ninja`
            });
            return !!resource;
        } catch (error) {
            // If resource doesn't exist, it will throw an error
            console.log('Profile does not exist for this account');
            return false;
        }
    };

    /**
     * Called once to delegate signing authority to a temporary session key.
     */
    const handleAuthorizeSession = async () => {
        console.log('handleAuthorizeSession called, account:', account);
        console.log('Wallet connection details:', { account, connected: !!account });
        
        if (!account) {
            console.log('No account available, cannot authorize session');
            alert('Please connect your wallet first before authorizing session');
            return;
        }

        try {
            // First, ensure the profile exists (commented out since profile already exists)
            // const profileCreated = await handleCreateProfile();
            // if (!profileCreated) {
            //     console.log('Profile creation failed, cannot proceed with session authorization');
            //     return;
            // }
            
            // 1. Create a new, temporary account locally (this is the delegate)
            const newSessionKey = Account.generate();
            
            // Store session key in localStorage and state
            try {
                localStorage.setItem('aptNinja_sessionKey', JSON.stringify({
                    privateKey: Array.from(newSessionKey.privateKey.toUint8Array())
                }));
            } catch (error) {
                console.error('Error storing session key to localStorage:', error);
            }
            
            setSessionKey(newSessionKey);
            console.log("Generated Session Key Address:", newSessionKey.accountAddress.toString());

            // 2. Build the transaction to delegate authority to the new key
            const payload = {
                type: "entry_function_payload",
                function: `${CONTRACT_ADDRESS}::game::delegate_signer`,
                type_arguments: [],
                arguments: [
                    newSessionKey.accountAddress.toString(), // The address to authorize
                ],
            };

            console.log('Submitting delegation transaction...');
            console.log('Transaction payload:', payload);
            
            // 3. Player signs THIS ONE TRANSACTION to approve the delegation
            console.log('About to submit transaction with wallet...');
            const result = await signAndSubmitTransaction({ payload });
            
            console.log('Transaction submitted, hash:', result.hash);
            console.log('Waiting for transaction confirmation...');
            
            // 4. Wait for transaction confirmation
            const confirmedTx = await aptos.waitForTransaction({ transactionHash: result.hash });
            
            console.log("Transaction confirmed:", confirmedTx);
            console.log("Delegation successful! Txn hash:", result.hash);
            
            // Store authorization state in localStorage and state
            localStorage.setItem('aptNinja_isSessionAuthorized', 'true');
            setIsSessionAuthorized(true);
            
            console.log('Session authorization completed successfully:', {
                sessionKeyAddress: newSessionKey.accountAddress.toString(),
                isAuthorized: true
            });
            
        } catch (error) {
            console.error("Delegation failed:", error);
            console.error("Error details:", {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Reset session key on failure (both state and localStorage)
            localStorage.removeItem('aptNinja_sessionKey');
            localStorage.removeItem('aptNinja_isSessionAuthorized');
            setSessionKey(null);
            setIsSessionAuthorized(false);
            
            // More specific error messages
            let errorMessage = 'Unknown error';
            if (error.message) {
                if (error.message.includes('PROFILE_NOT_FOUND')) {
                    errorMessage = 'Profile not found. Please create a profile first.';
                } else if (error.message.includes('User rejected')) {
                    errorMessage = 'Transaction was rejected by user.';
                } else if (error.message.includes('insufficient funds')) {
                    errorMessage = 'Insufficient funds to complete transaction.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            // Show user-friendly error message
            alert(`Session authorization failed: ${errorMessage}`);
        }
    };

    /**
     * Starts a new game on-chain, signed by the session key.
     */
    const handleStartGame = async () => {
        console.log('=== HANDLE START GAME DEBUG ===');
        console.log('Account:', account ? account.address : 'NULL');
        console.log('Session Key:', sessionKey ? sessionKey.accountAddress.toString() : 'NULL');
        console.log('Is Authorized:', isSessionAuthorized);
        console.log('Fee Payer:', feePayer ? feePayer.accountAddress.toString() : 'NULL');
        console.log('Contract Address:', CONTRACT_ADDRESS);
        console.log('LocalStorage sessionKey:', localStorage.getItem('aptNinja_sessionKey') ? 'exists' : 'missing');
        console.log('LocalStorage isAuthorized:', localStorage.getItem('aptNinja_isSessionAuthorized'));
        
        if (!account || !sessionKey || !isSessionAuthorized) {
            const missing = [];
            if (!account) missing.push('account');
            if (!sessionKey) missing.push('sessionKey');
            if (!isSessionAuthorized) missing.push('authorization');
            alert(`Missing requirements: ${missing.join(', ')}`);
            return;
        }
        
        if (!feePayer) {
            console.error('Fee payer not initialized. Environment variables:', {
                NODE_ENV: process.env.NODE_ENV,
                HAS_FEE_PAYER_KEY: !!FEE_PAYER_SECRET_KEY,
                KEY_LENGTH: FEE_PAYER_SECRET_KEY ? FEE_PAYER_SECRET_KEY.length : 0
            });
            alert("Fee payer not initialized. Please check environment variables.");
            return;
        }
        
        console.log("Starting game with session key...");

        try {
            // Build transaction with explicit gas configuration
            const transaction = await aptos.transaction.build.simple({
                sender: sessionKey.accountAddress,
                withFeePayer: true,
                data: {
                    function: `${CONTRACT_ADDRESS}::game::start_game`,
                    functionArguments: [account.address],
                },
                options: {
                    gasUnitPrice: 100, // Explicit gas price
                    maxGasAmount: 10000, // Explicit gas limit
                }
            });

            console.log('Transaction built successfully:', {
                sender: sessionKey.accountAddress.toString(),
                function: `${CONTRACT_ADDRESS}::game::start_game`,
                arguments: [account.address]
            });

            // Sign with session key
            console.log('Signing with session key...');
            const senderAuthenticator = aptos.transaction.sign({ 
                signer: sessionKey, 
                transaction 
            });
            console.log('Session key signature completed');

            // Sign with fee payer
            console.log('Signing with fee payer...');
            const feePayerAuthenticator = aptos.transaction.signAsFeePayer({ 
                signer: feePayer, 
                transaction 
            });
            console.log('Fee payer signature completed');

            // Submit transaction
            console.log('Submitting sponsored transaction...');
            // 4. Submit
            const committedTransaction = await aptos.transaction.submit.simple({
                transaction,
                senderAuthenticator: senderAuthenticator,
                feePayerAuthenticator: feePayerAuthenticator,
            });

            console.log("Transaction submitted successfully! Hash:", committedTransaction.hash);

            // Wait for confirmation
            console.log('Waiting for transaction confirmation...');
            const confirmedTx = await aptos.waitForTransaction({ 
                transactionHash: committedTransaction.hash,
                options: {
                    timeoutSecs: 30, // 30 second timeout
                    checkSuccess: true
                }
            });
            
            console.log("Game started successfully! Transaction confirmed:", confirmedTx);
            alert(`Game started! Transaction: ${committedTransaction.hash}`);
            
        } catch (error) {
            console.error("=== START GAME ERROR ===");
            console.error("Error type:", error.constructor.name);
            console.error("Error message:", error.message);
            console.error("Error code:", error.code);
            console.error("Full error:", error);
            
            // Check for specific error types
            let userMessage = 'Unknown error';
            if (error.message) {
                if (error.message.includes('E_GAME_ALREADY_IN_PROGRESS') || error.message.includes('GAME_ALREADY_IN_PROGRESS')) {
                    userMessage = 'Game is already in progress. Please finish the current game before starting a new one.';
                    console.log('Game already in progress - not starting new game');
                    return; // Don't show alert for this case, just return
                } else if (error.message.includes('INSUFFICIENT_BALANCE')) {
                    userMessage = 'Fee payer has insufficient balance for gas fees';
                } else if (error.message.includes('INVALID_SIGNATURE')) {
                    userMessage = 'Invalid signature - please try reconnecting wallet';
                } else if (error.message.includes('SEQUENCE_NUMBER')) {
                    userMessage = 'Sequence number error - please wait and try again';
                } else if (error.message.includes('PROFILE_NOT_FOUND')) {
                    userMessage = 'Profile not found - please create profile first';
                } else if (error.message.includes('NOT_AUTHORIZED')) {
                    userMessage = 'Session not properly authorized';
                } else if (error.message.includes('GAME_ALREADY_ACTIVE')) {
                    userMessage = 'Game is already active';
                } else {
                    userMessage = error.message;
                }
            }
            
            alert(`Failed to start game: ${userMessage}`);
        }
    };

    /**
     * Records a hit on-chain, signed by the session key and paid for by the fee payer.
     */
    const handleSlashFruit = async (hitType, scoreChange) => {
        console.log('=== HANDLE SLASH FRUIT DEBUG ===');
        console.log('Input:', { hitType, scoreChange });
        console.log('Session authorized:', isSessionAuthorized);
        console.log('Session key exists:', !!sessionKey);
        console.log('Fee payer exists:', !!feePayer);
        
        if (!sessionKey || !account || !isSessionAuthorized) {
            console.error('Missing session requirements');
            alert("Session not authorized!");
            return;
        }

        if (!feePayer) {
            console.error("Fee payer not initialized");
            alert("Fee payer not available - cannot record hit");
            return;
        }

        try {
            // Validate and convert hit type
            let hitTypeU8 = parseInt(hitType);
            if (isNaN(hitTypeU8) || hitTypeU8 < 0 || hitTypeU8 > HIT_TYPE_MISS) {
                console.error('Invalid hit type:', hitType);
                hitTypeU8 = HIT_TYPE_MISS;
            }

            const scoreChangeU64 = Math.max(0, parseInt(scoreChange) || 0);

            console.log('Processed arguments:', { 
                hitTypeU8, 
                scoreChangeU64, 
                hitTypeString: hitTypeU8 === HIT_TYPE_CORRECT ? 'CORRECT' : 
                              hitTypeU8 === HIT_TYPE_WRONG ? 'WRONG' : 'MISS'
            });

            // Build transaction
            const transaction = await aptos.transaction.build.simple({
                sender: sessionKey.accountAddress,
                withFeePayer: true,
                data: {
                    function: `${CONTRACT_ADDRESS}::game::record_hit`,
                    functionArguments: [
                        account.address,
                        hitTypeU8,
                        scoreChangeU64,
                    ],
                },
                options: {
                    gasUnitPrice: 100,
                    maxGasAmount: 10000,
                }
            });

            console.log('Hit transaction built:', {
                function: `${CONTRACT_ADDRESS}::game::record_hit`,
                args: [account.address, hitTypeU8, scoreChangeU64]
            });

            // Sign and submit
            const senderAuthenticator = aptos.transaction.sign({ signer: sessionKey, transaction });
            const feePayerAuthenticator = aptos.transaction.signAsFeePayer({ signer: feePayer, transaction });

            const submittedTx = await aptos.transaction.submit.sponsoredTransaction({
                transaction,
                senderAuthenticator,
                feePayerAuthenticator,
            });
            
            console.log(`Hit recorded successfully! Hash: ${submittedTx.hash}`);
            
            // Optional: Wait for confirmation for important hits
            // await aptos.waitForTransaction({ transactionHash: submittedTx.hash });
            
        } catch (error) {
            console.error("=== SLASH FRUIT ERROR ===");
            console.error("Error details:", error);
            
            // Don't alert for hit recording errors as they happen frequently during gameplay
            // Just log them for debugging
            console.error(`Failed to record hit (type: ${hitType}, score: ${scoreChange}):`, error.message);
        }
    };

    /**
     * Concludes the game on-chain, requiring the PLAYER'S main wallet signature.
     */
    const handleEndGame = async () => {
        if (!account || !sessionKey || !isSessionAuthorized) {
            alert("Player not connected or session not active.");
            return;
        }

        const payload = {
            type: "entry_function_payload",
            function: `${CONTRACT_ADDRESS}::game::conclude_game`,
            type_arguments: [],
            arguments: [
                account.address, // The player's main address
            ],
        };

        try {
            const result = await signAndSubmitTransaction({ payload });
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Game concluded! Txn hash:", result.hash);
        } catch (error) {
            console.error("Failed to conclude game:", error);
            alert(`Failed to conclude game: ${error.message || 'Unknown error'}`);
        }
    };

    /**
     * Revokes the delegate's authority. Signed by the player's main wallet.
     */
    const handleRevokeSession = async () => {
        if (!account) return;

        const payload = {
            type: "entry_function_payload",
            function: `${CONTRACT_ADDRESS}::game::delegate_signer`,
            type_arguments: [],
            arguments: [AccountAddress.ZERO.toString()], // Delegate to the null address (0x0)
        };

        try {
            const result = await signAndSubmitTransaction({ payload });
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Session authority revoked! Txn hash:", result.hash);
            
            // Clear localStorage and state
            localStorage.removeItem('aptNinja_sessionKey');
            localStorage.removeItem('aptNinja_isSessionAuthorized');
            setIsSessionAuthorized(false);
            setSessionKey(null);
        } catch (error) {
            console.error("Revocation failed:", error);
        }
    };

    return {
        handleCreateProfile,
        checkProfileExists,
        handleAuthorizeSession,
        handleStartGame,
        handleSlashFruit,
        handleEndGame,
        handleRevokeSession,
        isSessionAuthorized,
        // Export hit type constants for use in other components
        HIT_TYPE_CORRECT,
        HIT_TYPE_WRONG,
        HIT_TYPE_MISS,
    };
}
