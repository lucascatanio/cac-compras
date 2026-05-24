import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CurvaAbcItem } from '@/types/api'
import { formatMoeda, formatPercentual } from '@/lib/format'

interface ParetoChartProps {
  data: CurvaAbcItem[]
}

export default function ParetoChart({ data }: ParetoChartProps) {
  const chartData = data.map((item) => ({
    produto: item.produto.length > 18 ? item.produto.slice(0, 18) + '…' : item.produto,
    produtoCompleto: item.produto,
    valorTotalConsumido: Number(item.valorTotalConsumido),
    pctAcumulado: Number(item.pctAcumulado),
  }))

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="produto"
          angle={-45}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          yAxisId="valor"
          tickFormatter={(v: number) => formatMoeda(v)}
          tick={{ fontSize: 11 }}
          width={90}
        />
        <YAxis
          yAxisId="pct"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v: number) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value, name) => {
            const n = Number(value)
            if (name === 'Valor Consumido') return [formatMoeda(n), name]
            if (name === '% Acumulado') return [formatPercentual(n), name]
            return [value, name]
          }}
          labelFormatter={(_label, payload) => {
            const item = (payload as unknown as Array<{ payload?: { produtoCompleto?: string } }>)?.[0]?.payload
            return item?.produtoCompleto ?? _label
          }}
        />
        <Legend verticalAlign="top" />
        <Bar
          yAxisId="valor"
          dataKey="valorTotalConsumido"
          name="Valor Consumido"
          fill="#3b82f6"
          radius={[2, 2, 0, 0]}
        />
        <Line
          yAxisId="pct"
          type="monotone"
          dataKey="pctAcumulado"
          name="% Acumulado"
          stroke="#ef4444"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
