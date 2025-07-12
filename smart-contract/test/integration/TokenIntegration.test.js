const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {
  deployAmazonCoinFixture,
  deployAmazonCoinWithStateFixture,
} = require("../fixtures/deploy-fixtures");

describe("AmazonCoin Integration Tests", function () {
  describe("End-to-End Token Lifecycle", function () {
    it("Should handle complete token lifecycle: purchase, transfer, burn", async function () {
      const { amazonCoin, owner, user1, user2 } = await loadFixture(deployAmazonCoinFixture);

      // Step 1: User1 purchases tokens
      const purchaseAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(purchaseAmount);
      
      await amazonCoin.connect(user1).purchaseTokens(purchaseAmount, { value: etherCost });
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(purchaseAmount);

      // Step 2: User1 transfers tokens to User2
      const transferAmount = ethers.utils.parseEther("300");
      await amazonCoin.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(
        purchaseAmount.sub(transferAmount)
      );
      expect(await amazonCoin.balanceOf(user2.address)).to.equal(transferAmount);

      // Step 3: User2 burns some tokens
      const burnAmount = ethers.utils.parseEther("100");
      await amazonCoin.connect(user2).burn(burnAmount);
      
      expect(await amazonCoin.balanceOf(user2.address)).to.equal(
        transferAmount.sub(burnAmount)
      );
      
      // Verify total supply decreased
      const expectedTotalSupply = (await amazonCoin.MAX_SUPPLY()).div(10) // Initial supply
        .add(purchaseAmount) // Purchased tokens
        .sub(burnAmount); // Burned tokens
      
      expect(await amazonCoin.totalSupply()).to.equal(expectedTotalSupply);
    });

    it("Should handle multiple users purchasing tokens simultaneously", async function () {
      const { amazonCoin, user1, user2, user3 } = await loadFixture(deployAmazonCoinFixture);

      const purchaseAmount = ethers.utils.parseEther("500");
      const etherCost = await amazonCoin.calculateEtherCost(purchaseAmount);

      // Multiple users purchase tokens
      await Promise.all([
        amazonCoin.connect(user1).purchaseTokens(purchaseAmount, { value: etherCost }),
        amazonCoin.connect(user2).purchaseTokens(purchaseAmount, { value: etherCost }),
        amazonCoin.connect(user3).purchaseTokens(purchaseAmount, { value: etherCost }),
      ]);

      // Verify all users received tokens
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(purchaseAmount);
      expect(await amazonCoin.balanceOf(user2.address)).to.equal(purchaseAmount);
      expect(await amazonCoin.balanceOf(user3.address)).to.equal(purchaseAmount);

      // Verify total Ether collected
      const expectedEtherCollected = etherCost.mul(3);
      expect(await amazonCoin.totalEtherCollected()).to.equal(expectedEtherCollected);
    });

    it("Should handle exchange rate changes affecting purchases", async function () {
      const { amazonCoin, owner, user1, user2 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      
      // User1 purchases at initial rate
      const initialRate = await amazonCoin.exchangeRate();
      const initialCost = await amazonCoin.calculateEtherCost(tokenAmount);
      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: initialCost });

      // Owner changes exchange rate (doubles it)
      const newRate = initialRate.mul(2);
      await amazonCoin.connect(owner).setExchangeRate(newRate);

      // User2 purchases at new rate (should cost more)
      const newCost = await amazonCoin.calculateEtherCost(tokenAmount);
      expect(newCost).to.equal(initialCost.mul(2));
      
      await amazonCoin.connect(user2).purchaseTokens(tokenAmount, { value: newCost });

      // Both users should have same token amount
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(tokenAmount);
      expect(await amazonCoin.balanceOf(user2.address)).to.equal(tokenAmount);

      // But total Ether collected should reflect different rates
      const expectedTotalEther = initialCost.add(newCost);
      expect(await amazonCoin.totalEtherCollected()).to.equal(expectedTotalEther);
    });
  });

  describe("Emergency Scenarios", function () {
    it("Should handle emergency pause and recovery", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinWithStateFixture);

      // Normal operation before pause
      const tokenAmount = ethers.utils.parseEther("500");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);
      
      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
      expect(await amazonCoin.balanceOf(user1.address)).to.be.gt(0);

      // Emergency pause
      await amazonCoin.connect(owner).pause();

      // All operations should be blocked
      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost })
      ).to.be.revertedWith("Pausable: paused");

      await expect(
        amazonCoin.connect(user1).transfer(owner.address, tokenAmount)
      ).to.be.revertedWith("Pausable: paused");

      // Emergency withdrawal should still work
      const contractBalance = await ethers.provider.getBalance(amazonCoin.address);
      await amazonCoin.connect(owner).emergencyWithdrawAll();
      expect(await ethers.provider.getBalance(amazonCoin.address)).to.equal(0);

      // Unpause and resume normal operations
      await amazonCoin.connect(owner).unpause();
      
      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
      expect(await amazonCoin.balanceOf(user1.address)).to.be.gt(tokenAmount);
    });

    it("Should handle minting disable and re-enable", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      // Normal purchase works
      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });

      // Disable minting
      await amazonCoin.connect(owner).setMintingEnabled(false);

      // Purchases should fail
      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost })
      ).to.be.revertedWith("AmazonCoin: Minting is currently disabled");

      // Owner minting should also fail
      await expect(
        amazonCoin.connect(owner).mint(user1.address, tokenAmount)
      ).to.be.revertedWith("AmazonCoin: Minting is currently disabled");

      // But transfers should still work
      await amazonCoin.connect(user1).transfer(owner.address, tokenAmount.div(2));

      // Re-enable minting
      await amazonCoin.connect(owner).setMintingEnabled(true);

      // Purchases should work again
      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should have reasonable gas costs for common operations", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      // Test purchase gas cost
      const purchaseTx = await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
      const purchaseReceipt = await purchaseTx.wait();
      
      // Purchase should use less than 150k gas
      expect(purchaseReceipt.gasUsed).to.be.lt(150000);

      // Test transfer gas cost
      const transferTx = await amazonCoin.connect(user1).transfer(user1.address, tokenAmount.div(2));
      const transferReceipt = await transferTx.wait();
      
      // Transfer should use less than 60k gas
      expect(transferReceipt.gasUsed).to.be.lt(60000);
    });
  });

  describe("Edge Cases and Boundary Conditions", function () {
    it("Should handle maximum supply edge case", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinFixture);

      const maxSupply = await amazonCoin.MAX_SUPPLY();
      const currentSupply = await amazonCoin.totalSupply();
      const remainingSupply = maxSupply.sub(currentSupply);

      // Mint exactly to the maximum supply
      await amazonCoin.connect(owner).mint(user1.address, remainingSupply);
      
      expect(await amazonCoin.totalSupply()).to.equal(maxSupply);
      expect(await amazonCoin.getRemainingSupply()).to.equal(0);

      // Any additional minting should fail
      await expect(
        amazonCoin.connect(owner).mint(user1.address, 1)
      ).to.be.revertedWith("AmazonCoin: Minting would exceed maximum supply");

      await expect(
        amazonCoin.connect(user1).purchaseTokens(1, { value: await amazonCoin.exchangeRate() })
      ).to.be.revertedWith("AmazonCoin: Purchase would exceed maximum supply");
    });

    it("Should handle very small token purchases", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      // Purchase 1 wei worth of tokens
      const tokenAmount = 1;
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(tokenAmount);
    });

    it("Should handle large token purchases", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      // Purchase a large amount (but within limits)
      const tokenAmount = ethers.utils.parseEther("100000"); // 100k tokens
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      // Fund user1 with enough ETH
      const [owner] = await ethers.getSigners();
      await owner.sendTransaction({ to: user1.address, value: etherCost.add(ethers.utils.parseEther("1")) });

      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });
      expect(await amazonCoin.balanceOf(user1.address)).to.equal(tokenAmount);
    });
  });
});
