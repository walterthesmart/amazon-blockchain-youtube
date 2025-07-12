import amazonCoin from './AmazonCoin.json'
import {
  DEPLOYED_CONTRACT_ADDRESSES,
  getDeploymentInfo,
  getContractConfig,
  validateDeployments,
  getDeploymentSummary
} from './deployment-sync'

export const amazonAbi = amazonCoin.abi

// Network-specific contract addresses (synced from deployment files)
export const CONTRACT_ADDRESSES = DEPLOYED_CONTRACT_ADDRESSES

// Re-export deployment utilities for use in components
export {
  getDeploymentInfo,
  getContractConfig,
  validateDeployments,
  getDeploymentSummary
}

// Get contract address for current chain
export const getContractAddress = (chainId) => {
  return CONTRACT_ADDRESSES[chainId] || CONTRACT_ADDRESSES[296] // Default to Hedera Testnet
}

// Legacy export for backward compatibility
export const amazonCoinAddress = CONTRACT_ADDRESSES[296]

// Token configuration
export const TOKEN_DECIMALS = 18
export const TOKEN_SYMBOL = 'AC'
export const TOKEN_NAME = 'Amazon Coin'

// Network-specific pricing (in native currency) - synced with deployed contract
export const NETWORK_PRICING = {
  // Hedera Networks (HBAR pricing) - matches deployed contract exchange rate
  296: {
    tokenPrice: '0.0001', // 0.0001 HBAR per AC token (matches contract exchangeRate: 100000000000000)
    currency: 'HBAR',
    exchangeRate: '100000000000000', // From deployed contract
    decimals: 18,
  },
  295: {
    tokenPrice: '0.0001', // 0.0001 HBAR per AC token
    currency: 'HBAR',
    exchangeRate: '100000000000000',
    decimals: 18,
  },

  // Ethereum Networks (ETH pricing)
  11155111: {
    tokenPrice: '0.0001', // 0.0001 ETH per AC token
    currency: 'ETH',
    exchangeRate: '100000000000000',
    decimals: 18,
  },
  1: {
    tokenPrice: '0.0001', // 0.0001 ETH per AC token
    currency: 'ETH',
    exchangeRate: '100000000000000',
    decimals: 18,
  },

  // Development
  31337: {
    tokenPrice: '0.0001', // 0.0001 ETH per AC token
    currency: 'ETH',
    exchangeRate: '100000000000000',
    decimals: 18,
  },
}

// Get pricing for current network
export const getNetworkPricing = (chainId) => {
  return NETWORK_PRICING[chainId] || NETWORK_PRICING[296] // Default to Hedera Testnet
}

// Legacy export for backward compatibility
export const TOKEN_PRICE_ETH = '0.0001'

// Network type detection
export const isHederaNetwork = (chainId) => {
  return chainId === 295 || chainId === 296
}

export const isEthereumNetwork = (chainId) => {
  return chainId === 1 || chainId === 11155111
}

// Block explorer URLs
export const BLOCK_EXPLORERS = {
  296: 'https://hashscan.io/testnet',
  295: 'https://hashscan.io/mainnet',
  11155111: 'https://sepolia.etherscan.io',
  1: 'https://etherscan.io',
  31337: 'http://localhost:8545', // Local development
}

export const getBlockExplorerUrl = (chainId) => {
  return BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[296]
}

// Demo assets for the marketplace
export const DEMO_ASSETS = [
  {
    id: 1,
    name: 'Digital Art #1',
    price: '10',
    src: 'https://openseauserdata.com/files/3565db33a856b19f48396062e59e6d62.mp4',
    description: 'Exclusive digital artwork NFT',
  },
  {
    id: 2,
    name: 'Digital Art #2',
    price: '15',
    src: 'https://openseauserdata.com/files/89cba6f1544810aea19d78e664981d63.mp4',
    description: 'Limited edition digital collectible',
  },
  {
    id: 3,
    name: 'Digital Art #3',
    price: '20',
    src: 'https://openseauserdata.com/files/894fd3d49c7c258d202a22bb710a3416.mp4',
    description: 'Premium digital asset',
  },
  {
    id: 4,
    name: 'Digital Art #4',
    price: '25',
    src: 'https://openseauserdata.com/files/022c0aad904ddbd8884b12468aaaad28.mp4',
    description: 'Rare digital masterpiece',
  },
]

// Supported networks list
export const SUPPORTED_NETWORKS = [
  {
    chainId: 296,
    name: 'Hedera Testnet',
    currency: 'HBAR',
    type: 'testnet',
    isHedera: true,
  },
  {
    chainId: 295,
    name: 'Hedera Mainnet',
    currency: 'HBAR',
    type: 'mainnet',
    isHedera: true,
  },
  {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    currency: 'ETH',
    type: 'testnet',
    isEthereum: true,
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    type: 'mainnet',
    isEthereum: true,
  },
]
