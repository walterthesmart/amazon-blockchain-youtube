'use client'

import { createPublicClient, http, formatUnits } from 'viem'
import { sepolia } from 'viem/chains'
import { hederaTestnet } from './web3-config'
import { CONTRACT_ADDRESSES, amazonAbi, getDeploymentInfo } from './constants'

// Create public clients for different networks
const createNetworkClient = (chainId) => {
  const chains = {
    296: hederaTestnet,
    11155111: sepolia,
    31337: {
      id: 31337,
      name: 'Hardhat',
      network: 'hardhat',
      nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
      rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
      },
    },
  }

  const chain = chains[chainId]
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }

  return createPublicClient({
    chain,
    transport: http(),
  })
}

/**
 * Verify contract deployment and basic functionality
 */
export const verifyContractDeployment = async (chainId) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId]
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return {
        chainId,
        isDeployed: false,
        error: 'Contract address not configured',
      }
    }

    const client = createNetworkClient(chainId)
    const deploymentInfo = getDeploymentInfo(chainId)

    // Check if contract exists by getting bytecode
    const bytecode = await client.getBytecode({ address: contractAddress })
    const isDeployed = bytecode && bytecode !== '0x'

    if (!isDeployed) {
      return {
        chainId,
        contractAddress,
        isDeployed: false,
        error: 'Contract not found at address',
      }
    }

    // Test basic contract functions
    const results = await Promise.allSettled([
      // Get token name
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'name',
      }),
      // Get token symbol
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'symbol',
      }),
      // Get decimals
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'decimals',
      }),
      // Get total supply
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'totalSupply',
      }),
      // Get max supply
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'maxSupply',
      }),
      // Get exchange rate
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'exchangeRate',
      }),
      // Check if minting is enabled
      client.readContract({
        address: contractAddress,
        abi: amazonAbi,
        functionName: 'mintingEnabled',
      }),
    ])

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult, maxSupplyResult, exchangeRateResult, mintingEnabledResult] = results

    const contractInfo = {
      name: nameResult.status === 'fulfilled' ? nameResult.value : 'Unknown',
      symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : 'Unknown',
      decimals: decimalsResult.status === 'fulfilled' ? Number(decimalsResult.value) : 18,
      totalSupply: totalSupplyResult.status === 'fulfilled' ? formatUnits(totalSupplyResult.value, 18) : '0',
      maxSupply: maxSupplyResult.status === 'fulfilled' ? formatUnits(maxSupplyResult.value, 18) : '0',
      exchangeRate: exchangeRateResult.status === 'fulfilled' ? exchangeRateResult.value.toString() : '0',
      mintingEnabled: mintingEnabledResult.status === 'fulfilled' ? mintingEnabledResult.value : false,
    }

    return {
      chainId,
      contractAddress,
      isDeployed: true,
      contractInfo,
      deploymentInfo,
      verificationTime: new Date().toISOString(),
      functionTests: {
        name: nameResult.status === 'fulfilled',
        symbol: symbolResult.status === 'fulfilled',
        decimals: decimalsResult.status === 'fulfilled',
        totalSupply: totalSupplyResult.status === 'fulfilled',
        maxSupply: maxSupplyResult.status === 'fulfilled',
        exchangeRate: exchangeRateResult.status === 'fulfilled',
        mintingEnabled: mintingEnabledResult.status === 'fulfilled',
      },
    }
  } catch (error) {
    return {
      chainId,
      contractAddress: CONTRACT_ADDRESSES[chainId],
      isDeployed: false,
      error: error.message,
      verificationTime: new Date().toISOString(),
    }
  }
}

/**
 * Test token balance query for a specific address
 */
export const testBalanceQuery = async (chainId, address) => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId]
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed on this network')
    }

    const client = createNetworkClient(chainId)

    const balance = await client.readContract({
      address: contractAddress,
      abi: amazonAbi,
      functionName: 'balanceOf',
      args: [address],
    })

    return {
      chainId,
      address,
      balance: formatUnits(balance, 18),
      rawBalance: balance.toString(),
      success: true,
    }
  } catch (error) {
    return {
      chainId,
      address,
      balance: '0',
      rawBalance: '0',
      success: false,
      error: error.message,
    }
  }
}

/**
 * Verify all deployed contracts
 */
export const verifyAllContracts = async () => {
  const deployedChains = Object.entries(CONTRACT_ADDRESSES)
    .filter(([_, address]) => address !== '0x0000000000000000000000000000000000000000')
    .map(([chainId, _]) => parseInt(chainId))

  const verificationPromises = deployedChains.map(chainId => 
    verifyContractDeployment(chainId).catch(error => ({
      chainId,
      isDeployed: false,
      error: error.message,
    }))
  )

  const results = await Promise.all(verificationPromises)

  return {
    totalNetworks: deployedChains.length,
    successfulVerifications: results.filter(r => r.isDeployed).length,
    failedVerifications: results.filter(r => !r.isDeployed).length,
    results,
    verificationTime: new Date().toISOString(),
  }
}

/**
 * Test contract interaction (simulate mint transaction)
 */
export const testMintSimulation = async (chainId, amount = '1') => {
  try {
    const contractAddress = CONTRACT_ADDRESSES[chainId]
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error('Contract not deployed on this network')
    }

    const client = createNetworkClient(chainId)

    // Simulate the mint transaction (this won't actually execute)
    const simulation = await client.simulateContract({
      address: contractAddress,
      abi: amazonAbi,
      functionName: 'mint',
      args: [BigInt(amount) * BigInt(10 ** 18)], // Convert to wei
      value: BigInt('100000000000000'), // Exchange rate from contract
    })

    return {
      chainId,
      amount,
      simulation: {
        success: true,
        gasEstimate: simulation.request.gas?.toString() || 'Unknown',
        result: simulation.result?.toString() || 'Success',
      },
    }
  } catch (error) {
    return {
      chainId,
      amount,
      simulation: {
        success: false,
        error: error.message,
      },
    }
  }
}

/**
 * Get comprehensive contract status
 */
export const getContractStatus = async (chainId) => {
  const verification = await verifyContractDeployment(chainId)
  
  if (!verification.isDeployed) {
    return verification
  }

  // Test additional functionality if contract is deployed
  const mintTest = await testMintSimulation(chainId, '1')

  return {
    ...verification,
    mintTest,
    status: 'operational',
  }
}

/**
 * Generate contract verification report
 */
export const generateVerificationReport = async () => {
  const allVerifications = await verifyAllContracts()
  
  const report = {
    summary: {
      totalNetworks: allVerifications.totalNetworks,
      deployedContracts: allVerifications.successfulVerifications,
      failedVerifications: allVerifications.failedVerifications,
      overallStatus: allVerifications.failedVerifications === 0 ? 'healthy' : 'issues-detected',
    },
    networks: allVerifications.results,
    recommendations: [],
    generatedAt: new Date().toISOString(),
  }

  // Add recommendations based on results
  if (allVerifications.failedVerifications > 0) {
    report.recommendations.push('Some contracts failed verification. Check network connectivity and contract addresses.')
  }

  const mintingDisabled = allVerifications.results.filter(r => 
    r.isDeployed && r.contractInfo?.mintingEnabled === false
  )
  
  if (mintingDisabled.length > 0) {
    report.recommendations.push(`Minting is disabled on ${mintingDisabled.length} network(s). Enable minting if needed.`)
  }

  return report
}

// Auto-run verification in development mode
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔍 Running contract verification...')
  verifyAllContracts().then(results => {
    console.log('📊 Contract Verification Results:', results)
  }).catch(error => {
    console.error('❌ Contract verification failed:', error)
  })
}
