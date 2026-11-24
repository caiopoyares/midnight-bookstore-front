import type { Metadata } from 'next';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/spectral/latin-500.css';
import '@fontsource/spectral/latin-500-italic.css';
import '@fontsource/spectral/latin-600.css';
import './globals.css';
import { AccountProvider } from '../components/account';
import { BagProvider } from '../components/bag';
import { Header, Footer } from '../components/frame';
export const metadata: Metadata = {
  title: {
    default: 'Midnight Books · Livraria de terror',
    template: '%s · Midnight Books',
  },
  description:
    'Uma livraria independente de terror gótico, folclórico e cósmico.',
  referrer: 'no-referrer',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip" href="#main">
          Ir para o conteúdo
        </a>
        <AccountProvider>
          <BagProvider>
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </BagProvider>
        </AccountProvider>
      </body>
    </html>
  );
}
