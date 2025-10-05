import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = ['#2C7A7B', '#319795', '#38B2AC', '#81E6D9', '#285E61', '#234E52', '#4FD1C5', '#2A9D8F']

export default function CategoryPie({
  data,
}: {
  data: { category: string; income: number; expense: number }[]
}) {
  const expenseData = data.map((d) => ({ name: d.category, value: d.expense }))
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={expenseData} dataKey="value" nameKey="name" outerRadius={100} label>
            {expenseData.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

