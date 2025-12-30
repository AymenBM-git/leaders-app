"use client";

import { Bell, Search, Menu as MenuIcon, Loader2, User, GraduationCap, Users as UsersIcon } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useSidebar } from "./SidebarContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Topbar = () => {
    const [user, setUser] = useState({ name: "Utilisateur", role: "" });
    const { toggle } = useSidebar();
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const name = cookies['user-name'] ? decodeURIComponent(cookies['user-name']) : "Utilisateur";
        const role = cookies['user-role'] || "";

        const roleDisplay = role === "admin" ? "Administrateur" : role === "prof" ? "Enseignant" : role;

        setUser({ name, role: roleDisplay });
    }, []);

    // Search logic with debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                    if (res.ok) {
                        const data = await res.json();
                        setResults(data);
                        setShowResults(true);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Click away listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'student': return <GraduationCap className="h-4 w-4 text-violet-500" />;
            case 'teacher': return <User className="h-4 w-4 text-orange-500" />;
            case 'parent': return <UsersIcon className="h-4 w-4 text-pink-500" />;
            default: return <Search className="h-4 w-4 text-slate-400" />;
        }
    };

    return (
        <div className="h-20 px-4 md:px-8 flex items-center justify-between glass-effect border-b bg-white/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-x-4">
                <button
                    onClick={toggle}
                    className="p-2 md:hidden hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <MenuIcon className="h-6 w-6 text-slate-600" />
                </button>
                <h2 className="text-xl font-semibold text-slate-800 hidden md:block">
                    Tableau de bord
                </h2>
            </div>

            <div className="flex items-center gap-x-6">
                {/* Search */}
                <div ref={searchRef} className="relative hidden md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                            className="pl-10 pr-10 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
                        )}
                    </div>

                    {/* Results Dropdown */}
                    <AnimatePresence>
                        {showResults && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute top-full mt-2 w-[400px] left-0 md:left-auto md:right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                            >
                                <div className="p-2 max-h-[400px] overflow-y-auto">
                                    {results.length > 0 ? (
                                        <div className="space-y-1">
                                            {results.map((result) => (
                                                <button
                                                    key={result.id}
                                                    onClick={() => {
                                                        router.push(result.href);
                                                        setShowResults(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                                                >
                                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                                                        {result.photo ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            result.type==="teacher"?
                                                            <img src={result.photo} alt="" className="h-full w-full object-cover" />
                                                            :
                                                            <img src={result.photo} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            getIcon(result.type)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                                                        <p className="text-xs text-slate-500">{result.subtitle}</p>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                                            {result.type}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-sm text-slate-500">Aucun résultat pour "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Action Icons */}
                <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.role}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">{user.role.charAt(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
