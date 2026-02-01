# Gradient Descent Playground

## 概要
**Gradient Descent Playground** は、勾配法（Gradient Descent）を視覚的に学び、体験できるインタラクティブなツールです。  
さまざまな最適化アルゴリズムの特性を実際に動かして確認することで、アルゴリズムの挙動や違いを直感的に理解することを目的としています。

---

## 公開リンク
このプロジェクトは GitHub Pages で公開されています。以下のリンクからアクセスできます：

[Gradient Descent Playground](https://tazawa2002.github.io/gradient_descent_playground/)

---

## Next.js への移行について
現在、Next.js への移行を開始しました。`output: 'export'` により GitHub Pages 向けの静的エクスポート運用を前提に構成しています。

### ローカル開発
```bash
npm install
npm run dev
```

### 静的エクスポート（GitHub Pages 用）
```bash
npm run build
npm run export
```

---

## 主な機能
1. **ヒートマップの描画**  
   - 最適化対象の関数をヒートマップとして可視化。
   - 勾配法の探索過程を視覚的に追跡可能。

2. **複数の最適化アルゴリズムを選択可能**  
   - Normal Gradient Descent  
   - Momentum  
   - Nesterov Accelerated Gradient  
   - Metropolis  
   - Newton-Raphson

3. **パラメータの調整**  
   - 学習率（Learning Rate）やモーメンタム（Momentum）などのハイパーパラメータを自由に設定可能。

4. **インタラクティブな操作**  
   - スライダーやドロップダウンメニューを使って、初期値や探索速度をリアルタイムで変更可能。

5. **結果の共有**  
   - 実行結果をURLとして生成し、X（旧Twitter）で共有可能。
   - `canvas` の画像をクリップボードにコピーして投稿に貼り付けることも可能。

---

## 使用方法
1. 上記の公開リンクにアクセスします。
2. **関数** や **アルゴリズム** を選択します。
3. パラメータを調整し、「Start Optimization」ボタンをクリックして最適化を開始します。
4. 「結果をXに投稿」ボタンをクリックして、結果を共有します。

---

## 教育的価値
このツールは、以下のような教育的な目的に役立ちます：
- 勾配法や最適化アルゴリズムの動作を視覚的に理解。
- ハイパーパラメータの影響を直感的に体感。
- アルゴリズム間の違いを比較し、特性を学習。
