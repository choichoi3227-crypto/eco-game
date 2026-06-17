import React, { useState } from 'react';

export default function GameCanvas() {
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const items = [{ name: '페트병', type: 'plastic' }, { name: '택배상자', type: 'paper' }];
  const [item, setItem] = useState(items[0]);

  const select = (type: string) => {
    const isCorrect = type === item.type;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      incorrect: score.incorrect + (isCorrect ? 0 : 1)
    };
    setScore(newScore);
    setItem(items[Math.floor(Math.random() * items.length)]);
    
    if ((newScore.correct + newScore.incorrect) % 5 === 0) {
      fetch('/api/game/save', { method: 'POST', body: JSON.stringify(newScore) });
    }
  };

  return (
    <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-slate-100 text-center">
      <div className="text-blue-600 font-bold mb-4 uppercase tracking-widest text-sm">Now Sorting</div>
      <h2 className="text-5xl font-black mb-12 text-slate-900">{item.name}</h2>
      <div className="flex justify-center gap-4">
        {['plastic', 'paper', 'glass'].map(t => (
          <button key={t} onClick={() => select(t)} className="px-8 py-4 bg-slate-50 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all uppercase">
            {t}
          </button>
        ))}
      </div>
      <div className="mt-12 flex justify-center gap-12 font-bold text-slate-400">
        <div className="text-blue-600">정답: {score.correct}</div>
        <div className="text-red-500">오답: {score.incorrect}</div>
      </div>
    </div>
  );
}
