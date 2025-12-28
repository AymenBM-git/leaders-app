"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, MoreHorizontal, User, Eye, Phone, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsRes, classesRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/classes')
            ]);

            if (studentsRes.ok) {
                const studentsData = await studentsRes.json();
                setStudents(studentsData);
            }
            if (classesRes.ok) {
                const classesData = await classesRes.json();
                setClasses(classesData);
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
            try {
                await fetch(`/api/students/${id}`, { method: 'DELETE' });
                setStudents(students.filter(s => s.id !== id));
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredStudents = students.filter(student => {
        const matchesSearch = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = selectedClass ? String(student.classId) === selectedClass : true;
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
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Élèves</h1>
                    <p className="text-slate-500 mt-1">Gérez les inscriptions et les dossiers scolaires.</p>
                </div>
                <Link href="/students/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouvel Élève
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher un élève..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="appearance-none pl-10 pr-8 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium hover:bg-slate-100 border border-slate-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                            <option value="">Toutes les classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Élève</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Classe</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Parent</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((student, index) => {
                                const parent = student.parent;
                                const studentClass = student.classe;

                                return (
                                    <motion.tr
                                        key={student.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={student.photo || "/avatars/student-1.png"} alt={`${student.firstName} ${student.lastName}`} className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + student.firstName + '+' + student.lastName }}
                                                    />
                                                </div>
                                                <Link href={`/students/${student.id}`} className="font-bold text-slate-600 text-lg hover:text-indigo-600 transition-colors">
                                                    <span >{student.firstName} {student.lastName}</span>
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/classes/${student.classe.id}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group-hover/parent">   
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">
                                                {student.classe ? (
                                                    (student.classe.level === "1" ? "السابعة أساسي " :
                                                        student.classe.level === "2" ? "الثامنة أساسي " :
                                                            student.classe.level === "3" ? "التاسعة أساسي " : "") + student.classe.name
                                                ) : "N/A"}
                                            </span>
                                            </Link>
                                        </td>
                                        <td className="p-4">
                                            {parent ? (
                                                <Link href={`/parents?highlight=${parent.id}`} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors group-hover/parent">
                                                    <div className="p-1.5 bg-slate-100 rounded-full group-hover/parent:bg-indigo-100 transition-colors">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium">{parent.name}</span>
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Non assigné</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/students/${student.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="Voir profil">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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
                {filteredStudents.length === 0 && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50/50">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun élève trouvé.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper for conditional classes (inline to avoid import issues if utils not ready)
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
