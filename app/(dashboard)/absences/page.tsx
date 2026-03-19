"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Eye, Trash2, Loader2, CreditCard, User, User2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Absence {
    id: number;
    studentId: number;
    classId: number;
    dateAbsence: string;
    hour: string;
    student: {
        id: number;
        firstName: string;
        lastName: string;
    } | null;
    classe: {
        id: number;
        level: string;
        name: string;
    } | null;
}

export default function StudentsPage() {
    const [totaux, setTotaux] = useState<any[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState(0);
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1] ?? null;
    };

    const fetchData = async () => {
        try {
            const role = getCookie("user-role");
            const id = getCookie("user-id");
            const absencesUrl = (role !== 'admin' && id) ? `/api/absences?teacherId=${id}` : '/api/absences';

            const [absencesRes,classesRes] = await Promise.all([
                fetch(absencesUrl),
                fetch('/api/classes'),
            ]);

            if (absencesRes.ok && classesRes.ok) {
                console.log("Fetched absences successfully");
                const absencesData = await absencesRes.json();
                setAbsences(absencesData);

                const classesData = await classesRes.json();
                setClasses(classesData);
                const res = await fetch("/api/absences?p=all&as=all");//fetch(`/api/absences?p=all&as=${selectedAS}`);
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
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) {
            try {
                await fetch(`/api/absences/${id}`, { method: 'DELETE' });
            setAbsences(absences.filter(p => p.id !== id));
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredabsences = absences.filter(absence => {
        const matchesSearch = `${absence.student?.firstName || ''} ${absence.student?.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass!==0 ? absence.classId === selectedClass : true;
        return matchesSearch && matchesClass;
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
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Absences</h1>
                    <p className="text-slate-500 mt-1">Gérez les absences des élèves.</p>
                </div>
                <Link href="/absences/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouvelle absence
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                {/* Nom student Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un absence par élève..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Classe Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                        value={selectedClass}
                        name="class"
                        onChange={(e) => setSelectedClass(Number(e.target.value))}
                        className="appearance-none pl-10 pr-8 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium hover:bg-slate-100 border border-slate-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >
                        <option value={0}>Filtrer par classe</option>
                        {classes.map((cls) => {
                            const name = (cls.level === "1") ? "السابعة أساسي " + cls.name : (cls.level === "2") ? "الثامنة أساسي " + cls.name : (cls.level === "3") ? "التاسعة أساسي " + cls.name : ""
                            return (
                                <option key={cls.id} value={cls.id}>
                                    {name}
                                </option>
                            )
                        })}
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
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Classe</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Elève</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Date Absence</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Heure Absence</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredabsences.map((absence, index) => {

                                return (
                                    <motion.tr
                                        key={absence.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        {/* class */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">
                                                {(absence.classe?.level === "1") ? "السابعة أساسي " + absence.classe.name : (absence.classe?.level === "2") ? "الثامنة أساسي " + absence.classe.name : (absence.classe?.level === "3") ? "التاسعة أساسي " + absence.classe.name : ""}
                                            </span>
                                        </td>
                                        {/* student */}
                                        <td className="p-4">
                                            {absence.student ? (
                                                <Link href={`/students?highlight=${absence.studentId}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group-hover/student">
                                                    <div className="p-1.5 bg-slate-100 rounded-full group-hover/student:bg-indigo-100 transition-colors">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium">{absence.student.firstName} {absence.student.lastName}</span>
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Non assigné</span>
                                            )}
                                        </td>
                                        
                                        {/* Date */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">
                                                {new Date(absence.dateAbsence).toLocaleDateString("fr-FR")}
                                            </span>
                                        </td>
                                        {/* heure */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{absence.hour}</span>
                                        </td>
                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {/*<Link href={`/absences/${absence.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="Voir profil">
                                                    <Eye className="w-4 h-4" />
                                                </Link>*/}
                                                <button
                                                    onClick={() => handleDelete(absence.id)}
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
                {filteredabsences.length === 0 && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50/50">
                        <User2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucune absence trouvée.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


