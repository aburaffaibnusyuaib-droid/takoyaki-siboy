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
  metadataBase: new URL('https://takoyaki-siboy.vercel.app'),
  title: {
    default: 'Takoyaki Siboy - Takoyaki Kaki 5 Rasa Bintang 5',
    template: '%s | Siboy POS',
  },
  description: 'Pesan Takoyaki autentik lezat dengan aneka pilihan topping premium di Jakarta. Melayani pesan online & self pick-up.',
  keywords: ['Takoyaki Siboy', 'Takoyaki Jakarta', 'Takoyaki SMKN 50', 'Siboy POS'],
  icons: {
    icon: '/logosiboy.png',
    shortcut: '/logosiboy.png',
    apple: '/logosiboy.png',
  },
  openGraph: {
    title: 'Takoyaki Siboy - Jajanan Autentik Jepang',
    description: 'Pesan Takoyaki autentik lezat dengan aneka pilihan topping premium.',
    url: 'https://takoyaki-siboy.vercel.app',
    siteName: 'Takoyaki Siboy',
    images: [
      {
        url: '/logosiboy.png',
        width: 600,
        height: 600,
        alt: 'Logo Takoyaki Siboy',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  // Schema Structured Data agar Google mengenali gerai makanan secara resmi
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FastFoodRestaurant',
    name: 'Takoyaki Siboy',
    image: 'https://takoyaki-siboy.vercel.app/logosiboy.png',
    url: 'https://takoyaki-siboy.vercel.app',
    telephone: '+628567637987',
    servesCuisine: 'Japanese',
    priceRange: 'Rp 6.000 - Rp 17.000',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Depan SMKN 50 Jakarta',
      addressLocality: 'Jakarta Timur',
      addressRegion: 'DKI Jakarta',
      addressCountry: 'ID',
    },
  };

  return (
    <html lang="id" className={`${plusJakarta.variable} ${montserrat.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}