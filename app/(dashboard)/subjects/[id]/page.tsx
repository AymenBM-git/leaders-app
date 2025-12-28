"use client";

import { use, useEffect, useState } from "react";
import { ChevronLeft, Save, BookOpen, Trash2, User, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Subject {
    id: number;
    name: string;
    codematiere: string;
    teachers: any[];
}

export default function EditSubjectPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [subject, setSubject] = useState<Subject | null>(null);

    useEffect(() => {
        fetch(`/api/subjects/${unwrappedParams.id}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch");
                return res.json();
            })
            .then(data => {
                setSubject(data);
                setIsFetching(false);
            })
            .catch(err => {
                console.error(err);
                setIsFetching(false);
                // Optionally redirect or show error
            });
    }, [unwrappedParams.id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            codematiere: formData.get("codematiere"),
        };

        try {
            const res = await fetch(`/api/subjects/${unwrappedParams.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to update");

            router.push("/subjects");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de la mise à jour.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) return;

        try {
            const res = await fetch(`/api/subjects/${unwrappedParams.id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            router.push("/subjects");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de la suppression.");
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center text-slate-500">Chargement...</div>;
    }

    if (!subject) {
        return <div className="p-8 text-center text-slate-500">Matière introuvable</div>;
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/subjects"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Modifier Matière</h1>
                        <p className="text-slate-500 text-sm">Gestion du programme.</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Détails de la Matière</h3>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nom de la Matière</label>
                        <input
                            name="name"
                            type="text"
                            defaultValue={subject.name}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Identifiant Matière</label>
                        <input
                            name="codematiere"
                            type="text"
                            defaultValue={subject.codematiere}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
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
                                Mettre à jour
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Teachers List Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-indigo-600">
                        <User className="w-5 h-5" />
                        <h3 className="font-bold text-lg text-slate-900">Liste des Enseignants ({subject.teachers.length})</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Enseignant</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-center">Genre</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Téléphone</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {subject.teachers.map((teacher: any, index: number) => (
                                <motion.tr
                                    key={teacher.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="p-4">
                                        <span className="text-sm font-mono text-slate-500">{teacher.name}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${teacher.gender === 'm' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-50 text-pink-600 border border-pink-100'
                                            }`}>
                                            {teacher.gender === 'm' ? 'Masculin' : 'Féminin'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-sm font-mono text-slate-500">{teacher.phone}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link href={`/teachers/${teacher.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm font-medium">
                                            <Eye className="w-3.5 h-3.5" />
                                            Profil
                                        </Link>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {subject.teachers.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun enseignant pour cette matière.</p>
                    </div>
                )}
            </div>

        </div>
    );
}
