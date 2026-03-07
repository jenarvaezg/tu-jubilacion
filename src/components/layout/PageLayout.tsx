import { useState, type ReactNode } from "react";
import { Header } from "./Header.tsx";
import { Footer } from "./Footer.tsx";

interface PageLayoutProps {
  readonly sidebar: ReactNode;
  readonly children: ReactNode;
}

export function PageLayout({ sidebar, children }: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-paper transition-colors duration-300">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row relative items-start">
          <aside
            className={`w-full shrink-0 transition-all duration-300 ease-in-out md:sticky md:top-8 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto pr-2 custom-scrollbar ${
              isCollapsed
                ? "md:w-0 md:opacity-0 md:pointer-events-none"
                : "md:w-80 lg:w-96 md:opacity-100"
            }`}
          >
            {/* Toggle Button for Desktop - Anchored to sidebar but floating on the edge */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="absolute -right-4 top-4 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-paper-dark bg-white shadow-sm hover:bg-paper-dark md:flex transition-all duration-300"
              title={isCollapsed ? "Expandir datos" : "Colapsar datos"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="min-w-[320px] pb-8">{sidebar}</div>
          </aside>

          {/* Re-open button when collapsed */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="fixed left-0 top-1/2 z-30 hidden h-11 w-11 items-center justify-center rounded-r-xl border border-l-0 border-gray-200 bg-white shadow-md hover:bg-gray-50 md:flex"
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
