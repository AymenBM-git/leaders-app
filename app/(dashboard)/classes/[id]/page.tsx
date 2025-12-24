"use client";

import { use, useState } from "react";
import { ChevronLeft, Save, School, Trash2, User, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CLASSES, STUDENTS } from "@/lib/data";
import { motion } from "framer-motion";

export default function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [isLoading, setIsLoading] = useState(false);

    const classe = CLASSES.find(c => c.id === unwrappedParams.id);
    const classStudents = STUDENTS.filter(s => s.classId === unwrappedParams.id);

    if (!classe) {
        return <div>Classe non trouvée</div>;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            router.push("/classes");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/classes"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Détails Classe: {classe.name}</h1>
                        <p className="text-slate-500 text-sm">Gérez les détails et voyez la liste des élèves.</p>
                    </div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer la classe
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <School className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Détails de la Classe</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nom de la Classe</label>
                        <input
                            type="text"
                            defaultValue={classe.name}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Niveau</label>
                        <select defaultValue={classe.level} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                            <option value="1">7ème Année</option>
                            <option value="2">8ème Année</option>
                            <option value="3">9ème Année</option>
                        </select>
                    </div>

                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? "..." : (
                            <>
                                <Save className="w-4 h-4" />
                                Mettre à jour la classe
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Students List Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <User className="w-5 h-5" />
                        <h3 className="font-bold text-lg text-slate-900">Liste des Élèves ({classStudents.length})</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Élève</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-center">Genre</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Identifiant</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {classStudents.map((student, index) => (
                                <motion.tr
                                    key={student.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-bold text-slate-700">{student.firstName} {student.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${student.gender === 'm' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'
                                            }`}>
                                            {student.gender === 'm' ? 'Masculin' : 'Féminin'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-mono text-slate-500">{student.idenelev}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/students/${student.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-medium">
                                            <Eye className="w-3.5 h-3.5" />
                                            Profil
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {classStudents.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun élève dans cette classe.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
