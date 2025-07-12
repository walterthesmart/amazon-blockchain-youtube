const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Hedera-specific token operations script
 * Handles token operations optimized for Hedera network characteristics
 */
async function main() {
  console.log("🌐 Hedera Token Operations Script");
  console.log("📡 Network:", network.name);

  // Validate Hedera network
  const hederaNetworks = ['hedera', 'hederaTestnet', 'hederaPreviewnet'];
  if (!hederaNetworks.includes(network.name)) {
    throw new Error(`❌ This script is only for Hedera networks. Current network: ${network.name}`);
  }

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "../../deployments");
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 HashScan URL:", deploymentInfo.hederaSpecific?.explorerUrl || "N/A");

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Signer address:", signer.address);
  console.log("💰 Signer balance:", ethers.utils.formatEther(await signer.getBalance()), "HBAR");

  // Connect to deployed contract
  const AmazonCoin = await ethers.getContractFactory("AmazonCoin");
  const amazonCoin = AmazonCoin.attach(contractAddress);

  // Verify signer is the owner
  const owner = await amazonCoin.owner();
  const isOwner = signer.address.toLowerCase() === owner.toLowerCase();
  
  console.log("🔑 Contract owner:", owner);
  console.log("✅ Is signer owner:", isOwner);

  // Display current contract state
  console.log("\n📊 Current Contract State:");
  console.log("   Name:", await amazonCoin.name());
  console.log("   Symbol:", await amazonCoin.symbol());
  console.log("   Total Supply:", ethers.utils.formatEther(await amazonCoin.totalSupply()), "AC");
  console.log("   Max Supply:", ethers.utils.formatEther(await amazonCoin.MAX_SUPPLY()), "AC");
  console.log("   Remaining Supply:", ethers.utils.formatEther(await amazonCoin.getRemainingSupply()), "AC");
  console.log("   Exchange Rate:", ethers.utils.formatEther(await amazonCoin.exchangeRate()), "HBAR per token");
  console.log("   Minting Enabled:", await amazonCoin.mintingEnabled());
  console.log("   Contract Paused:", await amazonCoin.paused());
  console.log("   Total HBAR Collected:", ethers.utils.formatEther(await amazonCoin.totalEtherCollected()), "HBAR");

  // Hedera-specific operations menu
  console.log("\n🛠️  Available Hedera Operations:");
  console.log("   1. Purchase tokens with HBAR");
  console.log("   2. Mint tokens (owner only)");
  console.log("   3. Update exchange rate (owner only)");
  console.log("   4. Withdraw HBAR (owner only)");
  console.log("   5. Check token balance");
  console.log("   6. Transfer tokens");
  console.log("   7. Burn tokens");
  console.log("   8. Pause/Unpause contract (owner only)");

  // Example operations (you can uncomment and modify as needed)
  
  // Example 1: Purchase tokens with HBAR
  await demonstratePurchase(amazonCoin, signer);
  
  // Example 2: Owner operations (if signer is owner)
  if (isOwner) {
    await demonstrateOwnerOperations(amazonCoin, signer);
  }

  console.log("\n🎉 Hedera operations completed!");
}

/**
 * Demonstrate token purchase with HBAR
 */
