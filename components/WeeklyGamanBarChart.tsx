import React from 'react';
// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// props: [{ date: 'YYYY-MM-DD', gaman: number, cheat: number, dow: number }[] ]
export default function WeeklyGamanBarChart({ data }: { data: { date: string, gaman: number, cheat: number, dow: number }[] }) {
  if (!data || data.length === 0) return null;

  // dataのdateをYYYY-MM-DD形式に統一
  const values = data.map(d => ({
    date: d.date.length === 10 ? d.date : '', // 既にYYYY-MM-DDならそのまま
    count: d.gaman + d.cheat,
  })).filter(v => v.date);

  // 日付範囲を全期間に
  const dates = values.map(v => v.date).sort();
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];

  return (
    <div style={{ width: '100%', background: 'transparent', fontFamily: 'Meiryo UI, Meiryo, sans-serif' }}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value: { date: string, count: number } | null) => {
          if (!value || !value.count) return 'color-empty';
          if (value.count >= 4) return 'color-github-4';
          if (value.count >= 2) return 'color-github-3';
          if (value.count >= 1) return 'color-github-2';
          return 'color-github-1';
        }}
        showWeekdayLabels={true}
        gutterSize={2}
      />
      <style>{`
        .color-empty { fill: #222; }
        .color-github-1 { fill: #9be9a8; }
        .color-github-2 { fill: #40c463; }
        .color-github-3 { fill: #30a14e; }
        .color-github-4 { fill: #216e39; }
      `}</style>
    </div>
  );
} 