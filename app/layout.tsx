import type { Metadata } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/spectral/latin-500.css';
import '@fontsource/spectral/latin-500-italic.css';
import '@fontsource/spectral/latin-600.css';
import './globals.css';
import { BagProvider } from '../components/bag';
import { Header, Footer } from '../components/frame';
export const metadata: Metadata = {
  title: {
    default: 'Nightjar Books · Horror bookshop',
    template: '%s · Nightjar Books',
  },
  description: 'An independent bookshop for gothic, folk and cosmic horror.',
  referrer: 'no-referrer',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <BagProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </BagProvider>
      </body>
    </html>
  );
}
