"use client";

import { BookOpen, Plus, MoreVertical } from "lucide-react";
import Link from "next/link";

export const SUBJECTS = [
    { id: 1, name: "Mathématiques", coef: 4, teachers: 5, color: "bg-indigo-500" },
    { id: 2, name: "Physique-Chimie", coef: 3, teachers: 3, color: "bg-emerald-500" },
    { id: 3, name: "Français", coef: 3, teachers: 4, color: "bg-pink-500" },
    { id: 4, name: "Anglais", coef: 2, teachers: 3, color: "bg-sky-500" },
    { id: 5, name: "Histoire-Géo", coef: 2, teachers: 2, color: "bg-amber-500" },
    { id: 6, name: "Informatique", coef: 3, teachers: 2, color: "bg-slate-800" },
];

export default function SubjectsPage() {
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
                {SUBJECTS.map((subject) => (
                    <div key={subject.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-indigo-100 transition-all">
                        <div className="flex justify-between items-start">
                            <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center text-white shadow-md`}>
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <Link href={`/subjects/${subject.id}`} className="block">
                            <h3 className="text-lg font-bold text-slate-900 mt-4 hover:text-indigo-600 transition-colors">{subject.name}</h3>
                        </Link>

                        <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Coefficient</span>
                            <span className="font-bold text-slate-900 px-2 py-1 bg-slate-100 rounded-lg">{subject.coef}</span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-slate-500">Enseignants</span>
                            <div className="flex -space-x-2">
                                {[...Array(subject.teachers)].slice(0, 3).map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                                ))}
                                {subject.teachers > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-600">
                                        +{subject.teachers - 3}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
