import React from 'react';
// @ts-ignore
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';

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
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', background: 'transparent', fontFamily: 'Meiryo UI, Meiryo, sans-serif', padding: '8px 0' }}>
      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={values}
        classForValue={(value: { date: string, count: number } | null) => {
          if (!value || !value.count) return 'color-empty';
          if (value.count >= 4) return 'color-blue-4';
          if (value.count >= 3) return 'color-blue-3';
          if (value.count >= 2) return 'color-blue-2';
          if (value.count >= 1) return 'color-blue-1';
          return 'color-blue-1';
        }}
        showWeekdayLabels={true}
        gutterSize={3}
        horizontal={true}
        tooltipDataAttrs={(value: { date: string, count: number } | null) =>
          value && value.date
            ? { 'data-tip': `${value.date}: ${value.count}回投稿` }
            : { 'data-tip': '投稿なし' }
        }
        rectSize={13}
      />
      <Tooltip id="heatmap-tooltip" style={{ background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 4, fontSize: 12 }} />
      <style>{`
        .color-empty { fill: #222; }
        .color-blue-1 { fill: #93c5fd; }
        .color-blue-2 { fill: #3b82f6; }
        .color-blue-3 { fill: #1d4ed8; }
        .color-blue-4 { fill: #1e293b; }
        .react-calendar-heatmap .react-calendar-heatmap-week rect {
          rx: 3px;
          stroke: #111;
          stroke-width: 1;
        }
        .react-calendar-heatmap text {
          font-size: 12px;
          fill: #aaa;
        }
      `}</style>
    </div>
  );
} 