// src/hooks/useOptimizer.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FUNCTIONS, OPTIMIZERS } from '../utils/optimizers';

export function useOptimizer() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getInitialState = <T,>(key: string, defaultValue: T, parser: (val: string) => T): T => {
    const value = searchParams.get(key);
    return value ? parser(value) : defaultValue;
  };

  const [settings, setSettings] = useState(() => ({
    functionType: getInitialState('functionType', 'rosenbrock', s => s),
    optimizerType: getInitialState('optimizer', 'adam', s => s),
    learningRate: getInitialState('lr', 0.001, parseFloat),
    momentum: getInitialState('momentum', 0.9, parseFloat),
    initialX: getInitialState('x', -1.5, parseFloat),
    initialY: getInitialState('y', 1.5, parseFloat),
  }));

  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState([{ x: settings.initialX, y: settings.initialY }]);
  const optimizerState = useRef(OPTIMIZERS[settings.optimizerType]?.createState() || {});

  useEffect(() => {
    const params = {
      functionType: settings.functionType,
      optimizer: settings.optimizerType,
      lr: settings.learningRate.toString(),
      momentum: settings.momentum.toString(),
      x: settings.initialX.toString(),
      y: settings.initialY.toString(),
    };
    setSearchParams(params, { replace: true });
  }, [settings, setSearchParams]);

  useEffect(() => {
    if (!isRunning) {
      optimizerState.current = OPTIMIZERS[settings.optimizerType]?.createState() || {};
      setHistory([{ x: settings.initialX, y: settings.initialY }]);
    }
  }, [settings.initialX, settings.initialY, settings.functionType, settings.optimizerType, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    const selectedFunction = FUNCTIONS[settings.functionType];
    const optimizer = OPTIMIZERS[settings.optimizerType];
    if (!selectedFunction || !optimizer) return;

    const intervalId = setInterval(() => {
      setHistory(prevHistory => {
        if (prevHistory.length === 0) return [];
        const currentPos = prevHistory[prevHistory.length - 1];
        const grad = selectedFunction.gradient(currentPos.x, currentPos.y);
        const hyperparams = { learningRate: settings.learningRate, momentum: settings.momentum };

        const { newParams, newState } = optimizer.update(currentPos, grad, optimizerState.current, hyperparams);
        optimizerState.current = newState;

        if (isNaN(newParams.x) || isNaN(newParams.y) || !isFinite(newParams.x) || !isFinite(newParams.y)) {
          setIsRunning(false);
          console.error("Optimization resulted in invalid numbers. Stopping.");
          return prevHistory;
        }
        return [...prevHistory, newParams];
      });
    }, 50);

    return () => clearInterval(intervalId);
  }, [isRunning, settings]);

  const handleSettingChange = (field: keyof typeof settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleStart = useCallback(() => {
    optimizerState.current = OPTIMIZERS[settings.optimizerType]?.createState() || {};
    setHistory([{ x: settings.initialX, y: settings.initialY }]);
    setIsRunning(true);
  }, [settings.optimizerType, settings.initialX, settings.initialY]);

  const handleStop = useCallback(() => {
    setIsRunning(false);
  }, []);

  return { settings, isRunning, history, handleSettingChange, handleStart, handleStop };
}
