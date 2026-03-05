import { useState, type ReactNode } from 'react';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';

interface PageLayoutProps {
  readonly sidebar: ReactNode;
  readonly children: ReactNode;
}

export function PageLayout({ sidebar, children }: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 transition-colors duration-300">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row relative">
          {/* Toggle Button for Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -left-3 top-4 z-20 hidden h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 md:flex transition-transform duration-300"
            style={{ transform: isCollapsed ? 'translateX(0)' : 'translateX(0)' }}
            title={isCollapsed ? "Expandir datos" : "Colapsar datos"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <aside 
            className={`w-full shrink-0 transition-all duration-300 ease-in-out overflow-hidden md:sticky md:top-4 md:h-fit ${
              isCollapsed ? 'md:w-0 md:opacity-0 md:pointer-events-none' : 'md:w-80 lg:w-96 md:opacity-100'
            }`}
          >
            <div className="min-w-[320px]">
              {sidebar}
            </div>
          </aside>

          {/* Re-open button when collapsed */}
          {isCollapsed && (
             <button
             onClick={() => setIsCollapsed(false)}
             className="fixed left-0 top-1/2 z-30 hidden h-12 w-6 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-white shadow-md hover:bg-gray-50 md:flex"
           >
             <svg
               xmlns="http://www.w3.org/2000/svg"
               width="14"
               height="14"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
             >
               <polyline points="9 18 15 12 9 6" />
             </svg>
           </button>
          )}

          <section className="min-w-0 flex-1 transition-all duration-300">
            {children}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
