import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '../components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Posyandu Management System',
  description: 'Sistem manajemen posyandu untuk monitoring kesehatan balita, ibu menyusui, dan lansia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}