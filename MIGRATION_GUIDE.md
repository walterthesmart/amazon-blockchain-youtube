# Amazon Blockchain Migration Guide

## Overview

This guide documents the comprehensive modernization of the Amazon Blockchain project, including the removal of Moralis dependencies and migration to a modern Web3 stack.

## Major Changes

### 1. Removed Moralis Dependencies
- **Before**: Used Moralis for Web3 backend, authentication, and data storage
- **After**: Replaced with wagmi + RainbowKit for decentralized Web3 connections
- **Benefits**: No more centralized API dependencies, better performance, modern hooks

### 2. Updated Web3 Stack
- **Moralis** → **wagmi + RainbowKit**
- **ethers.js v5** → **ethers.js v6 + viem**
- **web3uikit** → **@rainbow-me/rainbowkit**

### 3. Migrated to Next.js App Router
- **Before**: Pages Router (`pages/` directory)
- **After**: App Router (`app/` directory)
- **Benefits**: Better performance, improved developer experience, modern React features

### 4. Enhanced Error Handling
- Added comprehensive error boundaries
- Implemented proper loading states
- Added user-friendly notifications
- Network status monitoring

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
npm install
# or
yarn install
```

2. **Environment Variables** (Optional):
Create a `.env.local` file:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

3. **Run the development server**:
```bash
npm run dev
# or
yarn dev
```

## Key Features

### Modern Web3 Integration
- **RainbowKit**: Beautiful wallet connection UI
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript-first Ethereum library
- **Multiple wallet support**: MetaMask, WalletConnect, Coinbase Wallet, etc.

### Decentralized Architecture
- No centralized backend dependencies
- Client-side data storage using localStorage
- Direct smart contract interactions

### Enhanced UX
- Comprehensive error handling
- Loading states for all async operations
- Network status monitoring
- User-friendly notifications

## Smart Contract Integration

The application interacts with the AmazonCoin ERC-20 token contract:

```javascript
// Contract address (update for your deployment)
const amazonCoinAddress = '0x1412D9A28bAAC801777581C28060B2C821e61823'

// Supported networks
- Ethereum Mainnet
- Sepolia Testnet (recommended for development)
```

## Component Architecture

### Core Components
- `AmazonContext`: Global state management with wagmi hooks
- `ErrorBoundary`: Catches and handles React errors
- `LoadingSpinner`: Reusable loading components
- `Notification`: Toast notifications for user feedback

### Updated Components
All components have been updated to:
- Use wagmi hooks instead of Moralis
- Include proper error handling
- Support the new App Router structure
- Implement better loading states

## Migration Benefits

### Performance Improvements
- Faster initial load times
- Reduced bundle size
- Better caching with React Query
- Optimized re-renders

### Developer Experience
- TypeScript-ready architecture
- Better error messages
- Modern React patterns
- Improved debugging

### User Experience
- Faster wallet connections
- Better error feedback
- Network status awareness
- Responsive loading states

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**:
   - Ensure you have a Web3 wallet installed
   - Check that you're on a supported network
   - Clear browser cache if needed

2. **Transaction Failures**:
   - Check network status
   - Ensure sufficient ETH for gas fees
   - Verify contract address is correct

3. **Build Errors**:
   - Clear `.next` folder and `node_modules`
   - Reinstall dependencies
   - Check Node.js version compatibility

### Network Configuration

The app is configured for:
- **Development**: Sepolia testnet
- **Production**: Ethereum mainnet

To change networks, update `lib/web3-config.js`.

## Future Enhancements

### Recommended Improvements
1. **Add TypeScript** for better type safety
2. **Implement real marketplace contract** for asset trading
3. **Add IPFS integration** for decentralized asset storage
4. **Enhanced testing** with Jest and React Testing Library
5. **Performance monitoring** with Web Vitals

### Security Considerations
1. **Input validation** for all user inputs
2. **Rate limiting** for API calls
3. **Secure storage** for sensitive data
4. **Smart contract auditing** before mainnet deployment

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the component documentation
3. Check wagmi and RainbowKit documentation
4. Open an issue in the repository

## License

This project maintains the same license as the original codebase.
