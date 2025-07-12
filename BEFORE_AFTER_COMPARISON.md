# Before/After Code Comparison

## 1. Package Dependencies

### Before (package.json)
```json
{
  "dependencies": {
    "@walletconnect/ethereum-provider": "^2.21.4",
    "@walletconnect/web3-provider": "^1.7.5",
    "@web3auth/web3auth": "^0.6.2",
    "ethers": "^5.6.1",
    "magic-sdk": "^8.1.0",
    "moralis": "^1.5.5",
    "moralis-v1": "^1.13.0",
    "react-moralis": "^1.3.4",
    "web3uikit": "^0.1.110"
  }
}
```

### After (package.json)
```json
{
  "dependencies": {
    "@rainbow-me/rainbowkit": "^2.1.0",
    "@tanstack/react-query": "^5.0.0",
    "ethers": "^6.13.0",
    "viem": "^2.21.0",
    "wagmi": "^2.12.0"
  }
}
```

## 2. Application Root

### Before (pages/_app.js)
```javascript
import { MoralisProvider } from 'react-moralis'
import { AmazonProvider } from '../context/AmazonContext'

function MyApp({ Component, pageProps }) {
  const moralisAppId = process.env.NEXT_PUBLIC_MORALIS_APP_ID
  const moralisServerUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER

  if (!moralisAppId || !moralisServerUrl) {
    return (
      <AmazonProvider>
        <Component {...pageProps} />
      </AmazonProvider>
    )
  }

  return (
    <MoralisProvider serverUrl={moralisServerUrl} appId={moralisAppId}>
      <AmazonProvider>
        <Component {...pageProps} />
      </AmazonProvider>
    </MoralisProvider>
  )
}
```

### After (app/layout.js)
```javascript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '../lib/web3-config'
import { AmazonProvider } from '../context/AmazonContext'
import ErrorBoundary from '../components/ErrorBoundary'

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <AmazonProvider>
                  {children}
                </AmazonProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

## 3. Context Provider

### Before (context/AmazonContext.js)
```javascript
import { useMoralis, useMoralisQuery } from 'react-moralis'
import { ethers } from 'ethers'

export const AmazonProvider = ({ children }) => {
  const {
    authenticate,
    isAuthenticated,
    enableWeb3,
    Moralis,
    user,
    isWeb3Enabled,
  } = useMoralis()

  const { data: userData } = useMoralisQuery('_User')
  const { data: assetsData } = useMoralisQuery('Assets')

  const buyTokens = async () => {
    const amount = ethers.BigNumber.from(tokenAmount)
    const price = ethers.BigNumber.from('100000000000000')
    const calcPrice = amount.mul(price)

    let options = {
      contractAddress: amazonCoinAddress,
      functionName: 'mint',
      abi: amazonAbi,
      msgValue: calcPrice,
      params: { amount },
    }
    const transaction = await Moralis.executeFunction(options)
  }
}
```

### After (context/AmazonContext.js)
```javascript
import { useAccount, useBalance, useReadContract, useWriteContract } from 'wagmi'
import { parseEther, formatUnits } from 'viem'

export const AmazonProvider = ({ children }) => {
  const { address, chain } = useAccount()
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: amazonCoinAddress,
    abi: amazonAbi,
    functionName: 'balanceOf',
    args: [address],
  })

  const { writeContract, data: hash, isPending } = useWriteContract()

  const buyTokens = useCallback(async () => {
    try {
      const amount = parseUnits(tokenAmount.toString(), 18)
      const value = parseEther(amountDue)

      writeContract({
        address: amazonCoinAddress,
        abi: amazonAbi,
        functionName: 'mint',
        args: [amount],
        value,
      })
    } catch (err) {
      setError(err.message || 'Failed to buy tokens')
    }
  }, [address, tokenAmount, amountDue, writeContract])
}
```

## 4. Wallet Connection

### Before (components/Sidebar.js)
```javascript
import { ConnectButton } from 'web3uikit'

const Sidebar = () => {
  const { isAuthenticated } = useContext(AmazonContext)
  
  return (
    <div>
      {isAuthenticated && (
        <div>Welcome {username}</div>
      )}
      <ConnectButton />
    </div>
  )
}
```

### After (components/Sidebar.js)
```javascript
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Sidebar = () => {
  const { isConnected } = useContext(AmazonContext)
  
  return (
    <div>
      {isConnected && (
        <div>Welcome {username}</div>
      )}
      <ConnectButton />
    </div>
  )
}
```

## 5. Error Handling

### Before
- Limited error handling
- No error boundaries
- Basic console.log for errors

### After (components/ErrorBoundary.js)
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h3>Something went wrong</h3>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
```

## Key Improvements

### 1. Decentralization
- **Before**: Relied on Moralis centralized backend
- **After**: Fully decentralized with client-side storage

### 2. Performance
- **Before**: Large bundle with multiple Web3 libraries
- **After**: Optimized bundle with modern libraries

### 3. Developer Experience
- **Before**: Complex Moralis setup with API keys
- **After**: Simple wagmi configuration, no API keys needed

### 4. User Experience
- **Before**: Basic error handling, limited feedback
- **After**: Comprehensive error boundaries, loading states, notifications

### 5. Maintainability
- **Before**: Dependent on legacy Moralis v1
- **After**: Modern, actively maintained libraries

### 6. Type Safety
- **Before**: JavaScript with limited typing
- **After**: TypeScript-ready with viem integration
