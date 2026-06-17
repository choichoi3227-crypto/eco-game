import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

export const UserStatsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [stats, setStats] = useState<{ label: string; count: number }[]>([]);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetch(`/api/admin/user-stats?range=${range}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [range]);

  useEffect(() => {
    if (!chartRef.current || stats.length === 0) return;
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: stats.map(s => s.label),
        datasets: [{
          label: '신규 가입자',
          data: stats.map(s => s.count),
          borderColor: '#0052FF',
          backgroundColor: 'rgba(0, 82, 255, 0.05)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }, [stats]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-96">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-slate-800">사용자 가입 추이</h3>
        <div class="flex bg-slate-100 p-1 rounded-xl">
          {['7d', '30d', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${range === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div class="h-64">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};
