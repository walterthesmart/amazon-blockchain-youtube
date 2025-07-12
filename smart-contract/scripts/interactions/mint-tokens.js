const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { getNetworkConfig, formatTokenAmount, formatEther } = require("../utils/network-config");

/**
 * Script to interact with deployed AmazonCoin contract
 * Allows minting tokens to specified addresses
 */
async function main() {
  console.log("🪙 AmazonCoin Token Minting Script");
  console.log("📡 Network:", network.name);

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "../../deployments");
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("📍 Contract address:", contractAddress);

  // Get signer (should be contract owner)
  const [signer] = await ethers.getSigners();
  console.log("👤 Signer address:", signer.address);

  // Connect to deployed contract
  const AmazonCoin = await ethers.getContractFactory("AmazonCoin");
  const amazonCoin = AmazonCoin.attach(contractAddress);

  // Verify signer is the owner
  const owner = await amazonCoin.owner();
  if (signer.address.toLowerCase() !== owner.toLowerCase()) {
    throw new Error(`❌ Signer is not the contract owner. Owner: ${owner}, Signer: ${signer.address}`);
  }

  console.log("✅ Signer verified as contract owner");

  // Display current contract state
  console.log("\n📊 Current Contract State:");
  console.log("   Name:", await amazonCoin.name());
  console.log("   Symbol:", await amazonCoin.symbol());
  console.log("   Total Supply:", formatTokenAmount(await amazonCoin.totalSupply()), "AC");
  console.log("   Max Supply:", formatTokenAmount(await amazonCoin.MAX_SUPPLY()), "AC");
  console.log("   Remaining Supply:", formatTokenAmount(await amazonCoin.getRemainingSupply()), "AC");
  console.log("   Exchange Rate:", formatEther(await amazonCoin.exchangeRate()), "ETH per token");
  console.log("   Minting Enabled:", await amazonCoin.mintingEnabled());
  console.log("   Contract Paused:", await amazonCoin.paused());
  console.log("   Total Ether Collected:", formatEther(await amazonCoin.totalEtherCollected()), "ETH");

  // Configuration for minting
  const MINT_RECIPIENTS = [
    // Add recipients here
    // { address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", amount: "1000" },
    // { address: "0x8ba1f109551bD432803012645Hac136c", amount: "500" },
  ];

  if (MINT_RECIPIENTS.length === 0) {
    console.log("\n⚠️  No mint recipients configured. Please edit the script to add recipients.");
    console.log("   Example configuration:");
    console.log('   { address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", amount: "1000" }');
    return;
  }

  // Check if minting is enabled
  const mintingEnabled = await amazonCoin.mintingEnabled();
  if (!mintingEnabled) {
    console.log("\n⚠️  Minting is currently disabled. Enable minting first:");
    console.log("   await amazonCoin.setMintingEnabled(true)");
    
    // Optionally enable minting
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    
    const answer = await new Promise((resolve) => {
      readline.question("Enable minting now? (y/N): ", resolve);
    });
    readline.close();
    
    if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
      console.log("🔓 Enabling minting...");
      const tx = await amazonCoin.setMintingEnabled(true);
      await tx.wait();
      console.log("✅ Minting enabled");
    } else {
      console.log("❌ Minting not enabled. Exiting.");
      return;
    }
  }

  // Process minting for each recipient
  console.log("\n🪙 Starting token minting...");
  
  for (let i = 0; i < MINT_RECIPIENTS.length; i++) {
    const recipient = MINT_RECIPIENTS[i];
    const recipientAddress = recipient.address;
    const mintAmount = ethers.utils.parseEther(recipient.amount);

    console.log(`\n📤 Minting ${recipient.amount} AC to ${recipientAddress}...`);

    try {
      // Check if recipient address is valid
      if (!ethers.utils.isAddress(recipientAddress)) {
        throw new Error("Invalid recipient address");
      }

      // Check remaining supply
      const remainingSupply = await amazonCoin.getRemainingSupply();
      if (mintAmount.gt(remainingSupply)) {
        throw new Error(`Insufficient remaining supply. Requested: ${formatTokenAmount(mintAmount)}, Available: ${formatTokenAmount(remainingSupply)}`);
      }

      // Estimate gas
      const estimatedGas = await amazonCoin.estimateGas.mint(recipientAddress, mintAmount);
      console.log("   ⛽ Estimated gas:", estimatedGas.toString());

      // Execute mint transaction
      const tx = await amazonCoin.mint(recipientAddress, mintAmount, {
        gasLimit: estimatedGas.mul(120).div(100), // Add 20% buffer
      });

      console.log("   📝 Transaction hash:", tx.hash);
      console.log("   ⏳ Waiting for confirmation...");

      const receipt = await tx.wait();
      console.log("   ✅ Minted successfully!");
      console.log("   📦 Block number:", receipt.blockNumber);
      console.log("   ⛽ Gas used:", receipt.gasUsed.toString());

      // Verify balance
      const balance = await amazonCoin.balanceOf(recipientAddress);
      console.log("   💰 Recipient balance:", formatTokenAmount(balance), "AC");

    } catch (error) {
      console.error(`   ❌ Minting failed for ${recipientAddress}:`, error.message);
      continue;
    }
  }

  // Display final contract state
  console.log("\n📊 Final Contract State:");
  console.log("   Total Supply:", formatTokenAmount(await amazonCoin.totalSupply()), "AC");
  console.log("   Remaining Supply:", formatTokenAmount(await amazonCoin.getRemainingSupply()), "AC");

  console.log("\n🎉 Minting process completed!");
}

// Execute minting
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Minting failed:", error);
      process.exit(1);
    });
}

module.exports = main;
