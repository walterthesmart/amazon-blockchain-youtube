// Wallet configuration for different network types
require('dotenv').config();

/**
 * Network type definitions
 */
const NETWORK_TYPES = {
  EVM: 'evm',
  HEDERA: 'hedera'
};

/**
 * Network type mapping
 * Maps network names to their types (EVM or Hedera)
 */
const NETWORK_TYPE_MAP = {
  // EVM Networks
  mainnet: NETWORK_TYPES.EVM,
  goerli: NETWORK_TYPES.EVM,
  sepolia: NETWORK_TYPES.EVM,
  polygon: NETWORK_TYPES.EVM,
  mumbai: NETWORK_TYPES.EVM,
  bsc: NETWORK_TYPES.EVM,
  bscTestnet: NETWORK_TYPES.EVM,
  arbitrum: NETWORK_TYPES.EVM,
  optimism: NETWORK_TYPES.EVM,
  hardhat: NETWORK_TYPES.EVM,
  
  // Hedera Networks
  hedera: NETWORK_TYPES.HEDERA,
  hederaTestnet: NETWORK_TYPES.HEDERA,
  hederaPreviewnet: NETWORK_TYPES.HEDERA,
};

/**
 * Get the network type for a given network name
 * @param {string} networkName - Name of the network
 * @returns {string} Network type ('evm' or 'hedera')
 */
function getNetworkType(networkName) {
  const networkType = NETWORK_TYPE_MAP[networkName];
  if (!networkType) {
    throw new Error(`Unknown network: ${networkName}. Please add it to NETWORK_TYPE_MAP.`);
  }
  return networkType;
}

/**
 * Check if a network is a Hedera network
 * @param {string} networkName - Name of the network
 * @returns {boolean} True if Hedera network, false otherwise
 */
function isHederaNetwork(networkName) {
  return getNetworkType(networkName) === NETWORK_TYPES.HEDERA;
}

/**
 * Check if a network is an EVM network
 * @param {string} networkName - Name of the network
 * @returns {boolean} True if EVM network, false otherwise
 */
function isEvmNetwork(networkName) {
  return getNetworkType(networkName) === NETWORK_TYPES.EVM;
}

/**
 * Get the appropriate private key for a network
 * @param {string} networkName - Name of the network
 * @returns {string} Private key for the network
 * @throws {Error} If no appropriate private key is found
 */
function getPrivateKeyForNetwork(networkName) {
  const networkType = getNetworkType(networkName);
  
  if (networkType === NETWORK_TYPES.HEDERA) {
    // For Hedera networks, use HEDERA_PRIVATE_KEY
    if (process.env.HEDERA_PRIVATE_KEY) {
      return process.env.HEDERA_PRIVATE_KEY;
    }
    throw new Error(
      `HEDERA_PRIVATE_KEY is required for Hedera network: ${networkName}. ` +
      `Please set HEDERA_PRIVATE_KEY in your .env file.`
    );
  } else if (networkType === NETWORK_TYPES.EVM) {
    // For EVM networks, prefer EVM_PRIVATE_KEY, fallback to PRIVATE_KEY
    if (process.env.EVM_PRIVATE_KEY) {
      return process.env.EVM_PRIVATE_KEY;
    } else if (process.env.PRIVATE_KEY) {
      console.warn(
        `Warning: Using legacy PRIVATE_KEY for EVM network: ${networkName}. ` +
        `Consider setting EVM_PRIVATE_KEY for better security separation.`
      );
      return process.env.PRIVATE_KEY;
    }
    throw new Error(
      `EVM_PRIVATE_KEY or PRIVATE_KEY is required for EVM network: ${networkName}. ` +
      `Please set EVM_PRIVATE_KEY (recommended) or PRIVATE_KEY in your .env file.`
    );
  }
  
  throw new Error(`Unsupported network type for network: ${networkName}`);
}

/**
 * Get accounts configuration for a network
 * @param {string} networkName - Name of the network
 * @returns {Array|Object} Accounts configuration
 */
function getAccountsForNetwork(networkName) {
  // If mnemonic is provided, use it (overrides private keys)
  if (process.env.MNEMONIC) {
    return {
      mnemonic: process.env.MNEMONIC,
      count: 20,
    };
  }
  
  // Otherwise, use appropriate private key
  try {
    const privateKey = getPrivateKeyForNetwork(networkName);
    return [privateKey];
  } catch (error) {
    console.error(`Error getting accounts for network ${networkName}:`, error.message);
    return [];
  }
}

/**
 * Validate private key configuration
 * @param {string} networkName - Name of the network to validate
 * @returns {boolean} True if configuration is valid
 */
function validatePrivateKeyConfig(networkName) {
  try {
    getPrivateKeyForNetwork(networkName);
    return true;
  } catch (error) {
    console.error(`Private key validation failed for ${networkName}:`, error.message);
    return false;
  }
}

/**
 * Get all available networks based on configured private keys
 * @returns {Object} Object with available networks by type
 */
function getAvailableNetworks() {
  const available = {
    evm: [],
    hedera: [],
    total: 0
  };
  
  // Check EVM networks
  if (process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY || process.env.MNEMONIC) {
    available.evm = Object.keys(NETWORK_TYPE_MAP).filter(isEvmNetwork);
  }
  
  // Check Hedera networks
  if (process.env.HEDERA_PRIVATE_KEY || process.env.MNEMONIC) {
    available.hedera = Object.keys(NETWORK_TYPE_MAP).filter(isHederaNetwork);
  }
  
  available.total = available.evm.length + available.hedera.length;
  
  return available;
}

/**
 * Display wallet configuration status
 */
function displayWalletStatus() {
  console.log("\n🔑 Wallet Configuration Status:");
  
  const hasEvmKey = !!(process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY);
  const hasHederaKey = !!process.env.HEDERA_PRIVATE_KEY;
  const hasMnemonic = !!process.env.MNEMONIC;
  
  console.log(`   EVM Private Key: ${hasEvmKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Hedera Private Key: ${hasHederaKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   Mnemonic: ${hasMnemonic ? '✅ Configured' : '❌ Missing'}`);
  
  if (hasMnemonic) {
    console.log("   📝 Note: Mnemonic will override private key settings");
  }
  
  const available = getAvailableNetworks();
  console.log(`\n📡 Available Networks: ${available.total}`);
  console.log(`   EVM Networks: ${available.evm.length} (${available.evm.join(', ')})`);
  console.log(`   Hedera Networks: ${available.hedera.length} (${available.hedera.join(', ')})`);
  
  if (available.total === 0) {
    console.log("\n⚠️  Warning: No networks available. Please configure private keys in .env file.");
  }
}

/**
 * Security recommendations for private key management
 */
function displaySecurityRecommendations() {
  console.log("\n🔒 Private Key Security Recommendations:");
  console.log("   1. Use separate wallets for different network types");
  console.log("   2. Never commit private keys to version control");
  console.log("   3. Use hardware wallets for mainnet deployments");
  console.log("   4. Regularly rotate private keys");
  console.log("   5. Use environment-specific .env files");
  console.log("   6. Consider using multi-signature wallets for production");
  console.log("   7. Keep testnet and mainnet keys completely separate");
}

module.exports = {
  NETWORK_TYPES,
  NETWORK_TYPE_MAP,
  getNetworkType,
  isHederaNetwork,
  isEvmNetwork,
  getPrivateKeyForNetwork,
  getAccountsForNetwork,
  validatePrivateKeyConfig,
  getAvailableNetworks,
  displayWalletStatus,
  displaySecurityRecommendations,
};
