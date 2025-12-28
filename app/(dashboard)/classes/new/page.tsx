"use client";

import { useState } from "react";
import { ChevronLeft, Save, School, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewClassPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch("/api/classes", {
                method: "POST",
                body: JSON.stringify({ name: formData.get("name"), level: formData.get("level") }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création");

            router.push("/classes");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/classes"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouvelle Classe</h1>
                    <p className="text-slate-500 text-sm">Créer un nouveau groupe classe.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2 text-indigo-600">
                    <School className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Détails de la Classe</h3>
                </div>
                <div className="mt-6 space-y-3">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Niveau</label>
                        <select name="level" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                            <option value="">Sélectionner un niveau...</option>
                            <option value="1">السابعة أساسي</option>
                            <option value="2">الثامنة أساسي</option>
                            <option value="3">التاسعة أساسي</option>
                        </select>

                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nom de la Classe</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ex: 1"
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
                                Créer la Classe
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
