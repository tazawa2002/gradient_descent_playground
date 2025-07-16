// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useSearchParams } from 'react-router-dom';
import styles from './App.module.css';
import { interpolateColor, normalizeLogScale, drawGrid, drawAxesWithTicks, drawPoint, drawPath } from './utils/visualizer';
import { FUNCTIONS } from './utils/optimizers';
import { OPTIMIZERS } from './utils/optimizers';
import Guide from './components/Guide';
import Gallery from './components/Gallery';
import Controls from './components/Controls';
import { useOptimizer } from './hooks/useOptimizer';

function Header() {
  return (
    <header>
      <h1 className={styles.title}>Gradient Descent Playground</h1>
    </header>
  );
}

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul>
        <li><Link to="/">Main</Link></li>
        <li><Link to="/guide">Guide</Link></li>
        <li><Link to="/gallery">Gallery</Link></li>
      </ul>
    </nav>
  );
}

type HeatMapProps = {
  func: (x: number, y: number) => number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width?: number;
  height?: number;
  history: { x: number; y: number }[];
};

function Heatmap({ func, xMin, xMax, yMin, yMax, width = 400, height = 400, history }: HeatMapProps) {
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const pathCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    let minVal = Infinity, maxVal = -Infinity;
    const values = new Float32Array(width * height);
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x = xMin + (xMax - xMin) * (i / (width - 1));
        const y = yMin + (yMax - yMin) * (j / (height - 1));
        const val = func(x, y);
        values[j * width + i] = val;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
    }
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const val = values[j * width + i];
        const normalized = normalizeLogScale(val, minVal, maxVal);
        const [r, g, b] = interpolateColor(normalized);
        const index = ((height - 1 - j) * width + i) * 4;
        [data[index], data[index + 1], data[index + 2]] = [r, g, b];
        data[index + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    drawGrid(ctx, width, height, [xMin, xMax], [yMin, yMax]);
    drawAxesWithTicks(ctx, width, height, [xMin, xMax], [yMin, yMax]);
  }, [func, xMin, xMax, yMin, yMax, width, height]);

  useEffect(() => {
    const canvas = pathCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (history.length > 0) {
      drawPath(ctx, width, height, history, [xMin, xMax], [yMin, yMax]);
      drawPoint(ctx, width, height, history[0].x, history[0].y, [xMin, xMax], [yMin, yMax], 'cyan', 3);
      if (history.length > 1) {
        const lastPoint = history[history.length - 1];
        drawPoint(ctx, width, height, lastPoint.x, lastPoint.y, [xMin, xMax], [yMin, yMax], 'red', 3);
      }
    }
  }, [history, xMin, xMax, yMin, yMax, width, height]);

  return (
    <div className={styles.heatmapContainer}>
      <canvas ref={heatmapCanvasRef} width={width} height={height}></canvas>
      <canvas ref={pathCanvasRef} width={width} height={height} className={styles.pathCanvas}></canvas>
    </div>
  );
}

import { useOptimizer } from './hooks/useOptimizer';

function MainContent() {
  const {
    settings,
    isRunning,
    history,
    handleSettingChange,
    handleStart,
    handleStop,
  } = useOptimizer();

  const selectedFunction = FUNCTIONS[settings.functionType];
  if (!selectedFunction) {
    // Render a fallback or null if the function type is invalid
    return <div>Error: Invalid function type selected.</div>;
  }

  return (
    <main className={styles.mainContent}>
      <Controls
        functionType={settings.functionType}
        optimizer={settings.optimizerType}
        learningRate={settings.learningRate}
        momentum={settings.momentum}
        initialX={settings.initialX}
        initialY={settings.initialY}
        isRunning={isRunning}
        onFunctionTypeChange={value => handleSettingChange('functionType', value)}
        onOptimizerChange={value => handleSettingChange('optimizerType', value)}
        onLearningRateChange={value => handleSettingChange('learningRate', value)}
        onMomentumChange={value => handleSettingChange('momentum', value)}
        onInitialXChange={value => handleSettingChange('initialX', value)}
        onInitialYChange={value => handleSettingChange('initialY', value)}
        onStart={handleStart}
        onStop={handleStop}
      />
      <Heatmap
        func={selectedFunction.f}
        xMin={selectedFunction.range.x[0]}
        xMax={selectedFunction.range.x[1]}
        yMin={selectedFunction.range.y[0]}
        yMax={selectedFunction.range.y[1]}
        width={500}
        height={500}
        history={history}
      />
    </main>
  );
}

function Footer() {
  return (
    <footer>
      <p>© 2025 Gradient Descent Playground. Created by tazawa2002.</p>
      <p></p>
      <p>
        <a href="https://github.com/tazawa2002" target="_blank">GitHub</a>
      </p>
    </footer>
  );
}

function App() {
  return (
    <Router basename="/">
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
