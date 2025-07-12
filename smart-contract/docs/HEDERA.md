# Hedera Network Deployment Guide

This guide covers deploying and interacting with the AmazonCoin smart contract on Hedera networks.

## 🌐 About Hedera

Hedera is a public distributed ledger that uses hashgraph consensus, offering:
- **High Throughput**: 10,000+ transactions per second
- **Low Fees**: Predictable, low-cost transactions
- **Fast Finality**: 3-5 second transaction finality
- **Carbon Negative**: Environmentally sustainable
- **Enterprise Grade**: Built for enterprise adoption

## 🔧 Hedera Network Configuration

### Supported Networks

| Network | Chain ID | RPC URL | Explorer |
|---------|----------|---------|----------|
| Mainnet | 295 | https://mainnet.hashio.io/api | https://hashscan.io/mainnet |
| Testnet | 296 | https://testnet.hashio.io/api | https://hashscan.io/testnet |
| Previewnet | 297 | https://previewnet.hashio.io/api | https://hashscan.io/previewnet |

### Environment Setup

Add these variables to your `.env` file:

```env
# Hedera RPC URLs
HEDERA_RPC_URL=https://mainnet.hashio.io/api
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_PREVIEWNET_RPC_URL=https://previewnet.hashio.io/api

# Hedera API Key for verification
HEDERA_API_KEY=your_hedera_api_key_here

# IMPORTANT: Use separate private keys for security
# Hedera private key (for all Hedera networks)
HEDERA_PRIVATE_KEY=your_hedera_private_key_without_0x_prefix

# EVM private key (for Ethereum, Polygon, BSC, etc.)
EVM_PRIVATE_KEY=your_evm_private_key_without_0x_prefix

# Legacy private key (fallback for EVM networks)
PRIVATE_KEY=your_private_key_without_0x_prefix
```

### Private Key Security

**Why separate private keys?**
- **Network Isolation**: Different keys for different network types
- **Risk Mitigation**: Compromise of one key doesn't affect other networks
- **Operational Security**: Different teams can manage different networks
- **Compliance**: Some organizations require network separation

## 🚀 Deployment Process

### 1. Testnet Deployment

Start with Hedera Testnet for testing:

```bash
# Deploy to Hedera Testnet
npm run deploy:hedera-testnet

# Interact with the deployed contract
npm run hedera:interact
```

### 2. Previewnet Deployment

Test on Previewnet for pre-production validation:

```bash
# Deploy to Hedera Previewnet
npm run deploy:hedera-previewnet

# Interact with the deployed contract
npm run hedera:interact-previewnet
```

### 3. Mainnet Deployment

Deploy to Hedera Mainnet for production:

```bash
# Deploy to Hedera Mainnet
npm run deploy:hedera

# Interact with the deployed contract
npm run hedera:interact-mainnet
```

## 💰 HBAR Requirements

### Minimum Balances

- **Testnet**: 5+ HBAR (free from faucet)
- **Previewnet**: 5+ HBAR (free from faucet)
- **Mainnet**: 10+ HBAR (purchase required)

### Getting HBAR

