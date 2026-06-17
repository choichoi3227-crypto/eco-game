import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

interface GuideViewData {
  title: string;
  views: number;
}

export const GuideViewsChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guideData, setGuideData] = useState<GuideViewData[]>([]);

  useEffect(() => {
    const fetchGuideViews = async () => {
      try {
        const response = await fetch('/api/admin/guide-views');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: GuideViewData[] = await response.json();
        setGuideData(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuideViews();
  }, []);

  useEffect(() => {
    if (!chartRef.current || guideData.length === 0) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // 기존 차트 인스턴스가 있으면 파괴
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: guideData.map(d => d.title),
        datasets: [{
          label: '조회수',
          data: guideData.map(d => d.views),
          backgroundColor: '#0052FF', // CloudPress Blue
          borderColor: '#0052FF',
          borderWidth: 1,
          borderRadius: 4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '가이드별 조회수 순위 (상위 10개)',
            font: { size: 18, weight: 'bold' },
            color: '#1E293B'
          },
          tooltip: {
            backgroundColor: '#1E293B',
            padding: 12,
            cornerRadius: 8,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 12 },
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#64748B',
              font: { size: 10 },
              maxRotation: 45,
              minRotation: 45,
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#E2E8F0' },
            ticks: { color: '#64748B', font: { size: 10 } }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [guideData]);

  if (loading) return <div className="p-6 text-center text-slate-500">데이터 로딩 중...</div>;
  if (error) return <div className="p-6 text-center text-red-500">에러 발생: {error}</div>;
  if (guideData.length === 0) return <div className="p-6 text-center text-slate-500">표시할 가이드 데이터가 없습니다.</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-96">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};
