import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

// props: [{ day: '月', gaman: 3, cheat: 1 }, ...]
export default function WeeklyGamanBarChart({ data }: { data: { day: string, gaman: number, cheat: number }[] }) {
  return (
    <div style={{ width: '100%', height: 140, background: 'transparent', fontFamily: 'Meiryo UI, Meiryo, sans-serif' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#ccc', fontSize: 10, fontFamily: 'Meiryo UI, Meiryo, sans-serif' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#aaa', fontSize: 8, fontFamily: 'Meiryo UI, Meiryo, sans-serif' }} axisLine={false} tickLine={false} width={24} />
          <Tooltip cursor={{ fill: '#222' }} contentStyle={{ background: '#222', border: 'none', color: '#fff', fontFamily: 'Meiryo UI, Meiryo, sans-serif', fontSize: 10 }} />
          <Bar dataKey="gaman" name="ガマン" radius={[8, 8, 0, 0]} fill="#888" barSize={8} >
            <LabelList dataKey="gaman" position="top" fill="#bbb" fontSize={10} fontFamily="Meiryo UI, Meiryo, sans-serif" />
          </Bar>
          <Bar dataKey="cheat" name="チートデイ" radius={[8, 8, 0, 0]} fill="#fca5a5" barSize={8} >
            <LabelList dataKey="cheat" position="top" fill="#fca5a5" fontSize={10} fontFamily="Meiryo UI, Meiryo, sans-serif" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 