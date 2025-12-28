"use client";

import { useState, useEffect } from "react";
import { Plus, Users, ChevronRight, School, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ClassesPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/classes');
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
            }
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Classes</h1>
                    <p className="text-slate-500 mt-1">Gestion des classes et des niveaux.</p>
                </div>
                <Link href="/classes/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouvelle Classe
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => {
                    const studentCount = cls.students ? cls.students.length : 0;
                    const name = (cls.level === "1") ? "السابعة أساسي " + cls.name : (cls.level === "2") ? "الثامنة أساسي " + cls.name : (cls.level === "3") ? "التاسعة أساسي " + cls.name : ""
                    return (
                        <div key={cls.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <School className="w-6 h-6" />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{studentCount} Élèves</span>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1">{name}</h3>

                            <Link href={`/classes/${cls.id}`} className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-indigo-600 font-medium text-sm group-hover:text-indigo-700">
                                <span>Voir détails</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
