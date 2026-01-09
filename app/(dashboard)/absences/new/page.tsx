"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Student {
    id: number;
    firstName: string;
    lastName: string;
}
interface Classe{
    id: number;
    name: string;
    level: string;
    students: Student[];
}

export default function NewStudentPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {

                const [classesRes] = await Promise.all([
                    //fetch('/api/students'),
                    fetch('/api/classes'),
                ]);

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setClasses(classesData);
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
        const select = e.currentTarget.elements.namedItem("studentId") as HTMLSelectElement;
        const studentName = select.options[select.selectedIndex].text;

        try {
            const res = await fetch("/api/absences", {
                method: "POST",
                // nameStudent: students.find(s => s.id === Number(formData.get("studentId")))?.firstName + " " + students.find(s => s.id === Number(formData.get("studentId")))?.lastName 
                body: JSON.stringify({ studentId: formData.get("studentId"), classId: formData.get("classId"), dateAbsence: formData.get("dateAbsence"), hour: formData.get("hour"), nameStudent: studentName }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création");

            router.push("/absences");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedClassId = parseInt(e.target.value);
        const selectedClass = classes.find((c) => c.id === selectedClassId);
        if (selectedClass) {
            setStudents(selectedClass.students);
        } else {
            setStudents([]);
        }
    };

    return (
        <div className="space-y-6 mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/absences"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouvelle absence</h1>
                    <p className="text-slate-500 text-sm">Créez une nouvelle absence.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        {/* Titre */}
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" />
                            Informations Elève
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* classe */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Classe</label>
                                <select
                                    name="classId"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionner une classe...</option>
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
                            {/* eleve */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Elève</label>
                                <select
                                    name="studentId"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner un élève...</option>
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date Absence</label>
                                <input
                                    type="date"
                                    name="dateAbsence"
                                    required
                                    defaultValue={new Date().toISOString().split("T")[0]}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            {/* heure */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Heure</label>
                                <input
                                    type="time"
                                    name="hour"
                                    required
                                    placeholder="Ex: 08:00"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
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
