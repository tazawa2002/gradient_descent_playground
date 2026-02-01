import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Gradient Descent Playground',
  description: '勾配法の挙動を可視化するインタラクティブなプレイグラウンド。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
