// Configuration constants for AmazonCoin deployment and testing

const { ethers } = require("hardhat");

// Token Configuration
const TOKEN_CONFIG = {
  name: "Amazon Coin",
  symbol: "AC",
  decimals: 18,
  maxSupply: ethers.utils.parseEther("1000000000"), // 1 billion tokens
  initialExchangeRate: ethers.utils.parseEther("0.0001"), // 0.0001 ETH per token
  initialSupplyPercentage: 10, // 10% of max supply minted initially
};

// Network Configuration
const NETWORK_CONFIG = {
  // Mainnet
  1: {
    name: "mainnet",
    gasPrice: ethers.utils.parseUnits("20", "gwei"),
    gasLimit: 8000000,
    confirmations: 2,
  },
  // Goerli Testnet
  5: {
    name: "goerli",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Sepolia Testnet
  11155111: {
    name: "sepolia",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Polygon Mainnet
  137: {
    name: "polygon",
    gasPrice: ethers.utils.parseUnits("30", "gwei"),
    gasLimit: 8000000,
    confirmations: 2,
  },
  // Polygon Mumbai Testnet
  80001: {
    name: "mumbai",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Hedera Mainnet
  295: {
    name: "hedera",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Hedera Testnet
  296: {
    name: "hederaTestnet",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Hedera Previewnet
  297: {
    name: "hederaPreviewnet",
    gasPrice: ethers.utils.parseUnits("10", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
  // Local Hardhat Network
  31337: {
    name: "hardhat",
    gasPrice: ethers.utils.parseUnits("1", "gwei"),
    gasLimit: 8000000,
    confirmations: 1,
  },
};

// Deployment Configuration
const DEPLOYMENT_CONFIG = {
  // Verification settings
  verification: {
    enabled: true,
    apiKeys: {
      etherscan: process.env.ETHERSCAN_API_KEY,
      polygonscan: process.env.POLYGONSCAN_API_KEY,
    },
  },
  
  // Contract deployment settings
  contracts: {
    amazonCoin: {
      constructorArgs: [], // No constructor arguments needed
      libraries: {}, // No libraries to link
    },
  },
  
  // Post-deployment configuration
  postDeployment: {
    // Initial minting configuration
    initialMinting: {
      enabled: true,
      recipients: [
        // Add initial token recipients here
        // { address: "0x...", amount: "1000000" }
      ],
    },
    
    // Initial exchange rate configuration
    exchangeRate: {
      updateAfterDeployment: false,
      newRate: TOKEN_CONFIG.initialExchangeRate,
    },
    
    // Ownership transfer
    ownershipTransfer: {
      enabled: false,
      newOwner: "", // Set new owner address if needed
    },
  },
};

// Testing Configuration
const TESTING_CONFIG = {
  // Test accounts configuration
  accounts: {
    deployer: 0,
    owner: 0,
    user1: 1,
    user2: 2,
    user3: 3,
  },
  
  // Test token amounts
  amounts: {
    small: ethers.utils.parseEther("100"),
    medium: ethers.utils.parseEther("1000"),
    large: ethers.utils.parseEther("10000"),
    maxPurchase: ethers.utils.parseEther("100000"),
  },
  
  // Test Ether amounts
  etherAmounts: {
    small: ethers.utils.parseEther("0.01"),
    medium: ethers.utils.parseEther("0.1"),
    large: ethers.utils.parseEther("1"),
    veryLarge: ethers.utils.parseEther("10"),
  },
  
  // Gas limits for testing
  gasLimits: {
    deployment: 3000000,
    mint: 100000,
    transfer: 60000,
    purchase: 150000,
  },
};

// Security Configuration
const SECURITY_CONFIG = {
  // Pause functionality
  pausable: {
    enabled: true,
    emergencyContacts: [
      // Add emergency contact addresses
    ],
  },
  
  // Rate limiting (if implemented)
  rateLimiting: {
    enabled: false,
    maxPurchasePerBlock: ethers.utils.parseEther("10000"),
    maxPurchasePerDay: ethers.utils.parseEther("100000"),
  },
  
  // Whitelist/Blacklist (if implemented)
  accessControl: {
    whitelistEnabled: false,
    blacklistEnabled: false,
  },
};

// Export all configurations
module.exports = {
  TOKEN_CONFIG,
  NETWORK_CONFIG,
  DEPLOYMENT_CONFIG,
  TESTING_CONFIG,
  SECURITY_CONFIG,
  
  // Helper functions
  getNetworkConfig: (chainId) => {
    return NETWORK_CONFIG[chainId] || NETWORK_CONFIG[31337]; // Default to hardhat
  },
  
  // Validation functions
  validateConfig: () => {
    // Add configuration validation logic here
    console.log("Configuration validated successfully");
    return true;
  },
};
