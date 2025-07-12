// Network configuration for different blockchain networks

require('dotenv').config();
const { getAccountsForNetwork } = require('./wallet-config');

const networks = {
  // Local development network
  hardhat: {
    chainId: 31337,
    gas: 8000000,
    gasPrice: 1000000000, // 1 gwei
    accounts: {
      mnemonic: "test test test test test test test test test test test junk",
      count: 20,
    },
  },

  // Ethereum Mainnet
  mainnet: {
    url: process.env.MAINNET_RPC_URL || "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    chainId: 1,
    gas: 8000000,
    gasPrice: 20000000000, // 20 gwei
    accounts: getAccountsForNetwork('mainnet'),
    confirmations: 2,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Goerli Testnet
  goerli: {
    url: process.env.GOERLI_RPC_URL || "https://goerli.infura.io/v3/YOUR_INFURA_KEY",
    chainId: 5,
    gas: 8000000,
    gasPrice: 10000000000, // 10 gwei
    accounts: getAccountsForNetwork('goerli'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },

  // Sepolia Testnet
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    chainId: 11155111,
    gas: 8000000,
    gasPrice: 10000000000, // 10 gwei
    accounts: getAccountsForNetwork('sepolia'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },

  // Polygon Mainnet
  polygon: {
    url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
    chainId: 137,
    gas: 8000000,
    gasPrice: 30000000000, // 30 gwei
    accounts: getAccountsForNetwork('polygon'),
    confirmations: 2,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Polygon Mumbai Testnet
  mumbai: {
    url: process.env.MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    gas: 8000000,
    gasPrice: 10000000000, // 10 gwei
    accounts: getAccountsForNetwork('mumbai'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },

  // Binance Smart Chain Mainnet
  bsc: {
    url: process.env.BSC_RPC_URL || "https://bsc-dataseed1.binance.org",
    chainId: 56,
    gas: 8000000,
    gasPrice: 5000000000, // 5 gwei
    accounts: getAccountsForNetwork('bsc'),
    confirmations: 2,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Binance Smart Chain Testnet
  bscTestnet: {
    url: process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    gas: 8000000,
    gasPrice: 10000000000, // 10 gwei
    accounts: getAccountsForNetwork('bscTestnet'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },

  // Arbitrum One
  arbitrum: {
    url: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc",
    chainId: 42161,
    gas: 8000000,
    gasPrice: 1000000000, // 1 gwei
    accounts: getAccountsForNetwork('arbitrum'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Optimism
  optimism: {
    url: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io",
    chainId: 10,
    gas: 8000000,
    gasPrice: 1000000000, // 1 gwei
    accounts: getAccountsForNetwork('optimism'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Hedera Mainnet
  hedera: {
    url: process.env.HEDERA_RPC_URL || "https://mainnet.hashio.io/api",
    chainId: 295,
    gas: 8000000,
    gasPrice: 500000000000, // 500 gwei (Hedera requires very high gas prices)
    accounts: getAccountsForNetwork('hedera'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: false,
  },

  // Hedera Testnet
  hederaTestnet: {
    url: process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api",
    chainId: 296,
    gas: 8000000,
    gasPrice: 500000000000, // 500 gwei (Hedera requires very high gas prices)
    accounts: getAccountsForNetwork('hederaTestnet'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },

  // Hedera Previewnet
  hederaPreviewnet: {
    url: process.env.HEDERA_PREVIEWNET_RPC_URL || "https://previewnet.hashio.io/api",
    chainId: 297,
    gas: 8000000,
    gasPrice: 500000000000, // 500 gwei (Hedera requires very high gas prices)
    accounts: getAccountsForNetwork('hederaPreviewnet'),
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: true,
  },
};

// Helper function to get network configuration
function getNetworkConfig(networkName) {
  const config = networks[networkName];
  if (!config) {
    throw new Error(`Network configuration not found for: ${networkName}`);
  }
  return config;
}

// Helper function to check if network is testnet
function isTestnet(networkName) {
  const testnets = ['goerli', 'sepolia', 'mumbai', 'bscTestnet', 'hederaTestnet', 'hederaPreviewnet', 'hardhat'];
  return testnets.includes(networkName);
}

// Helper function to get explorer URL
function getExplorerUrl(networkName) {
  const explorers = {
    mainnet: 'https://etherscan.io',
    goerli: 'https://goerli.etherscan.io',
    sepolia: 'https://sepolia.etherscan.io',
    polygon: 'https://polygonscan.com',
    mumbai: 'https://mumbai.polygonscan.com',
    bsc: 'https://bscscan.com',
    bscTestnet: 'https://testnet.bscscan.com',
    arbitrum: 'https://arbiscan.io',
    optimism: 'https://optimistic.etherscan.io',
    hedera: 'https://hashscan.io/mainnet',
    hederaTestnet: 'https://hashscan.io/testnet',
    hederaPreviewnet: 'https://hashscan.io/previewnet',
  };
  return explorers[networkName] || '';
}

module.exports = {
  networks,
  getNetworkConfig,
  isTestnet,
  getExplorerUrl,
};
