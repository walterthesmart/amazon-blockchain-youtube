# Wallet Setup Guide

This guide explains how to configure separate private keys for different network types in the AmazonCoin project.

## 🔑 Private Key Configuration

### Overview

The project supports separate private keys for enhanced security:

- **EVM_PRIVATE_KEY**: For Ethereum, Polygon, BSC, Arbitrum, Optimism
- **HEDERA_PRIVATE_KEY**: For Hedera Mainnet, Testnet, Previewnet
- **PRIVATE_KEY**: Legacy fallback for EVM networks

### Why Separate Private Keys?

1. **Security Isolation**: Compromise of one key doesn't affect other networks
2. **Risk Management**: Different risk profiles for different networks
3. **Operational Separation**: Different teams can manage different networks
4. **Compliance**: Some organizations require network segregation
5. **Testing Safety**: Separate testnet and mainnet keys

## 📝 Configuration Steps

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Configure Private Keys

Edit your `.env` file:

```env
# =============================================================================
# PRIVATE KEYS & WALLET CONFIGURATION
# =============================================================================

# EVM Networks Private Key (Ethereum, Polygon, BSC, Arbitrum, Optimism, etc.)
EVM_PRIVATE_KEY=your_evm_private_key_here

# Hedera Networks Private Key (Hedera Mainnet, Testnet, Previewnet)
HEDERA_PRIVATE_KEY=your_hedera_private_key_here

# Legacy private key (for backward compatibility)
PRIVATE_KEY=your_legacy_private_key_here

# =============================================================================
# RPC ENDPOINTS
# =============================================================================

# Ethereum Networks
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY

# Polygon Networks
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Hedera Networks
HEDERA_RPC_URL=https://mainnet.hashio.io/api
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_PREVIEWNET_RPC_URL=https://previewnet.hashio.io/api

# =============================================================================
# API KEYS FOR CONTRACT VERIFICATION
# =============================================================================

ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
HEDERA_API_KEY=your_hedera_api_key
```

### Step 3: Validate Configuration

```bash
# Check wallet configuration status
npm run wallet-status

# Validate specific networks
npm run validate-network -- --network goerli
npm run validate-network -- --network hederaTestnet

# Run full deployment validation
npm run validate
```

## 🛡️ Security Best Practices

### 1. Private Key Generation

#### For EVM Networks:
```bash
# Using OpenSSL
openssl rand -hex 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### For Hedera Networks:
```bash
# Same format as EVM (64-character hex string)
openssl rand -hex 32
```

### 2. Wallet Separation

| Network Type | Recommended Wallet | Purpose |
|--------------|-------------------|---------|
| EVM Testnet | MetaMask/Software | Development & Testing |
| EVM Mainnet | Hardware Wallet | Production Deployment |
| Hedera Testnet | HashPack/Software | Development & Testing |
| Hedera Mainnet | Hardware Wallet | Production Deployment |

### 3. Key Management

```bash
# Example directory structure for key management
~/.crypto-keys/
├── evm/
│   ├── testnet.key      # EVM testnet private key
│   └── mainnet.key      # EVM mainnet private key
└── hedera/
    ├── testnet.key      # Hedera testnet private key
    └── mainnet.key      # Hedera mainnet private key
```

### 4. Environment-Specific Configuration

#### Development (.env.development)
```env
EVM_PRIVATE_KEY=your_evm_testnet_key
HEDERA_PRIVATE_KEY=your_hedera_testnet_key
```

#### Production (.env.production)
```env
EVM_PRIVATE_KEY=your_evm_mainnet_key
HEDERA_PRIVATE_KEY=your_hedera_mainnet_key
```

## 🔍 Validation Commands

### Check Wallet Status
```bash
npm run wallet-status
```

**Output Example:**
```
🔑 Wallet Configuration Status:
   EVM Private Key: ✅ Configured
   Hedera Private Key: ✅ Configured
   Mnemonic: ❌ Missing

📡 Available Networks: 11
   EVM Networks: 8 (mainnet, goerli, sepolia, polygon, mumbai, bsc, bscTestnet, arbitrum, optimism, hardhat)
   Hedera Networks: 3 (hedera, hederaTestnet, hederaPreviewnet)
```

### Validate Network Configuration
```bash
# Validate EVM network
npm run validate-network -- --network goerli

# Validate Hedera network
npm run validate-network -- --network hederaTestnet
```

### Full Deployment Validation
```bash
npm run validate
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Missing Private Key
```
Error: HEDERA_PRIVATE_KEY is required for Hedera network: hederaTestnet
```
**Solution**: Add HEDERA_PRIVATE_KEY to your .env file

#### 2. Wrong Key Format
```
Error: Invalid private key format
```
**Solution**: Ensure private key is 64-character hex string without 0x prefix

#### 3. Insufficient Balance
```
Error: Insufficient balance. Need at least 5 HBAR, have 0 HBAR
```
**Solution**: Fund your wallet with appropriate currency

#### 4. Network Mismatch
```
Warning: Using legacy PRIVATE_KEY for EVM network
```
**Solution**: Set EVM_PRIVATE_KEY for better security separation

### Validation Failures

#### Check Configuration
```bash
# Display current configuration
npm run wallet-status

# Test specific network
npm run validate-network -- --network hederaTestnet
```

#### Fix Common Issues
```bash
# 1. Check .env file exists
ls -la .env

# 2. Check private key format (should be 64 characters)
echo $HEDERA_PRIVATE_KEY | wc -c

# 3. Test network connectivity
curl -X POST https://testnet.hashio.io/api \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

## 📚 Examples

### Example 1: EVM-Only Setup
```env
# Only EVM networks
EVM_PRIVATE_KEY=abcd1234...
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHERSCAN_API_KEY=your_key
```

### Example 2: Hedera-Only Setup
```env
# Only Hedera networks
HEDERA_PRIVATE_KEY=efgh5678...
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
HEDERA_API_KEY=your_key
```

### Example 3: Full Multi-Network Setup
```env
# Both EVM and Hedera networks
EVM_PRIVATE_KEY=abcd1234...
HEDERA_PRIVATE_KEY=efgh5678...

# All RPC URLs
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# All API keys
ETHERSCAN_API_KEY=your_etherscan_key
HEDERA_API_KEY=your_hedera_key
```

## 🔒 Security Checklist

- [ ] **Separate private keys** for EVM and Hedera networks
- [ ] **Hardware wallets** for mainnet deployments
- [ ] **Secure storage** of private keys (not in code)
- [ ] **Environment separation** (dev/staging/prod)
- [ ] **Regular key rotation** for long-term projects
- [ ] **Backup and recovery** procedures documented
- [ ] **Access control** for production keys
- [ ] **Monitoring** for unusual transactions

## 📞 Support

If you encounter issues with wallet configuration:

1. **Check Documentation**: Review this guide and README.md
2. **Run Validation**: Use `npm run wallet-status` and `npm run validate`
3. **Check Logs**: Review error messages for specific issues
4. **Create Issue**: Open a GitHub issue with configuration details (without private keys!)

Remember: **Never share your private keys** or commit them to version control!
