"use client";

import { useState } from "react";
import { TEACHERS } from "@/lib/data";
import { Search, Plus, Mail, Phone, BookOpen, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TeachersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filteredTeachers = TEACHERS.filter(teacher =>
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Enseignants</h1>
                    <p className="text-slate-500 mt-1">Gérez le corps professoral.</p>
                </div>
                <Link href="/teachers/new" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Ajouter Enseignant
                </Link>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <List className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredTeachers.map((teacher, index) => (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all group overflow-hidden"
                        >
                            <div className="h-24 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
                                <button className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="px-6 pb-6 mt-[-40px]">
                                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md mx-auto">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover rounded-xl" />
                                </div>
                                <div className="text-center mt-3">
                                    <Link href={`/teachers/${teacher.id}`} className="font-bold text-slate-900 text-lg hover:text-emerald-600 transition-colors block">
                                        {teacher.name}
                                    </Link>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        {teacher.subject}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-center gap-3">
                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </button>
                                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
