// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IAmazonCoin
 * @dev Interface for the AmazonCoin contract
 * @notice This interface defines all external functions available in AmazonCoin
 */
interface IAmazonCoin is IERC20 {
    
    // Events
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid);
    event ExchangeRateUpdated(uint256 oldRate, uint256 newRate);
    event MintingStatusChanged(bool enabled);
    event EtherWithdrawn(address indexed owner, uint256 amount);
    event EmergencyWithdrawal(address indexed owner, uint256 amount);

    // Constants getters
    function MAX_SUPPLY() external view returns (uint256);
    function INITIAL_EXCHANGE_RATE() external view returns (uint256);
    
    // State variable getters
    function exchangeRate() external view returns (uint256);
    function mintingEnabled() external view returns (bool);
    function totalEtherCollected() external view returns (uint256);
    
    // Core functionality
    function purchaseTokens(uint256 amount) external payable;
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
    
    // Owner functions
    function setExchangeRate(uint256 newRate) external;
    function setMintingEnabled(bool enabled) external;
    function pause() external;
    function unpause() external;
    function withdrawEther(uint256 amount) external;
    function emergencyWithdrawAll() external;
    
    // View functions
    function getExchangeRate() external view returns (uint256);
    function getRemainingSupply() external view returns (uint256);
    function calculateEtherCost(uint256 tokenAmount) external view returns (uint256);
    function paused() external view returns (bool);
    function owner() external view returns (address);
}
