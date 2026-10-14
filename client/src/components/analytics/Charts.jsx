import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#84cc16'];

const formatCurrency = (val) => `₹${val.toLocaleString('en-IN')}`;

export function CategoryPieChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No data yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No trends yet" />;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="month"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: '#3b82f6', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MemberBarChart({ data, users }) {
  if (!data || data.length === 0) {
    return <EmptyChart message="No contributions yet" />;
  }

  const chartData = data.map((item) => ({
    name: users[item.user]?.name || 'Unknown',
    amount: item.amount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#94a3b8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(val) => `₹${val}`}
        />
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            fontSize: 12,
          }}
        />
        <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-[260px] flex items-center justify-center text-slate-400 text-sm">
      {message}
    </div>
  );
}