'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PublicKey } from '@solana/web3.js'
import Link from 'next/link'
import ReactConfetti from 'react-confetti'

export default function Home() {
  const params = useParams()
  const [walletAddress, setWalletAddress] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timer, setTimer] = useState(0)
  const [numerophileNumber, setNumerophileNumber] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiEnded, setConfettiEnded] = useState(false)
  const [username, setUsername] = useState('')
  const [phantomProfile, setPhantomProfile] = useState<any>(null)

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
    getTotalRecords()
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
      setShowConfetti(true)
      setConfettiEnded(false)
      setTimeout(() => {
        setShowConfetti(false)
        setConfettiEnded(true)
      }, 5000) // Hide confetti after 5 seconds
    } catch (err) {
      setError('An error occurred while fetching the wallet age.')
      console.error(err) // Log the error for debugging
    } finally {
      setLoading(false)
    }
  }

  const fetchPhantomProfile = async (username: string) => {
    setLoading(true)
    setError(null)
    setPhantomProfile(null)

    try {
      const response = await fetch('/api/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch Phantom profile')
      }

      const data = await response.json()
      setPhantomProfile(data)
      if (data.addresses && data.addresses['solana:101']) {
        setWalletAddress(data.addresses['solana:101'])
        await fetchWalletAge(data.addresses['solana:101'])
      } else {
        setError('No Solana address found for this username')
      }
    } catch (err) {
      setError('An error occurred while fetching the Phantom profile.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (username) {
      await fetchPhantomProfile(username)
    } else if (walletAddress) {
      if (!isValidSolanaAddress(walletAddress)) {
        setError('Please enter a valid Solana wallet address.')
        return
      }
      await fetchWalletAge(walletAddress)
    } else {
      setError('Please enter a username or wallet address.')
    }
  }

  const handleReset = () => {
    setWalletAddress('')
    setResult(null)
    setError(null)
    setUsername('')
    setPhantomProfile(null)
  }

  const getTotalRecords = async () => {
    const totalRecords = await fetch('/api/total')
    const data = await totalRecords.json()
    setNumerophileNumber(data.total)
  }
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      alert('Failed to copy to clipboard')
    }
  }

  const shareToX = () => {
    if (!result) return

    const text = `My Solana Wallet is ${result.ageInDays} days old! Check your wallet age at`
    const url = `https://solage.vercel.app`
    const dev = ' By @metasal_'

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}${encodeURIComponent(dev)}`

    window.open(twitterUrl, '_blank', 'noopener,noreferrer')
  }

  const replayConfetti = () => {
    setShowConfetti(true)
    setConfettiEnded(false)
    setTimeout(() => {
      setShowConfetti(false)
      setConfettiEnded(true)
    }, 5000)
  }

  const renderIcon = (icon: string) => {
    if (icon.startsWith('http')) {
      return <img src={icon} alt="Profile Icon" className="w-8 h-8 rounded-full" />;
    } else {
      return <span className="text-2xl">{icon}</span>;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24">
      {showConfetti && <ReactConfetti />}
      <Link href="/">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center">Solana Wallet Age Calculator</h1>
      </Link>
      {numerophileNumber > 0 && <div className='text-sm text-gray-500 p-2 italic'>You are Numerophile #{numerophileNumber + 1}</div>}
      {!params.wallet && (
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setWalletAddress('')
              setError(null)
            }}
            placeholder="Enter Phantom username"
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => {
              setWalletAddress(e.target.value)
              setUsername('')
              setError(null)
            }}
            placeholder="Or enter Solana wallet address"
            className="w-full p-2 mb-4 border rounded text-sm sm:text-base"
          />
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 text-sm sm:text-base"
              disabled={loading || (!username && !walletAddress)}
            >
              {loading ? 'Calculating...' : 'Calculate Age'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm sm:text-base"
              disabled={loading}
            >
              Reset
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          <i className='text-gray-600 text-center text-sm block mt-2'>Please be patient, it can take a while for OG wallets.</i>
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
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Results:</h2>
          <p className="text-sm sm:text-base">Wallet age: {result.ageInDays} days</p>
          <p className="text-sm sm:text-base">Oldest transaction date: {result.oldestTransactionDate}</p>
          <p className="text-sm sm:text-base break-words">
            Oldest transaction signature:
            <small
              className="cursor-pointer text-blue-500 hover:text-blue-700 ml-2"
              onClick={() => copyToClipboard(result.oldestTransactionSignature)}
              title="Click to copy"
            >
              {result.oldestTransactionSignature}
            </small>
          </p>
          <a
            className='text-blue-500 hover:underline text-sm sm:text-base'
            target="_blank"
            rel="noopener noreferrer"
            href={`https://solscan.io/tx/${result.oldestTransactionSignature}`}
          >
            View on Solscan
          </a>
          <p className="text-sm sm:text-base">Total transactions: {result.totalTransactions}</p>
          <p className="text-sm sm:text-base">Processing time: {result.processingTime} seconds</p>
          <div className="text-xs text-red-500 mt-4 italic"><strong>Disclaimer:</strong> Please run the process a couple of times just in case.</div>
          <button
            onClick={shareToX}
            className="mt-4 p-2 bg-blue-400 text-white rounded hover:bg-blue-500 text-sm sm:text-base"
          >
            Share to X
          </button>
          {confettiEnded && (
            <button
              onClick={replayConfetti}
              className="mt-4 ml-2 p-2 bg-green-400 text-white rounded hover:bg-green-500 text-sm sm:text-base"
            >
              Replay Confetti
            </button>
          )}
        </div>
      )}
      {phantomProfile && (
        <div className="mt-8 w-full max-w-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Phantom Profile:</h2>
          <div className="flex items-center mb-2">
            {renderIcon(phantomProfile.icon)}
            <p className="text-sm sm:text-base ml-2">Username: {phantomProfile.username}</p>
          </div>
          <p className="text-sm sm:text-base">ID: {phantomProfile.id}</p>
        </div>
      )}
      <footer className="text-xs p-5 text-center">
        Made by <a className="text-red-500 hover:underline" target="_blank" rel="noopener noreferrer" href="https://www.metasal.xyz">@metasal</a>
      </footer>

    </main>
  )
}