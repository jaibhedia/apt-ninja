import { Aptos, AptosConfig, Network, Account, SimpleTransaction, AccountAddress, Hex, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData as WalletInputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

const APTOS_CONFIG = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(APTOS_CONFIG);

// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x28c71a033cda51eed025d933ae1627dd50541d548206523643d9114b3aad3efa";

// IMPORTANT: For a true gasless experience, a separate, funded account must pay for gas.
// This secret key should be stored securely on a backend server, not in the frontend.
// For testing, you can paste a private key here.

const FEE_PAYER_SECRET_KEY = process.env.FEE_PAYER_SECRET_KEY;

// 2. Add a check to ensure the variable is actually set.
if (!FEE_PAYER_SECRET_KEY) {
    throw new Error("FEE_PAYER_SECRET_KEY environment variable is not set. Please check your .env file.");
}

const privateKeyBytes = Hex.fromHexString(FEE_PAYER_SECRET_KEY).toUint8Array();

const privateKey = new Ed25519PrivateKey(privateKeyBytes)
const feePayer = Account.fromPrivateKey({ privateKey });


export const useAptosService = () => {
    const { account, signAndSubmitTransaction } = useWallet();
    const [sessionKey, setSessionKey] = useState(null);
    const [isSessionAuthorized, setIsSessionAuthorized] = useState(false);

    /**
     * Called once to delegate signing authority to a temporary session key.
     */
    const handleAuthorizeSession = async () => {
        if (!account) return;

        // 1. Create a new, temporary account locally (this is the delegate)
        const newSessionKey = Account.generate();
        setSessionKey(newSessionKey);
        console.log("Generated Session Key Address:", newSessionKey.accountAddress.toString());

        // 2. Build the transaction to delegate authority to the new key
        const transaction: WalletInputTransactionData = {
            data: {
                function: `${CONTRACT_ADDRESS}::game::delegate_signer`,
                functionArguments: [
                    newSessionKey.accountAddress.toString(), // The address to authorize
                ],
            },
        };

        try {
            // 3. Player signs THIS ONE TRANSACTION to approve the delegation
            const result = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Delegation successful! Txn hash:", result.hash);
            setIsSessionAuthorized(true);
        } catch (error) {
            console.error("Delegation failed:", error);
        }
    };

    /**
     * Starts a new game on-chain, signed by the session key.
     */
    const handleStartGame = async () => {
        if (!account || !sessionKey || !isSessionAuthorized) {
            alert("Player not connected or session not authorized.");
            return;
        }
        console.log("Starting game with session key...");

        const transaction = await aptos.transaction.build.simple({
            sender: sessionKey.accountAddress, // The SESSION KEY is the sender
            withFeePayer: true, // IMPORTANT: Specify that a fee payer will be used
            data: {
                function: `${CONTRACT_ADDRESS}::game::start_game`,
                functionArguments: [
                    account.address, // The player's main address
                ],
            },
        });

        try {
            // Sign the transaction with both the session key and the fee payer
            const senderAuthenticator = aptos.transaction.sign({ signer: sessionKey, transaction });
            const feePayerAuthenticator = aptos.transaction.signAsFeePayer({ signer: feePayer, transaction });

            const submittedTx = await aptos.transaction.submit.multiAgent({
                transaction,
                senderAuthenticator,
                additionalSignersAuthenticators: [feePayerAuthenticator],
            });

            console.log("Game started! Transaction hash:", submittedTx.hash);
        } catch (error) {
            console.error("Failed to start game:", error);
        }
    };

    /**
     * Records a hit on-chain, signed by the session key and paid for by the fee payer.
     */
    const handleSlashFruit = async (hitType: number, scoreChange: number) => {
        if (!sessionKey || !account || !isSessionAuthorized) {
            alert("Session not authorized!");
            return;
        }

        const transaction = await aptos.transaction.build.simple({
            sender: sessionKey.accountAddress, // The SESSION KEY is the sender
            withFeePayer: true, // Specify that a fee payer will be used
            data: {
                function: `${CONTRACT_ADDRESS}::game::record_hit`,
                functionArguments: [
                    account.address, // Pass the player's main address
                    hitType,
                    scoreChange,
                ],
            },
        });

        try {
            const senderAuthenticator = aptos.transaction.sign({ signer: sessionKey, transaction });
            const feePayerAuthenticator = aptos.transaction.signAsFeePayer({ signer: feePayer, transaction });

            const submittedTx = await aptos.transaction.submit.multiAgent({
                transaction,
                senderAuthenticator,
                additionalSignersAuthenticators: [feePayerAuthenticator],
            });
            console.log(`Hit recorded (type: ${hitType})! Txn hash:`, submittedTx.hash);
        } catch (error) {
            console.error("Failed to record hit:", error);
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

        const transaction: WalletInputTransactionData = {
            data: {
                function: `${CONTRACT_ADDRESS}::game::conclude_game`,
                functionArguments: [
                    account.address, // The player's main address
                ],
            },
        };

        try {
            const result = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Game concluded! Txn hash:", result.hash);
        } catch (error) {
            console.error("Failed to conclude game:", error);
        }
    };

    /**
     * Revokes the delegate's authority. Signed by the player's main wallet.
     */
    const handleRevokeSession = async () => {
        if (!account) return;

        const transaction: WalletInputTransactionData = {
            data: {
                function: `${CONTRACT_ADDRESS}::game::delegate_signer`,
                functionArguments: [AccountAddress.ZERO.toString()], // Delegate to the null address (0x0)
            },
        };

        try {
            const result = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Session authority revoked! Txn hash:", result.hash);
            setIsSessionAuthorized(false);
            setSessionKey(null);
        } catch (error) {
            console.error("Revocation failed:", error);
        }
    };

    return {
        handleAuthorizeSession,
        handleStartGame,
        handleSlashFruit,
        handleEndGame,
        handleRevokeSession, // Expose the revoke function
        isSessionAuthorized,
    };
};
