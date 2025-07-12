# AmazonCoin Smart Contract

A secure, feature-rich ERC20 token implementation with enhanced functionality for the Amazon Coin ecosystem.

## 🌟 Features

- **ERC20 Compliant**: Full compatibility with ERC20 standard
- **Mintable**: Owner-controlled token minting with purchase functionality
- **Burnable**: Token holders can burn their tokens
- **Pausable**: Emergency pause functionality for all transfers
- **Capped Supply**: Maximum supply limit to prevent unlimited inflation
- **Configurable Exchange Rate**: Owner can adjust token purchase rate
- **Reentrancy Protection**: Secure against reentrancy attacks
- **Comprehensive Events**: Detailed event logging for transparency
- **Emergency Withdrawal**: Owner can withdraw collected Ether

## 📋 Contract Details

- **Name**: Amazon Coin
- **Symbol**: AC
- **Decimals**: 18
- **Max Supply**: 1,000,000,000 AC (1 billion tokens)
- **Initial Exchange Rate**: 0.0001 ETH per token
- **Initial Supply**: 10% of max supply minted to deployer

## 🏗️ Architecture

### Directory Structure

```
smart-contract/
├── contracts/
│   ├── tokens/
│   │   ├── AmazonCoin.sol          # Main token contract
│   │   └── interfaces/
│   │       └── IAmazonCoin.sol     # Contract interface
│   ├── libraries/
│   │   └── TokenUtils.sol          # Utility functions
│   └── mocks/
│       └── MockERC20.sol           # Mock contract for testing
├── scripts/
│   ├── deploy/
│   │   ├── 01-deploy-amazon-coin.js # Deployment script
│   │   └── verify-contracts.js     # Verification script
│   ├── utils/
│   │   └── network-config.js       # Network utilities
│   └── interactions/
│       └── mint-tokens.js          # Token minting script
├── test/
│   ├── unit/
│   │   └── AmazonCoin.test.js      # Unit tests
│   ├── integration/
│   │   └── TokenIntegration.test.js # Integration tests
│   └── fixtures/
│       └── deploy-fixtures.js      # Test fixtures
├── config/
│   ├── constants.js                # Configuration constants
│   └── networks.js                 # Network configurations
└── docs/
    ├── README.md                   # This file
    ├── SECURITY.md                 # Security considerations
    ├── API.md                      # API documentation
    ├── HEDERA.md                   # Hedera deployment guide
    └── WALLET-SETUP.md             # Wallet configuration guide
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-contract
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Important**: Configure separate private keys for different network types:
   - `EVM_PRIVATE_KEY` for Ethereum, Polygon, BSC, Arbitrum, Optimism
   - `HEDERA_PRIVATE_KEY` for Hedera networks (mainnet, testnet, previewnet)
   - `PRIVATE_KEY` as fallback for EVM networks (legacy support)

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Private Keys (use separate keys for security)
EVM_PRIVATE_KEY=your_evm_private_key_here          # For Ethereum, Polygon, BSC, etc.
HEDERA_PRIVATE_KEY=your_hedera_private_key_here    # For Hedera networks
PRIVATE_KEY=your_private_key_here                  # Legacy fallback

# RPC URLs
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
HEDERA_RPC_URL=https://mainnet.hashio.io/api
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
HEDERA_API_KEY=your_hedera_api_key

# Optional
GAS_PRICE=10
VERIFY_CONTRACTS=true
```

### Wallet Configuration

The project supports separate private keys for different network types for enhanced security:

#### Private Key Types
- **EVM_PRIVATE_KEY**: Used for all EVM-compatible networks (Ethereum, Polygon, BSC, Arbitrum, Optimism)
- **HEDERA_PRIVATE_KEY**: Used for all Hedera networks (mainnet, testnet, previewnet)
- **PRIVATE_KEY**: Legacy fallback for EVM networks (backward compatibility)

#### Validation Commands
```bash
# Check wallet configuration status
npm run wallet-status

# Validate private key for specific network
npm run validate-network -- --network goerli
npm run validate-network -- --network hederaTestnet

# Run full deployment validation
npm run validate
```

#### Security Best Practices
1. **Use separate wallets** for different network types
2. **Never commit private keys** to version control
3. **Use hardware wallets** for mainnet deployments
4. **Keep testnet and mainnet keys separate**
5. **Regularly rotate private keys**

### Network Configuration

Supported networks:
- **Mainnets**: Ethereum, Polygon, BSC, Arbitrum, Optimism, Hedera
- **Testnets**: Goerli, Sepolia, Mumbai, BSC Testnet, Hedera Testnet, Hedera Previewnet
- **Local**: Hardhat Network

## 📦 Deployment

### Local Development

1. **Start local node**
   ```bash
   npm run node
   ```

2. **Deploy to local network**
   ```bash
   npm run deploy:local
   ```

### Testnet Deployment

1. **Deploy to Goerli**
   ```bash
   npm run deploy:goerli
   ```

2. **Deploy to Sepolia**
   ```bash
   npm run deploy:sepolia
   ```

3. **Deploy to Hedera Testnet**
   ```bash
   npm run deploy:hedera-testnet
   ```

