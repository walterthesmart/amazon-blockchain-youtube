const { ethers } = require("hardhat");

/**
 * Get network-specific configuration and utilities
 */

// Network configurations
const NETWORK_CONFIGS = {
  // Mainnets
  mainnet: {
    name: "Ethereum Mainnet",
    chainId: 1,
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    isTestnet: false,
    gasPrice: ethers.parseUnits("20", "gwei"),
    confirmations: 2,
  },
  polygon: {
    name: "Polygon Mainnet",
    chainId: 137,
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    isTestnet: false,
    gasPrice: ethers.parseUnits("30", "gwei"),
    confirmations: 2,
  },
  bsc: {
    name: "Binance Smart Chain",
    chainId: 56,
    currency: "BNB",
    explorerUrl: "https://bscscan.com",
    isTestnet: false,
    gasPrice: ethers.parseUnits("5", "gwei"),
    confirmations: 2,
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    currency: "ETH",
    explorerUrl: "https://arbiscan.io",
    isTestnet: false,
    gasPrice: ethers.parseUnits("1", "gwei"),
    confirmations: 1,
  },
  optimism: {
    name: "Optimism",
    chainId: 10,
    currency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    isTestnet: false,
    gasPrice: ethers.parseUnits("1", "gwei"),
    confirmations: 1,
  },

  // Hedera Networks
  hedera: {
    name: "Hedera Mainnet",
    chainId: 295,
    currency: "HBAR",
    explorerUrl: "https://hashscan.io/mainnet",
    isTestnet: false,
    gasPrice: ethers.parseUnits("50", "gwei"), // Higher gas price for Hedera
    confirmations: 1,
  },

  // Testnets
  goerli: {
    name: "Goerli Testnet",
    chainId: 5,
    currency: "GoerliETH",
    explorerUrl: "https://goerli.etherscan.io",
    isTestnet: true,
    gasPrice: ethers.parseUnits("10", "gwei"),
    confirmations: 1,
  },
  sepolia: {
    name: "Sepolia Testnet",
    chainId: 11155111,
    currency: "SepoliaETH",
    explorerUrl: "https://sepolia.etherscan.io",
    isTestnet: true,
    gasPrice: ethers.parseUnits("10", "gwei"),
    confirmations: 1,
  },
  mumbai: {
    name: "Polygon Mumbai",
    chainId: 80001,
    currency: "MATIC",
    explorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true,
    gasPrice: ethers.parseUnits("10", "gwei"),
    confirmations: 1,
  },
  bscTestnet: {
    name: "BSC Testnet",
    chainId: 97,
    currency: "tBNB",
    explorerUrl: "https://testnet.bscscan.com",
    isTestnet: true,
    gasPrice: ethers.parseUnits("10", "gwei"),
    confirmations: 1,
  },

  hederaTestnet: {
    name: "Hedera Testnet",
    chainId: 296,
    currency: "HBAR",
    explorerUrl: "https://hashscan.io/testnet",
    isTestnet: true,
    gasPrice: ethers.parseUnits("50", "gwei"), // Higher gas price for Hedera
    confirmations: 1,
  },
  hederaPreviewnet: {
    name: "Hedera Previewnet",
    chainId: 297,
    currency: "HBAR",
    explorerUrl: "https://hashscan.io/previewnet",
    isTestnet: true,
    gasPrice: ethers.parseUnits("50", "gwei"), // Higher gas price for Hedera
    confirmations: 1,
  },

  // Local
  hardhat: {
    name: "Hardhat Local",
    chainId: 31337,
    currency: "ETH",
    explorerUrl: "",
    isTestnet: true,
    gasPrice: ethers.parseUnits("1", "gwei"),
    confirmations: 1,
  },
};

/**
 * Get configuration for a specific network
 * @param {string} networkName - Name of the network
 * @returns {object} Network configuration
 */
function getNetworkConfig(networkName) {
  const config = NETWORK_CONFIGS[networkName];
  if (!config) {
    throw new Error(`Network configuration not found for: ${networkName}`);
  }
  return config;
}

/**
 * Check if a network is a testnet
 * @param {string} networkName - Name of the network
 * @returns {boolean} True if testnet, false if mainnet
 */
function isTestnet(networkName) {
  const config = getNetworkConfig(networkName);
  return config.isTestnet;
}

/**
 * Get explorer URL for a network
 * @param {string} networkName - Name of the network
 * @returns {string} Explorer URL
 */
function getExplorerUrl(networkName) {
  const config = getNetworkConfig(networkName);
  return config.explorerUrl;
}

/**
 * Get contract URL on block explorer
 * @param {string} networkName - Name of the network
 * @param {string} contractAddress - Contract address
 * @returns {string} Full URL to contract on explorer
 */
function getContractUrl(networkName, contractAddress) {
  const explorerUrl = getExplorerUrl(networkName);
  if (!explorerUrl) return "";
  return `${explorerUrl}/address/${contractAddress}`;
}

/**
 * Get transaction URL on block explorer
 * @param {string} networkName - Name of the network
 * @param {string} txHash - Transaction hash
 * @returns {string} Full URL to transaction on explorer
 */
function getTransactionUrl(networkName, txHash) {
  const explorerUrl = getExplorerUrl(networkName);
  if (!explorerUrl) return "";
  return `${explorerUrl}/tx/${txHash}`;
}

/**
 * Format address for display
 * @param {string} address - Ethereum address
 * @param {number} length - Number of characters to show on each side
 * @returns {string} Formatted address
 */
function formatAddress(address, length = 6) {
  if (!address) return "";
  if (address.length <= length * 2 + 2) return address;
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`;
}

/**
 * Format token amount for display
 * @param {string|BigNumber} amount - Token amount
 * @param {number} decimals - Token decimals
 * @param {number} precision - Display precision
 * @returns {string} Formatted amount
 */
function formatTokenAmount(amount, decimals = 18, precision = 4) {
  const formatted = ethers.formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  return num.toFixed(precision).replace(/\.?0+$/, "");
}

/**
 * Format Ether amount for display
 * @param {string|BigNumber} amount - Ether amount in wei
 * @param {number} precision - Display precision
 * @returns {string} Formatted amount
 */
function formatEther(amount, precision = 4) {
  const formatted = ethers.formatEther(amount);
  const num = parseFloat(formatted);
  return num.toFixed(precision).replace(/\.?0+$/, "");
}

/**
 * Wait for transaction confirmation
 * @param {object} tx - Transaction object
 * @param {number} confirmations - Number of confirmations to wait for
 * @returns {Promise<object>} Transaction receipt
 */
async function waitForConfirmation(tx, confirmations = 1) {
  console.log(`⏳ Waiting for ${confirmations} confirmation(s)...`);
  const receipt = await tx.wait(confirmations);
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Estimate gas with buffer
 * @param {object} contract - Contract instance
 * @param {string} method - Method name
 * @param {array} args - Method arguments
 * @param {number} buffer - Gas buffer percentage (default 20%)
 * @returns {Promise<BigNumber>} Estimated gas with buffer
 */
async function estimateGasWithBuffer(contract, method, args = [], buffer = 20) {
  const estimated = await contract.estimateGas[method](...args);
  return estimated.mul(100 + buffer).div(100);
}

module.exports = {
  NETWORK_CONFIGS,
  getNetworkConfig,
  isTestnet,
  getExplorerUrl,
  getContractUrl,
  getTransactionUrl,
  formatAddress,
  formatTokenAmount,
  formatEther,
  waitForConfirmation,
  estimateGasWithBuffer,
};
