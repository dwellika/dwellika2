"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Theme-aware palette (matches Studio Cream tokens — terracotta, sage, ochre, …)
export const ACCENT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--secondary))",
  "hsl(var(--tertiary))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
]

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-lg">
      {label ? <p className="font-medium">{label}</p> : null}
      {payload.map((p, i) => (
        <p key={i} className="tabular-nums text-muted-foreground">
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function LineSeriesChart({
  data,
  dataKey = "value",
  height = 220,
  color = ACCENT_COLORS[0],
}: {
  data: Array<{ date: string; value: number }>
  dataKey?: string
  height?: number
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v: string) => v.slice(5)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function BarSeriesChart({
  data,
  dataKey = "value",
  height = 220,
  color = ACCENT_COLORS[2],
}: {
  data: Array<{ date: string; value: number }>
  dataKey?: string
  height?: number
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          tickFormatter={(v: string) => v.slice(5)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryPie({
  data,
  height = 240,
}: {
  data: Array<{ name: string; value: number }>
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={45}
          paddingAngle={2}
          stroke="hsl(var(--background))"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function Sparkline({
  data,
  color = ACCENT_COLORS[0],
}: {
  data: Array<{ date: string; value: number }>
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={60}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
