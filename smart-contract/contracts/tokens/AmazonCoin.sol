// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// SafeMath is no longer needed in Solidity 0.8+ as it has built-in overflow protection

/**
 * @title AmazonCoin
 * @dev Implementation of the AmazonCoin ERC20 token with enhanced security features
 * @notice This contract implements a mintable ERC20 token with purchase functionality
 *
 * Features:
 * - ERC20 compliant token with burn functionality
 * - Pausable transfers for emergency situations
 * - Reentrancy protection for all external functions
 * - Owner-controlled minting with configurable exchange rate
 * - Maximum supply cap to prevent unlimited inflation
 * - Comprehensive event logging for transparency
 * - Emergency withdrawal functionality for contract owner
 */
contract AmazonCoin is ERC20, ERC20Burnable, ERC20Pausable, Ownable, ReentrancyGuard {
    // Using built-in Solidity 0.8+ overflow protection instead of SafeMath

    // Constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens max
    uint256 public constant INITIAL_EXCHANGE_RATE = 0.0001 ether; // Initial rate: 1 token = 0.0001 ETH

    // State variables
    uint256 public exchangeRate;
    bool public mintingEnabled;
    uint256 public totalEtherCollected;

    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event MintingStatusChanged(bool enabled);
    event EtherWithdrawn(address indexed owner, uint256 amount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    /**
     * @dev Constructor that initializes the AmazonCoin token
     * @notice Sets up the token with initial parameters and mints initial supply to owner
     */
    constructor() ERC20("Amazon Coin", "AC") Ownable(msg.sender) {
        exchangeRate = INITIAL_EXCHANGE_RATE;
        mintingEnabled = true;

        // Mint initial supply to contract deployer (10% of max supply)
        uint256 initialSupply = MAX_SUPPLY / 10;
        _mint(msg.sender, initialSupply);

        emit TokensPurchased(msg.sender, initialSupply, 0);
    }

    /**
     * @dev Modifier to check if minting is currently enabled
     */
    modifier whenMintingEnabled() {
        require(mintingEnabled, "AmazonCoin: Minting is currently disabled");
        _;
    }

    /**
     * @dev Modifier to check if the total supply won't exceed maximum
     * @param amount The amount of tokens to be minted
     */
    modifier withinSupplyLimit(uint256 amount) {
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "AmazonCoin: Minting would exceed maximum supply"
        );
        _;
    }

    /**
     * @dev Purchase tokens by sending Ether to the contract
     * @param amount The number of tokens to purchase
     * @notice Users can buy tokens at the current exchange rate
     * @notice Requires exact Ether amount based on current exchange rate
     */
    function purchaseTokens(uint256 amount)
        external
        payable
        nonReentrant
        whenNotPaused
        whenMintingEnabled
        withinSupplyLimit(amount)
    {
        require(amount > 0, "AmazonCoin: Amount must be greater than zero");

        uint256 requiredEther = (amount * exchangeRate) / 10**18;
        require(msg.value == requiredEther, "AmazonCoin: Incorrect Ether amount sent");

        totalEtherCollected = totalEtherCollected + msg.value;
        _mint(msg.sender, amount);

        emit TokensPurchased(msg.sender, amount, msg.value);
    }

    /**
     * @dev Owner-only function to mint tokens without payment
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @notice Only contract owner can call this function
     */
    function mint(address to, uint256 amount)
        external
        onlyOwner
        whenNotPaused
        withinSupplyLimit(amount)
    {
        require(to != address(0), "AmazonCoin: Cannot mint to zero address");
        require(amount > 0, "AmazonCoin: Amount must be greater than zero");

        _mint(to, amount);
        emit TokensPurchased(to, amount, 0);
    }

    /**
     * @dev Update the exchange rate for token purchases
     * @param newRate The new exchange rate in wei per token
     * @notice Only contract owner can update the exchange rate
     */
    function setExchangeRate(uint256 newRate) external onlyOwner {
        require(newRate > 0, "AmazonCoin: Exchange rate must be greater than zero");

        uint256 oldRate = exchangeRate;
        exchangeRate = newRate;

        emit ExchangeRateUpdated(oldRate, newRate);
    }

    /**
     * @dev Enable or disable token minting
     * @param enabled Whether minting should be enabled
     * @notice Only contract owner can change minting status
     */
    function setMintingEnabled(bool enabled) external onlyOwner {
        mintingEnabled = enabled;
        emit MintingStatusChanged(enabled);
    }

    /**
     * @dev Pause all token transfers
     * @notice Only contract owner can pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause all token transfers
     * @notice Only contract owner can unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Withdraw collected Ether to owner
     * @param amount The amount of Ether to withdraw
     * @notice Only contract owner can withdraw collected Ether
     */
    function withdrawEther(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "AmazonCoin: Amount must be greater than zero");
        require(amount <= address(this).balance, "AmazonCoin: Insufficient contract balance");

        totalEtherCollected = totalEtherCollected - amount;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "AmazonCoin: Ether transfer failed");

        emit EtherWithdrawn(owner(), amount);
    }

    /**
     * @dev Emergency withdrawal of all Ether in contract
     * @notice Only contract owner can perform emergency withdrawal
     */
    function emergencyWithdrawAll() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "AmazonCoin: No Ether to withdraw");

        totalEtherCollected = 0;

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "AmazonCoin: Emergency withdrawal failed");

        emit EmergencyWithdrawal(owner(), balance);
    }

    /**
     * @dev Get the current exchange rate
     * @return The current exchange rate in wei per token
     */
    function getExchangeRate() external view returns (uint256) {
        return exchangeRate;
    }

    /**
     * @dev Get the remaining mintable supply
     * @return The number of tokens that can still be minted
     */
    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Calculate the Ether cost for a given amount of tokens
     * @param tokenAmount The number of tokens
     * @return The Ether cost in wei
     */
    function calculateEtherCost(uint256 tokenAmount) external view returns (uint256) {
        return (tokenAmount * exchangeRate) / 10**18;
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     * In OpenZeppelin v5, _beforeTokenTransfer was replaced with _update
     */
    function _update(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, amount);
    }

    /**
     * @dev Receive function to handle direct Ether transfers
     * @notice Automatically purchases tokens when Ether is sent directly
     */
    receive() external payable {
        require(msg.value > 0, "AmazonCoin: Must send Ether to purchase tokens");
        require(mintingEnabled, "AmazonCoin: Minting is currently disabled");
        require(!paused(), "AmazonCoin: Contract is paused");

        uint256 tokenAmount = (msg.value * 10**18) / exchangeRate;
        require(
            totalSupply() + tokenAmount <= MAX_SUPPLY,
            "AmazonCoin: Purchase would exceed maximum supply"
        );

        totalEtherCollected = totalEtherCollected + msg.value;
        _mint(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount, msg.value);
    }

    /**
     * @dev Fallback function - rejects all calls
     */
    fallback() external payable {
        revert("AmazonCoin: Function does not exist");
    }
}