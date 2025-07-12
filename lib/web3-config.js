import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains'

// Define Hedera custom chains
export const hederaTestnet = {
  id: 296,
  name: 'Hedera Testnet',
  network: 'hedera-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    public: { http: ['https://testnet.hashio.io/api'] },
    default: { http: ['https://testnet.hashio.io/api'] },
  },
  blockExplorers: {
    hashscan: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
    default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
  },
  testnet: true,
}

export const hederaMainnet = {
  id: 295,
  name: 'Hedera Mainnet',
  network: 'hedera-mainnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HBAR',
    symbol: 'HBAR',
  },
  rpcUrls: {
    public: { http: ['https://mainnet.hashio.io/api'] },
    default: { http: ['https://mainnet.hashio.io/api'] },
  },
  blockExplorers: {
    hashscan: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
    default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
  },
}

// Web3 configuration using RainbowKit with Hedera support
export const config = getDefaultConfig({
  appName: 'Amazon Blockchain',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [hederaTestnet, sepolia, hederaMainnet, mainnet, polygon, optimism, arbitrum, base],
  ssr: true, // Enable server-side rendering
})

// Supported networks with Hedera integration
export const supportedChains = {
  hederaTestnet: {
    id: 296,
    name: 'Hedera Testnet',
    network: 'hedera-testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'HBAR',
      symbol: 'HBAR',
    },
    rpcUrls: {
      public: { http: ['https://testnet.hashio.io/api'] },
      default: { http: ['https://testnet.hashio.io/api'] },
    },
    blockExplorers: {
      hashscan: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
      default: { name: 'HashScan', url: 'https://hashscan.io/testnet' },
    },
    isHedera: true,
    testnet: true,
  },
  hederaMainnet: {
    id: 295,
    name: 'Hedera Mainnet',
    network: 'hedera-mainnet',
    nativeCurrency: {
      decimals: 18,
      name: 'HBAR',
      symbol: 'HBAR',
    },
    rpcUrls: {
      public: { http: ['https://mainnet.hashio.io/api'] },
      default: { http: ['https://mainnet.hashio.io/api'] },
    },
    blockExplorers: {
      hashscan: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
      default: { name: 'HashScan', url: 'https://hashscan.io/mainnet' },
    },
    isHedera: true,
  },
  sepolia: {
    id: 11155111,
    name: 'Sepolia',
    network: 'sepolia',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://sepolia.infura.io/v3/'] },
      default: { http: ['https://sepolia.infura.io/v3/'] },
    },
    blockExplorers: {
      etherscan: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
      default: { name: 'Etherscan', url: 'https://sepolia.etherscan.io' },
    },
    isEthereum: true,
    testnet: true,
  },
  mainnet: {
    id: 1,
    name: 'Ethereum',
    network: 'homestead',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      public: { http: ['https://cloudflare-eth.com'] },
      default: { http: ['https://cloudflare-eth.com'] },
    },
    blockExplorers: {
      etherscan: { name: 'Etherscan', url: 'https://etherscan.io' },
      default: { name: 'Etherscan', url: 'https://etherscan.io' },
    },
    isEthereum: true,
  },
}

// Default chain for the application (Hedera Testnet for development)
export const defaultChain = hederaTestnet
