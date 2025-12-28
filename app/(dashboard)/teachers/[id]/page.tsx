"use client";

import { use, useState, useEffect } from "react";
import { ChevronLeft, Save, Upload, User, Mail, Phone, BookOpen, Trash2, GraduationCap, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
    id: number;
    name: string;
}

export default function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [teacher, setTeacher] = useState<any>(null);
    const [user, setUser] = useState<any>(null); // To store linked user info
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Modal State
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const res = await fetch('/api/subjects');
                if (res.ok) {
                    const data = await res.json();
                    setSubjects(data);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };
        fetchSubjects();
    }, []);

    useEffect(() => {
        fetchTeacher();
    }, [unwrappedParams.id]);

    const fetchTeacher = async () => {
        try {
            const res = await fetch(`/api/teachers/${unwrappedParams.id}`);
            if (!res.ok) throw new Error("Failed to fetch teacher");
            const data = await res.json();
            setTeacher(data);
            if (data.user) {
                setUser(data.user);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);

        const formData = new FormData(e.currentTarget);

        // Subject ID is already in formData as 'subjectId'

        try {
            const res = await fetch(`/api/teachers/${unwrappedParams.id}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to update teacher");

            router.push("/teachers");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas.");
            return;
        }

        if (!user || !user.login) {
            setPasswordError("Utilisateur lié introuvable.");
            return;
        }

        setIsResetting(true);
        try {
            const res = await fetch(`/api/users/${user.login}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!res.ok) throw new Error("Erreur lors de la mise à jour");

            setIsPasswordModalOpen(false);
            setNewPassword("");
            setConfirmPassword("");
            alert("Mot de passe mis à jour avec succès.");
        } catch (err) {
            console.error(err);
            setPasswordError("Une erreur est survenue.");
        } finally {
            setIsResetting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Chargement...</div>;
    if (!teacher) return <div className="p-8 text-center text-red-500">Enseignant introuvable.</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/teachers"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Modifier Enseignant</h1>
                        <p className="text-slate-500 text-sm">ID: {teacher.id}</p>
                    </div>
                </div>
                {/* Delete button (placeholder for now) */}
                <button className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                </button>
            </div>


            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Photo & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                        <div className="w-32 h-32 mx-auto bg-slate-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-200 mb-4 cursor-pointer group relative">
                            {/* Placeholder image logic */}
                            {teacher.photo ? (
                                <img src={`../${teacher.photo}`} alt={teacher.name || "Teacher"} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-8 h-8 text-white" />
                            </div>
                            <input type="file" name="photo" className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{teacher.name}</p>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-emerald-500" />
                            Informations Personnelles
                        </h3>

                        
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nom Complet</label>
                                <input
                                    type="text"
                                    name="name"
                                    defaultValue={teacher.name || ""}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
                            

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Identifiant Unique</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="iuense"
                                        placeholder="Ex: ENS001"
                                        defaultValue={teacher.iuense || ""}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Matière Principale</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <select
                                        name="subjectId"
                                        defaultValue={teacher.subjectId || ""}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="email"
                                        name="email"
                                        defaultValue={teacher.email || ""}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        defaultValue={teacher.phone || ""}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Diplôme</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="diploma"
                                        placeholder="Ex: Mastère"
                                        defaultValue={teacher.diploma || ""}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Genre</label>
                                <select
                                    name="gender"
                                    defaultValue={teacher.gender || "m"}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm">
                                    <option value="m">Masculin</option>
                                    <option value="f">Féminin</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                INFORMATION DE COMPTE
                            </h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Nom d'utilisateur</label>
                                <input
                                    type="text"
                                    defaultValue={user?.login || ""}
                                    readOnly // Login usually shouldn't change easily or needs specific logic
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-500 cursor-not-allowed text-sm"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div>
                                    <p className="font-medium text-slate-900">Mot de passe</p>
                                    <p className="text-sm text-slate-500">********</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                >
                                    Réinitialiser le mot de passe
                                </button>
                            </div>
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
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSaving ? "..." : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Mettre à jour
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>

            {/* Password Reset Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                            onClick={() => setIsPasswordModalOpen(false)}
                        />
                        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="bg-white w-full max-w-md rounded-2xl shadow-2xl pointer-events-auto overflow-hidden"
                            >
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                    <h2 className="text-lg font-bold text-slate-900">Réinitialiser le mot de passe</h2>
                                    <button
                                        onClick={() => setIsPasswordModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
                                    {passwordError && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                            {passwordError}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                                        <input
                                            type="password"
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                                        <input
                                            type="password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="pt-4 flex items-center justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsPasswordModalOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isResetting}
                                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
