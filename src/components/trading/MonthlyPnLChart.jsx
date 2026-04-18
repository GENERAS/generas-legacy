// This component is lazy-loaded to avoid bundling recharts in the main chunk
// recharts adds ~500KB to bundle size
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function MonthlyPnLChart({ data, formatCurrency }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
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
  )
}
