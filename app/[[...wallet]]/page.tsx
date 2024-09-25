'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import Link from 'next/link'

export default function Home() {
  const params = useParams()
  const [walletAddress, setWalletAddress] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)

  const isValidSolanaAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  }

  useEffect(() => {
    if (params.wallet) {
      setWalletAddress(Array.isArray(params.wallet) ? params.wallet[0] : params.wallet)
      fetchWalletAge(Array.isArray(params.wallet) ? params.wallet[0] : params.wallet)
    }
  }, [params.wallet])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (loading) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
    } else {
      setTimer(0)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [loading])

  const fetchWalletAge = async (address: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/wallet-age', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch wallet age')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('An error occurred while fetching the wallet age.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletAddress) {
      setError('Please enter a wallet address.')
      return
    }
    if (!isValidSolanaAddress(walletAddress)) {
      setError('Please enter a valid Solana wallet address.')
      return
    }
    await fetchWalletAge(walletAddress)
  }

  const handleReset = () => {
    setWalletAddress('')
    setResult(null)
    setError(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  const shareToX = () => {
    if (!result) return

    const text = `My Solana Wallet is ${result.ageInDays} days old! Check your wallet age at`
    const url = `https://solage.vercel.app`
    const dev = ' By @metasal_'

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${encodeURIComponent(dev)}`

    window.open(twitterUrl, '_blank')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Link href="/">
        <h1 className="text-4xl font-bold mb-8">Solana Wallet Age Calculator</h1>
      </Link>
      {!params.wallet && (
        <form onSubmit={handleSubmit} className="w-full max-w-full">
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value)
              setError(null) // Clear any previous error when input changes
            }}
            placeholder="Enter Solana wallet address"
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading || !walletAddress || !isValidSolanaAddress(walletAddress)}
            >
              {loading ? 'Calculating...' : 'Calculate Age'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Reset
            </button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <i className='text-gray-600 text-center'>Please be patient, it can take a while for OG wallets.</i>
        </form>
      )}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
          <p>Calculating... {timer} seconds elapsed</p>
          <p className="text-sm text-gray-500">Please be patient, it can take a while for OG wallets.</p>
        </div>
      )}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Results:</h2>
          <p>Wallet age: {result.ageInDays} days</p>
          <p>Oldest transaction date: {result.oldestTransactionDate}</p>
          <p>
            Oldest transaction signature:
            <small
              className="cursor-pointer text-blue-500 hover:text-blue-700"
              onClick={() => copyToClipboard(result.oldestTransactionSignature)}
              title="Click to copy"
            >
              {result.oldestTransactionSignature}
            </small>
          </p>
          <a className='text-blue-500' target="_blank" href={`https://solscan.io/tx/${result.oldestTransactionSignature}`}>View on Solscan</a>
          <p>Total transactions: {result.totalTransactions}</p>
          <p>Processing time: {result.processingTime} seconds</p>
          <button
            onClick={shareToX}
            className="mt-4 p-2 bg-blue-400 text-white rounded hover:bg-blue-500"
          >
            Share to X
          </button>
        </div>
      )}
      <footer className="text-xs p-5">Made by <a className="text-red-500" target="_blank" href={"https://www.metasal.xyz"}>@metasal</a></footer>

    </main>
  )
}