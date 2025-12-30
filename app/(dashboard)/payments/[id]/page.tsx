"use client";

import { use, useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, Loader2, CreditCard } from "lucide-react";
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

export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const [payment, setPayment] = useState<any>();
    const [parents, setParents] = useState<Parent[]>([]);
    const [anneeScolaires, setAnneeScolaires] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                setAnneeScolaires([currentYear]);
                
                const [paymentRes, parentsRes, asRes] = await Promise.all([
                    fetch(`/api/payments/${unwrappedParams.id}`),
                    fetch('/api/parents'),
                    fetch('/api/payments/as')
                ]);

                if (parentsRes.ok && paymentRes.ok && asRes.ok) {
                    const [p, s, asData] = await Promise.all([
                        parentsRes.json(),
                        paymentRes.json(),
                        asRes.json()
                    ]);
                    setPayment(s);
                    setParents(p);

                    const yearsInDB = Array.from(new Set(asData.map((e: any) => e.as))).filter(Boolean) as string[];
                    const allYears = Array.from(new Set([currentYear, ...yearsInDB]))
                    .sort((a, b) => b.localeCompare(a));
                    setAnneeScolaires(allYears);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [unwrappedParams.id]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);


        try {
            const res = await fetch(`/api/payments/${unwrappedParams.id}`, {
                method: 'PUT',
                body: JSON.stringify({ parentId: formData.get("parentId"), amount: formData.get("amount"),as: formData.get("as"), type: formData.get("type") }),
            });

            if (res.ok) {
                router.push("/payments");
            } else {
                alert("Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error("Failed to update payment", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer ce paiement ?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/payments/${unwrappedParams.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push("/payments");
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Failed to delete payment", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading || !payment) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/payments"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Modifier Paiement</h1>
                        <p className="text-slate-500 text-sm">ID: {payment?.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Supprimer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        {/* Titre */}
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                            Informations du paiement
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Parent */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Parent</label>
                                <select
                                    name="parentId"
                                    defaultValue={payment?.parentId}
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
                                    name="amount"
                                    type="number"
                                    defaultValue={payment?.amount}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            {/* Annee Scolaire */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Année Scolaire</label>
                                <select
                                    name="as"
                                    defaultValue={payment?.as}
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
                                    defaultValue={payment?.type}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner un type...</option>
                                    <option value="comptant">Comptant</option>
                                    <option value="cheque">Chèque</option>
                                    <option value="virement">Virement</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Boutons */}
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
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Mettre à jour
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
