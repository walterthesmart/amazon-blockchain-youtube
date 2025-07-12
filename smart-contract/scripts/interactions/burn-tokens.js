const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script to burn half of the tokens from the deployed AmazonCoin contract
 */
async function main() {
  console.log("🔥 AmazonCoin Token Burning Script");
  console.log("📡 Network:", network.name);
  
  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "..", "deployments", `${network.name}-deployment.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }
  
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;
  
  console.log("📍 Contract address:", contractAddress);
  console.log("🔗 HashScan URL:", deploymentInfo.hederaSpecific?.explorerUrl || "N/A");

  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("👤 Signer address:", signer.address);
  console.log("💰 Signer balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "HBAR");

  // Connect to deployed contract
  const AmazonCoin = await ethers.getContractFactory("AmazonCoin");
  const amazonCoin = AmazonCoin.attach(contractAddress);
  
  // Verify contract connection
  console.log("🔍 Contract attached, verifying connection...");
  try {
    const name = await amazonCoin.name();
    console.log("✅ Contract connection verified, name:", name);
  } catch (error) {
    console.log("❌ Contract connection failed:", error.message);
    return;
  }

  // Verify signer is the owner or has tokens to burn
  const owner = await amazonCoin.owner();
  const isOwner = signer.address.toLowerCase() === owner.toLowerCase();
  
  console.log("🔑 Contract owner:", owner);
  console.log("✅ Is signer owner:", isOwner);

  // Get current token balance
  const currentBalance = await amazonCoin.balanceOf(signer.address);
  console.log("\n📊 Current Token Balance:");
  console.log("   Your balance:", ethers.formatEther(currentBalance), "AC");
  
  if (currentBalance === 0n) {
    console.log("❌ No tokens to burn! Current balance is 0.");
    return;
  }

  // Calculate half of the tokens to burn
  const burnAmount = currentBalance / 2n;
  console.log("   Amount to burn:", ethers.formatEther(burnAmount), "AC");
  console.log("   Remaining after burn:", ethers.formatEther(currentBalance - burnAmount), "AC");

  // Get total supply before burning
  const totalSupplyBefore = await amazonCoin.totalSupply();
  console.log("   Total supply before:", ethers.formatEther(totalSupplyBefore), "AC");

  // Confirm the burn operation
  console.log("\n🔥 Preparing to burn tokens...");
  console.log("⚠️  This action is irreversible!");
  
  try {
    // Estimate gas for the burn operation
    console.log("   🔍 Estimating gas for burn operation...");
    const gasEstimate = await amazonCoin.burn.estimateGas(burnAmount);
    console.log(`   ⛽ Estimated gas: ${gasEstimate.toString()}`);
    
    // Execute burn with Hedera-optimized gas settings
    console.log("   🔥 Executing burn transaction...");
    const tx = await amazonCoin.burn(burnAmount, {
      gasLimit: gasEstimate * 120n / 100n, // 20% buffer
      gasPrice: ethers.parseUnits("500", "gwei"), // Hedera requires higher gas price
    });

    console.log(`   📝 Transaction hash: ${tx.hash}`);
    console.log("   ⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log(`   ✅ Burn successful! Block: ${receipt.blockNumber}`);
    console.log(`   ⛽ Gas used: ${receipt.gasUsed.toString()}`);
    
    // Check balances after burning
    const newBalance = await amazonCoin.balanceOf(signer.address);
    const totalSupplyAfter = await amazonCoin.totalSupply();
    const tokensBurned = currentBalance - newBalance;
    
    console.log("\n📊 Burn Results:");
    console.log("   Tokens burned:", ethers.formatEther(tokensBurned), "AC");
    console.log("   Your balance before:", ethers.formatEther(currentBalance), "AC");
    console.log("   Your balance after:", ethers.formatEther(newBalance), "AC");
    console.log("   Total supply before:", ethers.formatEther(totalSupplyBefore), "AC");
    console.log("   Total supply after:", ethers.formatEther(totalSupplyAfter), "AC");
    console.log("   Total supply reduced by:", ethers.formatEther(totalSupplyBefore - totalSupplyAfter), "AC");
    
    // Calculate percentage burned
    const percentageBurned = (tokensBurned * 100n) / currentBalance;
    console.log("   Percentage of your tokens burned:", percentageBurned.toString() + "%");
    
    // Update deployment file with burn information
    const burnInfo = {
      timestamp: new Date().toISOString(),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      tokensBurned: tokensBurned.toString(),
      newBalance: newBalance.toString(),
      newTotalSupply: totalSupplyAfter.toString(),
      burnerAddress: signer.address
    };
    
    // Add burn info to deployment file
    deploymentInfo.burnOperations = deploymentInfo.burnOperations || [];
    deploymentInfo.burnOperations.push(burnInfo);
    
    // Save updated deployment info
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Burn information saved to:", deploymentFile);
    
    console.log("\n🌐 Transaction Details:");
    console.log("   HashScan URL:", `https://hashscan.io/testnet/transaction/${tx.hash}`);
    
  } catch (error) {
    console.log(`   ❌ Burn failed: ${error.message}`);
    
    // Check if it's a common error
    if (error.message.includes("ERC20: burn amount exceeds balance")) {
      console.log("   💡 Error: Trying to burn more tokens than you own");
    } else if (error.message.includes("gas")) {
      console.log("   💡 Error: Gas-related issue. Try increasing gas limit or gas price");
    } else if (error.message.includes("paused")) {
      console.log("   💡 Error: Contract is paused. Burns are not allowed when paused");
    }
  }

  console.log("\n🎉 Token burning script completed!");
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
