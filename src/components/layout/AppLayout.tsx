import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useAuthStore } from "@/stores/useAuthStore";
import Mask from "@/components/Mask";
import { X } from "lucide-react";

export function AppLayout() {
  const hydrate = useAuthStore((s: { hydrate: () => void }) => s.hydrate);
  const isAuthenticated = useAuthStore((s: { isAuthenticated: boolean }) => s.isAuthenticated);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <img src="/bg-images/bg-light.png" alt="" className="w-full h-full object-cover dark:hidden" />
        <img src="/bg-images/bg-dark.png" alt="" className="w-full h-full object-cover hidden dark:block" />
      </div>
      <div className="fixed inset-0 -z-10">
        <Mask particleCount={100} />
      </div>

      {isAuthenticated ? (
        <>
          {/* Mobile top bar */}
          <Navbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="flex flex-1 min-h-screen">
            {/* Desktop sidebar */}
            <div className="hidden md:block fixed top-0 left-0 h-screen z-30">
              <Sidebar />
            </div>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
              <>
                <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
                <div className="fixed top-0 left-0 bottom-0 z-50 md:hidden flex">
                  <Sidebar />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}

            <main className="flex-1 min-w-0 px-4 py-6 md:px-6 md:ml-56">
              <Outlet />
            </main>
          </div>
        </>
      ) : (
        <>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-6">
            <Outlet />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
