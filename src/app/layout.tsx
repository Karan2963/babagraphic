import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'BABA Graphics - Thesis Printing, Binding & Design in Varanasi | BHU Lanka',
  description: 'Professional thesis printing, hard binding, spiral binding, graphic design, color printing, xerox, document editing, resume printing, ID cards, photo printing, project binding in Varanasi, BHU Lanka. Call +91 63064 74331.',
  keywords: ['thesis printing Varanasi', 'hard binding Varanasi', 'spiral binding', 'thesis binding BHU', 'BABA Book Binding', 'graphic design Varanasi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="google-site-verification" content="8_XOaZb3vflydwbdQ2rLqYlWM02RTrLWdfk6H3PRW9I" />
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        </head>
        <body className="antialiased bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
