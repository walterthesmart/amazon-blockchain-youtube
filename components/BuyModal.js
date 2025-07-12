'use client'

import React, { useContext, useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { SiHedera } from 'react-icons/si'
import { AmazonContext } from '../context/AmazonContext'
import { HederaContext } from '../context/HederaContext'
import { HashLoader } from 'react-spinners'
import Link from 'next/link'

const BuyModal = ({ close, buyTokens }) => {
  const styles = {
    container: `h-full w-full flex flex-col `,
    closeX: `w-full h-[50px] flex items-center justify-end mb-[20px]`,
    title: `text-3xl font-bold flex flex-1 items-center mt-[20px] justify-center mb-[40px]`,
    content: `flex w-full mb-[30px] text-xl justify-center`,
    input: `w-[50%] h-[50px] bg-[#f7f6f2] rounded-lg p-[10px] flex mx-auto`,
    inputBox: `w-full h-full flex items-center justify-center bg-[#f7f6f2] focus:outline-none`,
    price: `w-full h-full flex justify-center items-center mt-[20px] font-bold text-3xl`,
    buyBtn: `w-[20%] h-[50px] bg-[#000] mt-[40px] rounded-lg p-[10px] flex mx-auto text-white justify-center items-center cursor-pointer`,
    loaderContainer: `w-full h-[500px] flex items-center justify-center`,
    loader: `w-full h-full flex items-center justify-center`,
    etherscan: `w-full h-full flex items-center justify-center text-green-500 text-2xl mt-[20px] font-bold cursor-pointer`,
    success: `w-full h-full flex items-center justify-center text-xl mt-[20px] font-bolder`,
  }
  const {
    amountDue,
    setAmountDue,
    tokenAmount,
    setTokenAmount,
    isLoading,
    transactionLink,
    setTransactionLink,
    error,
    successMessage,
    clearMessages,
    networkPricing,
    currentNetwork,
    isHederaNetwork,
    contractAddress,
    buyTokens,
  } = useContext(AmazonContext)

  const {
    isNativeHederaAvailable,
    mintTokensHedera,
    hederaAccountId,
    isLoadingHedera,
  } = useContext(HederaContext)

  const [useNativeHedera, setUseNativeHedera] = useState(false)
  const [hederaError, setHederaError] = useState(null)

  return (
    <div className={styles.container}>
      {isLoading ? (
        <>
          <div className={styles.loaderContainer}>
            <HashLoader size={80} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.closeX}>
            <IoIosClose
              onClick={() => {
                close()
                setAmountDue('')
                setTokenAmount('')
                setTransactionLink('')
                clearMessages()
              }}
              fontSize={50}
              className='cursor-pointer'
            />
          </div>
          <div className={styles.title}>Buy More Amazon Coins Here!</div>
          <div className={styles.content}>
            Select how many tokens you would like to buy on {currentNetwork?.name || 'this network'}.
          </div>

          {/* Network and contract info */}
          {currentNetwork && (
            <div className="text-center mb-4 p-2 bg-gray-100 rounded text-sm">
              <div className="font-medium">
                {isHederaNetwork ? '🟣 Hedera Network' : '🟢 Ethereum Network'}
              </div>
              <div className="text-gray-600">
                Network: {currentNetwork.name} | Currency: {networkPricing?.currency || 'ETH'}
              </div>
              {!contractAddress && (
                <div className="text-red-600 mt-1">
                  ⚠️ Contract not deployed on this network
                </div>
              )}
            </div>
          )}

          {/* Hedera transaction method selection */}
          {isHederaNetwork && isNativeHederaAvailable() && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded">
              <div className="flex items-center gap-3 mb-2">
                <SiHedera className="text-purple-600" />
                <span className="font-medium text-purple-800">Transaction Method</span>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="transactionMethod"
                    checked={!useNativeHedera}
                    onChange={() => setUseNativeHedera(false)}
                    className="text-purple-600"
                  />
                  <span className="text-sm">EVM Compatible (via wallet)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="transactionMethod"
                    checked={useNativeHedera}
                    onChange={() => setUseNativeHedera(true)}
                    className="text-purple-600"
                  />
                  <span className="text-sm">Native Hedera SDK</span>
                </label>
              </div>
              {useNativeHedera && (
                <div className="mt-2 text-xs text-purple-700">
                  Using native Hedera SDK for optimal performance and lower fees.
                  Account ID: {hederaAccountId || 'Not available'}
                </div>
              )}
            </div>
          )}

          {(error || hederaError) && (
            <div className="text-red-500 text-center mb-4 p-2 bg-red-100 rounded">
              {error || hederaError}
            </div>
          )}

          {successMessage && (
            <div className="text-green-500 text-center mb-4 p-2 bg-green-100 rounded">
              {successMessage}
            </div>
          )}

          <div className={styles.input}>
            <input
              type='number'
              placeholder='Amount...'
              className={styles.inputBox}
              onChange={e => setTokenAmount(e.target.value)}
              value={tokenAmount}
              min="0"
              step="1"
              disabled={!contractAddress}
            />
          </div>
          <div className={styles.price}>
            Total Due:{' '}
            {tokenAmount && tokenAmount > 0 && networkPricing
              ? `${amountDue} ${networkPricing.currency}`
              : `0 ${networkPricing?.currency || 'ETH'}`}
          </div>
          <button
            className={styles.buyBtn}
            disabled={
              !tokenAmount ||
              tokenAmount <= 0 ||
              isLoading ||
              isLoadingHedera ||
              (!contractAddress && !useNativeHedera)
            }
            onClick={async () => {
              if (useNativeHedera && isNativeHederaAvailable()) {
                try {
                  setHederaError(null)
                  const amount = BigInt(tokenAmount) * BigInt(10 ** 18)
                  const hbarAmount = parseFloat(tokenAmount) * 0.1
                  await mintTokensHedera(amount, hbarAmount)
                } catch (err) {
                  setHederaError(err.message)
                }
              } else {
                buyTokens()
              }
            }}
          >
            {(isLoading || isLoadingHedera) ? 'Processing...' :
             !contractAddress && !useNativeHedera ? 'Contract Not Available' :
             useNativeHedera ? 'Buy with Hedera SDK' : 'Buy with Wallet'}
          </button>
          {transactionLink && (
            <>
              <div className={styles.success}>
                Transaction Successful! Check out your receipt for your
                transaction below!
              </div>
              <Link href={transactionLink} target='_blank' className={styles.etherscan}>
                Transaction Receipt
              </Link>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default BuyModal
