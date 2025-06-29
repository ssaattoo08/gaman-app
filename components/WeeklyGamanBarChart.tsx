import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// props: [{ day: '月', count: 3 }, ...]
export default function WeeklyGamanBarChart({ data }: { data: { day: string, count: number }[] }) {
  return (
    <div style={{ width: '100%', height: 180, background: 'transparent' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#ccc', fontSize: 18 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#aaa', fontSize: 16 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip cursor={{ fill: '#222' }} contentStyle={{ background: '#222', border: 'none', color: '#fff' }} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#888" barSize={32} >
            <LabelList dataKey="count" position="top" fill="#bbb" fontSize={18} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 