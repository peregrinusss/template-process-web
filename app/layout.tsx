import type { Metadata } from 'next';
import { Golos_Text } from 'next/font/google';
import './globals.css';

const golos = Golos_Text({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Генератор документов РУДН',
  description: 'Генерация документов по шаблонам',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={golos.variable}>
      <body className="font-sans bg-page text-ink min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
