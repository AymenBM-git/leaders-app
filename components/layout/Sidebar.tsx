"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    GraduationCap,
    Users,
    BookOpen,
    Calendar,
    Settings,
    LogOut,
    UserCheck,
    School,
    Menu,
    X,
    MapPin
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const routes = [
    {
        label: "Tableau de bord",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Élèves",
        icon: GraduationCap,
        href: "/students",
        color: "text-violet-500",
    },
    {
        label: "Parents",
        icon: Users,
        href: "/parents",
        color: "text-pink-500",
    },
    {
        label: "Enseignants",
        icon: UserCheck,
        href: "/teachers",
        color: "text-orange-500",
    },
    {
        label: "Classes",
        icon: School,
        href: "/classes",
        color: "text-emerald-500",
    },
    {
        label: "Matières",
        icon: BookOpen,
        href: "/subjects",
        color: "text-blue-500",
    },
    {
        label: "Salles",
        icon: MapPin,
        href: "/rooms",
        color: "text-amber-500",
    },
    {
        label: "Emploi du temps",
        icon: Calendar,
        href: "/schedule",
        color: "text-indigo-500",
    },
];

export const Sidebar = () => {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 bg-white rounded-full shadow-lg text-slate-900"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Desktop & Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto",
                isMobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col glass-effect-sidebar bg-[#111827]">
                    {/* Logo */}
                    <div className="px-6 py-8 flex items-center">
                        <Link href="/dashboard" className="flex items-center gap-x-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                                <School className="text-white w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">
                                GSI Leaders
                            </h1>
                        </Link>
                    </div>

                    {/* Routes */}
                    <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center group w-full p-3 rounded-xl transition-all duration-200 hover:bg-white/10",
                                    pathname === route.href
                                        ? "bg-white/10 text-white shadow-lg shadow-indigo-500/10"
                                        : "text-zinc-400"
                                )}
                            >
                                <div className={cn("flex items-center flex-1")}>
                                    <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                    <span className="font-medium text-sm">{route.label}</span>
                                </div>
                                {pathname === route.href && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="w-1.5 h-1.5 rounded-full bg-indigo-500 ml-auto"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* User / Settings Footer */}
                    <div className="mt-auto px-3 py-6 border-t border-white/10">
                        <Link href="/settings" className="flex items-center p-3 rounded-xl hover:bg-white/10 text-zinc-400 transition-colors">
                            <Settings className="h-5 w-5 mr-3" />
                            <span className="font-medium text-sm">Paramètres</span>
                        </Link>
                        <Link href="/login" className="flex items-center p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-500 transition-colors mt-1">
                            <LogOut className="h-5 w-5 mr-3" />
                            <span className="font-medium text-sm">Déconnexion</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};
