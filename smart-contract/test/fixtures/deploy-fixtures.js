const { ethers } = require("hardhat");
const { TOKEN_CONFIG } = require("../../config/constants");

/**
 * Deploy AmazonCoin contract for testing
 */
async function deployAmazonCoinFixture() {
  // Get signers
  const [owner, user1, user2, user3, ...otherUsers] = await ethers.getSigners();

  // Deploy AmazonCoin contract
  const AmazonCoinFactory = await ethers.getContractFactory("AmazonCoin");
  const amazonCoin = await AmazonCoinFactory.deploy();
  await amazonCoin.deployed();

  return {
    amazonCoin,
    owner,
    user1,
    user2,
    user3,
    otherUsers,
  };
}

/**
 * Deploy AmazonCoin with some initial state for testing
 */
async function deployAmazonCoinWithStateFixture() {
  const { amazonCoin, owner, user1, user2, user3, otherUsers } = await deployAmazonCoinFixture();

  // Give some ETH to test users
  const ethAmount = ethers.utils.parseEther("10");
  await owner.sendTransaction({ to: user1.address, value: ethAmount });
  await owner.sendTransaction({ to: user2.address, value: ethAmount });
  await owner.sendTransaction({ to: user3.address, value: ethAmount });

  // Purchase some tokens for user1
  const tokenAmount = ethers.utils.parseEther("1000");
  const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);
  await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });

  return {
    amazonCoin,
    owner,
    user1,
    user2,
    user3,
    otherUsers,
    initialTokenAmount: tokenAmount,
    initialEtherCost: etherCost,
  };
}

/**
 * Deploy MockERC20 for testing interactions
 */
async function deployMockERC20Fixture() {
  const [owner] = await ethers.getSigners();
  
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockToken = await MockERC20Factory.deploy(
    "Mock Token",
    "MOCK",
    18,
    ethers.utils.parseEther("1000000") // 1M tokens
  );
  await mockToken.deployed();

  return {
    mockToken,
    owner,
  };
}

/**
 * Deploy AmazonCoin in paused state
 */
async function deployPausedAmazonCoinFixture() {
  const { amazonCoin, owner, user1, user2, user3, otherUsers } = await deployAmazonCoinFixture();
  
  // Pause the contract
  await amazonCoin.connect(owner).pause();

  return {
    amazonCoin,
    owner,
    user1,
    user2,
    user3,
    otherUsers,
  };
}

/**
 * Deploy AmazonCoin with minting disabled
 */
async function deployAmazonCoinMintingDisabledFixture() {
  const { amazonCoin, owner, user1, user2, user3, otherUsers } = await deployAmazonCoinFixture();
  
  // Disable minting
  await amazonCoin.connect(owner).setMintingEnabled(false);

  return {
    amazonCoin,
    owner,
    user1,
    user2,
    user3,
    otherUsers,
  };
}

module.exports = {
  deployAmazonCoinFixture,
  deployAmazonCoinWithStateFixture,
  deployMockERC20Fixture,
  deployPausedAmazonCoinFixture,
  deployAmazonCoinMintingDisabledFixture,
};
