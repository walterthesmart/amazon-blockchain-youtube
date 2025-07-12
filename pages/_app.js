import '../styles/globals.css'
import { MoralisProvider } from 'react-moralis'
import { AmazonProvider } from '../context/AmazonContext'
import { ModalProvider } from 'react-simple-hook-modal'

function MyApp({ Component, pageProps }) {
  // Check if Moralis credentials are available
  const moralisAppId = process.env.NEXT_PUBLIC_MORALIS_APP_ID
  const moralisServerUrl = process.env.NEXT_PUBLIC_MORALIS_SERVER

  // If Moralis credentials are missing, render without MoralisProvider
  if (!moralisAppId || !moralisServerUrl) {
    console.warn('Moralis credentials not found. Running in demo mode.')
    return (
      <AmazonProvider>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
      </AmazonProvider>
    )
  }

  return (
    <MoralisProvider
      serverUrl={moralisServerUrl}
      appId={moralisAppId}
    >
      <AmazonProvider>
        <ModalProvider>
          <Component {...pageProps} />
        </ModalProvider>
      </AmazonProvider>
    </MoralisProvider>
  )
}

export default MyApp
