import { useState } from 'react';

export function useWeb3() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectMetaMask = async () => {
    setError(null);
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        setAddress(accounts[0]);
        return accounts[0];
      } catch (err: any) {
        setError(err.message || 'Failed to connect MetaMask');
        return null;
      }
    } else {
      setError('MetaMask not installed');
      return null;
    }
  };

  const connectSolana = async () => {
    setError(null);
    if (typeof window !== 'undefined' && (window as any).solana && (window as any).solana.isPhantom) {
      try {
        const response = await (window as any).solana.connect();
        const pubKey = response.publicKey.toString();
        setAddress(pubKey);
        return pubKey;
      } catch (err: any) {
        setError(err.message || 'Failed to connect Phantom');
        return null;
      }
    } else {
      setError('Phantom wallet not installed');
      return null;
    }
  };

  return {
    address,
    error,
    connectMetaMask,
    connectSolana,
  };
}
