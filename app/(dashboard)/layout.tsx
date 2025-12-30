import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
        redirect('/login');
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
                {/* Sidebar */}
                <Sidebar />

                {/* Main Content */}
                <main className="md:pl-72 min-h-screen transition-all duration-300">
                    <div className="no-print">
                        <Topbar />
                    </div>
                    <div className="p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}
