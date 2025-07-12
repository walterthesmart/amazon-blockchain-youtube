# Hedera Integration Test Guide

## Overview
This guide provides step-by-step instructions to test the Hedera network integration in the Amazon Blockchain frontend.

## Prerequisites

### 1. Wallet Setup
- **MetaMask** or compatible wallet installed
- **Hedera Testnet** network added to your wallet

### 2. Hedera Testnet Configuration
Add the following network to your wallet:

```
Network Name: Hedera Testnet
RPC URL: https://testnet.hashio.io/api
Chain ID: 296
Currency Symbol: HBAR
Block Explorer: https://hashscan.io/testnet
```

### 3. Test HBAR
- Get test HBAR from Hedera faucet: https://portal.hedera.com/faucet
- Minimum 1 HBAR required for testing

## Deployed Contract Information

### Hedera Testnet Deployment
- **Contract Address**: `0xd995b5323b1Ec4194D1cb2470a9b6383263CE196`
- **Network**: Hedera Testnet (Chain ID: 296)
- **Explorer**: https://hashscan.io/testnet/contract/0xd995b5323b1Ec4194D1cb2470a9b6383263CE196
- **Token Symbol**: AC (Amazon Coin)
- **Decimals**: 18

## Test Scenarios

### 1. Network Detection Test
**Objective**: Verify the app correctly detects Hedera networks

**Steps**:
1. Start the application: `npm run dev`
2. Connect your wallet
3. Switch to Hedera Testnet
4. Verify the network status shows:
   - 🟣 Hedera Network indicator
   - "Connected to Hedera Testnet"
   - Chain ID: 296

**Expected Results**:
- Purple network indicator for Hedera
- Correct network name and chain ID displayed
- Contract address should be the Hedera deployment

### 2. Wallet Connection Test
**Objective**: Ensure wallet connection works with Hedera

**Steps**:
1. Click "Connect Wallet" in RainbowKit
2. Select MetaMask
3. Approve connection
4. Switch to Hedera Testnet if not already connected

**Expected Results**:
- Wallet connects successfully
- Address displayed in sidebar
- Network status shows Hedera Testnet

### 3. Token Balance Test
**Objective**: Verify token balance reading from Hedera contract

**Steps**:
1. Ensure wallet is connected to Hedera Testnet
2. Check the header for AC token balance
3. Balance should show current Amazon Coin balance

**Expected Results**:
- Token balance displays correctly
- Shows "0 AC" if no tokens owned
- Updates when tokens are purchased

### 4. Token Purchase Test
**Objective**: Test buying Amazon Coins on Hedera

**Steps**:
1. Click on the AC balance in header
2. Buy Modal opens
3. Verify network information shows:
   - "🟣 Hedera Network"
   - "Network: Hedera Testnet | Currency: HBAR"
4. Enter token amount (e.g., 10)
5. Verify price calculation (10 tokens = 1.0 HBAR)
6. Click "Buy" button
7. Approve transaction in wallet

**Expected Results**:
- Price calculated in HBAR (not ETH)
- Transaction submitted to Hedera network
- Transaction hash links to HashScan
- Token balance updates after confirmation

### 5. Network Switching Test
**Objective**: Test switching between Ethereum and Hedera

**Steps**:
1. Connect to Hedera Testnet
2. Click "Switch Network" button
3. Select "Sepolia Testnet"
4. Approve network switch in wallet
5. Verify UI updates for Ethereum
6. Switch back to Hedera Testnet

**Expected Results**:
- Network switching works smoothly
- UI updates network indicators
- Contract addresses change appropriately
- Pricing currency updates (ETH ↔ HBAR)

### 6. Asset Purchase Test
**Objective**: Test purchasing marketplace assets with AC tokens

**Steps**:
1. Ensure you have AC tokens (buy some first)
2. Click on any asset card in the marketplace
3. Transaction should process
4. Check transaction history page

**Expected Results**:
- Asset purchase works with AC tokens
- Transaction recorded in history
- HashScan link for Hedera transactions

### 7. Transaction History Test
**Objective**: Verify transaction history with Hedera links

**Steps**:
1. Navigate to history page
2. Check purchased items
3. Click "Etherscan" button (should link to HashScan)

**Expected Results**:
- History shows purchased items
- Links point to HashScan for Hedera transactions
- Correct transaction hashes displayed

## Error Scenarios

### 1. Unsupported Network
**Test**: Connect to an unsupported network (e.g., Polygon)
**Expected**: Yellow warning message about unsupported network

### 2. No Contract Deployment
**Test**: Switch to Ethereum Mainnet (no contract deployed)
**Expected**: Warning message about contract not being available

### 3. Insufficient Balance
**Test**: Try to buy tokens without enough HBAR
**Expected**: Transaction fails with insufficient funds error

## Debugging

### Common Issues

1. **Network Not Detected**
   - Check wallet network configuration
   - Verify RPC URL is correct
   - Clear browser cache

2. **Contract Interaction Fails**
   - Verify contract address in constants.js
   - Check if contract is deployed on current network
   - Ensure wallet has sufficient gas

3. **Transaction Links Wrong**
   - Check block explorer URLs in constants.js
   - Verify HashScan URLs are correct

### Debug Information

The app logs debug information to console:
```javascript
// Check browser console for:
console.log('Buying tokens:', {
  network: currentNetwork?.name,
  chainId: chain?.id,
  contractAddress,
  amount: tokenAmount,
  value: amountDue,
  currency: networkPricing.currency,
  isHedera: isHederaNetwork(chain?.id),
})
```

## Success Criteria

✅ **All tests pass if**:
- Wallet connects to Hedera Testnet
- Network detection works correctly
- Token purchases work with HBAR pricing
- Transaction links point to HashScan
- Network switching functions properly
- UI shows appropriate Hedera indicators

## Next Steps

After successful testing:
1. Deploy to Hedera Mainnet
2. Update mainnet contract address
3. Test with real HBAR
4. Consider additional Hedera-specific features

## Support

For issues:
1. Check Hedera documentation: https://docs.hedera.com
2. HashScan explorer: https://hashscan.io
3. Hedera Discord: https://discord.gg/hedera
