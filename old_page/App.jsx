import React, { useState, useRef } from 'react';
import Controls from './components/Controls';
import OptimizationCanvas from './components/OptimizationCanvas';
import { FUNCTIONS } from './utils/optimizers';
import { SLEEP_MS } from './utils/constants';
import { sleep } from './utils/visualizer';

const INITIAL_SETTINGS = {
  function: 'rosenbrock',
  optimizer: 'sgd',
  learningRate: 0.001,
  iterations: 100,
  // 初期位置は固定
  initialX: -1.5,
  initialY: 1.5,
};

function App() {
  // ユーザーが設定する値の状態
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  // 最適化の軌跡を保存する状態
  const [history, setHistory] = useState([]);
  // 最適化が実行中かどうかの状態
  const [isRunning, setIsRunning] = useState(false);

  // 実行中の処理を中断するためのフラグ
  const isStoppingRef = useRef(false);

  // 最適化を開始するハンドラ
  const handleStart = async () => {
    setIsRunning(true);
    isStoppingRef.current = false;

    let currentX = settings.initialX;
    let currentY = settings.initialY;
    
    // 履歴を初期位置でリセット
    const initialHistory = [{ x: currentX, y: currentY }];
    setHistory(initialHistory);

    const selectedFunction = FUNCTIONS[settings.function];

    for (let i = 0; i < settings.iterations; i++) {
      if (isStoppingRef.current) break;

      // 勾配を計算
      const { gx, gy } = selectedFunction.gradient(currentX, currentY);

      // パラメータを更新 (SGD)
      currentX -= settings.learningRate * gx;
      currentY -= settings.learningRate * gy;

      // 履歴に新しい点を追加
      setHistory(prev => [...prev, { x: currentX, y: currentY }]);

      await sleep(SLEEP_MS);
    }

    setIsRunning(false);
  };

  // 状態をリセットするハンドラ
  const handleReset = () => {
    isStoppingRef.current = true; // 実行中であればループを止める
    setHistory([]);
    setSettings(INITIAL_SETTINGS);
  };

  return (
    <div className="app-container">
      <Controls settings={settings} setSettings={setSettings} onStart={handleStart} onReset={handleReset} isRunning={isRunning} />
      <OptimizationCanvas func={FUNCTIONS[settings.function]} history={history} />
    </div>
  );
}

export default App;