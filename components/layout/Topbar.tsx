"use client";

import { Bell, Search } from "lucide-react";

export const Topbar = () => {
    return (
        <div className="h-20 px-8 flex items-center justify-between glass-effect border-b bg-white/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="flex items-center gap-x-4">
                <h2 className="text-xl font-semibold text-slate-800 hidden md:block">
                    Tableau de bord
                </h2>
            </div>

            <div className="flex items-center gap-x-6">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                    />
                </div>

                {/* Action Icons */}
                <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-x-3 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">Admin User</p>
                        <p className="text-xs text-slate-500">Administrateur</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">A</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
