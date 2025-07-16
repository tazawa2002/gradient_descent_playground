// src/components/SliderControl.tsx
import React from 'react';
import styles from './Controls.module.css';

// Propsの型を定義
interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

// Propsを分割代入で受け取る
const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, step, onChange, disabled = false }) => {
  return (
    <div className={styles.controlGroup}>
      <label htmlFor={`${label}-slider`}>{label}: {value}</label>
      <input
        type="range"
        id={`${label}-slider`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default SliderControl;