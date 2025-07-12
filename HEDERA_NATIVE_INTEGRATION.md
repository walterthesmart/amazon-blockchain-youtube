# Native Hedera Integration Guide

## Overview

This document describes the comprehensive Hedera integration that leverages both EVM compatibility and native Hedera services through the official Hedera JavaScript SDK.

## Architecture

### Dual Integration Approach

The application now supports two transaction methods on Hedera networks:

1. **EVM Compatible Transactions**: Using wagmi/viem through MetaMask
2. **Native Hedera Transactions**: Using @hashgraph/sdk directly

### Package Dependencies

```json
{
  "@hashgraph/sdk": "^2.49.0",
  "@hashgraph/hedera-wallet-connect": "^1.3.7",
  "@hashgraph/proto": "^2.14.0"
}
```

## Core Components

### 1. Hedera SDK Utility (`lib/hedera-sdk.js`)

Provides native Hedera functionality:

```javascript
// Initialize Hedera client
const client = initializeHederaClient('testnet')

// Query account balance (HBAR + tokens)
const balance = await getAccountBalance('0.0.12345')

// Execute smart contract functions
const result = await executeContract(contractId, 'mint', parameters, gas, payableAmount)

// Create HTS tokens
const tokenResult = await createHederaToken(tokenConfig)

// Transfer HBAR/tokens natively
const transferResult = await transferHbar(from, to, amount, privateKey)
```

### 2. Hedera Context (`context/HederaContext.js`)

React context providing native Hedera state and functions:

```javascript
const {
  hederaAccountId,        // Converted from EVM address
  hederaBalance,          // Native HBAR balance
  isHederaInitialized,    // SDK initialization status
  mintTokensHedera,       // Native token minting
  transferHbarNative,     // Native HBAR transfers
  queryTokenBalance,      // Native balance queries
} = useContext(HederaContext)
```

### 3. Hedera Integration Component (`components/HederaIntegration.js`)

Comprehensive UI for native Hedera features:
- Account information display
- Native token operations
- HBAR transfers
- Transaction history
- SDK status monitoring

## Key Features

### Native Hedera Capabilities

#### 1. Account Management
- **EVM to Account ID Conversion**: Automatic mapping of wallet addresses to Hedera Account IDs
- **Balance Queries**: Native HBAR and token balance retrieval
- **Account Information**: Detailed account data from mirror nodes

#### 2. Smart Contract Interactions
- **Native Contract Calls**: Direct SDK-based contract interactions
- **Gas Optimization**: Better gas estimation and execution
- **Result Parsing**: Native handling of contract function results

#### 3. Token Operations
- **HTS Token Creation**: Create native Hedera tokens
- **Token Minting**: Mint tokens using native SDK
- **Token Transfers**: Transfer HTS tokens between accounts
- **Token Association**: Associate accounts with tokens

#### 4. Transaction Management
- **Native Transaction Signing**: Direct SDK transaction creation
- **Mirror Node Integration**: Real-time transaction status
- **HashScan Integration**: Proper block explorer links
- **Transaction History**: Native Hedera transaction tracking

### Enhanced User Experience

#### 1. Transaction Method Selection
Users can choose between:
- **EVM Compatible**: Traditional wallet-based transactions
- **Native Hedera**: SDK-based transactions for optimal performance

#### 2. Network Detection
- Automatic detection of Hedera networks
- SDK initialization based on network
- Proper fallback to EVM mode when needed

#### 3. Error Handling
- Comprehensive error messages for both EVM and native modes
- Network-specific error handling
- Graceful degradation when SDK unavailable

## Implementation Details

### Network Configuration

```javascript
export const HEDERA_NETWORKS = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: 296,
    client: () => Client.forTestnet(),
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    hashscanUrl: 'https://hashscan.io/testnet',
  },
  mainnet: {
    name: 'Hedera Mainnet',
    chainId: 295,
    client: () => Client.forMainnet(),
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
    hashscanUrl: 'https://hashscan.io/mainnet',
  },
}
```

### Contract Interaction Example

