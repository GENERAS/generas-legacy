import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload } from 'react-icons/fa'

export default function TradingManager() {
  const [trades, setTrades] = useState([])  // ← Start with empty array, not null
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    platform: 'Binance',
    pair: '',
    entry_price: '',
    exit_price: '',
    quantity: '',
    profit_loss: '',
    screenshot_url: '',
    trade_date: new Date().toISOString().split('T')[0],
    strategy: '',
    lessons: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    loadTrades()
  }, [])

  const loadTrades = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false })
      
      if (error) throw error
      setTrades(data || [])  // ← Always set to array, even if null
    } catch (error) {
      console.error('Error loading trades:', error)
      setTrades([])  // ← Set to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const calculatePnL = () => {
    const entry = parseFloat(form.entry_price)
    const exit = parseFloat(form.exit_price)
    const qty = parseFloat(form.quantity)
    if (entry && exit && qty) {
      setForm({ ...form, profit_loss: ((exit - entry) * qty).toFixed(2) })
    }
  }

  useEffect(() => {
    calculatePnL()
  }, [form.entry_price, form.exit_price, form.quantity])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.pair) {
      alert('Please enter a trading pair')
      return
    }

    setLoading(true)
    
    try {
      const tradeData = {
        platform: form.platform,
        pair: form.pair,
        entry_price: parseFloat(form.entry_price) || 0,
        exit_price: parseFloat(form.exit_price) || 0,
        quantity: parseFloat(form.quantity) || 0,
        profit_loss: parseFloat(form.profit_loss) || 0,
        screenshot_url: form.screenshot_url || null,
        trade_date: form.trade_date,
        strategy: form.strategy || null,
        lessons: form.lessons || null,
        tags: form.tags.filter(t => t.trim() !== '')
      }

      let result
      if (editing && editing !== 'new') {
        result = await supabase
          .from('trades')
          .update(tradeData)
          .eq('id', editing)
      } else {
        result = await supabase
          .from('trades')
          .insert([tradeData])
      }

      if (result.error) throw result.error
      
      alert(editing ? 'Trade updated successfully!' : 'Trade added successfully!')
      resetForm()
      await loadTrades()
    } catch (error) {
      console.error('Error saving trade:', error)
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (trade) => {
    setEditing(trade.id)
    setForm({
      platform: trade.platform || 'Binance',
      pair: trade.pair || '',
      entry_price: trade.entry_price || '',
      exit_price: trade.exit_price || '',
      quantity: trade.quantity || '',
      profit_loss: trade.profit_loss || '',
      screenshot_url: trade.screenshot_url || '',
      trade_date: trade.trade_date || new Date().toISOString().split('T')[0],
      strategy: trade.strategy || '',
      lessons: trade.lessons || '',
      tags: trade.tags || []
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this trade?')) return
    
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Trade deleted successfully!')
      await loadTrades()
    } catch (error) {
      console.error('Error deleting trade:', error)
      alert('Error: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({
      platform: 'Binance',
      pair: '',
      entry_price: '',
      exit_price: '',
      quantity: '',
      profit_loss: '',
      screenshot_url: '',
      trade_date: new Date().toISOString().split('T')[0],
      strategy: '',
      lessons: '',
      tags: []
    })
    setTagInput('')
  }

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) })
  }

  if (loading && trades.length === 0) {
    return <div className="text-center py-12">Loading trades...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Trading Manager
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Trade
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold">{trades.length}</div>
          <div className="text-xs text-gray-400">Total Trades</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-500">
            ${trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">Total P&L</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold">{trades.filter(t => t.profit_loss > 0).length}</div>
          <div className="text-xs text-gray-400">Winning</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold">{trades.filter(t => t.profit_loss < 0).length}</div>
          <div className="text-xs text-gray-400">Losing</div>
        </div>
      </div>

      {/* Trade Form */}
      {(editing === 'new' || editing) && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg mb-8 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">
              {editing === 'new' ? 'Add New Trade' : 'Edit Trade'}
            </h3>
            <button type="button" onClick={resetForm} className="text-gray-400 hover:text-white">
              <FaTimes />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={e => setForm({...form, platform: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
              >
                <option>Binance</option><option>MT4</option><option>MT5</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pair *</label>
              <input
                type="text"
                required
                value={form.pair}
                onChange={e => setForm({...form, pair: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
                placeholder="BTC/USDT"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={form.entry_price}
                onChange={e => setForm({...form, entry_price: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Exit Price</label>
              <input
                type="number"
                step="any"
                value={form.exit_price}
                onChange={e => setForm({...form, exit_price: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={form.trade_date}
                onChange={e => setForm({...form, trade_date: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Strategy</label>
              <input
                type="text"
                value={form.strategy}
                onChange={e => setForm({...form, strategy: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
                placeholder="e.g., Breakout, Scalping"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Screenshot URL</label>
              <input
                type="url"
                value={form.screenshot_url}
                onChange={e => setForm({...form, screenshot_url: e.target.value})}
                className="w-full bg-slate-700 rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-slate-700 rounded px-3 py-2"
                placeholder="Add tag (e.g., Scalping, Day Trading)"
              />
              <button type="button" onClick={addTag} className="bg-blue-600 px-4 py-2 rounded">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="bg-slate-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-white">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Lessons */}
          <div>
            <label className="block text-sm font-medium mb-1">Lessons Learned</label>
            <textarea
              value={form.lessons}
              onChange={e => setForm({...form, lessons: e.target.value})}
              className="w-full bg-slate-700 rounded px-3 py-2"
              rows="3"
              placeholder="What did you learn from this trade?"
            />
          </div>

          {/* Calculated P&L */}
          <div className="bg-slate-700/50 p-3 rounded">
            <span className="text-sm">Calculated P&L: </span>
            <span className={`font-bold ${parseFloat(form.profit_loss) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${form.profit_loss || '0.00'}
            </span>
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg flex items-center gap-2">
              <FaSave /> {editing === 'new' ? 'Add Trade' : 'Update Trade'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Trades List */}
      {trades.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p>No trades yet. Add your first trade!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trades.map(trade => (
            <div key={trade.id} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">{trade.pair}</span>
                    <span className="text-sm text-gray-400">{trade.platform}</span>
                    <span className="text-xs text-gray-500">{new Date(trade.trade_date).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Entry: ${trade.entry_price?.toFixed(2)}</div>
                    <div>Exit: ${trade.exit_price?.toFixed(2)}</div>
                    <div>Qty: {trade.quantity}</div>
                    <div className={trade.profit_loss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      P&L: ${trade.profit_loss?.toFixed(2)}
                    </div>
                    {trade.strategy && <div>Strategy: {trade.strategy}</div>}
                  </div>
                  {trade.lessons && (
                    <p className="text-sm text-gray-400 mt-2 italic">"{trade.lessons}"</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(trade)} className="text-blue-400 hover:text-blue-300">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(trade.id)} className="text-red-400 hover:text-red-300">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}