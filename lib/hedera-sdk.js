'use client'

import {
  Client,
  AccountId,
  PrivateKey,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
  TransactionId,
  AccountBalanceQuery,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenAssociateTransaction,
  TransferTransaction,
} from '@hashgraph/sdk'

// Re-export commonly used classes for other modules
export { ContractFunctionParameters, Hbar }

// Hedera network configuration
export const HEDERA_NETWORKS = {
  testnet: {
    name: 'Hedera Testnet',
    chainId: 296,
    client: () => Client.forTestnet(),
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    hashscanUrl: 'https://hashscan.io/testnet',
  },
  mainnet: {
    name: 'Hedera Mainnet',
    chainId: 295,
    client: () => Client.forMainnet(),
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
    hashscanUrl: 'https://hashscan.io/mainnet',
  },
}

// Hedera client singleton
let hederaClient = null
let currentNetwork = null

/**
 * Initialize Hedera client for the specified network
 * @param {string} network - 'testnet' or 'mainnet'
 * @param {string} operatorId - Account ID for transactions (optional)
 * @param {string} operatorKey - Private key for transactions (optional)
 */
export const initializeHederaClient = (network = 'testnet', operatorId = null, operatorKey = null) => {
  try {
    if (currentNetwork === network && hederaClient) {
      return hederaClient
    }

    const networkConfig = HEDERA_NETWORKS[network]
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`)
    }

    hederaClient = networkConfig.client()
    currentNetwork = network

    // Set operator if provided (for server-side operations)
    if (operatorId && operatorKey) {
      hederaClient.setOperator(AccountId.fromString(operatorId), PrivateKey.fromString(operatorKey))
    }

    console.log(`Hedera client initialized for ${networkConfig.name}`)
    return hederaClient
  } catch (error) {
    console.error('Failed to initialize Hedera client:', error)
    throw error
  }
}

/**
 * Get current Hedera client
 */
export const getHederaClient = () => {
  if (!hederaClient) {
    return initializeHederaClient('testnet')
  }
  return hederaClient
}

/**
 * Get account balance (HBAR and tokens)
 * @param {string} accountId - Account ID to query
 */
export const getAccountBalance = async (accountId) => {
  try {
    const client = getHederaClient()
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(client)

    return {
      hbar: balance.hbars.toString(),
      tokens: balance.tokens ? Object.fromEntries(balance.tokens) : {},
    }
  } catch (error) {
    console.error('Failed to get account balance:', error)
    throw error
  }
}

/**
 * Execute smart contract function (read-only)
 * @param {string} contractId - Contract ID
 * @param {string} functionName - Function name to call
 * @param {ContractFunctionParameters} parameters - Function parameters
 */
export const queryContract = async (contractId, functionName, parameters = null) => {
  try {
    const client = getHederaClient()
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setFunction(functionName, parameters)
      .setGas(100000)

    const result = await query.execute(client)
    return result
  } catch (error) {
    console.error('Failed to query contract:', error)
    throw error
  }
}

/**
 * Execute smart contract function (state-changing)
 * @param {string} contractId - Contract ID
 * @param {string} functionName - Function name to call
 * @param {ContractFunctionParameters} parameters - Function parameters
 * @param {number} gas - Gas limit
 * @param {Hbar} payableAmount - HBAR amount to send (for payable functions)
 */
export const executeContract = async (contractId, functionName, parameters = null, gas = 300000, payableAmount = null) => {
  try {
    const client = getHederaClient()
    let transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setFunction(functionName, parameters)
      .setGas(gas)

    if (payableAmount) {
      transaction = transaction.setPayableAmount(payableAmount)
    }

    const response = await transaction.execute(client)
    const receipt = await response.getReceipt(client)
    
    return {
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
      contractFunctionResult: receipt.contractFunctionResult,
    }
  } catch (error) {
    console.error('Failed to execute contract:', error)
    throw error
  }
}

/**
 * Create a new Hedera Token Service (HTS) token
 * @param {Object} tokenConfig - Token configuration
 */
export const createHederaToken = async (tokenConfig) => {
  try {
    const client = getHederaClient()
    const {
      name,
      symbol,
      decimals = 18,
      initialSupply = 0,
      treasuryAccountId,
      adminKey,
      supplyKey,
      freezeKey,
      wipeKey,
    } = tokenConfig

    const transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(AccountId.fromString(treasuryAccountId))
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Infinite)

    if (adminKey) transaction.setAdminKey(PrivateKey.fromString(adminKey))
    if (supplyKey) transaction.setSupplyKey(PrivateKey.fromString(supplyKey))
    if (freezeKey) transaction.setFreezeKey(PrivateKey.fromString(freezeKey))
    if (wipeKey) transaction.setWipeKey(PrivateKey.fromString(wipeKey))

    const response = await transaction.execute(client)
    const receipt = await response.getReceipt(client)
    
    return {
      tokenId: receipt.tokenId.toString(),
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
    }
  } catch (error) {
    console.error('Failed to create Hedera token:', error)
    throw error
  }
}

/**
 * Transfer HBAR between accounts
 * @param {string} fromAccountId - Sender account ID
 * @param {string} toAccountId - Receiver account ID
 * @param {number} amount - Amount in HBAR
 * @param {string} privateKey - Sender's private key
 */
export const transferHbar = async (fromAccountId, toAccountId, amount, privateKey) => {
  try {
    const client = getHederaClient()
    const transaction = new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(fromAccountId), Hbar.fromTinybars(-amount * 100000000))
      .addHbarTransfer(AccountId.fromString(toAccountId), Hbar.fromTinybars(amount * 100000000))
      .freezeWith(client)

    const signedTransaction = await transaction.sign(PrivateKey.fromString(privateKey))
    const response = await signedTransaction.execute(client)
    const receipt = await response.getReceipt(client)

    return {
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
    }
  } catch (error) {
    console.error('Failed to transfer HBAR:', error)
    throw error
  }
}

/**
 * Transfer HTS tokens between accounts
 * @param {string} tokenId - Token ID
 * @param {string} fromAccountId - Sender account ID
 * @param {string} toAccountId - Receiver account ID
 * @param {number} amount - Amount to transfer
 * @param {string} privateKey - Sender's private key
 */
export const transferToken = async (tokenId, fromAccountId, toAccountId, amount, privateKey) => {
  try {
    const client = getHederaClient()
    const transaction = new TransferTransaction()
      .addTokenTransfer(tokenId, AccountId.fromString(fromAccountId), -amount)
      .addTokenTransfer(tokenId, AccountId.fromString(toAccountId), amount)
      .freezeWith(client)

    const signedTransaction = await transaction.sign(PrivateKey.fromString(privateKey))
    const response = await signedTransaction.execute(client)
    const receipt = await response.getReceipt(client)

    return {
      transactionId: response.transactionId.toString(),
      status: receipt.status.toString(),
    }
  } catch (error) {
    console.error('Failed to transfer token:', error)
    throw error
  }
}

/**
 * Get transaction details from mirror node
 * @param {string} transactionId - Transaction ID
 */
export const getTransactionDetails = async (transactionId) => {
  try {
    const network = currentNetwork || 'testnet'
    const mirrorNodeUrl = HEDERA_NETWORKS[network].mirrorNodeUrl
    
    const response = await fetch(`${mirrorNodeUrl}/api/v1/transactions/${transactionId}`)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Failed to get transaction details:', error)
    throw error
  }
}

/**
 * Get account information from mirror node
 * @param {string} accountId - Account ID
 */
export const getAccountInfo = async (accountId) => {
  try {
    const network = currentNetwork || 'testnet'
    const mirrorNodeUrl = HEDERA_NETWORKS[network].mirrorNodeUrl
    
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${accountId}`)
    const data = await response.json()
    
    return data
  } catch (error) {
    console.error('Failed to get account info:', error)
    throw error
  }
}

/**
 * Utility function to convert EVM address to Hedera Account ID
 * @param {string} evmAddress - EVM address (0x...)
 */
export const evmAddressToAccountId = async (evmAddress) => {
  try {
    const network = currentNetwork || 'testnet'
    const mirrorNodeUrl = HEDERA_NETWORKS[network].mirrorNodeUrl
    
    const response = await fetch(`${mirrorNodeUrl}/api/v1/accounts/${evmAddress}`)
    const data = await response.json()
    
    return data.account
  } catch (error) {
    console.error('Failed to convert EVM address to Account ID:', error)
    return null
  }
}

/**
 * Get current network configuration
 */
export const getCurrentNetworkConfig = () => {
  const network = currentNetwork || 'testnet'
  return HEDERA_NETWORKS[network]
}
