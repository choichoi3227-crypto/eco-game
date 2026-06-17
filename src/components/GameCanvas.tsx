import React, { useState, useEffect } from 'react';

const ITEMS = [
  { name: '페트병', type: 'plastic' },
  { name: '신문지', type: 'paper' },
  { name: '와인병', type: 'glass' }
];

export default function GameCanvas() {
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentItem, setCurrentItem] = useState(ITEMS[0]);
  const [userLevel, setUserLevel] = useState(1); // 사용자 레벨 상태
  const [userXp, setUserXp] = useState(0); // 사용자 경험치 상태

  // 초기 사용자 레벨/XP 로드 (선택 사항)
  // useEffect(() => {
  //   // 로그인된 사용자 정보에서 레벨/XP 가져오는 API 호출
  // }, []);

  const handleChoice = async (choice: string) => {
    const isCorrect = choice === currentItem.type;
    const newScore = {
      correct: score.correct + (isCorrect ? 1 : 0),
      incorrect: score.incorrect + (isCorrect ? 0 : 1)
    };
    setScore(newScore);
    setCurrentItem(ITEMS[Math.floor(Math.random() * ITEMS.length)]);

    // XP 획득 API 호출
    if (isCorrect) {
      const xpRes = await fetch('/api/game/xp', {
        method: 'POST',
        body: JSON.stringify({ isCorrect: true }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (xpRes.ok) {
        const xpData = await xpRes.json();
        setUserXp(xpData.experiencePoints);
        setUserLevel(xpData.level);
        if (xpData.leveledUp) {
          alert(`축하합니다! 레벨 ${xpData.level}로 레벨업했습니다!`);
        }
      }
    }

    // 10회마다 게임 결과 저장
    if ((newScore.correct + newScore.incorrect) % 10 === 0) {
      await fetch('/api/game/save', { method: 'POST', body: JSON.stringify(newScore) });
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center max-w-md mx-auto">
      <div className="text-sm font-bold text-blue-600 mb-2 uppercase">Recycle Challenge</div>
      <h2 className="text-4xl font-black text-slate-900 mb-8">{currentItem.name}</h2>
      <div className="grid grid-cols-3 gap-3">
        {['plastic', 'paper', 'glass'].map(t => (
          <button key={t} onClick={() => handleChoice(t)} className="py-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-all capitalize">
            {t}
          </button>
        ))}
      </div>
      <div className="mt-8 flex justify-around text-sm font-bold">
        <span className="text-blue-600">성공: {score.correct}</span>
        <span className="text-red-500">실패: {score.incorrect}</span>
      </div>
      <div className="mt-4 text-sm font-bold text-slate-700">
        레벨: {userLevel} (XP: {userXp})
      </div>
    </div>
  );
}
