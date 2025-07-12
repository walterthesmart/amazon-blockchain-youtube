const { ethers, network, run } = require("hardhat");
const { getNetworkConfig, isTestnet } = require("../utils/network-config");
const { TOKEN_CONFIG, DEPLOYMENT_CONFIG } = require("../../config/constants");
const { validateAndExit } = require("../utils/validate-deployment");

/**
 * Deploy AmazonCoin contract specifically for Hedera networks
 * Hedera has some unique characteristics that require special handling
 */
async function main() {
  // Pre-deployment validation
  console.log("🔍 Running pre-deployment validation...");
  await validateAndExit();

  console.log("🚀 Starting AmazonCoin deployment on Hedera...");
  console.log("📡 Network:", network.name);
  console.log("⛽ Chain ID:", network.config.chainId);

  // Validate that this is a Hedera network
  const hederaNetworks = ['hedera', 'hederaTestnet', 'hederaPreviewnet'];
  if (!hederaNetworks.includes(network.name)) {
    throw new Error(`❌ This script is only for Hedera networks. Current network: ${network.name}`);
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  
  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "HBAR");

  // Validate minimum balance for deployment (Hedera requires more gas)
  const minBalance = ethers.utils.parseEther("5"); // 5 HBAR minimum
  if (balance.lt(minBalance)) {
    throw new Error(`❌ Insufficient balance. Need at least 5 HBAR, have ${ethers.utils.formatEther(balance)} HBAR`);
  }

  console.log("\n📋 Hedera Deployment Configuration:");
  console.log("   Token Name:", TOKEN_CONFIG.name);
  console.log("   Token Symbol:", TOKEN_CONFIG.symbol);
  console.log("   Max Supply:", ethers.utils.formatEther(TOKEN_CONFIG.maxSupply));
  console.log("   Initial Exchange Rate:", ethers.utils.formatEther(TOKEN_CONFIG.initialExchangeRate), "HBAR per token");
  console.log("   Network Type:", isTestnet(network.name) ? "Testnet" : "Mainnet");

  // Get contract factory
  console.log("\n🏭 Getting contract factory...");
  const AmazonCoinFactory = await ethers.getContractFactory("AmazonCoin");

  // Hedera-specific gas estimation (higher gas limits)
  const deploymentData = AmazonCoinFactory.getDeployTransaction();
  let estimatedGas;
  
  try {
    estimatedGas = await ethers.provider.estimateGas(deploymentData);
    console.log("⛽ Estimated gas for deployment:", estimatedGas.toString());
  } catch (error) {
    console.log("⚠️  Gas estimation failed, using default gas limit");
    estimatedGas = ethers.BigNumber.from("3000000"); // 3M gas default for Hedera
  }

  // Deploy contract with Hedera-optimized settings
  console.log("\n🚀 Deploying AmazonCoin contract on Hedera...");
  const amazonCoin = await AmazonCoinFactory.deploy({
    gasLimit: estimatedGas.mul(150).div(100), // Add 50% buffer for Hedera
    gasPrice: network.config.gasPrice || ethers.utils.parseUnits("10", "gwei"),
  });

  console.log("⏳ Waiting for deployment transaction...");
  await amazonCoin.deployed();

  console.log("\n✅ AmazonCoin deployed successfully on Hedera!");
  console.log("📍 Contract address:", amazonCoin.address);
  console.log("🔗 Transaction hash:", amazonCoin.deployTransaction.hash);

  // Wait for confirmations (Hedera is usually fast)
  const confirmations = 1; // Hedera typically needs only 1 confirmation
  
  console.log(`⏳ Waiting for ${confirmations} confirmation(s)...`);
  const receipt = await amazonCoin.deployTransaction.wait(confirmations);
  console.log(`✅ ${confirmations} confirmation(s) received`);
  console.log("📦 Block number:", receipt.blockNumber);
  console.log("⛽ Gas used:", receipt.gasUsed.toString());

  // Verify contract on HashScan (Hedera's block explorer)
  if (process.env.HEDERA_API_KEY && !isTestnet(network.name)) {
    console.log("\n🔍 Verifying contract on HashScan...");
    try {
      await run("verify:verify", {
        address: amazonCoin.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully on HashScan");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("💡 You can manually verify at: https://hashscan.io/" + 
                  (isTestnet(network.name) ? "testnet" : "mainnet") + 
                  "/contract/" + amazonCoin.address);
    }
  }

  // Display contract information
  console.log("\n📊 Contract Information:");
  console.log("   Name:", await amazonCoin.name());
  console.log("   Symbol:", await amazonCoin.symbol());
  console.log("   Decimals:", await amazonCoin.decimals());
  console.log("   Total Supply:", ethers.utils.formatEther(await amazonCoin.totalSupply()));
  console.log("   Max Supply:", ethers.utils.formatEther(await amazonCoin.MAX_SUPPLY()));
  console.log("   Exchange Rate:", ethers.utils.formatEther(await amazonCoin.exchangeRate()), "HBAR per token");
  console.log("   Minting Enabled:", await amazonCoin.mintingEnabled());
  console.log("   Owner:", await amazonCoin.owner());

  // Hedera-specific information
  console.log("\n🌐 Hedera Network Information:");
  console.log("   Network:", network.name);
  console.log("   Chain ID:", network.config.chainId);
  console.log("   Explorer URL:", getHederaExplorerUrl(network.name, amazonCoin.address));
  console.log("   Transaction URL:", getHederaTransactionUrl(network.name, amazonCoin.deployTransaction.hash));

  // Save deployment information with Hedera-specific details
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: amazonCoin.address,
    deployerAddress: deployer.address,
    transactionHash: amazonCoin.deployTransaction.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed.toString(),
    gasPrice: (receipt.effectiveGasPrice || network.config.gasPrice).toString(),
    timestamp: new Date().toISOString(),
    hederaSpecific: {
      explorerUrl: getHederaExplorerUrl(network.name, amazonCoin.address),
      transactionUrl: getHederaTransactionUrl(network.name, amazonCoin.deployTransaction.hash),
      networkType: isTestnet(network.name) ? "testnet" : "mainnet",
    },
    contractInfo: {
      name: await amazonCoin.name(),
      symbol: await amazonCoin.symbol(),
      decimals: await amazonCoin.decimals(),
      totalSupply: (await amazonCoin.totalSupply()).toString(),
      maxSupply: (await amazonCoin.MAX_SUPPLY()).toString(),
      exchangeRate: (await amazonCoin.exchangeRate()).toString(),
      mintingEnabled: await amazonCoin.mintingEnabled(),
      owner: await amazonCoin.owner(),
    }
  };

  // Write deployment info to file
  const fs = require("fs");
  const path = require("path");
  const deploymentsDir = path.join(__dirname, "../../deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n💾 Deployment information saved to:", deploymentFile);

  // Hedera-specific post-deployment recommendations
  console.log("\n💡 Hedera Post-Deployment Recommendations:");
  console.log("   1. Verify contract on HashScan manually if auto-verification failed");
  console.log("   2. Consider setting up Hedera Token Service (HTS) integration");
  console.log("   3. Test token transfers with small amounts first");
  console.log("   4. Monitor gas usage as Hedera pricing may differ from Ethereum");
  console.log("   5. Consider Hedera's consensus timestamp for event ordering");

  console.log("\n🎉 Hedera deployment completed successfully!");

  return amazonCoin;
}

/**
 * Helper function to get Hedera explorer URL
 */
function getHederaExplorerUrl(networkName, contractAddress) {
  const baseUrls = {
    hedera: "https://hashscan.io/mainnet",
    hederaTestnet: "https://hashscan.io/testnet",
    hederaPreviewnet: "https://hashscan.io/previewnet",
  };
  
  const baseUrl = baseUrls[networkName];
  return baseUrl ? `${baseUrl}/contract/${contractAddress}` : "";
}

/**
 * Helper function to get Hedera transaction URL
 */
function getHederaTransactionUrl(networkName, txHash) {
  const baseUrls = {
    hedera: "https://hashscan.io/mainnet",
    hederaTestnet: "https://hashscan.io/testnet",
    hederaPreviewnet: "https://hashscan.io/previewnet",
  };
  
  const baseUrl = baseUrls[networkName];
  return baseUrl ? `${baseUrl}/transaction/${txHash}` : "";
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Hedera deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
