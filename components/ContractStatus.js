'use client'

import React, { useState, useEffect, useContext } from 'react'
import { AmazonContext } from '../context/AmazonContext'
import { 
  verifyContractDeployment, 
  testBalanceQuery, 
  generateVerificationReport,
  getContractStatus 
} from '../lib/contract-verification'
import { getDeploymentInfo, CONTRACT_ADDRESSES } from '../lib/constants'
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSync, FaExternalLinkAlt } from 'react-icons/fa'

const ContractStatus = () => {
  const { chain, address, isConnected } = useContext(AmazonContext)
  const [contractStatus, setContractStatus] = useState(null)
  const [verificationReport, setVerificationReport] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [balanceTest, setBalanceTest] = useState(null)

  const styles = {
    container: `bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto`,
    header: `flex items-center justify-between mb-6 pb-4 border-b`,
    title: `text-2xl font-bold text-gray-800`,
    refreshBtn: `bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2`,
    statusCard: `bg-gray-50 rounded-lg p-4 mb-4`,
    statusGood: `bg-green-50 border border-green-200`,
    statusWarning: `bg-yellow-50 border border-yellow-200`,
    statusError: `bg-red-50 border border-red-200`,
    statusIcon: `text-xl`,
    infoGrid: `grid grid-cols-2 gap-4 mb-4`,
    infoItem: ``,
    label: `text-sm text-gray-600`,
    value: `font-semibold`,
    section: `mb-6`,
    sectionTitle: `text-lg font-semibold mb-3`,
    errorMsg: `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4`,
    loadingMsg: `bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4`,
  }

  // Load contract status when component mounts or chain changes
  useEffect(() => {
    if (chain?.id) {
      loadContractStatus()
    }
  }, [chain?.id])

  const loadContractStatus = async () => {
    if (!chain?.id) return

    setIsLoading(true)
    setError(null)

    try {
      // Get contract status for current chain
      const status = await getContractStatus(chain.id)
      setContractStatus(status)

      // Test balance query if user is connected
      if (address && status.isDeployed) {
        const balanceResult = await testBalanceQuery(chain.id, address)
        setBalanceTest(balanceResult)
      }

      // Generate overall verification report
      const report = await generateVerificationReport()
      setVerificationReport(report)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (isDeployed, hasError = false) => {
    if (hasError) return <FaTimesCircle className={`${styles.statusIcon} text-red-500`} />
    if (isDeployed) return <FaCheckCircle className={`${styles.statusIcon} text-green-500`} />
    return <FaExclamationTriangle className={`${styles.statusIcon} text-yellow-500`} />
  }

  const getStatusClass = (isDeployed, hasError = false) => {
    if (hasError) return styles.statusError
    if (isDeployed) return styles.statusGood
    return styles.statusWarning
  }

  const formatAddress = (addr) => {
    if (!addr) return 'Not available'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getExplorerUrl = (chainId, address) => {
    const explorers = {
      296: `https://hashscan.io/testnet/contract/${address}`,
      11155111: `https://sepolia.etherscan.io/address/${address}`,
      31337: `http://localhost:8545`, // Local development
    }
    return explorers[chainId]
  }

  if (!chain?.id) {
    return (
      <div className={styles.container}>
        <div className="text-center text-gray-600">
          Connect to a network to view contract status
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Contract Status</h2>
        <button
          onClick={loadContractStatus}
          disabled={isLoading}
          className={styles.refreshBtn}
        >
          <FaSync className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorMsg}>
          Error: {error}
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingMsg}>
          Loading contract status...
        </div>
      )}

      {contractStatus && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Current Network: {chain.name}</h3>
          
          <div className={`${styles.statusCard} ${getStatusClass(contractStatus.isDeployed, !!contractStatus.error)}`}>
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(contractStatus.isDeployed, !!contractStatus.error)}
              <span className="font-semibold">
                {contractStatus.isDeployed ? 'Contract Deployed' : 'Contract Not Available'}
              </span>
            </div>

            {contractStatus.error && (
              <div className="text-red-600 text-sm mb-3">
                {contractStatus.error}
              </div>
            )}

            {contractStatus.isDeployed && (
              <>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <div className={styles.label}>Contract Address</div>
                    <div className={styles.value}>
                      {formatAddress(contractStatus.contractAddress)}
                      {getExplorerUrl(chain.id, contractStatus.contractAddress) && (
                        <a
                          href={getExplorerUrl(chain.id, contractStatus.contractAddress)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <FaExternalLinkAlt className="inline" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.label}>Chain ID</div>
                    <div className={styles.value}>{chain.id}</div>
                  </div>
                </div>

                {contractStatus.contractInfo && (
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <div className={styles.label}>Token Name</div>
                      <div className={styles.value}>{contractStatus.contractInfo.name}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.label}>Token Symbol</div>
                      <div className={styles.value}>{contractStatus.contractInfo.symbol}</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.label}>Total Supply</div>
                      <div className={styles.value}>{parseFloat(contractStatus.contractInfo.totalSupply).toLocaleString()} AC</div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.label}>Minting Status</div>
                      <div className={styles.value}>
                        {contractStatus.contractInfo.mintingEnabled ? (
                          <span className="text-green-600">Enabled</span>
                        ) : (
                          <span className="text-red-600">Disabled</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {contractStatus.deploymentInfo && (
                  <div className="mt-4 pt-4 border-t">
                    <div className={styles.label}>Deployment Info</div>
                    <div className="text-sm text-gray-600">
                      Deployed: {new Date(contractStatus.deploymentInfo.timestamp).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Block: {contractStatus.deploymentInfo.blockNumber}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {balanceTest && isConnected && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Balance Test</h3>
          <div className={`${styles.statusCard} ${getStatusClass(balanceTest.success)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(balanceTest.success)}
              <span className="font-semibold">
                {balanceTest.success ? 'Balance Query Successful' : 'Balance Query Failed'}
              </span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.label}>Your Address</div>
                <div className={styles.value}>{formatAddress(address)}</div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.label}>AC Token Balance</div>
                <div className={styles.value}>
                  {balanceTest.success ? `${parseFloat(balanceTest.balance).toLocaleString()} AC` : 'Failed to fetch'}
                </div>
              </div>
            </div>
            {balanceTest.error && (
              <div className="text-red-600 text-sm mt-2">
                Error: {balanceTest.error}
              </div>
            )}
          </div>
        </div>
      )}

      {verificationReport && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Overall Status Report</h3>
          <div className={`${styles.statusCard} ${getStatusClass(verificationReport.summary.overallStatus === 'healthy')}`}>
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(verificationReport.summary.overallStatus === 'healthy')}
              <span className="font-semibold">
                {verificationReport.summary.overallStatus === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
              </span>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <div className={styles.label}>Total Networks</div>
                <div className={styles.value}>{verificationReport.summary.totalNetworks}</div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.label}>Deployed Contracts</div>
                <div className={styles.value}>{verificationReport.summary.deployedContracts}</div>
              </div>
            </div>
            {verificationReport.recommendations.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className={styles.label}>Recommendations</div>
                <ul className="text-sm text-gray-600 list-disc list-inside">
                  {verificationReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ContractStatus
