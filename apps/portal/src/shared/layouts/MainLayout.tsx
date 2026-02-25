import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "../utils/cn";

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen bg-slate-50 antialiased overflow-hidden font-sans isolate selection:bg-indigo-100 selection:text-indigo-900 ">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div
        className={cn(
          "flex flex-1 flex-col h-full overflow-hidden shrink min-w-0 transition-all bg-transparent relative z-0 ",
        )}
      >
        <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-8 pt-6 relative px-4 md:px-6 lg:px-10  scroll-smooth selection:text-red">
          <div className="mx-auto w-full max-w-[1340px] animate-in slide-in-from-bottom-2 fade-in duration-300 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
