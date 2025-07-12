const { ethers, network, run } = require("hardhat");
const { getNetworkConfig, isTestnet } = require("../../config/networks");
const { TOKEN_CONFIG, DEPLOYMENT_CONFIG } = require("../../config/constants");
const { validateAndExit } = require("../utils/validate-deployment");

/**
 * Deploy AmazonCoin contract with comprehensive logging and verification
 */
async function main() {
  // Pre-deployment validation
  console.log("🔍 Running pre-deployment validation...");
  await validateAndExit();

  console.log("🚀 Starting AmazonCoin deployment...");
  console.log("📡 Network:", network.name);
  console.log("⛽ Chain ID:", network.config.chainId);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Validate minimum balance for deployment
  const minBalance = ethers.utils.parseEther("0.1");
  if (balance.lt(minBalance)) {
    throw new Error(`❌ Insufficient balance. Need at least 0.1 ETH, have ${ethers.utils.formatEther(balance)} ETH`);
  }

  console.log("\n📋 Deployment Configuration:");
  console.log("   Token Name:", TOKEN_CONFIG.name);
  console.log("   Token Symbol:", TOKEN_CONFIG.symbol);
  console.log("   Max Supply:", ethers.utils.formatEther(TOKEN_CONFIG.maxSupply));
  console.log("   Initial Exchange Rate:", ethers.utils.formatEther(TOKEN_CONFIG.initialExchangeRate), "ETH per token");

  // Get contract factory
  console.log("\n🏭 Getting contract factory...");
  const AmazonCoinFactory = await ethers.getContractFactory("AmazonCoin");

  // Estimate deployment gas
  const deploymentData = AmazonCoinFactory.getDeployTransaction();
  const estimatedGas = await ethers.provider.estimateGas(deploymentData);
  console.log("⛽ Estimated gas for deployment:", estimatedGas.toString());

  // Deploy contract
  console.log("\n🚀 Deploying AmazonCoin contract...");
  const amazonCoin = await AmazonCoinFactory.deploy({
    gasLimit: estimatedGas.mul(120).div(100), // Add 20% buffer
  });

  console.log("⏳ Waiting for deployment transaction...");
  await amazonCoin.deployed();

  console.log("\n✅ AmazonCoin deployed successfully!");
  console.log("📍 Contract address:", amazonCoin.address);
  console.log("🔗 Transaction hash:", amazonCoin.deployTransaction.hash);

  // Wait for confirmations
  const networkConfig = getNetworkConfig(network.name);
  const confirmations = networkConfig.confirmations || 1;

  if (confirmations > 1) {
    console.log(`⏳ Waiting for ${confirmations} confirmations...`);
    await amazonCoin.deployTransaction.wait(confirmations);
    console.log(`✅ ${confirmations} confirmations received`);
  }

  // Verify contract on block explorer
  if (DEPLOYMENT_CONFIG.verification.enabled && !isTestnet(network.name)) {
    console.log("\n🔍 Verifying contract on block explorer...");
    try {
      await run("verify:verify", {
        address: amazonCoin.address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }

  // Display contract information
  console.log("\n📊 Contract Information:");
  console.log("   Name:", await amazonCoin.name());
  console.log("   Symbol:", await amazonCoin.symbol());
  console.log("   Decimals:", await amazonCoin.decimals());
  console.log("   Total Supply:", ethers.utils.formatEther(await amazonCoin.totalSupply()));
  console.log("   Max Supply:", ethers.utils.formatEther(await amazonCoin.MAX_SUPPLY()));
  console.log("   Exchange Rate:", ethers.utils.formatEther(await amazonCoin.exchangeRate()), "ETH per token");
  console.log("   Minting Enabled:", await amazonCoin.mintingEnabled());
  console.log("   Owner:", await amazonCoin.owner());

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: amazonCoin.address,
    deployerAddress: deployer.address,
    transactionHash: amazonCoin.deployTransaction.hash,
    blockNumber: amazonCoin.deployTransaction.blockNumber,
    gasUsed: (await amazonCoin.deployTransaction.wait()).gasUsed.toString(),
    timestamp: new Date().toISOString(),
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
  console.log("\n🎉 Deployment completed successfully!");

  return amazonCoin;
}

// Execute deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
