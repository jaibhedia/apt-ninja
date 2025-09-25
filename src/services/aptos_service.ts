import { Aptos, AptosConfig, Network, Account} from "@aptos-labs/ts-sdk";
import { useWallet, InputTransactionData as WalletInputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";

const APTOS_CONFIG = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(APTOS_CONFIG);

// TODO: Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xad94bb008073df8c8740d4474e52a6ddf226d3c84223e66fd861fb29810f073";

export function useAptosService() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [sessionKey, setSessionKey] = useState(null);
    const [isSessionAuthorized, setIsSessionAuthorized] = useState(false);

    /**
     * Called once at the start of the game session to delegate authority.
     */
    const handleAuthorizeSession = async () => {
        if (!account) return;

        // 1. Create a new, temporary account locally
        const newSessionKey = Account.generate();
        setSessionKey(newSessionKey);
        console.log("Generated Session Key:", newSessionKey.accountAddress);

        // 2. Build the transaction to delegate authority to this new key
        const transaction: WalletInputTransactionData = {
            data: {
                function: `${CONTRACT_ADDRESS}::game::delegate_session_key`,
                functionArguments: [
                    newSessionKey.accountAddress, // The key to authorize
                    300, // Authorize for 5 minutes (300 seconds)
                ],
            },
        };

        try {
            // 3. Player signs THIS ONE TRANSACTION to approve the session
            const result = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Session authorized! Txn hash:", result.hash);
            setIsSessionAuthorized(true);
            // Now you can start the game UI
        } catch (error) {
            console.error("Delegation failed:", error);
        }
    };

    /**
     * This function can be called to signal the start of a game.
     */
    const handleStartGame = async () => {
        if (!account || !isSessionAuthorized) {
            alert("Player not connected or session not active.");
            return;
        }
        console.log("Player is starting the game.");
        // You can add any on-chain logic for starting a game here if needed
    };

    /**
     * This function can be called repeatedly during gameplay without user prompts.
     * @param scoreChange - The change in score for this fruit cut.
     */
    const handleSlashFruit = async (scoreChange: number) => {
        if (!sessionKey || !account || !isSessionAuthorized) {
            alert("Session not authorized!");
            return;
        }
        console.log("Executing a hit with the session key...");

        const transaction = await aptos.transaction.build.simple({
            sender: sessionKey.accountAddress, // The SESSION KEY is the sender
            data: {
                function: `${CONTRACT_ADDRESS}::game::record_hit`,
                functionArguments: [
                    account.address, // Pass the player's main address for lookup
                    0, // hit_type
                    scoreChange, // score_change
                ],
            },
        });

        const authenticator = aptos.transaction.sign({ signer: sessionKey, transaction });
        const submittedTx = await aptos.transaction.submit.simple({ transaction, senderAuthenticator: authenticator });
        console.log("Hit recorded! Transaction hash:", submittedTx.hash);
    };

    /**
     * Called when the game ends to finalizessss the score on-chain.
     */
    const handleEndGame = async () => {
        if (!account || !isSessionAuthorized) {
            alert("Player not connected or session not active.");
            return;
        }
        console.log("Player is ending the game. Requesting final signature...");

        const transaction: WalletInputTransactionData = {
            data: {
                function: `${CONTRACT_ADDRESS}::game::conclude_game`,
                functionArguments: [], // This function takes no arguments
            },
        };

        try {
            // This MUST be signed by the player's main wallet via the adapter
            const result = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: result.hash });
            console.log("Game concluded and score recorded! Txn hash:", result.hash);

            // Reset the session state after the game is over
            setIsSessionAuthorized(false);
            setSessionKey(null);
        } catch (error) {
            console.error("Failed to conclude the game:", error);
        }
    };

    return {
        handleAuthorizeSession,
        handleStartGame,
        handleSlashFruit,
        handleEndGame,
        isSessionAuthorized,
    };
}
