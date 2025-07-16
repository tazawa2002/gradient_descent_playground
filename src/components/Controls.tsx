
// src/components/Controls.tsx
import React from 'react';
import styles from './Controls.module.css';
import SliderControl from './SliderControl';
import { FUNCTIONS, OPTIMIZERS } from '../utils/optimizers';

// Types for the component's props
type ControlsProps = {
  functionType: string;
  optimizer: string;
  learningRate: number;
  momentum: number;
  initialX: number;
  initialY: number;
  isRunning: boolean;

  onFunctionTypeChange: (value: string) => void;
  onOptimizerChange: (value: string) => void;
  onLearningRateChange: (value: number) => void;
  onMomentumChange: (value: number) => void;
  onInitialXChange: (value: number) => void;
  onInitialYChange: (value: number) => void;
  onStart: () => void;
  onStop: () => void;
};

function Controls(props: ControlsProps) {
  const {
    functionType, optimizer, learningRate, momentum, initialX, initialY, isRunning,
    onFunctionTypeChange, onOptimizerChange, onLearningRateChange, onMomentumChange,
    onInitialXChange, onInitialYChange, onStart, onStop
  } = props;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('URL copied to clipboard!'))
      .catch(err => console.error('Failed to copy URL:', err));
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlGroup}>
        <label htmlFor="functionType">Function</label>
        <select id="functionType" value={functionType} onChange={e => onFunctionTypeChange(e.target.value)} disabled={isRunning}>
          {Object.keys(FUNCTIONS).map(key => (
            <option key={key} value={key}>{FUNCTIONS[key].name}</option>
          ))}
        </select>
      </div>

      <div className={styles.controlGroup}>
        <label htmlFor="optimizer">Optimizer</label>
        <select id="optimizer" value={optimizer} onChange={e => onOptimizerChange(e.target.value)} disabled={isRunning}>
          {Object.keys(OPTIMIZERS).map(key => (
            <option key={key} value={key}>{OPTIMIZERS[key].name}</option>
          ))}
        </select>
      </div>

      <SliderControl
        label="Learning Rate"
        value={learningRate}
        min={0.0001}
        max={0.1}
        step={0.0001}
        onChange={onLearningRateChange}
        disabled={isRunning}
      />

      <SliderControl
        label="Momentum"
        value={momentum}
        min={0.1}
        max={0.99}
        step={0.01}
        onChange={onMomentumChange}
        disabled={isRunning || !optimizer.includes('momentum')}
      />

      <SliderControl
        label="Initial X"
        value={initialX}
        min={-2}
        max={2}
        step={0.1}
        onChange={onInitialXChange}
        disabled={isRunning}
      />

      <SliderControl
        label="Initial Y"
        value={initialY}
        min={-1}
        max={3}
        step={0.1}
        onChange={onInitialYChange}
        disabled={isRunning}
      />

      <div className={styles.buttonGroup}>
        <button className={styles.startButton} onClick={onStart} disabled={isRunning}>Start</button>
        <button className={styles.stopButton} onClick={onStop} disabled={!isRunning}>Stop</button>
        <button className={styles.copyUrlButton} onClick={handleCopyUrl}>Copy URL</button>
      </div>
    </div>
  );
}

export default Controls;
