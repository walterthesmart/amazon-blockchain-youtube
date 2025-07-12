'use client'

import { createContext, useState, useEffect, useCallback, useContext } from 'react'
import { AmazonContext } from './AmazonContext'
import {
  initializeHederaClient,
  getAccountBalance,
  queryContract,
  executeContract,
  transferHbar,
  getTransactionDetails,
  getAccountInfo,
  evmAddressToAccountId,
  getCurrentNetworkConfig,
  HEDERA_NETWORKS,
} from '../lib/hedera-sdk'
import { ContractFunctionParameters, Hbar } from '@hashgraph/sdk'
import { isHederaNetwork, getContractAddress } from '../lib/constants'

export const HederaContext = createContext()

export const HederaProvider = ({ children }) => {
  // Get Web3 context for coordination
  const { address, chain, isConnected } = useContext(AmazonContext)
  
  // Hedera-specific state
  const [hederaAccountId, setHederaAccountId] = useState(null)
  const [hederaBalance, setHederaBalance] = useState(null)
  const [isHederaInitialized, setIsHederaInitialized] = useState(false)
  const [hederaClient, setHederaClient] = useState(null)
  const [hederaError, setHederaError] = useState(null)
  const [hederaTransactions, setHederaTransactions] = useState([])
  const [isLoadingHedera, setIsLoadingHedera] = useState(false)

  // Initialize Hedera client when on Hedera network
  useEffect(() => {
    const initializeHedera = async () => {
      if (!chain?.id || !isHederaNetwork(chain.id)) {
        setIsHederaInitialized(false)
        setHederaClient(null)
        return
      }

      try {
        setIsLoadingHedera(true)
        const network = chain.id === 296 ? 'testnet' : 'mainnet'
        const client = initializeHederaClient(network)
        setHederaClient(client)
        setIsHederaInitialized(true)
        setHederaError(null)
        
        console.log(`Hedera SDK initialized for ${network}`)
      } catch (error) {
        console.error('Failed to initialize Hedera SDK:', error)
        setHederaError(error.message)
        setIsHederaInitialized(false)
      } finally {
        setIsLoadingHedera(false)
      }
    }

    initializeHedera()
  }, [chain?.id])

  // Convert EVM address to Hedera Account ID
  useEffect(() => {
    const convertAddress = async () => {
      if (!address || !isHederaInitialized || !isHederaNetwork(chain?.id)) {
        setHederaAccountId(null)
        return
      }

      try {
        const accountId = await evmAddressToAccountId(address)
        setHederaAccountId(accountId)
        console.log(`EVM address ${address} mapped to Hedera Account ID: ${accountId}`)
      } catch (error) {
        console.error('Failed to convert EVM address to Account ID:', error)
        setHederaAccountId(null)
      }
    }

    convertAddress()
  }, [address, isHederaInitialized, chain?.id])

  // Get Hedera account balance
  const refreshHederaBalance = useCallback(async () => {
    if (!hederaAccountId || !isHederaInitialized) {
      return null
    }

    try {
      const balance = await getAccountBalance(hederaAccountId)
      setHederaBalance(balance)
      return balance
    } catch (error) {
      console.error('Failed to get Hedera balance:', error)
      setHederaError(error.message)
      return null
    }
  }, [hederaAccountId, isHederaInitialized])

  // Refresh balance when account changes
  useEffect(() => {
    if (hederaAccountId && isHederaInitialized) {
      refreshHederaBalance()
    }
  }, [hederaAccountId, isHederaInitialized, refreshHederaBalance])

  // Query Amazon Coin balance using native Hedera SDK
  const queryTokenBalance = useCallback(async () => {
    if (!hederaAccountId || !isHederaInitialized || !chain?.id) {
      return null
    }

    try {
      const contractAddress = getContractAddress(chain.id)
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network')
      }

      // Convert EVM address to Hedera contract ID format
      const contractId = contractAddress.replace('0x', '0.0.')
      
      const parameters = new ContractFunctionParameters()
        .addAddress(address)

      const result = await queryContract(contractId, 'balanceOf', parameters)
      
      // Parse the result (assuming it returns a uint256)
      const balance = result.getUint256(0)
      return balance.toString()
    } catch (error) {
      console.error('Failed to query token balance via Hedera SDK:', error)
      return null
    }
  }, [hederaAccountId, isHederaInitialized, chain?.id, address])

  // Execute token mint using native Hedera SDK
  const mintTokensHedera = useCallback(async (amount, hbarAmount) => {
    if (!hederaAccountId || !isHederaInitialized || !chain?.id) {
      throw new Error('Hedera not initialized')
    }

    try {
      setIsLoadingHedera(true)
      const contractAddress = getContractAddress(chain.id)
      if (!contractAddress) {
        throw new Error('Contract not deployed on this network')
      }

      // Convert EVM address to Hedera contract ID format
      const contractId = contractAddress.replace('0x', '0.0.')
      
      const parameters = new ContractFunctionParameters()
        .addUint256(amount)

      const payableAmount = Hbar.fromTinybars(hbarAmount * 100000000) // Convert HBAR to tinybars

      const result = await executeContract(
        contractId,
        'mint',
        parameters,
        300000, // gas limit
        payableAmount
      )

      // Add to transaction history
      const transaction = {
        id: result.transactionId,
        type: 'mint',
        amount: amount.toString(),
        hbarAmount: hbarAmount.toString(),
        timestamp: Date.now(),
        status: result.status,
        network: 'hedera',
      }
      
      setHederaTransactions(prev => [transaction, ...prev])
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshHederaBalance()
        queryTokenBalance()
      }, 3000)

      return result
    } catch (error) {
      console.error('Failed to mint tokens via Hedera SDK:', error)
      throw error
    } finally {
      setIsLoadingHedera(false)
    }
  }, [hederaAccountId, isHederaInitialized, chain?.id, refreshHederaBalance, queryTokenBalance])

  // Transfer HBAR between accounts
  const transferHbarNative = useCallback(async (toAccountId, amount, privateKey) => {
    if (!hederaAccountId || !isHederaInitialized) {
      throw new Error('Hedera not initialized')
    }

    try {
      setIsLoadingHedera(true)
      const result = await transferHbar(hederaAccountId, toAccountId, amount, privateKey)
      
      // Add to transaction history
      const transaction = {
        id: result.transactionId,
        type: 'transfer',
        from: hederaAccountId,
        to: toAccountId,
        amount: amount.toString(),
        timestamp: Date.now(),
        status: result.status,
        network: 'hedera',
      }
      
      setHederaTransactions(prev => [transaction, ...prev])
      
      // Refresh balance after successful transaction
      setTimeout(() => {
        refreshHederaBalance()
      }, 3000)

      return result
    } catch (error) {
      console.error('Failed to transfer HBAR:', error)
      throw error
    } finally {
      setIsLoadingHedera(false)
    }
  }, [hederaAccountId, isHederaInitialized, refreshHederaBalance])

  // Get transaction details
  const getHederaTransactionDetails = useCallback(async (transactionId) => {
    try {
      const details = await getTransactionDetails(transactionId)
      return details
    } catch (error) {
      console.error('Failed to get transaction details:', error)
      throw error
    }
  }, [])

  // Get account information
  const getHederaAccountInfo = useCallback(async (accountId = hederaAccountId) => {
    if (!accountId) {
      throw new Error('No account ID provided')
    }

    try {
      const info = await getAccountInfo(accountId)
      return info
    } catch (error) {
      console.error('Failed to get account info:', error)
      throw error
    }
  }, [hederaAccountId])

  // Check if current network supports native Hedera features
  const isNativeHederaAvailable = useCallback(() => {
    return isConnected && isHederaNetwork(chain?.id) && isHederaInitialized
  }, [isConnected, chain?.id, isHederaInitialized])

  // Get current network configuration
  const getNetworkConfig = useCallback(() => {
    if (!chain?.id || !isHederaNetwork(chain.id)) {
      return null
    }
    return getCurrentNetworkConfig()
  }, [chain?.id])

  const contextValue = {
    // State
    hederaAccountId,
    hederaBalance,
    isHederaInitialized,
    hederaClient,
    hederaError,
    hederaTransactions,
    isLoadingHedera,

    // Functions
    refreshHederaBalance,
    queryTokenBalance,
    mintTokensHedera,
    transferHbarNative,
    getHederaTransactionDetails,
    getHederaAccountInfo,
    isNativeHederaAvailable,
    getNetworkConfig,

    // Utilities
    supportedNetworks: Object.keys(HEDERA_NETWORKS),
    currentNetwork: chain?.id === 296 ? 'testnet' : chain?.id === 295 ? 'mainnet' : null,
  }

  return (
    <HederaContext.Provider value={contextValue}>
      {children}
    </HederaContext.Provider>
  )
}
