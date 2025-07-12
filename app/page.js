'use client'

import { useContext, useState } from 'react'
import Main from '../components/Main'
import Sidebar from '../components/Sidebar'
import HederaIntegration from '../components/HederaIntegration'
import { NetworkStatus, NetworkSwitcher } from '../components/LoadingSpinner'
import { AmazonContext } from '../context/AmazonContext'

const styles = {
  container: `h-full w-full flex bg-[#fff]`,
  networkStatus: `fixed top-0 left-0 right-0 z-40`,
  networkSwitcher: `fixed top-4 right-4 z-50`,
}

export default function Home() {
  const {
    chain,
    isConnected,
    switchToNetwork,
    getSupportedNetworks,
    currentNetwork,
    isHederaNetwork,
    isEthereumNetwork
  } = useContext(AmazonContext)

  const [showNetworkSwitcher, setShowNetworkSwitcher] = useState(false)

  return (
    <>
      <div className={styles.networkStatus}>
        <NetworkStatus chain={chain} isConnected={isConnected} />
        {isConnected && (
          <div className="flex justify-end pr-4">
            <button
              onClick={() => setShowNetworkSwitcher(!showNetworkSwitcher)}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Switch Network
            </button>
          </div>
        )}
      </div>

      {showNetworkSwitcher && (
        <div className={styles.networkSwitcher}>
          <NetworkSwitcher
            currentChain={chain}
            onSwitchNetwork={(chainId) => {
              switchToNetwork(chainId)
              setShowNetworkSwitcher(false)
            }}
            supportedNetworks={getSupportedNetworks()}
          />
        </div>
      )}

      <div className={styles.container} style={{ marginTop: isConnected ? '120px' : '80px' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Main />
          {/* Show Hedera Integration when on Hedera network */}
          {isHederaNetwork && (
            <div className="p-6">
              <HederaIntegration />
            </div>
          )}
        </div>
      </div>

      {/* Network info display */}
      {isConnected && currentNetwork && (
        <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-xs">
          <div className="font-medium">
            {currentNetwork.name} ({currentNetwork.currency})
          </div>
          <div className="text-gray-500">
            {isHederaNetwork ? '🟣 Hedera Network' : '🟢 Ethereum Network'}
          </div>
        </div>
      )}
    </>
  )
}
