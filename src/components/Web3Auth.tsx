'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Web3Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const connectWallet = async () => {
    setLoading(true)
    setError('')

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        setError('MetaMask not detected. Please install MetaMask extension.')
        setLoading(false)
        return
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      const address = accounts[0]

      // Create message to sign
      const message = `Sign this message to authenticate with Piata AI.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`

      // Request signature
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address]
      })

      // Authenticate with Supabase
      const response = await fetch('/api/auth/web3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          signature,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Set Supabase session
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession(data.session);

      if (sessionError) {
        throw sessionError;
      }

      console.log('Web3 Connected:', { address, signature, user: data.user });
      
      // Refresh state using router
      router.refresh();

    } catch (err: any) {
      console.error('Web3 auth error:', err)
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={connectWallet}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.05 7.54a4.97 4.97 0 0 0-3.54-2.31 1.83 1.83 0 0 1-1.28-.67l-.22-.29a4.97 4.97 0 0 0-7.88 0l-.22.29a1.83 1.83 0 0 1-1.28.67 4.97 4.97 0 0 0-3.54 2.31 4.97 4.97 0 0 0-.54 4.18c.18.64.27 1.3.27 1.97 0 .67-.09 1.33-.27 1.97a4.97 4.97 0 0 0 .54 4.18 4.97 4.97 0 0 0 3.54 2.31c.47.1.89.35 1.21.71l.22.29a4.97 4.97 0 0 0 7.88 0l.22-.29c.32-.36.74-.61 1.21-.71a4.97 4.97 0 0 0 3.54-2.31 4.97 4.97 0 0 0 .54-4.18 6.47 6.47 0 0 1-.27-1.97c0-.67.09-1.33.27-1.97a4.97 4.97 0 0 0-.54-4.18zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/>
            </svg>
            Connect Web3 Wallet
          </>
        )}
      </button>

      {error && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-400 text-center">
        Supports MetaMask, WalletConnect, Coinbase Wallet, and more
      </div>
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
