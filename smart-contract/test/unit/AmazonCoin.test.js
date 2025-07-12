const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {
  deployAmazonCoinFixture,
  deployAmazonCoinWithStateFixture,
  deployPausedAmazonCoinFixture,
  deployAmazonCoinMintingDisabledFixture,
} = require("../fixtures/deploy-fixtures");

describe("AmazonCoin", function () {
  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      expect(await amazonCoin.name()).to.equal("Amazon Coin");
      expect(await amazonCoin.symbol()).to.equal("AC");
      expect(await amazonCoin.decimals()).to.equal(18);
      expect(await amazonCoin.owner()).to.equal(owner.address);
      expect(await amazonCoin.mintingEnabled()).to.equal(true);
      expect(await amazonCoin.paused()).to.equal(false);
    });

    it("Should mint initial supply to owner", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      const maxSupply = await amazonCoin.MAX_SUPPLY();
      const expectedInitialSupply = maxSupply.div(10); // 10% of max supply
      const ownerBalance = await amazonCoin.balanceOf(owner.address);

      expect(ownerBalance).to.equal(expectedInitialSupply);
      expect(await amazonCoin.totalSupply()).to.equal(expectedInitialSupply);
    });

    it("Should set correct exchange rate", async function () {
      const { amazonCoin } = await loadFixture(deployAmazonCoinFixture);

      const expectedRate = ethers.utils.parseEther("0.0001");
      expect(await amazonCoin.exchangeRate()).to.equal(expectedRate);
      expect(await amazonCoin.INITIAL_EXCHANGE_RATE()).to.equal(expectedRate);
    });
  });

  describe("Token Purchase", function () {
    it("Should allow users to purchase tokens with correct Ether amount", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost })
      )
        .to.emit(amazonCoin, "TokensPurchased")
        .withArgs(user1.address, tokenAmount, etherCost);

      expect(await amazonCoin.balanceOf(user1.address)).to.equal(tokenAmount);
    });

    it("Should reject purchase with incorrect Ether amount", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const incorrectEther = ethers.utils.parseEther("0.05"); // Wrong amount

      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: incorrectEther })
      ).to.be.revertedWith("AmazonCoin: Incorrect Ether amount sent");
    });

    it("Should reject purchase of zero tokens", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      await expect(
        amazonCoin.connect(user1).purchaseTokens(0, { value: 0 })
      ).to.be.revertedWith("AmazonCoin: Amount must be greater than zero");
    });

    it("Should reject purchase when minting is disabled", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinMintingDisabledFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost })
      ).to.be.revertedWith("AmazonCoin: Minting is currently disabled");
    });

    it("Should reject purchase when contract is paused", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployPausedAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      await expect(
        amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost })
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should update total Ether collected", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const etherCost = await amazonCoin.calculateEtherCost(tokenAmount);

      await amazonCoin.connect(user1).purchaseTokens(tokenAmount, { value: etherCost });

      expect(await amazonCoin.totalEtherCollected()).to.equal(etherCost);
    });
  });

  describe("Receive Function", function () {
    it("Should automatically purchase tokens when Ether is sent directly", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployAmazonCoinFixture);

      const etherAmount = ethers.utils.parseEther("0.1");
      const expectedTokens = await amazonCoin.calculateTokenAmount(etherAmount);

      await expect(
        user1.sendTransaction({ to: amazonCoin.address, value: etherAmount })
      )
        .to.emit(amazonCoin, "TokensPurchased")
        .withArgs(user1.address, expectedTokens, etherAmount);

      expect(await amazonCoin.balanceOf(user1.address)).to.equal(expectedTokens);
    });

    it("Should reject direct Ether transfer when paused", async function () {
      const { amazonCoin, user1 } = await loadFixture(deployPausedAmazonCoinFixture);

      const etherAmount = ethers.utils.parseEther("0.1");

      await expect(
        user1.sendTransaction({ to: amazonCoin.address, value: etherAmount })
      ).to.be.revertedWith("AmazonCoin: Contract is paused");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to mint tokens", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinFixture);

      const mintAmount = ethers.utils.parseEther("5000");

      await expect(amazonCoin.connect(owner).mint(user1.address, mintAmount))
        .to.emit(amazonCoin, "TokensPurchased")
        .withArgs(user1.address, mintAmount, 0);

      expect(await amazonCoin.balanceOf(user1.address)).to.equal(mintAmount);
    });

    it("Should reject minting by non-owner", async function () {
      const { amazonCoin, user1, user2 } = await loadFixture(deployAmazonCoinFixture);

      const mintAmount = ethers.utils.parseEther("5000");

      await expect(
        amazonCoin.connect(user1).mint(user2.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to update exchange rate", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      const newRate = ethers.utils.parseEther("0.0002");

      await expect(amazonCoin.connect(owner).setExchangeRate(newRate))
        .to.emit(amazonCoin, "ExchangeRateUpdated")
        .withArgs(await amazonCoin.INITIAL_EXCHANGE_RATE(), newRate);

      expect(await amazonCoin.exchangeRate()).to.equal(newRate);
    });

    it("Should reject zero exchange rate", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      await expect(
        amazonCoin.connect(owner).setExchangeRate(0)
      ).to.be.revertedWith("AmazonCoin: Exchange rate must be greater than zero");
    });

    it("Should allow owner to toggle minting", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      await expect(amazonCoin.connect(owner).setMintingEnabled(false))
        .to.emit(amazonCoin, "MintingStatusChanged")
        .withArgs(false);

      expect(await amazonCoin.mintingEnabled()).to.equal(false);

      await amazonCoin.connect(owner).setMintingEnabled(true);
      expect(await amazonCoin.mintingEnabled()).to.equal(true);
    });

    it("Should allow owner to pause and unpause", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinFixture);

      await amazonCoin.connect(owner).pause();
      expect(await amazonCoin.paused()).to.equal(true);

      await amazonCoin.connect(owner).unpause();
      expect(await amazonCoin.paused()).to.equal(false);
    });
  });

  describe("Ether Withdrawal", function () {
    it("Should allow owner to withdraw collected Ether", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinWithStateFixture);

      const initialOwnerBalance = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(amazonCoin.address);
      const withdrawAmount = contractBalance.div(2);

      await expect(amazonCoin.connect(owner).withdrawEther(withdrawAmount))
        .to.emit(amazonCoin, "EtherWithdrawn")
        .withArgs(owner.address, withdrawAmount);

      expect(await ethers.provider.getBalance(amazonCoin.address)).to.equal(
        contractBalance.sub(withdrawAmount)
      );
    });

    it("Should allow emergency withdrawal of all Ether", async function () {
      const { amazonCoin, owner } = await loadFixture(deployAmazonCoinWithStateFixture);

      const contractBalance = await ethers.provider.getBalance(amazonCoin.address);

      await expect(amazonCoin.connect(owner).emergencyWithdrawAll())
        .to.emit(amazonCoin, "EmergencyWithdrawal")
        .withArgs(owner.address, contractBalance);

      expect(await ethers.provider.getBalance(amazonCoin.address)).to.equal(0);
      expect(await amazonCoin.totalEtherCollected()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return correct remaining supply", async function () {
      const { amazonCoin } = await loadFixture(deployAmazonCoinFixture);

      const maxSupply = await amazonCoin.MAX_SUPPLY();
      const totalSupply = await amazonCoin.totalSupply();
      const expectedRemaining = maxSupply.sub(totalSupply);

      expect(await amazonCoin.getRemainingSupply()).to.equal(expectedRemaining);
    });

    it("Should calculate Ether cost correctly", async function () {
      const { amazonCoin } = await loadFixture(deployAmazonCoinFixture);

      const tokenAmount = ethers.utils.parseEther("1000");
      const exchangeRate = await amazonCoin.exchangeRate();
      const expectedCost = tokenAmount.mul(exchangeRate).div(ethers.utils.parseEther("1"));

      expect(await amazonCoin.calculateEtherCost(tokenAmount)).to.equal(expectedCost);
    });
  });

  describe("Supply Limits", function () {
    it("Should reject minting beyond maximum supply", async function () {
      const { amazonCoin, owner, user1 } = await loadFixture(deployAmazonCoinFixture);

      const maxSupply = await amazonCoin.MAX_SUPPLY();
      const currentSupply = await amazonCoin.totalSupply();
      const excessiveAmount = maxSupply.sub(currentSupply).add(1);

      await expect(
        amazonCoin.connect(owner).mint(user1.address, excessiveAmount)
      ).to.be.revertedWith("AmazonCoin: Minting would exceed maximum supply");
    });
  });
});
