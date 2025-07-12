// Network configuration for different blockchain networks

require('dotenv').config();

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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
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
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    confirmations: 1,
    timeoutBlocks: 200,
    skipDryRun: false,
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
  const testnets = ['goerli', 'sepolia', 'mumbai', 'bscTestnet', 'hardhat'];
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
  };
  return explorers[networkName] || '';
}

module.exports = {
  networks,
  getNetworkConfig,
  isTestnet,
  getExplorerUrl,
};
