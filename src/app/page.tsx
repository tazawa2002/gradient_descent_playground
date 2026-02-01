export default function Home() {
  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Migration kickoff</p>
          <h1>Gradient Descent Playground</h1>
          <p className="subtitle">
            Next.js への移行プロジェクトを開始しました。ここから UI の刷新と
            ブログ機能の追加を進めます。
          </p>
          <div className="actions">
            <a className="primary" href="/gradient_descent_playground/index.html">
              既存デモを見る
            </a>
            <a className="secondary" href="#roadmap">
              進行ロードマップ
            </a>
          </div>
        </div>
      </header>

      <section className="card" id="roadmap">
        <h2>移行ロードマップ（初期）</h2>
        <ol>
          <li>現行の可視化ロジックを core モジュールとして切り出し</li>
          <li>UI をコンポーネント化して操作性を改善</li>
          <li>ブログ機能（Markdown/MDX）を追加</li>
          <li>ユーザー定義の目的関数・最適化手法を実行可能に</li>
        </ol>
      </section>

      <section className="card">
        <h2>次のステップ</h2>
        <ul>
          <li>現在の JS を TypeScript 化して段階的に移植</li>
          <li>GitHub Pages 向けの静的エクスポート運用を整備</li>
        </ul>
      </section>
    </main>
  );
}
