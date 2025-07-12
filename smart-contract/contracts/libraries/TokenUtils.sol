// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title TokenUtils
 * @dev Utility library for token-related calculations and validations
 * @notice This library provides common utility functions for token operations
 */
library TokenUtils {
    using SafeMath for uint256;

    /**
     * @dev Calculate the percentage of a total amount
     * @param amount The total amount
     * @param percentage The percentage (in basis points, e.g., 100 = 1%)
     * @return The calculated percentage amount
     */
    function calculatePercentage(uint256 amount, uint256 percentage) 
        internal 
        pure 
        returns (uint256) 
    {
        require(percentage <= 10000, "TokenUtils: Percentage cannot exceed 100%");
        return amount.mul(percentage).div(10000);
    }

    /**
     * @dev Calculate exchange rate with precision
     * @param etherAmount The amount of Ether in wei
     * @param tokenAmount The amount of tokens (with decimals)
     * @return The exchange rate in wei per token
     */
    function calculateExchangeRate(uint256 etherAmount, uint256 tokenAmount) 
        internal 
        pure 
        returns (uint256) 
    {
        require(tokenAmount > 0, "TokenUtils: Token amount must be greater than zero");
        return etherAmount.mul(10**18).div(tokenAmount);
    }

    /**
     * @dev Calculate token amount from Ether with given exchange rate
     * @param etherAmount The amount of Ether in wei
     * @param exchangeRate The exchange rate in wei per token
     * @return The amount of tokens that can be purchased
     */
    function calculateTokenAmount(uint256 etherAmount, uint256 exchangeRate) 
        internal 
        pure 
        returns (uint256) 
    {
        require(exchangeRate > 0, "TokenUtils: Exchange rate must be greater than zero");
        return etherAmount.mul(10**18).div(exchangeRate);
    }

    /**
     * @dev Calculate Ether cost for token amount with given exchange rate
     * @param tokenAmount The amount of tokens
     * @param exchangeRate The exchange rate in wei per token
     * @return The Ether cost in wei
     */
    function calculateEtherCost(uint256 tokenAmount, uint256 exchangeRate) 
        internal 
        pure 
        returns (uint256) 
    {
        return tokenAmount.mul(exchangeRate).div(10**18);
    }

    /**
     * @dev Validate that an address is not the zero address
     * @param addr The address to validate
     * @param errorMessage The error message to use if validation fails
     */
    function validateAddress(address addr, string memory errorMessage) 
        internal 
        pure 
    {
        require(addr != address(0), errorMessage);
    }

    /**
     * @dev Validate that an amount is greater than zero
     * @param amount The amount to validate
     * @param errorMessage The error message to use if validation fails
     */
    function validateAmount(uint256 amount, string memory errorMessage) 
        internal 
        pure 
    {
        require(amount > 0, errorMessage);
    }

    /**
     * @dev Check if adding an amount would exceed a maximum limit
     * @param current The current amount
     * @param addition The amount to add
     * @param maximum The maximum allowed total
     * @return Whether the addition would exceed the maximum
     */
    function wouldExceedLimit(uint256 current, uint256 addition, uint256 maximum) 
        internal 
        pure 
        returns (bool) 
    {
        return current.add(addition) > maximum;
    }

    /**
     * @dev Calculate the remaining capacity given current and maximum amounts
     * @param current The current amount
     * @param maximum The maximum allowed amount
     * @return The remaining capacity
     */
    function remainingCapacity(uint256 current, uint256 maximum) 
        internal 
        pure 
        returns (uint256) 
    {
        require(current <= maximum, "TokenUtils: Current exceeds maximum");
        return maximum.sub(current);
    }
}
