# AmazonCoin API Documentation

Complete API reference for the AmazonCoin smart contract.

## 📋 Contract Information

- **Contract Name**: AmazonCoin
- **Symbol**: AC
- **Decimals**: 18
- **Standard**: ERC20 + Extensions

## 🔧 Constructor

### `constructor()`

Initializes the AmazonCoin contract with default parameters.

**Parameters**: None

**Effects**:
- Sets token name to "Amazon Coin"
- Sets token symbol to "AC"
- Sets initial exchange rate to 0.0001 ETH per token
- Enables minting
- Mints 10% of max supply to deployer

## 💰 Core Functions

### `purchaseTokens(uint256 amount)`

Purchase tokens by sending Ether at the current exchange rate.

**Parameters**:
- `amount` (uint256): Number of tokens to purchase (in wei, 18 decimals)

**Requirements**:
- Contract must not be paused
- Minting must be enabled
- Must send exact Ether amount for token quantity
- Purchase must not exceed maximum supply
- Amount must be greater than zero

**Events Emitted**:
- `TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid)`

**Example**:
```javascript
const tokenAmount = ethers.utils.parseEther("1000"); // 1000 tokens
const etherCost = await contract.calculateEtherCost(tokenAmount);
await contract.purchaseTokens(tokenAmount, { value: etherCost });
```

### `mint(address to, uint256 amount)`

**Access**: Owner only

Mint tokens directly to an address without payment.

**Parameters**:
- `to` (address): Recipient address
- `amount` (uint256): Number of tokens to mint

**Requirements**:
- Caller must be contract owner
- Contract must not be paused
- Recipient address must not be zero
- Amount must be greater than zero
- Minting must not exceed maximum supply

**Events Emitted**:
- `TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid)` (with etherPaid = 0)

## 🎛️ Owner Functions

### `setExchangeRate(uint256 newRate)`

**Access**: Owner only

Update the exchange rate for token purchases.

**Parameters**:
- `newRate` (uint256): New exchange rate in wei per token

**Requirements**:
- Caller must be contract owner
- New rate must be greater than zero

**Events Emitted**:
- `ExchangeRateUpdated(uint256 oldRate, uint256 newRate)`

### `setMintingEnabled(bool enabled)`

**Access**: Owner only

Enable or disable token minting and purchases.

**Parameters**:
- `enabled` (bool): Whether minting should be enabled

**Requirements**:
- Caller must be contract owner

**Events Emitted**:
- `MintingStatusChanged(bool enabled)`

### `pause()`

**Access**: Owner only

Pause all token transfers and purchases.

**Requirements**:
- Caller must be contract owner
- Contract must not already be paused

**Events Emitted**:
- `Paused(address account)`

### `unpause()`

**Access**: Owner only

Resume all token transfers and purchases.

**Requirements**:
- Caller must be contract owner
- Contract must be paused

**Events Emitted**:
- `Unpaused(address account)`

### `withdrawEther(uint256 amount)`

**Access**: Owner only

Withdraw collected Ether from the contract.

**Parameters**:
- `amount` (uint256): Amount of Ether to withdraw in wei

**Requirements**:
- Caller must be contract owner
- Amount must be greater than zero
- Contract must have sufficient balance
- Protected against reentrancy

**Events Emitted**:
- `EtherWithdrawn(address indexed owner, uint256 amount)`

### `emergencyWithdrawAll()`

**Access**: Owner only

Emergency withdrawal of all Ether in the contract.

**Requirements**:
- Caller must be contract owner
- Contract must have Ether balance
- Protected against reentrancy

**Events Emitted**:
- `EmergencyWithdrawal(address indexed owner, uint256 amount)`

## 👁️ View Functions

### `name()` → `string`

Returns the token name.

**Returns**: "Amazon Coin"

### `symbol()` → `string`

Returns the token symbol.

**Returns**: "AC"

### `decimals()` → `uint8`

Returns the number of decimals.

**Returns**: 18

### `totalSupply()` → `uint256`

Returns the current total supply of tokens.

### `balanceOf(address account)` → `uint256`

Returns the token balance of an account.

**Parameters**:
- `account` (address): Address to check balance for

### `MAX_SUPPLY()` → `uint256`

Returns the maximum possible supply.

**Returns**: 1,000,000,000 * 10^18 (1 billion tokens)

### `INITIAL_EXCHANGE_RATE()` → `uint256`

Returns the initial exchange rate.

**Returns**: 0.0001 * 10^18 (0.0001 ETH per token)

### `exchangeRate()` → `uint256`

Returns the current exchange rate in wei per token.

### `mintingEnabled()` → `bool`

Returns whether minting is currently enabled.

### `totalEtherCollected()` → `uint256`

