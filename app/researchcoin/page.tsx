'use client'

import { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Gauge, Coins, ExternalLink } from 'lucide-react';

const sampleTransactions = [
  {
    id: 1,
    type: 'Bought RSC',
    date: '2024-03-15T14:30:00Z',
    amount: '+500',
    value: '$1,000.00',
    details: {
      txHash: '0x1234...5678',
      status: 'Completed'
    }
  },
  {
    id: 2,
    type: 'Withdrew RSC',
    date: '2024-03-14T09:15:00Z',
    amount: '-1,000',
    value: '$2,000.00',
    details: {
      txHash: '0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef',
      toAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      status: 'Confirmed',
      etherscanUrl: 'https://etherscan.io/tx/0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef'
    }
  },
  {
    id: 3,
    type: 'Peer Review Reward',
    date: '2024-03-13T16:45:00Z',
    amount: '+25 RSC',
    value: '$50.00',
    details: {
      paperTitle: 'Advances in Quantum Computing',
      paperId: '123456',
      reviewId: '789012',
      paperUrl: '/paper/123456/advances-in-quantum-computing'
    }
  },
  {
    id: 4,
    type: 'Comment Reward',
    date: '2024-03-12T11:20:00Z',
    amount: '+5 RSC',
    value: '$10.00',
    details: {
      paperTitle: 'Neural Network Architectures',
      paperId: '345678',
      commentId: '901234'
    }
  },
  {
    id: 5,
    type: 'RSC Deposited',
    date: '2024-03-10T13:00:00Z',
    amount: '+2,500 RSC',
    value: '$5,000.00',
    details: {
      txHash: '0x5678...9012',
      fromAddress: '0x123...789'
    }
  },
  {
    id: 6,
    type: 'Fundraise Contribution',
    date: '2024-03-08T15:30:00Z',
    amount: '-100 RSC',
    value: '$200.00',
    details: {
      projectTitle: 'Climate Change Research Initiative',
      projectId: '567890',
      projectUrl: '/fundraise/567890/climate-change-research-initiative'
    }
  },
  {
    id: 7,
    type: 'RSC Staked',
    date: '2024-03-05T10:00:00Z',
    amount: '-1,000 RSC',
    value: '$2,000.00',
    details: {
      stakingPool: 'Research Validator Pool',
      apy: '5.0%'
    }
  },
  {
    id: 8,
    type: 'Platform Fee',
    date: '2024-03-01T09:45:00Z',
    amount: '-9 RSC',
    value: '$18.00',
    details: {
      feeType: 'Monthly Platform Fee',
      period: 'March 2024'
    }
  }
];

export default function ResearchCoinPage() {
  const [balance] = useState('1,234.56');
  
  return (
    <div className="flex">
      <div className="flex-1">
        {/* Balance Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Coins className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold">My ResearchCoin</h1>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600">Available Balance</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold">{balance}</h2>
              <span className="text-lg">RSC</span>
            </div>
            <p className="text-sm text-gray-600">≈ $2,469.12 USD</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
              <ArrowUpRight className="h-4 w-4" />
              Buy
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              <ArrowDownRight className="h-4 w-4" />
              Withdraw
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              <Gauge className="h-4 w-4" />
              <span>Stake</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                5% APY
              </span>
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="divide-y">
            {sampleTransactions.map((transaction) => (
              <div key={transaction.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{transaction.type}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                  {transaction.type === 'Withdrew RSC' && transaction.details.txHash && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        Tx: {transaction.details.txHash.slice(0, 6)}...{transaction.details.txHash.slice(-4)}
                      </p>
                      <a 
                        href={transaction.details.etherscanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-0.5"
                      >
                        View on Etherscan
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {transaction.type === 'Peer Review Reward' && (
                    <a 
                      href={transaction.details.paperUrl}
                      className="text-xs text-indigo-600 hover:text-indigo-800 block mt-1"
                    >
                      {transaction.details.paperTitle}
                    </a>
                  )}
                  {transaction.type === 'Fundraise Contribution' && (
                    <a 
                      href={transaction.details.projectUrl}
                      className="text-xs text-indigo-600 hover:text-indigo-800 block mt-1"
                    >
                      {transaction.details.projectTitle}
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className={`font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                    {transaction.amount} RSC
                  </p>
                  <p className="text-sm text-gray-600">{transaction.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 