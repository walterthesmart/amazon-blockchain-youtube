const { run, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Verify deployed contracts on block explorer
 */
async function main() {
  console.log("🔍 Starting contract verification...");
  console.log("📡 Network:", network.name);

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "../../deployments");
  const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  console.log("📍 Contract address:", deploymentInfo.contractAddress);

  try {
    console.log("⏳ Verifying AmazonCoin contract...");
    
    await run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: [], // AmazonCoin has no constructor arguments
    });

    console.log("✅ Contract verified successfully!");
    
    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verificationTimestamp = new Date().toISOString();
    
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info updated with verification status");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified");
      
      // Update deployment info
      deploymentInfo.verified = true;
      deploymentInfo.verificationTimestamp = new Date().toISOString();
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      
    } else {
      console.error("❌ Verification failed:", error.message);
      throw error;
    }
  }

  console.log("🎉 Verification process completed!");
}

// Execute verification
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Verification failed:", error);
      process.exit(1);
    });
}

module.exports = main;
