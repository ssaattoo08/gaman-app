import React, { type JSX } from 'react';

// props: data = [{ date: 'YYYY-MM-DD', gaman: number, myrule: boolean }[] ]
export default function ThreeMonthCamelCalendar({ data }: { data: { date: string, gaman: number, myrule: boolean }[] }) {
  // 今日を基準に直近3ヶ月分の年月を取得
  const today = new Date();
  const months = [];
  for (let i = 2; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() });
  }

  // 投稿がある日をSetで持つ
  const postSet = new Set(data.map(d => d.date));

  // カレンダー1ヶ月分を生成
  function renderMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const weeks: JSX.Element[][] = [];
    let week: JSX.Element[] = [];
    // 1日目の曜日（0:日〜6:土）
    let dayOfWeek = firstDay.getDay();
    // 空白セル
    for (let i = 0; i < dayOfWeek; i++) {
      week.push(<td key={`empty-start-${i}`}></td>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasPost = postSet.has(dateStr);
      week.push(
        <td key={dateStr} style={{ width: 18, height: 18, textAlign: 'center', verticalAlign: 'middle', background: '#181a20', borderRadius: 4, border: '1px solid #222', position: 'relative', padding: 0 }}>
          <div style={{ fontSize: 8, color: '#aaa', marginBottom: 0 }}>{day}</div>
          {hasPost && (
            <img src="/camel-icon-transparent.png" alt="ラクダ" style={{ width: 12, height: 12, display: 'block', margin: '0 auto' }} />
          )}
        </td>
      );
      dayOfWeek++;
      if (dayOfWeek === 7 || day === daysInMonth) {
        // 残りの空白セル
        for (let i = dayOfWeek; i < 7 && day === daysInMonth; i++) {
          week.push(<td key={`empty-end-${i}`}></td>);
        }
        weeks.push(week);
        week = [];
        dayOfWeek = 0;
      }
    }
    return (
      <table style={{ borderCollapse: 'separate', borderSpacing: 2, background: 'transparent', margin: '0 2px', minWidth: 120 }}>
        <thead>
          <tr>
            <th colSpan={7} style={{ textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 12, background: 'transparent', padding: 2 }}>{year}年{month + 1}月</th>
          </tr>
          <tr style={{ color: '#aaa', fontSize: 8 }}>
            <th>日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th>土</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w, i) => <tr key={i}>{w}</tr>)}
        </tbody>
      </table>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, width: '100%', overflowX: 'auto', padding: 4 }}>
      {months.map(m => (
        <div key={`${m.year}-${m.month}`}>{renderMonth(m.year, m.month)}</div>
      ))}
    </div>
  );
} 