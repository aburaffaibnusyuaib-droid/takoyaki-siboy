import { Plus_Jakarta_Sans, Montserrat } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-montserrat',
});

export const metadata = {
  title: {
    default: 'Takoyaki Siboy - Takoyaki Kaki 5 Rasa *5',
    template: '%s | Siboy POS', // Otomatis menambahkan akhiran "| Siboy POS" di sub-halaman
  },
  description: 'Pesan Takoyaki autentik lezat dengan aneka pilihan topping premium.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${plusJakarta.variable} ${montserrat.variable} h-full`}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}