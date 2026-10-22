import type { Metadata } from 'next';
import '@fontsource/bodoni-moda/latin-400.css';
import '@fontsource/bodoni-moda/latin-500.css';
import '@fontsource/bodoni-moda/latin-400-italic.css';
import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import './globals.css';
export const metadata: Metadata = {
  icons: { icon: '/mark.svg' },
  title: 'ATELIER COFFEE — Precision in every drop.',
  description: 'Le temps d’un espresso. Une extraction cinématographique dont chaque goutte suit votre défilement.',
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fr"><body>{children}</body></html>}
