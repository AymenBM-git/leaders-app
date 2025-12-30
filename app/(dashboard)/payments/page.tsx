"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Eye, Trash2, Loader2, CreditCard, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Payment {
    id: number;
    amount: number;
    type: string;
    parentId: number;
    parent: {
        id: number;
        name: string;
    } | null;
    as: string;
    paymentDate: string;
}

export default function StudentsPage() {
    const [totaux, setTotaux] = useState<any[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAS, setSelectedAS] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    });
    const [anneeScolaires, setAnneeScolaires] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const currentYear = (() => {
                const now = new Date();
                const year = now.getFullYear();
                return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
            })();
            setAnneeScolaires([currentYear]);
            const [paymentsRes] = await Promise.all([
                fetch('/api/payments'),
            ]);

            if (paymentsRes.ok) {
                console.log("Fetched payments successfully");
                const paymentsData = await paymentsRes.json();
                setPayments(paymentsData);

                const yearsInDB = Array.from(new Set(paymentsData.map((e: any) => e.as))).filter(Boolean) as string[];
                const allYears = Array.from(new Set([currentYear, ...yearsInDB])).sort((a, b) => b.localeCompare(a));
                setAnneeScolaires(allYears);

                const res = await fetch("/api/payments?p=all&as=all");//fetch(`/api/payments?p=all&as=${selectedAS}`);
                const resData = await res.json();
                setTotaux(resData);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce payement ?")) {
            try {
                await fetch(`/api/payments/${id}`, { method: 'DELETE' });
                setPayments(payments.filter(p => p.id !== id));
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = `${payment.parent?.name}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAS = selectedAS ? payment.as === selectedAS : true;
        return matchesSearch && matchesAS;
    });

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Payements</h1>
                    <p className="text-slate-500 mt-1">Gérez les payements des parents.</p>
                </div>
                <Link href="/payments/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouveau Payement
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                {/* Nom Parent Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un payement par parent..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Annee Scolaire Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <select
                            value={selectedAS}
                            name="as"
                            onChange={(e) => setSelectedAS(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium hover:bg-slate-100 border border-slate-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >

                            {
                                anneeScolaires.map((as, index) => <option key={index} value={as}>{as}</option>)
                            }
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* Entete tableau */}
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Parent</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Montant</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Total Payer</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Date Payement</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredPayments.map((payment, index) => {

                                return (
                                    <motion.tr
                                        key={payment.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        {/* Parent */}
                                        <td className="p-4">
                                            {payment.parent ? (
                                                <Link href={`/parents?highlight=${payment.id}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group-hover/parent">
                                                    <div className="p-1.5 bg-slate-100 rounded-full group-hover/parent:bg-indigo-100 transition-colors">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium">{payment.parent.name}</span>
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Non assigné</span>
                                            )}
                                        </td>
                                        {/* Montant */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{payment.amount}</span>
                                        </td>
                                        {/* Total Payer */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">
                                                {totaux.find(item => item.parentId === payment.parentId && item.as === selectedAS)?._sum.amount || 0}
                                            </span>
                                        </td>
                                        {/* Date */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{payment.paymentDate.substring(0, 10)}</span>
                                        </td>
                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/payments/${payment.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="Voir profil">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(payment.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredPayments.length === 0 && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50/50">
                        <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun Payement trouvé.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


