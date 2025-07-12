require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { networks } = require("./config/networks");
const { validatePrivateKeyConfig, displayWalletStatus } = require("./config/wallet-config");

// Custom tasks
task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();
  console.log("Available accounts:");
  for (let i = 0; i < accounts.length; i++) {
    const balance = await accounts[i].getBalance();
    console.log(`${i}: ${accounts[i].address} (${hre.ethers.utils.formatEther(balance)} ETH)`);
  }
});

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, hre) => {
    const balance = await hre.ethers.provider.getBalance(taskArgs.account);
    console.log(hre.ethers.utils.formatEther(balance), "ETH");
  });

task("deploy-amazon-coin", "Deploy AmazonCoin contract")
  .addOptionalParam("verify", "Verify contract after deployment", false)
  .setAction(async () => {
    const deployScript = require("./scripts/deploy/01-deploy-amazon-coin");
    await deployScript();
  });

task("contract-info", "Get contract information")
  .addParam("address", "The contract address")
  .setAction(async (taskArgs, hre) => {
    const AmazonCoin = await hre.ethers.getContractFactory("AmazonCoin");
    const contract = AmazonCoin.attach(taskArgs.address);

    console.log("Contract Information:");
    console.log("Name:", await contract.name());
    console.log("Symbol:", await contract.symbol());
    console.log("Decimals:", await contract.decimals());
    console.log("Total Supply:", hre.ethers.utils.formatEther(await contract.totalSupply()));
    console.log("Max Supply:", hre.ethers.utils.formatEther(await contract.MAX_SUPPLY()));
    console.log("Exchange Rate:", hre.ethers.utils.formatEther(await contract.exchangeRate()), "ETH per token");
    console.log("Minting Enabled:", await contract.mintingEnabled());
    console.log("Owner:", await contract.owner());
    console.log("Paused:", await contract.paused());
  });

task("wallet-status", "Display wallet configuration status")
  .setAction(async () => {
    displayWalletStatus();
  });

task("validate-network", "Validate private key configuration for a network")
  .addParam("network", "Network name to validate")
  .setAction(async (taskArgs) => {
    const isValid = validatePrivateKeyConfig(taskArgs.network);
    if (isValid) {
      console.log(`✅ Private key configuration is valid for network: ${taskArgs.network}`);
    } else {
      console.log(`❌ Private key configuration is invalid for network: ${taskArgs.network}`);
      process.exit(1);
    }
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },

  networks: {
    ...networks,
    // Override hardhat network for local development
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 12000000,
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 20,
        accountsBalance: "10000000000000000000000", // 10,000 ETH
      },
      forking: process.env.FORK_MAINNET === "true" ? {
        url: process.env.MAINNET_RPC_URL,
        blockNumber: process.env.FORK_BLOCK_NUMBER ? parseInt(process.env.FORK_BLOCK_NUMBER) : undefined,
      } : undefined,
    },
  },

  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY,
      hedera: process.env.HEDERA_API_KEY,
      hederaTestnet: process.env.HEDERA_API_KEY,
      hederaPreviewnet: process.env.HEDERA_API_KEY,
    },
    customChains: [
      {
        network: "hedera",
        chainId: 295,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/mainnet"
        }
      },
      {
        network: "hederaTestnet",
        chainId: 296,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/testnet"
        }
      },
      {
        network: "hederaPreviewnet",
        chainId: 297,
        urls: {
          apiURL: "https://server-verify.hashscan.io",
          browserURL: "https://hashscan.io/previewnet"
        }
      }
    ]
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },

  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },

  mocha: {
    timeout: 300000, // 5 minutes
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
