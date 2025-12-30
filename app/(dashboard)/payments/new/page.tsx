"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Parent {
    id: number;
    name: string;
}

const currentYear = (() => {
    const now = new Date();
    const year = now.getFullYear();
    return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
})();

export default function NewStudentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [parents, setParents] = useState<Parent[]>([]);
    const [anneeScolaires, setAnneeScolaires] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {

                setAnneeScolaires([currentYear]);

                const [parentsRes,asRes] = await Promise.all([
                    fetch('/api/parents'),
                    fetch('/api/payments/as'),
                ]);

                if (parentsRes.ok && asRes.ok) {
                    const parentsData = await parentsRes.json();
                    setParents(parentsData);

                    const asData = await asRes.json();
                    const yearsInDB = Array.from(new Set(asData.map((e: any) => e.as))).filter(Boolean) as string[];
                    const allYears = Array.from(new Set([currentYear, ...yearsInDB]))
                    .sort((a, b) => b.localeCompare(a));
                    setAnneeScolaires(allYears);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch("/api/payments", {
                method: "POST",
                body: JSON.stringify({ parentId: formData.get("parentId"), amount: formData.get("amount"),as: formData.get("as"), type: formData.get("type") }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création");

            router.push("/payments");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/payments"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouveau Payement</h1>
                    <p className="text-slate-500 text-sm">Créez un nouveau payement parent.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        {/* Titre */}
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                            Informations Payement
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Parent */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Parent</label>
                                <select
                                    name="parentId"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner un parent...</option>
                                    {parents.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Montant */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Montant</label>
                                <input
                                    type="number"
                                    name="amount"
                                    placeholder="Ex: 100"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            {/* Annee Scolaire */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Année Scolaire</label>
                                <select
                                    name="as"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    {
                                        anneeScolaires.map((as, index) => <option key={index} value={as}>{as}</option>)
                                    }
                                </select>
                            </div>
                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    name="type"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                                    <option value="comptant">Comptant</option>
                                    <option value="cheque">Chèque</option>
                                    <option value="virement">Virement</option>
                                </select>
                            </div>
                            {/** Description 
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Ex: Description"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>*/}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
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
                            {isLoading ? "Enregistrement..." : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
