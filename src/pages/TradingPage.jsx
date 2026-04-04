import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaChartLine, FaCalendar, FaDollarSign, FaPercentage, 
  FaEye, FaDownload, FaChevronDown, FaChevronUp, 
  FaTrophy, FaSkull, FaInfoCircle 
} from 'react-icons/fa'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import CommentsSection from '../components/comments/CommentsSection'

export default function TradingPage() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedTrade, setExpandedTrade] = useState(null)
  const [stats, setStats] = useState({
    totalPnL: 0,
    winRate: 0,
    winningTrades: 0,
    losingTrades: 0,
    bestTrade: 0,
    worstTrade: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0
  })
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    loadTrades()
    
    const channel = supabase
      .channel('trading-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'trades' },
        () => loadTrades()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadTrades = async () => {
    try {
      const { data } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
      
      setTrades(data || [])
      calculateStats(data || [])
      prepareChartData(data || [])
    } catch (error) {
      console.error('Error loading trades:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (tradesData) => {
    const totalPnL = tradesData.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
    const winningTradesList = tradesData.filter(t => t.profit_loss > 0)
    const losingTradesList = tradesData.filter(t => t.profit_loss < 0)
    const winningTrades = winningTradesList.length
    const losingTrades = losingTradesList.length
    const winRate = tradesData.length > 0 ? (winningTrades / tradesData.length) * 100 : 0
    const bestTrade = Math.max(...tradesData.map(t => t.profit_loss || 0), 0)
    const worstTrade = Math.min(...tradesData.map(t => t.profit_loss || 0), 0)
    
    const totalWins = winningTradesList.reduce((sum, t) => sum + (t.profit_loss || 0), 0)
    const totalLosses = Math.abs(losingTradesList.reduce((sum, t) => sum + (t.profit_loss || 0), 0))
    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? totalWins : 0

    setStats({
      totalPnL,
      winRate: winRate.toFixed(1),
      winningTrades,
      losingTrades,
      bestTrade,
      worstTrade,
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      profitFactor: profitFactor.toFixed(2)
    })
  }

  const prepareChartData = (tradesData) => {
    const monthlyData = {}
    tradesData.forEach(trade => {
      const date = new Date(trade.trade_date)
      const month = date.toLocaleString('default', { month: 'short' })
      monthlyData[month] = (monthlyData[month] || 0) + (trade.profit_loss || 0)
    })
    
    setChartData(Object.entries(monthlyData).map(([month, pnl]) => ({ month, pnl })))
  }

  const toggleExpand = (tradeId) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Trading Dashboard
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          My trading journey - P&L, strategies, and lessons learned
        </p>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 text-center border border-slate-700">
          <FaDollarSign className="text-2xl mx-auto mb-2 text-green-500" />
          <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(stats.totalPnL)}
          </div>
          <div className="text-xs text-gray-400">Total P&L</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 text-center border border-slate-700">
          <FaPercentage className="text-2xl mx-auto mb-2 text-blue-500" />
          <div className="text-2xl font-bold text-blue-500">{stats.winRate}%</div>
          <div className="text-xs text-gray-400">Win Rate</div>
          <div className="text-xs text-gray-500 mt-1">{stats.winningTrades}W / {stats.losingTrades}L</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 text-center border border-slate-700">
          <FaTrophy className="text-2xl mx-auto mb-2 text-amber-500" />
          <div className="text-lg font-bold text-amber-500">{formatCurrency(stats.bestTrade)}</div>
          <div className="text-xs text-gray-400">Best Trade</div>
          <div className="text-xs text-gray-500 mt-1">Avg Win: {formatCurrency(stats.avgWin)}</div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 rounded-xl p-4 text-center border border-slate-700">
          <FaSkull className="text-2xl mx-auto mb-2 text-red-500" />
          <div className="text-lg font-bold text-red-500">{formatCurrency(Math.abs(stats.worstTrade))}</div>
          <div className="text-xs text-gray-400">Worst Loss</div>
          <div className="text-xs text-gray-500 mt-1">Avg Loss: {formatCurrency(stats.avgLoss)}</div>
        </div>
      </div>

      {/* Profit Factor Card */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 text-center border border-blue-500/30">
        <div className="text-sm text-gray-400 mb-1">Profit Factor</div>
        <div className="text-3xl font-bold text-blue-400">{stats.profitFactor}</div>
        <div className="text-xs text-gray-500 mt-1">Gross Profit ÷ Gross Loss</div>
      </div>

      {/* P&L Chart */}
      {chartData.length > 0 && (
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            Monthly P&L
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  formatter={(value) => [`${formatCurrency(value)}`, 'P&L']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trade History Table */}
      <div className="bg-slate-800/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Trade History</h2>
          <div className="text-xs text-gray-500">
            {trades.length} trades • Click any row to view/add comments
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left rounded-tl-lg">Date</th>
                <th className="px-4 py-3 text-left">Platform</th>
                <th className="px-4 py-3 text-left">Pair</th>
                <th className="px-4 py-3 text-right">Entry</th>
                <th className="px-4 py-3 text-right">Exit</th>
                <th className="px-4 py-3 text-right">P&L</th>
                <th className="px-4 py-3 text-left">Strategy</th>
                <th className="px-4 py-3 text-center rounded-tr-lg">💬</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <React.Fragment key={trade.id}>
                  <tr 
                    className="border-t border-slate-700 cursor-pointer hover:bg-slate-700/40 transition-colors"
                    onClick={() => toggleExpand(trade.id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {new Date(trade.trade_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs">{trade.platform}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{trade.pair}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(trade.entry_price)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatCurrency(trade.exit_price)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(trade.profit_loss)}
                    </td>
                    <td className="px-4 py-3">
                      {trade.strategy ? (
                        <span className="px-2 py-1 bg-blue-600/30 rounded-full text-xs">{trade.strategy}</span>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {expandedTrade === trade.id ? (
                        <FaChevronUp className="inline text-blue-400" />
                      ) : (
                        <FaChevronDown className="inline text-gray-500 hover:text-white" />
                      )}
                    </td>
                  </tr>
                  {expandedTrade === trade.id && (
                    <tr className="bg-slate-800/40">
                      <td colSpan="8" className="px-4 py-4">
                        <div className="border-t border-slate-700 pt-3">
                          <CommentsSection contentType="trade" contentId={trade.id} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {trades.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FaChartLine className="text-4xl mx-auto mb-3 opacity-50" />
            <p>No trades yet. Add your first trade in the admin panel!</p>
          </div>
        )}
      </div>
    </div>
  )
}