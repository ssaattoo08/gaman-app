import React, { type JSX } from 'react';
import Image from 'next/image';

// 日本の祝日（簡易版）
const JAPAN_HOLIDAYS = [
  // 月-日
  '01-01', // 元日
  '02-11', // 建国記念の日
  '02-23', // 天皇誕生日
  '04-29', // 昭和の日
  '05-03', // 憲法記念日
  '05-04', // みどりの日
  '05-05', // こどもの日
  '07-15', // 海の日（例年変動あり、2025年は7/21）
  '08-11', // 山の日
  '09-16', // 敬老の日（例年変動あり、2025年は9/15）
  '09-23', // 秋分の日（例年変動あり、2025年は9/23）
  '10-14', // 体育の日（スポーツの日、例年変動あり、2025年は10/13）
  '11-03', // 文化の日
  '11-23', // 勤労感謝の日
];

function isHoliday(year: number, month: number, day: number) {
  const md = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return JAPAN_HOLIDAYS.includes(md);
}

// props: data = [{ date: 'YYYY-MM-DD', gaman: number, myrule: boolean }[] ]
export default function ThreeMonthCamelCalendar({ data }: { data: { date: string, gaman: number, myrule: boolean }[] }) {
  // 今日を基準に直近2ヶ月分の年月を取得
  const today = new Date();
  const months = [];
  for (let i = 1; i >= 0; i--) {
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
      // 曜日・祝日色分け
      const dow = new Date(year, month, day).getDay();
      let color = '#aaa';
      if (dow === 0 || isHoliday(year, month, day)) {
        color = '#e57373'; // 日曜・祝日: 赤
      } else if (dow === 6) {
        color = '#60a5fa'; // 土曜: 青
      }
      week.push(
        <td key={dateStr} style={{ width: 18, height: 18, textAlign: 'center', verticalAlign: 'middle', background: '#181a20', borderRadius: 4, border: '1px solid #222', position: 'relative', padding: 0 }}>
          {hasPost ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `1.5px solid ${color}`,
                color: color,
                fontWeight: 'bold',
                fontSize: 9,
                margin: '0 auto',
                background: 'transparent',
              }}
            >
              {day}
            </div>
          ) : (
            <div style={{ fontSize: 9, color, margin: '0 auto', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{day}</div>
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
            <th colSpan={7} style={{ textAlign: 'center', color: '#fff', fontWeight: 400, fontSize: 10, background: 'transparent', padding: 2, letterSpacing: 0.5 }}>{year}年{month + 1}月</th>
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