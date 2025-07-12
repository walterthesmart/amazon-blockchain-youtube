const { ethers, network } = require("hardhat");
const { 
  validatePrivateKeyConfig, 
  displayWalletStatus, 
  getNetworkType,
  isHederaNetwork,
  isEvmNetwork,
  displaySecurityRecommendations 
} = require("../../config/wallet-config");

/**
 * Comprehensive deployment validation script
 * Validates private key configuration, network settings, and security requirements
 */
async function validateDeployment() {
  console.log("🔍 Deployment Validation Starting...");
  console.log("📡 Target Network:", network.name);
  console.log("⛽ Chain ID:", network.config.chainId);
  
  let validationPassed = true;
  const issues = [];
  const warnings = [];

  // 1. Validate network type
  try {
    const networkType = getNetworkType(network.name);
    console.log("🌐 Network Type:", networkType.toUpperCase());
    
    if (isHederaNetwork(network.name)) {
      console.log("🔗 Hedera Network Detected");
    } else if (isEvmNetwork(network.name)) {
      console.log("⚡ EVM Network Detected");
    }
  } catch (error) {
    issues.push(`Unknown network: ${network.name}`);
    validationPassed = false;
  }

  // 2. Validate private key configuration
  console.log("\n🔑 Validating Private Key Configuration...");
  const keyValid = validatePrivateKeyConfig(network.name);
  
  if (!keyValid) {
    issues.push(`Private key configuration invalid for network: ${network.name}`);
    validationPassed = false;
  } else {
    console.log("✅ Private key configuration is valid");
  }

  // 3. Check environment variables
  console.log("\n🌍 Checking Environment Variables...");
  const requiredEnvVars = ['NODE_ENV'];
  const missingEnvVars = [];

  // Network-specific environment variable checks
  if (isHederaNetwork(network.name)) {
    if (!process.env.HEDERA_PRIVATE_KEY && !process.env.MNEMONIC) {
      missingEnvVars.push('HEDERA_PRIVATE_KEY or MNEMONIC');
    }
    
    // Check for Hedera RPC URLs
    const hederaRpcVars = {
      'hedera': 'HEDERA_RPC_URL',
      'hederaTestnet': 'HEDERA_TESTNET_RPC_URL',
      'hederaPreviewnet': 'HEDERA_PREVIEWNET_RPC_URL'
    };
    
    const requiredRpcVar = hederaRpcVars[network.name];
    if (requiredRpcVar && !process.env[requiredRpcVar]) {
      warnings.push(`${requiredRpcVar} not set, using default RPC URL`);
    }
  } else {
    if (!process.env.EVM_PRIVATE_KEY && !process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
      missingEnvVars.push('EVM_PRIVATE_KEY, PRIVATE_KEY, or MNEMONIC');
    }
  }

  if (missingEnvVars.length > 0) {
    issues.push(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    validationPassed = false;
  }

  // 4. Check network connectivity
  console.log("\n🌐 Testing Network Connectivity...");
  try {
    const provider = network.provider;
    const blockNumber = await provider.send("eth_blockNumber", []);
    console.log("✅ Network connectivity confirmed, latest block:", parseInt(blockNumber, 16));
  } catch (error) {
    issues.push(`Network connectivity failed: ${error.message}`);
    validationPassed = false;
  }

  // 5. Validate account balance
  console.log("\n💰 Checking Account Balance...");
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);
    
    console.log("👤 Deployer Address:", deployer.address);
    console.log("💰 Balance:", balanceEth, isHederaNetwork(network.name) ? "HBAR" : "ETH");
    
    // Minimum balance requirements
    const minBalance = isHederaNetwork(network.name) ?
      ethers.parseEther("5") :   // 5 HBAR for Hedera
      ethers.parseEther("0.1");  // 0.1 ETH for EVM networks

    if (balance < minBalance) {
      const currency = isHederaNetwork(network.name) ? "HBAR" : "ETH";
      const minRequired = ethers.formatEther(minBalance);
      issues.push(`Insufficient balance. Need at least ${minRequired} ${currency}, have ${balanceEth} ${currency}`);
      validationPassed = false;
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
  } catch (error) {
    issues.push(`Failed to check account balance: ${error.message}`);
    validationPassed = false;
  }

  // 6. Security checks
  console.log("\n🔒 Security Validation...");
  
  // Check if using different keys for different network types
  const hasEvmKey = !!(process.env.EVM_PRIVATE_KEY || process.env.PRIVATE_KEY);
  const hasHederaKey = !!process.env.HEDERA_PRIVATE_KEY;
  const hasMnemonic = !!process.env.MNEMONIC;
  
  if (hasMnemonic) {
    warnings.push("Using mnemonic for all networks. Consider using separate private keys for better security.");
  } else if (hasEvmKey && hasHederaKey) {
    console.log("✅ Using separate private keys for EVM and Hedera networks");
  } else if (process.env.PRIVATE_KEY && (isHederaNetwork(network.name) || isEvmNetwork(network.name))) {
    warnings.push("Using legacy PRIVATE_KEY. Consider migrating to EVM_PRIVATE_KEY and HEDERA_PRIVATE_KEY for better security separation.");
  }

  // Check for mainnet deployment warnings
  const mainnetNetworks = ['mainnet', 'polygon', 'bsc', 'arbitrum', 'optimism', 'hedera'];
  if (mainnetNetworks.includes(network.name)) {
    warnings.push("🚨 MAINNET DEPLOYMENT DETECTED! Ensure you have:");
    warnings.push("   - Thoroughly tested on testnet");
    warnings.push("   - Reviewed all contract parameters");
    warnings.push("   - Secured your private keys");
    warnings.push("   - Prepared for contract verification");
  }

  // 7. Display results
  console.log("\n📊 Validation Results:");
  
  if (validationPassed) {
    console.log("✅ All validations passed!");
  } else {
    console.log("❌ Validation failed with the following issues:");
    issues.forEach(issue => console.log(`   ❌ ${issue}`));
  }
  
  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  }

  // 8. Display wallet status
  displayWalletStatus();

  // 9. Display security recommendations
  if (!validationPassed || warnings.length > 0) {
    displaySecurityRecommendations();
  }

  return {
    passed: validationPassed,
    issues,
    warnings,
    networkType: getNetworkType(network.name),
    isMainnet: mainnetNetworks.includes(network.name)
  };
}

/**
 * Pre-deployment validation with exit on failure
 */
async function validateAndExit() {
  const result = await validateDeployment();
  
  if (!result.passed) {
    console.log("\n❌ Deployment validation failed. Please fix the issues above before proceeding.");
    process.exit(1);
  }
  
  if (result.warnings.length > 0 && result.isMainnet) {
    console.log("\n⚠️  Mainnet deployment detected with warnings. Proceed with caution!");
    
    // In a real scenario, you might want to add a confirmation prompt here
    // const readline = require("readline").createInterface({
    //   input: process.stdin,
    //   output: process.stdout,
    // });
    // 
    // const answer = await new Promise((resolve) => {
    //   readline.question("Continue with deployment? (yes/no): ", resolve);
    // });
    // readline.close();
    // 
    // if (answer.toLowerCase() !== "yes") {
    //   console.log("Deployment cancelled by user.");
    //   process.exit(1);
    // }
  }
  
  console.log("\n🚀 Validation passed! Ready for deployment.");
  return result;
}

module.exports = {
  validateDeployment,
  validateAndExit,
};

// Allow running as standalone script
if (require.main === module) {
  validateAndExit()
    .then(() => {
      console.log("✅ Validation completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Validation failed:", error);
      process.exit(1);
    });
}
