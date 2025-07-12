'use client'

import React, { useContext, useState, useEffect } from 'react'
import { HederaContext } from '../context/HederaContext'
import { AmazonContext } from '../context/AmazonContext'
import { FaCoins, FaExchangeAlt, FaInfoCircle, FaHistory } from 'react-icons/fa'
import { SiHedera } from 'react-icons/si'

const HederaIntegration = () => {
  const {
    hederaAccountId,
    hederaBalance,
    isHederaInitialized,
    hederaError,
    hederaTransactions,
    isLoadingHedera,
    refreshHederaBalance,
    queryTokenBalance,
    mintTokensHedera,
    transferHbarNative,
    getHederaAccountInfo,
    isNativeHederaAvailable,
    getNetworkConfig,
    currentNetwork,
  } = useContext(HederaContext)

  const { isHederaNetwork, chain, address } = useContext(AmazonContext)

  const [tokenBalance, setTokenBalance] = useState(null)
  const [accountInfo, setAccountInfo] = useState(null)
  const [mintAmount, setMintAmount] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const styles = {
    container: `bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto`,
    header: `flex items-center gap-3 mb-6 pb-4 border-b`,
    title: `text-2xl font-bold text-gray-800`,
    tabs: `flex gap-2 mb-6`,
    tab: `px-4 py-2 rounded-lg font-medium transition-colors`,
    activeTab: `bg-purple-600 text-white`,
    inactiveTab: `bg-gray-100 text-gray-600 hover:bg-gray-200`,
    section: `mb-6`,
    sectionTitle: `text-lg font-semibold mb-3 flex items-center gap-2`,
    card: `bg-gray-50 rounded-lg p-4 mb-4`,
    input: `w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500`,
    button: `bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50`,
    errorMsg: `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4`,
    successMsg: `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4`,
    infoBox: `bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg`,
  }

  // Fetch token balance when component mounts
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (isNativeHederaAvailable()) {
        try {
          const balance = await queryTokenBalance()
          setTokenBalance(balance)
        } catch (err) {
          console.error('Failed to fetch token balance:', err)
        }
      }
    }

    fetchTokenBalance()
  }, [isNativeHederaAvailable, queryTokenBalance])

  // Fetch account info
  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (hederaAccountId) {
        try {
          const info = await getHederaAccountInfo()
          setAccountInfo(info)
        } catch (err) {
          console.error('Failed to fetch account info:', err)
        }
      }
    }

    fetchAccountInfo()
  }, [hederaAccountId, getHederaAccountInfo])

  const handleMintTokens = async () => {
    if (!mintAmount || isNaN(mintAmount) || mintAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const amount = BigInt(mintAmount) * BigInt(10 ** 18) // Convert to wei
      const hbarAmount = parseFloat(mintAmount) * 0.1 // 0.1 HBAR per token
      
      const result = await mintTokensHedera(amount, hbarAmount)
      setSuccess(`Tokens minted successfully! Transaction ID: ${result.transactionId}`)
      setMintAmount('')
      
      // Refresh balances
      setTimeout(() => {
        refreshHederaBalance()
        queryTokenBalance().then(setTokenBalance)
      }, 3000)
    } catch (err) {
      setError(`Failed to mint tokens: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTransferHbar = async () => {
    if (!transferAmount || !transferTo || isNaN(transferAmount) || transferAmount <= 0) {
      setError('Please enter valid transfer details')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Note: This would require the user's private key, which is not available in a browser context
      // This is for demonstration purposes only
      setError('HBAR transfers require private key signing, which is not available in browser context. Use wallet-based transactions instead.')
    } catch (err) {
      setError(`Failed to transfer HBAR: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  if (!isHederaNetwork) {
    return (
      <div className={styles.container}>
        <div className={styles.infoBox}>
          <p>Switch to a Hedera network to access native Hedera features.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <SiHedera className="text-3xl text-purple-600" />
        <h2 className={styles.title}>Native Hedera Integration</h2>
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
          {currentNetwork?.toUpperCase()}
        </span>
      </div>

      {error && (
        <div className={styles.errorMsg}>
          {error}
          <button onClick={clearMessages} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {success && (
        <div className={styles.successMsg}>
          {success}
          <button onClick={clearMessages} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {hederaError && (
        <div className={styles.errorMsg}>
          Hedera SDK Error: {hederaError}
        </div>
      )}

      <div className={styles.tabs}>
        {['overview', 'tokens', 'transfers', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : styles.inactiveTab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FaInfoCircle />
              Account Information
            </h3>
            <div className={styles.card}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">EVM Address</p>
                  <p className="font-mono text-sm">{address || 'Not connected'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hedera Account ID</p>
                  <p className="font-mono text-sm">{hederaAccountId || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">HBAR Balance</p>
                  <p className="font-semibold">{hederaBalance?.hbar || '0'} HBAR</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">AC Token Balance</p>
                  <p className="font-semibold">{tokenBalance ? (BigInt(tokenBalance) / BigInt(10 ** 18)).toString() : '0'} AC</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <SiHedera />
              Hedera SDK Status
            </h3>
            <div className={styles.card}>
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${isHederaInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>{isHederaInitialized ? 'Connected' : 'Disconnected'}</span>
                <span className="text-sm text-gray-600">
                  {getNetworkConfig()?.name || 'Unknown Network'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FaCoins />
            Token Operations
          </h3>
          <div className={styles.card}>
            <h4 className="font-semibold mb-3">Mint Amazon Coins (Native Hedera)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Use native Hedera SDK to mint tokens. Rate: 0.1 HBAR per AC token.
            </p>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Amount to mint"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className={styles.input}
                disabled={!isNativeHederaAvailable() || isLoading}
              />
              <button
                onClick={handleMintTokens}
                disabled={!isNativeHederaAvailable() || isLoading || !mintAmount}
                className={styles.button}
              >
                {isLoading ? 'Minting...' : 'Mint Tokens'}
              </button>
            </div>
            {!isNativeHederaAvailable() && (
              <p className="text-sm text-red-600 mt-2">
                Native Hedera features not available. Ensure you're connected to a Hedera network.
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FaExchangeAlt />
            HBAR Transfers
          </h3>
          <div className={styles.card}>
            <h4 className="font-semibold mb-3">Transfer HBAR (Native Hedera)</h4>
            <p className="text-sm text-gray-600 mb-4">
              Transfer HBAR using native Hedera SDK. Note: Requires private key signing.
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Recipient Account ID (0.0.xxxxx)"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                className={styles.input}
                disabled={!isNativeHederaAvailable() || isLoading}
              />
              <input
                type="number"
                placeholder="Amount in HBAR"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className={styles.input}
                disabled={!isNativeHederaAvailable() || isLoading}
              />
              <button
                onClick={handleTransferHbar}
                disabled={!isNativeHederaAvailable() || isLoading || !transferAmount || !transferTo}
                className={styles.button}
              >
                {isLoading ? 'Transferring...' : 'Transfer HBAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FaHistory />
            Hedera Transaction History
          </h3>
          <div className={styles.card}>
            {hederaTransactions.length > 0 ? (
              <div className="space-y-3">
                {hederaTransactions.map((tx, index) => (
                  <div key={index} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{tx.type.toUpperCase()}</p>
                        <p className="text-sm text-gray-600">ID: {tx.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{tx.amount} {tx.type === 'mint' ? 'AC' : 'HBAR'}</p>
                        <p className={`text-sm ${tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No Hedera transactions yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HederaIntegration
