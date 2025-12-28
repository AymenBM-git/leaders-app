"use client";

import { BookOpen, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Subject {
    id: number;
    name: string;
    codematiere: string;
    teachers: any[]; // Depending on what's returned, or just array of objects
}

const COLORS = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-pink-500",
    "bg-sky-500",
    "bg-amber-500",
    "bg-slate-800"
];

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('/api/subjects');
                if (!res.ok) throw new Error('Failed to fetch subjects');
                const data = await res.json();
                //data.teachers = await fetch('/api/teachers');
                setSubjects(data);
            } catch (error) {
                console.error("Error fetching subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Chargement des matières...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Matières</h1>
                    <p className="text-slate-500 mt-1">Programme scolaire et coefficients.</p>
                </div>
                <Link href="/subjects/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouvelle Matière
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subjects.map((subject, index) => {
                    // Assign a color based on index or ID to keep it somewhat consistent
                    // Using index % COLORS.length ensures we cycle through colors
                    const color = COLORS[index % COLORS.length];
                    const teacherCount = subject.teachers ? subject.teachers.length : 0;

                    return (
                        <div key={subject.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-indigo-100 transition-all">
                            <div className="flex justify-between items-start">
                                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-md`}>
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>

                            <Link href={`/subjects/${subject.id}`} className="block">
                                <h3 className="text-lg font-bold text-slate-900 mt-4 hover:text-indigo-600 transition-colors">{subject.name}</h3>
                            </Link>

                            <div className="mt-2 flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Enseignants</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-700">{teacherCount}</span>
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(teacherCount, 3))].map((_, i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                                        ))}
                                        {teacherCount > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                                                +{teacherCount - 3}
                                            </div>
                                        )}
                                    </div>
                                    {teacherCount === 0 && <span className="text-xs text-slate-400 font-medium">Aucun enseignant</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {subjects.length === 0 && (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                    <p className="text-slate-500">Aucune matière trouvée.</p>
                </div>
            )}
        </div>
    );
}