#### Testnet/Previewnet
- Use the [Hedera Portal](https://portal.hedera.com/) faucet
- Free HBAR for testing purposes

#### Mainnet
- Purchase HBAR from exchanges (Binance, Coinbase, etc.)
- Transfer to your deployment wallet

## ⚙️ Hedera-Specific Considerations

### Gas Settings

Hedera requires different gas settings than Ethereum:

```javascript
{
  gasLimit: 8000000,        // Higher gas limits
  gasPrice: "10000000000",  // 10 gwei minimum
}
```

### Transaction Finality

- **Ethereum**: 12+ confirmations for finality
- **Hedera**: 1 confirmation (3-5 seconds)

### Contract Verification

Hedera uses HashScan for contract verification:
- Automatic verification via Hardhat plugin
- Manual verification at https://hashscan.io

## 🛠️ Development Workflow

### 1. Wallet Validation

Before deployment, validate your private key configuration:

```bash
# Check wallet configuration status
npm run wallet-status

# Validate Hedera private key
npm run validate-network -- --network hederaTestnet

# Run full deployment validation
npm run validate
```

### 2. Local Development

```bash
# Start local Hardhat node
npm run node

# Deploy locally for testing
npm run deploy:local

# Run tests
npm run test
```

### 3. Testnet Testing

```bash
# Validate configuration first
npm run validate-network -- --network hederaTestnet

# Deploy to Hedera Testnet
npm run deploy:hedera-testnet

# Run integration tests
npm run hedera:interact

# Verify contract
npm run verify:hedera-testnet
```

### 4. Production Deployment

```bash
# Validate mainnet configuration
npm run validate-network -- --network hedera

# Final deployment to mainnet
npm run deploy:hedera

# Verify on HashScan
npm run verify:hedera
```

## 📊 Monitoring and Analytics

### HashScan Explorer

Monitor your contract at:
- **Mainnet**: https://hashscan.io/mainnet/contract/YOUR_CONTRACT_ADDRESS
- **Testnet**: https://hashscan.io/testnet/contract/YOUR_CONTRACT_ADDRESS

### Key Metrics to Monitor

1. **Transaction Volume**: Number of token purchases/transfers
2. **Gas Usage**: Average gas consumption per transaction
3. **HBAR Collection**: Total HBAR collected from token sales
4. **Token Distribution**: Token holder analytics
5. **Contract Interactions**: Function call frequency

## 🔐 Security Considerations

### Hedera-Specific Security

1. **Consensus Mechanism**: Hashgraph provides Byzantine fault tolerance
2. **Network Governance**: Governed by the Hedera Governing Council
3. **Node Security**: Professional node operators with strict requirements
4. **Smart Contract Security**: Same Solidity security practices apply

### Best Practices

1. **Multi-Signature**: Use multi-sig wallets for mainnet deployments
2. **Gradual Rollout**: Start with small amounts on testnet
3. **Monitoring**: Set up alerts for unusual activity
4. **Backup**: Secure backup of private keys and deployment info

## 🚨 Troubleshooting

### Common Issues

#### 1. Insufficient HBAR Balance
```
Error: insufficient funds for gas * price + value
```
**Solution**: Add more HBAR to your wallet

#### 2. Gas Estimation Failed
```
Error: cannot estimate gas
```
**Solution**: Use higher gas limits (8M+) for Hedera

#### 3. RPC Connection Issues
```
Error: could not detect network
```
**Solution**: Check RPC URL and network connectivity

#### 4. Verification Failed
```
Error: verification failed
```
**Solution**: Ensure correct API key and contract address

#### 5. Private Key Configuration Issues
```
Error: HEDERA_PRIVATE_KEY is required for Hedera network
```
**Solution**: Set HEDERA_PRIVATE_KEY in your .env file

```
Error: Private key configuration invalid for network
```
**Solution**: Run `npm run wallet-status` to check configuration

#### 6. Wrong Network Type
```
Error: Using EVM private key for Hedera network
```
**Solution**: Ensure HEDERA_PRIVATE_KEY is set for Hedera networks

### Getting Help

1. **Hedera Discord**: https://hedera.com/discord
2. **Documentation**: https://docs.hedera.com
3. **Developer Portal**: https://portal.hedera.com
4. **GitHub Issues**: Create issues in this repository

## 📈 Performance Optimization

### Gas Optimization

1. **Batch Operations**: Combine multiple operations
2. **Efficient Contracts**: Use gas-optimized Solidity patterns
3. **State Management**: Minimize storage operations

### Network Optimization

1. **Connection Pooling**: Reuse RPC connections
2. **Caching**: Cache frequently accessed data
3. **Load Balancing**: Use multiple RPC endpoints

## 🔗 Useful Links

- [Hedera Website](https://hedera.com)
- [Hedera Documentation](https://docs.hedera.com)
- [HashScan Explorer](https://hashscan.io)
- [Hedera Portal](https://portal.hedera.com)
- [Hedera GitHub](https://github.com/hashgraph)
- [Developer Discord](https://hedera.com/discord)

## 📝 Example Deployment Output

```bash
🚀 Starting AmazonCoin deployment on Hedera...
📡 Network: hederaTestnet
⛽ Chain ID: 296
👤 Deploying with account: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
💰 Account balance: 10.5 HBAR

📋 Hedera Deployment Configuration:
   Token Name: Amazon Coin
   Token Symbol: AC
   Max Supply: 1000000000.0
   Initial Exchange Rate: 0.0001 HBAR per token
   Network Type: Testnet

🏭 Getting contract factory...
⛽ Estimated gas for deployment: 2847392
🚀 Deploying AmazonCoin contract on Hedera...
⏳ Waiting for deployment transaction...

✅ AmazonCoin deployed successfully on Hedera!
📍 Contract address: 0x1234567890123456789012345678901234567890
🔗 Transaction hash: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
⏳ Waiting for 1 confirmation(s)...
✅ 1 confirmation(s) received
📦 Block number: 12345678
⛽ Gas used: 2847392

🌐 Hedera Network Information:
   Network: hederaTestnet
   Chain ID: 296
   Explorer URL: https://hashscan.io/testnet/contract/0x1234567890123456789012345678901234567890
   Transaction URL: https://hashscan.io/testnet/transaction/0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

💾 Deployment information saved to: ./deployments/hederaTestnet-deployment.json
🎉 Hedera deployment completed successfully!
```

This completes the Hedera integration for the AmazonCoin smart contract project!