4. **Verify contract**
   ```bash
   npm run verify:goerli
   npm run verify:hedera-testnet
   ```

### Hedera Network Deployment

Hedera offers unique advantages with its hashgraph consensus and high throughput:

1. **Deploy to Hedera Testnet**
   ```bash
   npm run deploy:hedera-testnet
   ```

2. **Deploy to Hedera Previewnet**
   ```bash
   npm run deploy:hedera-previewnet
   ```

3. **Deploy to Hedera Mainnet**
   ```bash
   npm run deploy:hedera
   ```

4. **Interact with Hedera deployment**
   ```bash
   npm run hedera:interact          # Testnet
   npm run hedera:interact-mainnet  # Mainnet
   ```

### Mainnet Deployment

1. **Deploy to mainnet**
   ```bash
   npm run deploy:mainnet
   npm run deploy:hedera  # For Hedera mainnet
   ```

2. **Verify contract**
   ```bash
   npm run verify:mainnet
   npm run verify:hedera  # For Hedera mainnet
   ```

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Test Suites
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With gas reporting
npm run test:gas

# With coverage
npm run test:coverage
```

### Test Coverage

The test suite covers:
- ✅ Contract deployment and initialization
- ✅ Token purchasing with Ether
- ✅ Owner-only minting functionality
- ✅ Pause/unpause mechanisms
- ✅ Exchange rate updates
- ✅ Ether withdrawal functions
- ✅ Supply limit enforcement
- ✅ Access control mechanisms
- ✅ Edge cases and error conditions
- ✅ Gas optimization verification

## 🔐 Security Features

### Access Control
- **Owner-only functions**: Minting, pausing, rate changes, withdrawals
- **Ownable pattern**: Secure ownership management

### Reentrancy Protection
- **ReentrancyGuard**: Protects against reentrancy attacks
- **Checks-Effects-Interactions**: Proper function ordering

### Supply Management
- **Maximum supply cap**: Prevents unlimited inflation
- **Supply tracking**: Accurate total and remaining supply

### Emergency Controls
- **Pausable transfers**: Emergency stop functionality
- **Emergency withdrawal**: Owner can recover stuck funds
- **Minting toggle**: Can disable token purchases

## 📚 API Reference

### Core Functions

#### `purchaseTokens(uint256 amount)`
Purchase tokens by sending Ether at current exchange rate.

#### `mint(address to, uint256 amount)` (Owner only)
Mint tokens directly to an address without payment.

#### `setExchangeRate(uint256 newRate)` (Owner only)
Update the exchange rate for token purchases.

#### `pause()` / `unpause()` (Owner only)
Emergency pause/unpause all token transfers.

#### `withdrawEther(uint256 amount)` (Owner only)
Withdraw collected Ether from contract.

### View Functions

#### `getRemainingSupply()`
Returns the number of tokens that can still be minted.

#### `calculateEtherCost(uint256 tokenAmount)`
Calculate the Ether cost for a given amount of tokens.

#### `getExchangeRate()`
Get the current exchange rate in wei per token.

For complete API documentation, see [API.md](docs/API.md).

For Hedera-specific deployment and interaction guide, see [HEDERA.md](docs/HEDERA.md).

For detailed wallet configuration and private key setup, see [WALLET-SETUP.md](docs/WALLET-SETUP.md).

## 🛠️ Development

### Available Scripts

```bash
# Compilation
npm run compile          # Compile contracts
npm run clean           # Clean artifacts

# Testing
npm run test            # Run all tests
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests
npm run test:coverage   # Run with coverage
npm run test:gas        # Run with gas reporting

# Deployment
npm run deploy:local    # Deploy to local network
npm run deploy:goerli   # Deploy to Goerli testnet
npm run deploy:hedera-testnet   # Deploy to Hedera testnet
npm run deploy:hedera   # Deploy to Hedera mainnet
npm run deploy:mainnet  # Deploy to mainnet

# Verification
npm run verify:goerli   # Verify on Goerli
npm run verify:hedera-testnet   # Verify on Hedera testnet
npm run verify:hedera   # Verify on Hedera mainnet
npm run verify:mainnet  # Verify on mainnet

# Code Quality
npm run lint            # Lint Solidity code
npm run lint:fix        # Fix linting issues
npm run format          # Format code
npm run size            # Check contract sizes

# Utilities
npm run accounts        # List available accounts
npm run node           # Start local Hardhat node
```

### Custom Hardhat Tasks

```bash
# Get account information
npx hardhat accounts

# Get account balance
npx hardhat balance --account 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# Deploy AmazonCoin
npx hardhat deploy-amazon-coin --network goerli

# Get contract information
npx hardhat contract-info --address 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Solidity style guide
- Write comprehensive tests for new features
- Update documentation for API changes
- Run linting and formatting before commits
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This smart contract is provided as-is for educational and development purposes. Always conduct thorough testing and security audits before deploying to mainnet with real funds.

## 🔗 Links

- [Ethereum](https://ethereum.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Solidity](https://soliditylang.org/)

## 📞 Support

For questions and support:
- Create an issue in this repository
- Check the [documentation](docs/)
- Review the [security considerations](docs/SECURITY.md)