Returns the total amount of Ether collected from token purchases.

### `paused()` → `bool`

Returns whether the contract is currently paused.

### `owner()` → `address`

Returns the address of the contract owner.

### `getRemainingSupply()` → `uint256`

Returns the number of tokens that can still be minted.

**Returns**: `MAX_SUPPLY - totalSupply()`

### `calculateEtherCost(uint256 tokenAmount)` → `uint256`

Calculate the Ether cost for a given amount of tokens.

**Parameters**:
- `tokenAmount` (uint256): Number of tokens

**Returns**: Ether cost in wei

**Formula**: `tokenAmount * exchangeRate / 10^18`

### `getExchangeRate()` → `uint256`

Returns the current exchange rate (same as `exchangeRate()`).

## 🔥 Burn Functions

### `burn(uint256 amount)`

Burn tokens from caller's balance.

**Parameters**:
- `amount` (uint256): Number of tokens to burn

**Requirements**:
- Caller must have sufficient balance
- Amount must be greater than zero

### `burnFrom(address account, uint256 amount)`

Burn tokens from another account (requires allowance).

**Parameters**:
- `account` (address): Account to burn tokens from
- `amount` (uint256): Number of tokens to burn

**Requirements**:
- Account must have sufficient balance
- Caller must have sufficient allowance
- Amount must be greater than zero

## 📡 Special Functions

### `receive()`

Automatically purchase tokens when Ether is sent directly to the contract.

**Requirements**:
- Must send Ether with transaction
- Minting must be enabled
- Contract must not be paused
- Purchase must not exceed maximum supply

**Events Emitted**:
- `TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid)`

### `fallback()`

Rejects all function calls that don't match existing functions.

**Behavior**: Always reverts with "Function does not exist"

## 📊 Events

### `TokensPurchased(address indexed buyer, uint256 amount, uint256 etherPaid)`

Emitted when tokens are purchased or minted.

**Parameters**:
- `buyer`: Address that received tokens
- `amount`: Number of tokens purchased/minted
- `etherPaid`: Amount of Ether paid (0 for owner minting)

### `ExchangeRateUpdated(uint256 oldRate, uint256 newRate)`

Emitted when exchange rate is updated.

**Parameters**:
- `oldRate`: Previous exchange rate
- `newRate`: New exchange rate

### `MintingStatusChanged(bool enabled)`

Emitted when minting is enabled or disabled.

**Parameters**:
- `enabled`: New minting status

### `EtherWithdrawn(address indexed owner, uint256 amount)`

Emitted when Ether is withdrawn by owner.

**Parameters**:
- `owner`: Owner address
- `amount`: Amount withdrawn

### `EmergencyWithdrawal(address indexed owner, uint256 amount)`

Emitted during emergency withdrawal.

**Parameters**:
- `owner`: Owner address
- `amount`: Amount withdrawn

## 🔒 Access Control

### Owner-Only Functions
- `mint()`
- `setExchangeRate()`
- `setMintingEnabled()`
- `pause()`
- `unpause()`
- `withdrawEther()`
- `emergencyWithdrawAll()`

### Public Functions
- `purchaseTokens()`
- `transfer()`
- `transferFrom()`
- `approve()`
- `burn()`
- `burnFrom()`
- All view functions

## 💡 Usage Examples

### Purchase Tokens
```javascript
// Calculate cost for 1000 tokens
const tokenAmount = ethers.utils.parseEther("1000");
const etherCost = await contract.calculateEtherCost(tokenAmount);

// Purchase tokens
await contract.purchaseTokens(tokenAmount, { value: etherCost });
```

### Owner Minting
```javascript
// Mint 5000 tokens to user
const recipient = "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6";
const amount = ethers.utils.parseEther("5000");
await contract.mint(recipient, amount);
```

### Update Exchange Rate
```javascript
// Set new rate to 0.0002 ETH per token
const newRate = ethers.utils.parseEther("0.0002");
await contract.setExchangeRate(newRate);
```

### Emergency Pause
```javascript
// Pause all transfers
await contract.pause();

// Later, unpause
await contract.unpause();
```

## ⚠️ Error Messages

Common error messages and their meanings:

- `"AmazonCoin: Amount must be greater than zero"` - Invalid amount parameter
- `"AmazonCoin: Incorrect Ether amount sent"` - Wrong Ether value for purchase
- `"AmazonCoin: Minting is currently disabled"` - Minting has been disabled
- `"AmazonCoin: Minting would exceed maximum supply"` - Purchase/mint would exceed cap
- `"AmazonCoin: Cannot mint to zero address"` - Invalid recipient address
- `"Ownable: caller is not the owner"` - Unauthorized access to owner function
- `"Pausable: paused"` - Operation attempted while contract is paused
