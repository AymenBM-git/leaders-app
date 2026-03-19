"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Users } from "lucide-react";
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
interface Teacher {
    id: number;
    name: string;
}

const HOURS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"];

export default function NewAbsencePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [classes, setClasses] = useState<Classe[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    
    // Attendance mapping: default false (Present) -> true (Absent)
    const [attendance, setAttendance] = useState<Record<number, boolean>>({});
    
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split("T")[0]);
    const [hourFilter, setHourFilter] = useState<string>("");

    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;
        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1] ?? null;
    };

    useEffect(() => {
        const role = getCookie("user-role");
        const idStr = getCookie("user-id");
        setUserRole(role);
        setUserId(idStr);

        const fetchData = async () => {
            try {
                const isTeacher = role !== 'admin';
                const [classesRes, teachersRes] = await Promise.all([
                    fetch('/api/classes'),
                    fetch(isTeacher && idStr ? `/api/teachers/${idStr}` : '/api/teachers'),
                ]);

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setClasses(classesData);
                }
                if (teachersRes.ok) {
                    const teachersData = await teachersRes.json();
                    const list = isTeacher ? [teachersData] : teachersData;
                    setTeachers(list);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Effect to fetch existing absences when class, date, or hour change
    useEffect(() => {
        if (!selectedClassId || !dateFilter || !hourFilter) return;

        const fetchExistingAbsences = async () => {
            try {
                const res = await fetch(`/api/absences?classId=${selectedClassId}&date=${dateFilter}&hour=${hourFilter}`);
                if (res.ok) {
                    const existingAbsences = await res.json();
                    
                    // Reset all attendance to false first
                    const newAttendance: Record<number, boolean> = {};
                    students.forEach(s => {
                        newAttendance[s.id] = false;
                    });

                    // Set true for those who are absent
                    existingAbsences.forEach((a: any) => {
                        newAttendance[a.studentId] = true;
                    });
                    
                    setAttendance(newAttendance);
                }
            } catch (error) {
                console.error("Error fetching existing absences:", error);
            }
        };

        fetchExistingAbsences();
    }, [selectedClassId, dateFilter, hourFilter, students]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const classId = formData.get("classId");
        const teacherId = formData.get("teacherId");

        const absentStudents = students.filter(s => attendance[s.id]);

        if (absentStudents.length === 0) {
            if (!confirm("Aucun élève n'a été marqué absent. Voulez-vous enregistrer la liste comme complète (sans absence) ?")) {
                setIsLoading(false);
                return;
            }
        }

        try {
            const res = await fetch("/api/absences/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    classId, 
                    dateAbsence: dateFilter, 
                    hour: hourFilter, 
                    teacherId,
                    absentStudents
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to sync absences");
            }

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
        const classId = parseInt(e.target.value);
        setSelectedClassId(classId || null);
        const selectedClass = classes.find((c) => c.id === classId);
        if (selectedClass) {
            const sortedStudents = [...selectedClass.students].sort((a, b) => 
                (a.firstName || "").localeCompare(b.firstName || "")
            );
            setStudents(sortedStudents);
            const initialAttendance: Record<number, boolean> = {};
            sortedStudents.forEach(s => {
                initialAttendance[s.id] = false;
            });
            setAttendance(initialAttendance);
        } else {
            setStudents([]);
            setAttendance({});
        }
    };

    const toggleAttendance = (studentId: number) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));
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
                    <h1 className="text-2xl font-bold text-slate-900">Feuille d'appel</h1>
                    <p className="text-slate-500 text-sm">Saisissez les absences de la classe.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        {/* Titre */}
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Informations de la séance
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Prof */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Enseignant</label>
                                <select
                                    name="teacherId"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm disabled:opacity-70 disabled:bg-slate-100"
                                    defaultValue={userRole !== 'admin' ? (userId || "") : ""}
                                    disabled={userRole !== 'admin'}
                                >
                                    <option value="">Sélectionner un enseignant...</option>
                                    {teachers.map((teacher) => {
                                        return (
                                            <option key={teacher.id} value={teacher.id}>
                                                {teacher.name}
                                            </option>
                                        )
                                    })}
                                </select>
                                <input 
                                    type="hidden" 
                                    name="teacherId" 
                                    value={userRole !== 'admin' ? (userId || "") : ""} 
                                    disabled={userRole === 'admin'} 
                                />
                            </div>
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
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date Absence</label>
                                <input
                                    type="date"
                                    name="dateAbsence"
                                    required
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            {/* heure */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Heure</label>
                                <select
                                    name="hour"
                                    required
                                    value={hourFilter}
                                    onChange={(e) => setHourFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner l'heure...</option>
                                    {HOURS.map((h) => (
                                        <option key={h} value={h}>
                                            {h}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Liste d'appel */}
                        {students.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    Appel des élèves ({students.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {students.map((s) => {
                                        const isAbsent = attendance[s.id];
                                        return (
                                            <div 
                                                key={s.id} 
                                                onClick={() => toggleAttendance(s.id)}
                                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                                                    isAbsent 
                                                    ? 'bg-red-50/50 border-red-200 text-red-900' 
                                                    : 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                                                }`}
                                            >
                                                <div className="font-medium text-sm">
                                                    {s.firstName} {s.lastName}
                                                </div>
                                                <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                                                    isAbsent 
                                                    ? 'bg-red-100 text-red-700' 
                                                    : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {isAbsent ? 'Absent' : 'Présent'}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
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
