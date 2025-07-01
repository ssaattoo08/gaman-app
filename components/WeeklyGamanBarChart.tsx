import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import React from 'react';

// props: [{ date: '06/25', gaman: 3, cheat: 1, dow: 2 }, ...]
export default function WeeklyGamanBarChart({ data }: { data: { date: string, gaman: number, cheat: number, dow: number }[] }) {
  // XAxisのカスタムtickレンダラー
  const renderCustomTick = (props: any) => {
    const { x, y, payload } = props;
    // dow: 0=日, 6=土
    const dow = data[payload.index]?.dow;
    let color = '#ccc';
    if (dow === 0) color = '#e53935'; // 日曜: 濃い赤
    if (dow === 6) color = '#1e40af'; // 土曜: 濃い青
    return (
      <g transform={`translate(${x},${y + 8})`}>
        <text x={0} y={0} dy={0} textAnchor="middle" fill={color} fontSize={10} fontFamily="Meiryo UI, Meiryo, sans-serif">
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 140, background: 'transparent', fontFamily: 'Meiryo UI, Meiryo, sans-serif' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: 16, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis dataKey="date" tick={renderCustomTick} axisLine={false} tickLine={false} />
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