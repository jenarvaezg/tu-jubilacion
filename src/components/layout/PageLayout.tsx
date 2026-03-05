import type { ReactNode } from 'react';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';

interface PageLayoutProps {
  readonly sidebar: ReactNode;
  readonly children: ReactNode;
}

export function PageLayout({ sidebar, children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <aside className="w-full shrink-0 md:w-80 lg:w-96">
            {sidebar}
          </aside>
          <section className="min-w-0 flex-1">
            {children}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
