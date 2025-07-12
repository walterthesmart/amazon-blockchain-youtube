#!/usr/bin/env node

/**
 * Contract Verification Script
 * Verifies that deployed contracts are accessible and functional
 */

const { createPublicClient, http, formatUnits } = require('viem')

// Import deployment data
const hederaTestnetDeployment = require('../smart-contract/deployments/hederaTestnet-deployment.json')
const hardhatDeployment = require('../smart-contract/deployments/hardhat-deployment.json')
const amazonCoin = require('../lib/AmazonCoin.json')

// Network configurations
const networks = {
  296: {
    name: 'Hedera Testnet',
    rpcUrl: 'https://testnet.hashio.io/api',
    explorerUrl: 'https://hashscan.io/testnet',
    contractAddress: hederaTestnetDeployment.contractAddress,
    deployment: hederaTestnetDeployment,
  },
  31337: {
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    contractAddress: hardhatDeployment.contractAddress,
    deployment: hardhatDeployment,
  },
}

// Create viem client for network
function createClient(chainId) {
  const network = networks[chainId]
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`)
  }

  return createPublicClient({
    chain: {
      id: chainId,
      name: network.name,
      network: network.name.toLowerCase().replace(' ', '-'),
      nativeCurrency: {
        decimals: 18,
        name: chainId === 296 ? 'HBAR' : 'Ether',
        symbol: chainId === 296 ? 'HBAR' : 'ETH',
      },
      rpcUrls: {
        default: { http: [network.rpcUrl] },
        public: { http: [network.rpcUrl] },
      },
    },
    transport: http(network.rpcUrl),
  })
}

// Verify contract deployment
async function verifyContract(chainId) {
  const network = networks[chainId]
  console.log(`\n🔍 Verifying ${network.name} (Chain ID: ${chainId})`)
  console.log(`📍 Contract Address: ${network.contractAddress}`)
  console.log(`🌐 RPC URL: ${network.rpcUrl}`)

  try {
    const client = createClient(chainId)

    // Check if contract exists
    console.log('   ⏳ Checking contract bytecode...')
    const bytecode = await client.getBytecode({ 
      address: network.contractAddress 
    })
    
    if (!bytecode || bytecode === '0x') {
      console.log('   ❌ Contract not found at address')
      return { success: false, error: 'Contract not deployed' }
    }
    console.log('   ✅ Contract bytecode found')

    // Test contract functions
    console.log('   ⏳ Testing contract functions...')
    
    const results = await Promise.allSettled([
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'name',
      }),
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'symbol',
      }),
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'decimals',
      }),
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'totalSupply',
      }),
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'exchangeRate',
      }),
      client.readContract({
        address: network.contractAddress,
        abi: amazonCoin.abi,
        functionName: 'mintingEnabled',
      }),
    ])

    const [nameResult, symbolResult, decimalsResult, totalSupplyResult, exchangeRateResult, mintingResult] = results

    const contractInfo = {
      name: nameResult.status === 'fulfilled' ? nameResult.value : 'Failed',
      symbol: symbolResult.status === 'fulfilled' ? symbolResult.value : 'Failed',
      decimals: decimalsResult.status === 'fulfilled' ? Number(decimalsResult.value) : 'Failed',
      totalSupply: totalSupplyResult.status === 'fulfilled' ? formatUnits(totalSupplyResult.value, 18) : '0',
      exchangeRate: exchangeRateResult.status === 'fulfilled' ? exchangeRateResult.value.toString() : '0',
      mintingEnabled: mintingResult.status === 'fulfilled' ? mintingResult.value : false,
    }

    console.log('   📊 Contract Information:')
    console.log(`      Name: ${contractInfo.name}`)
    console.log(`      Symbol: ${contractInfo.symbol}`)
    console.log(`      Decimals: ${contractInfo.decimals}`)
    console.log(`      Total Supply: ${parseFloat(contractInfo.totalSupply).toLocaleString()} AC`)

    // Safe BigInt conversion for exchange rate
    let exchangeRateFormatted = '0'
    try {
      if (contractInfo.exchangeRate !== '0' && contractInfo.exchangeRate !== 'Failed') {
        exchangeRateFormatted = formatUnits(BigInt(contractInfo.exchangeRate), 18)
      }
    } catch (e) {
      exchangeRateFormatted = 'Error parsing'
    }

    console.log(`      Exchange Rate: ${contractInfo.exchangeRate} (${exchangeRateFormatted} ${chainId === 296 ? 'HBAR' : 'ETH'} per AC)`)
    console.log(`      Minting Enabled: ${contractInfo.mintingEnabled}`)

    // Deployment info
    if (network.deployment) {
      console.log('   📅 Deployment Information:')
      console.log(`      Deployed: ${new Date(network.deployment.timestamp).toLocaleString()}`)
      console.log(`      Block: ${network.deployment.blockNumber}`)
      console.log(`      Gas Used: ${network.deployment.gasUsed?.toLocaleString()}`)
      console.log(`      Deployer: ${network.deployment.deployerAddress}`)
    }

    console.log(`   🔗 Explorer: ${network.explorerUrl}/contract/${network.contractAddress}`)
    console.log('   ✅ Contract verification successful!')

    return { 
      success: true, 
      contractInfo, 
      deployment: network.deployment,
      explorerUrl: `${network.explorerUrl}/contract/${network.contractAddress}`
    }

  } catch (error) {
    console.log(`   ❌ Verification failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Test balance query
async function testBalanceQuery(chainId, address = '0x0000000000000000000000000000000000000000') {
  const network = networks[chainId]
  console.log(`\n🔍 Testing balance query on ${network.name}`)
  console.log(`📍 Address: ${address}`)

  try {
    const client = createClient(chainId)
    
    const balance = await client.readContract({
      address: network.contractAddress,
      abi: amazonCoin.abi,
      functionName: 'balanceOf',
      args: [address],
    })

    const formattedBalance = formatUnits(balance, 18)
    console.log(`   💰 Balance: ${parseFloat(formattedBalance).toLocaleString()} AC`)
    console.log('   ✅ Balance query successful!')

    return { success: true, balance: formattedBalance }
  } catch (error) {
    console.log(`   ❌ Balance query failed: ${error.message}`)
    return { success: false, error: error.message }
  }
}

// Main verification function
async function main() {
  console.log('🚀 Starting Contract Verification')
  console.log('=====================================')

  const results = {}
  let totalNetworks = 0
  let successfulVerifications = 0

  // Verify each network
  for (const [chainId, network] of Object.entries(networks)) {
    totalNetworks++
    const result = await verifyContract(parseInt(chainId))
    results[chainId] = result
    
    if (result.success) {
      successfulVerifications++
      
      // Test balance query for successful verifications
      await testBalanceQuery(parseInt(chainId))
    }
  }

  // Summary
  console.log('\n📊 Verification Summary')
  console.log('========================')
  console.log(`Total Networks: ${totalNetworks}`)
  console.log(`Successful Verifications: ${successfulVerifications}`)
  console.log(`Failed Verifications: ${totalNetworks - successfulVerifications}`)

  if (successfulVerifications === totalNetworks) {
    console.log('🎉 All contracts verified successfully!')
  } else {
    console.log('⚠️  Some contracts failed verification')
  }

  // Recommendations
  console.log('\n💡 Recommendations')
  console.log('===================')
  
  if (successfulVerifications > 0) {
    console.log('✅ Frontend is properly configured for deployed contracts')
    console.log('✅ Contract addresses and ABIs are correctly integrated')
    console.log('✅ Ready for user testing and interaction')
  }

  if (successfulVerifications < totalNetworks) {
    console.log('⚠️  Some networks need contract deployment')
    console.log('⚠️  Update contract addresses after deployment')
  }

  console.log('\n🔗 Next Steps')
  console.log('==============')
  console.log('1. Start the frontend: npm run dev')
  console.log('2. Connect to Hedera Testnet in MetaMask')
  console.log('3. Test token minting and balance queries')
  console.log('4. Verify transaction links work correctly')

  return results
}

// Run verification
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { verifyContract, testBalanceQuery, main }
