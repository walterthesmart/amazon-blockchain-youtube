import { createContext, useState, useEffect, useCallback } from 'react'
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther, formatUnits } from 'viem'
import {
  amazonAbi,
  getContractAddress,
  getNetworkPricing,
  getBlockExplorerUrl,
  isHederaNetwork,
  isEthereumNetwork,
  DEMO_ASSETS,
  SUPPORTED_NETWORKS
} from '../lib/constants'

export const AmazonContext = createContext()

export const AmazonProvider = ({ children }) => {
  // Wallet connection state
  const { address, isConnected, chain } = useAccount()
  const { switchChain } = useSwitchChain()

  // Local state
  const [formattedAccount, setFormattedAccount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [amountDue, setAmountDue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [transactionLink, setTransactionLink] = useState('')
  const [nickname, setNickname] = useState('')
  const [username, setUsername] = useState('')
  const [assets, setAssets] = useState(DEMO_ASSETS)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [ownedItems, setOwnedItems] = useState([])
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [currentNetwork, setCurrentNetwork] = useState(null)
  const [networkPricing, setNetworkPricing] = useState(null)

  // Get current contract address based on chain
  const contractAddress = chain?.id ? getContractAddress(chain.id) : null

  // Wagmi hooks for contract interactions
  const { data: nativeBalance } = useBalance({
    address,
    enabled: !!address,
  })

  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: contractAddress,
    abi: amazonAbi,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address && !!contractAddress,
  })

  const { writeContract, data: hash, isPending: isWritePending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Network detection and setup
  useEffect(() => {
    if (chain?.id) {
      const networkInfo = SUPPORTED_NETWORKS.find(n => n.chainId === chain.id)
      setCurrentNetwork(networkInfo)

      const pricing = getNetworkPricing(chain.id)
      setNetworkPricing(pricing)

      console.log(`Connected to ${chain.name} (Chain ID: ${chain.id})`)
      console.log(`Contract Address: ${getContractAddress(chain.id)}`)
      console.log(`Network Type: ${isHederaNetwork(chain.id) ? 'Hedera' : 'Ethereum'}`)
    }
  }, [chain])

  // Format account address
  useEffect(() => {
    if (address) {
      const formatted = `${address.slice(0, 6)}...${address.slice(-4)}`
      setFormattedAccount(formatted)

      // Load user data from localStorage
      const savedUsername = localStorage.getItem(`username_${address}`)
      if (savedUsername) {
        setUsername(savedUsername)
      }

      const savedOwnedItems = localStorage.getItem(`ownedItems_${address}`)
      if (savedOwnedItems) {
        try {
          setOwnedItems(JSON.parse(savedOwnedItems))
        } catch (e) {
          console.error('Error parsing owned items:', e)
        }
      }
    } else {
      setFormattedAccount('')
      setUsername('')
      setOwnedItems([])
    }
  }, [address])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && chain?.id) {
      const explorerUrl = getBlockExplorerUrl(chain.id)
      const txUrl = `${explorerUrl}/tx/${hash}`
      setTransactionLink(txUrl)
      setSuccessMessage('Transaction successful!')
      setIsLoading(false)
      refetchTokenBalance()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [isConfirmed, hash, chain, refetchTokenBalance])

  // Handle errors
  useEffect(() => {
    if (writeError) {
      setError(writeError.message)
      setIsLoading(false)
      setTimeout(() => setError(null), 5000)
    }
  }, [writeError])

  // Calculate price when token amount changes
  useEffect(() => {
    if (tokenAmount && !isNaN(tokenAmount) && tokenAmount > 0 && networkPricing) {
      const price = (parseFloat(tokenAmount) * parseFloat(networkPricing.tokenPrice)).toFixed(6)
      setAmountDue(price)
    } else {
      setAmountDue('')
    }
  }, [tokenAmount, networkPricing])

  // Clear error and success messages
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage('')
  }, [])

  // Network switching function
  const switchToNetwork = useCallback(async (chainId) => {
    try {
      await switchChain({ chainId })
      setSuccessMessage(`Switched to ${SUPPORTED_NETWORKS.find(n => n.chainId === chainId)?.name}`)
    } catch (err) {
      setError(`Failed to switch network: ${err.message}`)
    }
  }, [switchChain])

  // Buy tokens function with Hedera support
  const buyTokens = useCallback(async () => {
    if (!address || !tokenAmount || isNaN(tokenAmount) || tokenAmount <= 0) {
      setError('Please enter a valid token amount')
      return
    }

    if (!contractAddress) {
      setError('Contract not deployed on this network')
      return
    }

    if (!networkPricing) {
      setError('Network pricing not available')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      clearMessages()

      const amount = parseUnits(tokenAmount.toString(), 18)
      const value = parseEther(amountDue)

      // Log transaction details for debugging
      console.log('Buying tokens:', {
        network: currentNetwork?.name,
        chainId: chain?.id,
        contractAddress,
        amount: tokenAmount,
        value: amountDue,
        currency: networkPricing.currency,
        isHedera: isHederaNetwork(chain?.id),
      })

      writeContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'mint',
        args: [amount],
        value,
      })
    } catch (err) {
      console.error('Error buying tokens:', err)
      setError(err.message || 'Failed to buy tokens')
      setIsLoading(false)
    }
  }, [address, tokenAmount, amountDue, contractAddress, networkPricing, currentNetwork, chain, writeContract, clearMessages])

  // Handle username setting
  const handleSetUsername = useCallback(() => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    if (!nickname.trim()) {
      setError("Username cannot be empty")
      return
    }

    try {
      localStorage.setItem(`username_${address}`, nickname.trim())
      setUsername(nickname.trim())
      setNickname('')
      setSuccessMessage('Username set successfully!')
    } catch (err) {
      setError('Failed to save username')
    }
  }, [address, nickname])

  // Get formatted token balance
  const getFormattedBalance = useCallback(() => {
    if (!tokenBalance) return '0'
    try {
      return formatUnits(tokenBalance, 18)
    } catch {
      return '0'
    }
  }, [tokenBalance])

  // Buy asset function
  const buyAsset = useCallback(async (price, asset) => {
    if (!address) {
      setError('Please connect your wallet first')
      return
    }

    if (!tokenBalance || BigInt(tokenBalance) < BigInt(parseUnits(price.toString(), 18))) {
      setError('Insufficient token balance')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // For demo purposes, we'll simulate the purchase
      // In a real app, you'd interact with a marketplace contract
      const purchasedItem = {
        ...asset,
        purchaseDate: Date.now(),
        transactionHash: `demo_${Date.now()}`,
        etherscanLink: `https://sepolia.etherscan.io/tx/demo_${Date.now()}`,
      }

      const updatedOwnedItems = [...ownedItems, purchasedItem]
      setOwnedItems(updatedOwnedItems)

      // Save to localStorage
      localStorage.setItem(`ownedItems_${address}`, JSON.stringify(updatedOwnedItems))

      setSuccessMessage(`Successfully purchased ${asset.name}!`)
      setIsLoading(false)
    } catch (err) {
      console.error('Error buying asset:', err)
      setError(err.message || 'Failed to purchase asset')
      setIsLoading(false)
    }
  }, [address, tokenBalance, ownedItems])

  // Get current network info
  const getCurrentNetwork = useCallback(() => {
    if (!chain) return null
    return {
      id: chain.id,
      name: chain.name,
      blockExplorer: chain.blockExplorers?.default?.url,
    }
  }, [chain])

  return (
    <AmazonContext.Provider
      value={{
        // Wallet connection
        address,
        isConnected: !!address,
        formattedAccount,
        chain,

        // Network information
        currentNetwork,
        networkPricing,
        isHederaNetwork: chain?.id ? isHederaNetwork(chain.id) : false,
        isEthereumNetwork: chain?.id ? isEthereumNetwork(chain.id) : false,
        contractAddress,

        // Token data
        balance: getFormattedBalance(),
        tokenBalance,
        nativeBalance,

        // UI state
        tokenAmount,
        setTokenAmount,
        amountDue,
        setAmountDue,
        isLoading: isLoading || isWritePending || isConfirming,
        error,
        successMessage,
        transactionLink,
        setTransactionLink,

        // User data
        nickname,
        setNickname,
        username,
        setUsername,
        handleSetUsername,

        // Assets and transactions
        assets,
        recentTransactions,
        ownedItems,

        // Functions
        buyTokens,
        buyAsset,
        clearMessages,
        getCurrentNetwork,
        switchToNetwork,

        // Utility functions
        getBalance: getFormattedBalance,
        refetchBalance: refetchTokenBalance,
        getBlockExplorerUrl: () => chain?.id ? getBlockExplorerUrl(chain.id) : null,
        getSupportedNetworks: () => SUPPORTED_NETWORKS,
      }}
    >
      {children}
    </AmazonContext.Provider>
  )
}