```javascript
// Native Hedera contract call
const queryTokenBalance = async () => {
  const contractId = contractAddress.replace('0x', '0.0.')
  const parameters = new ContractFunctionParameters()
    .addAddress(address)
  
  const result = await queryContract(contractId, 'balanceOf', parameters)
  return result.getUint256(0).toString()
}

// Native token minting
const mintTokensHedera = async (amount, hbarAmount) => {
  const parameters = new ContractFunctionParameters()
    .addUint256(amount)
  
  const payableAmount = Hbar.fromTinybars(hbarAmount * 100000000)
  
  return await executeContract(
    contractId,
    'mint',
    parameters,
    300000,
    payableAmount
  )
}
```

### Mirror Node Integration

```javascript
// Get transaction details
const getTransactionDetails = async (transactionId) => {
  const response = await fetch(
    `${mirrorNodeUrl}/api/v1/transactions/${transactionId}`
  )
  return await response.json()
}

// Get account information
const getAccountInfo = async (accountId) => {
  const response = await fetch(
    `${mirrorNodeUrl}/api/v1/accounts/${accountId}`
  )
  return await response.json()
}
```

## Benefits of Native Integration

### 1. Performance Improvements
- **Lower Fees**: Native transactions often have lower fees
- **Faster Execution**: Direct SDK calls bypass wallet overhead
- **Better Gas Estimation**: More accurate gas calculations

### 2. Enhanced Functionality
- **HTS Token Support**: Create and manage native Hedera tokens
- **Consensus Service**: Access to Hedera Consensus Service (HCS)
- **File Service**: Integration with Hedera File Service (HFS)
- **Smart Contract Service**: Enhanced smart contract capabilities

### 3. Developer Experience
- **Rich SDK**: Comprehensive JavaScript SDK
- **Type Safety**: Better TypeScript support
- **Error Handling**: Detailed error messages and status codes
- **Documentation**: Extensive Hedera documentation

### 4. User Experience
- **Choice of Methods**: Users can choose optimal transaction method
- **Better Feedback**: More detailed transaction status
- **Network Optimization**: Automatic optimization based on network

## Testing the Integration

### 1. Prerequisites
- Hedera Testnet account with HBAR
- MetaMask configured for Hedera Testnet
- Node.js 18+ for development

### 2. Test Scenarios

#### Native Token Minting
1. Connect to Hedera Testnet
2. Open token purchase modal
3. Select "Native Hedera SDK" option
4. Enter token amount
5. Verify transaction via HashScan

#### Account Information
1. Navigate to Hedera Integration section
2. Verify EVM address to Account ID conversion
3. Check HBAR and token balances
4. Confirm SDK initialization status

#### Transaction History
1. Perform native Hedera transactions
2. Check transaction history tab
3. Verify HashScan links work correctly

### 3. Debugging

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'hedera:*')
```

Check network status:
```javascript
// Verify SDK initialization
console.log('Hedera initialized:', isHederaInitialized)
console.log('Account ID:', hederaAccountId)
console.log('Network config:', getNetworkConfig())
```

## Future Enhancements

### 1. Hedera Token Service (HTS)
- Create custom marketplace tokens
- Implement token royalties
- Add token freezing/unfreezing

### 2. Hedera Consensus Service (HCS)
- Store transaction logs
- Implement audit trails
- Add message timestamping

### 3. Hedera File Service (HFS)
- Store asset metadata
- Implement decentralized storage
- Add file versioning

### 4. Advanced Features
- Multi-signature transactions
- Scheduled transactions
- Token atomic swaps
- Cross-chain bridges

## Security Considerations

### 1. Private Key Management
- Never expose private keys in frontend
- Use secure key storage for server operations
- Implement proper key rotation

### 2. Transaction Validation
- Validate all transaction parameters
- Implement proper access controls
- Add transaction limits

### 3. Network Security
- Use official Hedera endpoints
- Implement proper error handling
- Add rate limiting

## Support and Resources

### Official Documentation
- [Hedera Documentation](https://docs.hedera.com)
- [JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js)
- [Mirror Node API](https://docs.hedera.com/hedera/sdks-and-apis/rest-api)

### Community Resources
- [Hedera Discord](https://discord.gg/hedera)
- [Developer Portal](https://portal.hedera.com)
- [HashScan Explorer](https://hashscan.io)

### Troubleshooting
- Check network connectivity
- Verify account permissions
- Review transaction parameters
- Monitor gas limits and fees
