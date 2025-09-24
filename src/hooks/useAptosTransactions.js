import { useState, useCallback } from 'react';
import { useWallet } from '../components/AptosWalletProvider';

export const useAptosTransactions = () => {
  const { account, signAndSubmitTransaction, aptos } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAccountBalance = useCallback(async (accountAddress = account?.address) => {
    if (!accountAddress) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const resources = await aptos.account.getAccountResources({
        accountAddress: accountAddress
      });
      
      const coinResource = resources.find(
        (resource) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      
      if (coinResource) {
        return parseInt(coinResource.data.coin.value) / 100000000; // Convert from octas to APT
      }
      return 0;
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account?.address]);

  const getAccountInfo = useCallback(async (accountAddress = account?.address) => {
    if (!accountAddress) return null;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const accountInfo = await aptos.account.getAccountInfo({
        accountAddress: accountAddress
      });
      
      return accountInfo;
    } catch (err) {
      console.error('Error fetching account info:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account?.address]);

  const submitTransaction = useCallback(async (payload) => {
    if (!account || !signAndSubmitTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction to be processed
      const txnResult = await aptos.transaction.waitForTransaction({
        transactionHash: response.hash,
      });
      
      return txnResult;
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [account, signAndSubmitTransaction]);

  // Example function for creating a simple transfer transaction
  const transferAPT = useCallback(async (recipient, amount) => {
    const payload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [recipient, (amount * 100000000).toString()], // Convert APT to octas
    };

    return await submitTransaction(payload);
  }, [submitTransaction]);

  // Future: Function to submit high score to blockchain
  const submitHighScore = useCallback(async (score, gameId = "aptos_ninja") => {
    // This would be a custom Move module function
    // For now, we'll just simulate the transaction structure
    console.log('Would submit high score to blockchain:', { score, gameId, account: account?.address });
    
    // Example payload structure for a hypothetical high score contract
    /*
    const payload = {
      type: "entry_function_payload",
      function: "0x1::leaderboard::submit_score",
      type_arguments: [],
      arguments: [gameId, score.toString()],
    };
    
    return await submitTransaction(payload);
    */
    
    return { success: true, hash: 'mock-transaction-hash' };
  }, [account?.address]);

  return {
    account,
    getAccountBalance,
    getAccountInfo,
    transferAPT,
    submitHighScore,
    submitTransaction,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};