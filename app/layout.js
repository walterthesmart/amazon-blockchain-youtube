'use client'

import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { config } from '../lib/web3-config'
import { AmazonProvider } from '../context/AmazonContext'
import { HederaProvider } from '../context/HederaContext'
import { ModalProvider } from 'react-simple-hook-modal'
import ErrorBoundary from '../components/ErrorBoundary'
import { useState } from 'react'

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>Amazon Blockchain</title>
        <meta name="description" content="Decentralized Amazon marketplace powered by blockchain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ErrorBoundary>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <RainbowKitProvider>
                <AmazonProvider>
                  <HederaProvider>
                    <ModalProvider>
                      {children}
                    </ModalProvider>
                  </HederaProvider>
                </AmazonProvider>
              </RainbowKitProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
