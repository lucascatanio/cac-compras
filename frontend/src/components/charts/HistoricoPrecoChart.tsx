import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistoricoPrecosItem } from '@/types/api'
import { formatData, formatMoeda } from '@/lib/format'

interface HistoricoPrecoChartProps {
  data: HistoricoPrecosItem[]
}

const STROKE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function HistoricoPrecoChart({ data }: HistoricoPrecoChartProps) {
  const fornecedores = [...new Set(data.map((d) => d.fornecedor))]

  const byDate: Record<string, Record<string, unknown>> = {}
  for (const item of data) {
    const key = item.dataEntrada
    if (!byDate[key]) byDate[key] = { data: key }
    byDate[key][item.fornecedor] = item.precoUnitario
  }

  const chartData = Object.values(byDate).sort((a, b) =>
    String(a.data) < String(b.data) ? -1 : 1
  )

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="data"
          tickFormatter={(v: string) => formatData(String(v))}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v: number) => formatMoeda(Number(v))}
          tick={{ fontSize: 11 }}
          width={90}
        />
        <Tooltip
          labelFormatter={(v) => formatData(String(v))}
          formatter={(value) => [formatMoeda(Number(value))]}
        />
        <Legend />
        {fornecedores.map((forn, i) => (
          <Line
            key={forn}
            type="monotone"
            dataKey={forn}
            name={forn}
            stroke={STROKE_COLORS[i % STROKE_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
