'use client'

import React from 'react'
import { HashLoader } from 'react-spinners'

const LoadingSpinner = ({ 
  size = 50, 
  color = '#3B82F6', 
  loading = true, 
  message = 'Loading...', 
  overlay = false 
}) => {
  if (!loading) return null

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <HashLoader size={size} color={color} loading={loading} />
      {message && (
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 shadow-xl">
          {spinnerContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinnerContent}
    </div>
  )
}

// Transaction loading component
export const TransactionLoader = ({ isLoading, message }) => {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <HashLoader size={60} color="#FB9701" loading={isLoading} />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Processing Transaction
            </h3>
            <p className="text-sm text-gray-600">
              {message || 'Please wait while your transaction is being processed...'}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This may take a few moments
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Network status component with Hedera support
export const NetworkStatus = ({ chain, isConnected }) => {
  if (!isConnected) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Wallet not connected</span>
        </div>
      </div>
    )
  }

  // Supported networks: Ethereum (1, 11155111) and Hedera (295, 296)
  const supportedNetworks = [1, 11155111, 295, 296, 31337] // Added Hedera and local dev
  const isUnsupportedNetwork = chain && !supportedNetworks.includes(chain.id)

  if (isUnsupportedNetwork) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            Unsupported network: {chain.name}. Please switch to Ethereum, Sepolia, or Hedera networks.
          </span>
        </div>
      </div>
    )
  }

  // Determine network type and styling
  const isHedera = chain && (chain.id === 295 || chain.id === 296)
  const isTestnet = chain && (chain.id === 11155111 || chain.id === 296 || chain.id === 31337)

  const networkColor = isHedera ? 'purple' : 'green'
  const bgColor = isHedera ? 'bg-purple-100' : 'bg-green-100'
  const borderColor = isHedera ? 'border-purple-400' : 'border-green-400'
  const textColor = isHedera ? 'text-purple-700' : 'text-green-700'

  return (
    <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">
            Connected to {chain?.name || 'Unknown Network'}
          </span>
          {isTestnet && (
            <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
              Testnet
            </span>
          )}
        </div>
        <div className="text-xs opacity-75">
          Chain ID: {chain?.id}
        </div>
      </div>
    </div>
  )
}

// Network switcher component
export const NetworkSwitcher = ({ currentChain, onSwitchNetwork, supportedNetworks }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Switch Network</h3>
      <div className="grid grid-cols-2 gap-2">
        {supportedNetworks.map((network) => (
          <button
            key={network.chainId}
            onClick={() => onSwitchNetwork(network.chainId)}
            disabled={currentChain?.id === network.chainId}
            className={`p-2 text-sm rounded border transition-colors ${
              currentChain?.id === network.chainId
                ? 'bg-blue-50 border-blue-200 text-blue-700 cursor-not-allowed'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{network.name}</div>
            <div className="text-xs opacity-75">{network.currency}</div>
            {network.type === 'testnet' && (
              <div className="text-xs text-orange-600">Testnet</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default LoadingSpinner
