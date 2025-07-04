import React from 'react';
// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

// props: [{ date: '06/25', gaman: 3, cheat: 1, dow: 2 }, ...]
export default function WeeklyGamanBarChart({ data }: { data: { date: string, gaman: number, cheat: number, dow: number }[] }) {
  // 日付をYYYY-MM-DD形式に変換（必要なら）
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 6);

  // dataをCalendarHeatmap用に整形
  const values = data.map(d => {
    // 例: '06/25' → '2024-06-25'（今年で仮定）
    const [month, day] = d.date.split('/');
    const year = today.getFullYear();
    return {
      date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      count: d.gaman + d.cheat,
    };
  });

  return (
    <div style={{ width: '100%', background: 'transparent', fontFamily: 'Meiryo UI, Meiryo, sans-serif' }}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={today}
        values={values}
        classForValue={(value: { date: string, count: number } | null) => {
          if (!value || !value.count) return 'color-empty';
          if (value.count >= 4) return 'color-github-4';
          if (value.count >= 2) return 'color-github-3';
          if (value.count >= 1) return 'color-github-2';
          return 'color-github-1';
        }}
        showWeekdayLabels={false}
        gutterSize={4}
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