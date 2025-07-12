/**
 * Deployment Sync Utility
 * Automatically syncs deployed contract addresses from deployment files
 */

import hederaTestnetDeployment from '../smart-contract/deployments/hederaTestnet-deployment.json'
import hardhatDeployment from '../smart-contract/deployments/hardhat-deployment.json'

// Import deployment data and extract contract addresses
const deploymentData = {
  hederaTestnet: hederaTestnetDeployment,
  hardhat: hardhatDeployment,
}

// Automatically generate contract addresses from deployment files
export const DEPLOYED_CONTRACT_ADDRESSES = {
  // Hedera Networks
  296: deploymentData.hederaTestnet?.contractAddress || '0x0000000000000000000000000000000000000000', // Hedera Testnet
  295: '0x0000000000000000000000000000000000000000', // Hedera Mainnet (to be deployed)
  
  // Ethereum Networks  
  11155111: '0x1412D9A28bAAC801777581C28060B2C821e61823', // Sepolia Testnet (manual entry)
  1: '0x0000000000000000000000000000000000000000', // Ethereum Mainnet (to be deployed)
  
  // Development
  31337: deploymentData.hardhat?.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Hardhat Local
}

// Deployment metadata for each network
export const DEPLOYMENT_METADATA = {
  296: {
    network: deploymentData.hederaTestnet?.network,
    chainId: deploymentData.hederaTestnet?.chainId,
    contractAddress: deploymentData.hederaTestnet?.contractAddress,
    deployerAddress: deploymentData.hederaTestnet?.deployerAddress,
    transactionHash: deploymentData.hederaTestnet?.transactionHash,
    blockNumber: deploymentData.hederaTestnet?.blockNumber,
    gasUsed: deploymentData.hederaTestnet?.gasUsed,
    timestamp: deploymentData.hederaTestnet?.timestamp,
    explorerUrl: deploymentData.hederaTestnet?.hederaSpecific?.explorerUrl,
    transactionUrl: deploymentData.hederaTestnet?.hederaSpecific?.transactionUrl,
    contractInfo: deploymentData.hederaTestnet?.contractInfo,
    burnOperations: deploymentData.hederaTestnet?.burnOperations,
  },
  31337: {
    network: deploymentData.hardhat?.network,
    chainId: deploymentData.hardhat?.chainId,
    contractAddress: deploymentData.hardhat?.contractAddress,
    deployerAddress: deploymentData.hardhat?.deployerAddress,
    transactionHash: deploymentData.hardhat?.transactionHash,
    blockNumber: deploymentData.hardhat?.blockNumber,
    gasUsed: deploymentData.hardhat?.gasUsed,
    timestamp: deploymentData.hardhat?.timestamp,
    contractInfo: deploymentData.hardhat?.contractInfo,
  },
}

// Validate deployment data
export const validateDeployments = () => {
  const validations = []
  
  Object.entries(DEPLOYED_CONTRACT_ADDRESSES).forEach(([chainId, address]) => {
    const isValidAddress = address && address !== '0x0000000000000000000000000000000000000000'
    const metadata = DEPLOYMENT_METADATA[chainId]
    
    validations.push({
      chainId: parseInt(chainId),
      address,
      isDeployed: isValidAddress,
      hasMetadata: !!metadata,
      network: metadata?.network || 'unknown',
      deploymentDate: metadata?.timestamp || null,
      explorerUrl: metadata?.explorerUrl || metadata?.transactionUrl || null,
    })
  })
  
  return validations
}

// Get deployment info for a specific chain
export const getDeploymentInfo = (chainId) => {
  return {
    address: DEPLOYED_CONTRACT_ADDRESSES[chainId],
    metadata: DEPLOYMENT_METADATA[chainId],
    isDeployed: DEPLOYED_CONTRACT_ADDRESSES[chainId] !== '0x0000000000000000000000000000000000000000',
  }
}

// Get all deployed networks
export const getDeployedNetworks = () => {
  return Object.entries(DEPLOYED_CONTRACT_ADDRESSES)
    .filter(([_, address]) => address !== '0x0000000000000000000000000000000000000000')
    .map(([chainId, address]) => ({
      chainId: parseInt(chainId),
      address,
      metadata: DEPLOYMENT_METADATA[chainId],
    }))
}

// Contract configuration with deployment sync
export const getContractConfig = (chainId) => {
  const deploymentInfo = getDeploymentInfo(chainId)
  
  if (!deploymentInfo.isDeployed) {
    console.warn(`Contract not deployed on chain ${chainId}`)
    return null
  }
  
  return {
    address: deploymentInfo.address,
    chainId: parseInt(chainId),
    metadata: deploymentInfo.metadata,
    explorerUrl: deploymentInfo.metadata?.explorerUrl,
    deploymentDate: deploymentInfo.metadata?.timestamp,
  }
}

// Verify contract deployment status
export const verifyContractDeployment = async (chainId, address) => {
  try {
    // This would typically involve checking if the contract exists on-chain
    // For now, we'll just verify the address format and deployment metadata
    
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address)
    const metadata = DEPLOYMENT_METADATA[chainId]
    
    return {
      isValid: isValidAddress,
      hasMetadata: !!metadata,
      address,
      chainId,
      metadata,
    }
  } catch (error) {
    console.error(`Failed to verify contract deployment on chain ${chainId}:`, error)
    return {
      isValid: false,
      hasMetadata: false,
      address,
      chainId,
      error: error.message,
    }
  }
}

// Export deployment summary for debugging
export const getDeploymentSummary = () => {
  const validations = validateDeployments()
  const deployedNetworks = getDeployedNetworks()
  
  return {
    totalNetworks: Object.keys(DEPLOYED_CONTRACT_ADDRESSES).length,
    deployedNetworks: deployedNetworks.length,
    pendingDeployments: validations.filter(v => !v.isDeployed).length,
    validations,
    deployedNetworks,
    lastUpdated: new Date().toISOString(),
  }
}

// Log deployment status (for debugging)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('📋 Deployment Summary:', getDeploymentSummary())
}