async function demonstratePurchase(amazonCoin, signer) {
  console.log("\n💰 Demonstrating Token Purchase with HBAR...");
  
  try {
    const tokenAmount = ethers.utils.parseEther("100"); // 100 tokens
    const hbarCost = await amazonCoin.calculateEtherCost(tokenAmount);
    
    console.log(`   Purchasing ${ethers.utils.formatEther(tokenAmount)} AC tokens`);
    console.log(`   Cost: ${ethers.utils.formatEther(hbarCost)} HBAR`);
    
    // Check if user has enough HBAR
    const balance = await signer.getBalance();
    if (balance.lt(hbarCost.add(ethers.utils.parseEther("1")))) { // Keep 1 HBAR for gas
      console.log("   ⚠️  Insufficient HBAR balance for purchase");
      return;
    }
    
    // Estimate gas for Hedera
    const gasEstimate = await amazonCoin.estimateGas.purchaseTokens(tokenAmount, { value: hbarCost });
    console.log(`   ⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Execute purchase with Hedera-optimized gas settings
    const tx = await amazonCoin.purchaseTokens(tokenAmount, {
      value: hbarCost,
      gasLimit: gasEstimate.mul(120).div(100), // 20% buffer
      gasPrice: ethers.utils.parseUnits("10", "gwei"), // Hedera gas price
    });
    
    console.log(`   📝 Transaction hash: ${tx.hash}`);
    console.log("   ⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`   ✅ Purchase successful! Block: ${receipt.blockNumber}`);
    console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check new balance
    const newBalance = await amazonCoin.balanceOf(signer.address);
    console.log(`   💎 New token balance: ${ethers.utils.formatEther(newBalance)} AC`);
    
  } catch (error) {
    console.log(`   ❌ Purchase failed: ${error.message}`);
  }
}

/**
 * Demonstrate owner-only operations
 */
async function demonstrateOwnerOperations(amazonCoin, signer) {
  console.log("\n👑 Demonstrating Owner Operations...");
  
  try {
    // Example: Mint tokens to a test address
    const testAddress = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"; // Replace with actual address
    const mintAmount = ethers.utils.parseEther("500"); // 500 tokens
    
    console.log(`   Minting ${ethers.utils.formatEther(mintAmount)} AC to ${testAddress}`);
    
    // Check remaining supply
    const remainingSupply = await amazonCoin.getRemainingSupply();
    if (mintAmount.gt(remainingSupply)) {
      console.log("   ⚠️  Mint amount exceeds remaining supply");
      return;
    }
    
    // Estimate gas
    const gasEstimate = await amazonCoin.estimateGas.mint(testAddress, mintAmount);
    console.log(`   ⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Execute mint with Hedera settings
    const tx = await amazonCoin.mint(testAddress, mintAmount, {
      gasLimit: gasEstimate.mul(120).div(100),
      gasPrice: ethers.utils.parseUnits("10", "gwei"),
    });
    
    console.log(`   📝 Transaction hash: ${tx.hash}`);
    console.log("   ⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`   ✅ Mint successful! Block: ${receipt.blockNumber}`);
    console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
  } catch (error) {
    console.log(`   ❌ Owner operation failed: ${error.message}`);
  }
}

/**
 * Check Hedera network status
 */
async function checkHederaNetworkStatus() {
  console.log("\n🌐 Hedera Network Status:");
  
  try {
    const provider = ethers.provider;
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);
    
    console.log(`   Latest block: ${blockNumber}`);
    console.log(`   Block timestamp: ${new Date(block.timestamp * 1000).toISOString()}`);
    console.log(`   Gas limit: ${block.gasLimit.toString()}`);
    
    // Hedera-specific network info
    const networkInfo = {
      hedera: { name: "Mainnet", consensusNodes: "Multiple", tps: "10,000+" },
      hederaTestnet: { name: "Testnet", consensusNodes: "Multiple", tps: "10,000+" },
      hederaPreviewnet: { name: "Previewnet", consensusNodes: "Multiple", tps: "10,000+" },
    };
    
    const info = networkInfo[network.name];
    if (info) {
      console.log(`   Network: ${info.name}`);
      console.log(`   Consensus: ${info.consensusNodes}`);
      console.log(`   TPS: ${info.tps}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Failed to get network status: ${error.message}`);
  }
}

/**
 * Hedera-specific gas optimization tips
 */
function displayHederaGasTips() {
  console.log("\n💡 Hedera Gas Optimization Tips:");
  console.log("   1. Use higher gas prices (10+ gwei) for faster confirmation");
  console.log("   2. Batch operations when possible to reduce transaction count");
  console.log("   3. Monitor HashScan for network congestion");
  console.log("   4. Consider Hedera's consensus timestamp for ordering");
  console.log("   5. Use appropriate gas limits (Hedera may require more gas)");
  console.log("   6. Test on testnet first to optimize gas usage");
}

// Execute operations
if (require.main === module) {
  main()
    .then(() => {
      displayHederaGasTips();
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Hedera operations failed:", error);
      process.exit(1);
    });
}

module.exports = main;
