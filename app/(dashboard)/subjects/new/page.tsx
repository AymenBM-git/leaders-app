"use client";

import { useState } from "react";
import { ChevronLeft, Save, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewSubjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            codematiere: formData.get("codematiere"),
        };

        try {
            const res = await fetch("/api/subjects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to create subject");

            router.push("/subjects");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue lors de la création.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/subjects"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouvelle Matière</h1>
                    <p className="text-slate-500 text-sm">Ajouter une matière au programme.</p>
                </div>
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
                            placeholder="Ex: Informatique"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Identifiant Matière</label>
                            <div className="relative">
                                <label className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    name="codematiere"
                                    type="text"
                                    placeholder="Ex: Mat001"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
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
                                Créer
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
