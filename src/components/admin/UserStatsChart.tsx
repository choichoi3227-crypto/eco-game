import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export const UserStatsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<{ month: string; count: number }[]>([]);

  useEffect(() => {
    fetch('/api/admin/user-stats')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  useEffect(() => {
    if (!chartRef.current || stats.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.map(s => s.month),
        datasets: [{
          label: '신규 가입자 수',
          data: stats.map(s => s.count),
          fill: true,
          backgroundColor: 'rgba(0, 82, 255, 0.1)',
          borderColor: '#0052FF',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#0052FF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: '월별 사용자 가입 추이', font: { size: 16, weight: 'bold' } }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });

    return () => chart.destroy();
  }, [stats]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};
