# Amazon Blockchain - Decentralized Marketplace

A modern, decentralized marketplace built with Next.js, featuring multi-chain support for both Ethereum and Hedera networks. Purchase digital assets using Amazon Coins (AC) - an ERC-20 token deployed on multiple blockchain networks.

## 🌟 Features

### Multi-Chain Support
- **Hedera Networks**: Testnet (296) and Mainnet (295)
- **Ethereum Networks**: Sepolia Testnet (11155111) and Mainnet (1)
- **Automatic Network Detection**: Seamless switching between networks
- **Native Currency Support**: HBAR for Hedera, ETH for Ethereum

### Modern Web3 Stack
- **RainbowKit**: Beautiful wallet connection interface
- **wagmi**: React hooks for Ethereum interactions
- **viem**: TypeScript-first Ethereum library
- **@hashgraph/sdk**: Official Hedera JavaScript SDK for native functionality
- **Next.js App Router**: Modern React framework with SSR

### Native Hedera Integration
- **Dual Transaction Methods**: EVM-compatible and native Hedera SDK options
- **Hedera Token Service (HTS)**: Support for native Hedera tokens
- **Mirror Node Integration**: Real-time transaction data and account information
- **Account ID Conversion**: Automatic EVM address to Hedera Account ID mapping

### User Experience
- **Comprehensive Error Handling**: User-friendly error messages and recovery
- **Real-time Network Status**: Visual indicators for network connection
- **Loading States**: Smooth UX with proper loading indicators
- **Transaction Tracking**: Links to appropriate block explorers (Etherscan/HashScan)
- **Transaction Method Selection**: Choose between wallet-based or native SDK transactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Web3 wallet (MetaMask recommended)
- Test tokens (HBAR for Hedera, ETH for Ethereum testnets)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/walterthesmart/amazon-blockchain-youtube.git
cd amazon-blockchain-youtube
```

2. **Install dependencies**:
```bash
npm install
```

3. **Environment Setup** (Optional):
```bash
# Create .env.local file
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔗 Network Configuration

### Hedera Testnet Setup
Add to your wallet:
```
Network Name: Hedera Testnet
RPC URL: https://testnet.hashio.io/api
Chain ID: 296
Currency Symbol: HBAR
Block Explorer: https://hashscan.io/testnet
```

### Deployed Contracts

| Network | Chain ID | Contract Address | Explorer |
|---------|----------|------------------|----------|
| Hedera Testnet | 296 | `0xd995b5323b1Ec4194D1cb2470a9b6383263CE196` | [HashScan](https://hashscan.io/testnet/contract/0xd995b5323b1Ec4194D1cb2470a9b6383263CE196) |
| Sepolia Testnet | 11155111 | `0x1412D9A28bAAC801777581C28060B2C821e61823` | [Etherscan](https://sepolia.etherscan.io/address/0x1412D9A28bAAC801777581C28060B2C821e61823) |
| Local Development | 31337 | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Local |

## 🎮 How to Use

### 1. Connect Your Wallet
- Click "Connect Wallet" in the sidebar
- Select your preferred wallet (MetaMask, WalletConnect, etc.)
- Approve the connection

### 2. Switch Networks
- Use the "Switch Network" button to change between supported networks
- The UI automatically updates pricing and contract addresses

### 3. Buy Amazon Coins (AC)
- Click on your AC balance in the header
- Choose transaction method (on Hedera networks):
  - **EVM Compatible**: Traditional wallet-based transactions
  - **Native Hedera SDK**: Direct SDK transactions for optimal performance
- Enter the amount of tokens you want to purchase
- Pricing automatically adjusts based on network:
  - **Hedera**: 0.1 HBAR per AC token
  - **Ethereum**: 0.0001 ETH per AC token

### 4. Access Native Hedera Features (Hedera Networks Only)
- Navigate to the Hedera Integration section
- View account information and balances
- Perform native token operations
- Monitor Hedera transaction history

### 5. Purchase Digital Assets
- Browse the marketplace for available digital assets
- Click on any asset to purchase with AC tokens
- View your purchase history in the "Transaction History" page

## 🧪 Testing

### Hedera Integration Testing
See [HEDERA_INTEGRATION_TEST.md](./HEDERA_INTEGRATION_TEST.md) for comprehensive testing instructions.

### Quick Test Checklist
- [ ] Wallet connects to Hedera Testnet
- [ ] Network detection shows correct information
- [ ] Token purchases work with HBAR pricing
- [ ] Transaction links point to HashScan
- [ ] Network switching functions properly

## 📚 Documentation

- [Migration Guide](./MIGRATION_GUIDE.md) - Detailed migration from Moralis
- [Before/After Comparison](./BEFORE_AFTER_COMPARISON.md) - Code changes overview
- [Hedera Integration Test](./HEDERA_INTEGRATION_TEST.md) - EVM compatibility testing
- [Native Hedera Integration](./HEDERA_NATIVE_INTEGRATION.md) - Comprehensive native SDK guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both Ethereum and Hedera networks
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Hedera Documentation**: https://docs.hedera.com
- **wagmi Documentation**: https://wagmi.sh
- **RainbowKit Documentation**: https://rainbowkit.com
- **Issues**: Open an issue in this repository
