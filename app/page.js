'use client'

import { useContext, useState } from 'react'
import Main from '../components/Main'
import Sidebar from '../components/Sidebar'
import HederaIntegration from '../components/HederaIntegration'
import ContractStatus from '../components/ContractStatus'
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
  const [showContractStatus, setShowContractStatus] = useState(false)

  return (
    <>
      <div className={styles.networkStatus}>
        <NetworkStatus chain={chain} isConnected={isConnected} />
        {isConnected && (
          <div className="flex justify-end pr-4 gap-2">
            <button
              onClick={() => setShowContractStatus(!showContractStatus)}
              className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Contract Status
            </button>
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

      {showContractStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Contract Status & Verification</h2>
              <button
                onClick={() => setShowContractStatus(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <ContractStatus />
            </div>
          </div>
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
