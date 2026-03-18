"use client"

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    GraduationCap,
    User,
    Calendar,
    ChevronDown,
    Loader2,
    AlertCircle,
    FileText,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterOption {
    id: string;
    name: string;
}

interface StudentGrade {
    id: string;
    name: string;
    grades: Record<string, number>;
}

interface ExamColumn {
    key: string;
    abreType: string;
    label: string;
    period: string;
    subject: string;
    subjectId: string;
}

interface NotesData {
    students: StudentGrade[];
    examTypes: ExamColumn[];
}

const NotesPage = () => {
    // Selection State
    const [selectedAS, setSelectedAS] = useState<string>('');
    const [selectedTeacher, setSelectedTeacher] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');

    // Data State
    const [filters, setFilters] = useState<{
        academicYears: string[];
        teachers: FilterOption[];
        classes: FilterOption[];
        periods: string[];
        subjects: FilterOption[];
    }>({
        academicYears: [],
        teachers: [],
        classes: [],
        periods: [],
        subjects: []
    });

    const [data, setData] = useState<NotesData | null>(null);
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Load: Filters
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const res = await fetch('/api/notes/filters');
                if (!res.ok) throw new Error('Failed to load filters');
                const filterData = await res.json();
                setFilters(filterData);

                // Set default AS
                const now = new Date();
                const year = now.getFullYear();
                const currentAS = now.getMonth() >= 6 ? `${year}/${year + 1}` : `${year - 1}/${year}`;

                if (filterData.academicYears.includes(currentAS)) {
                    setSelectedAS(currentAS);
                } else if (filterData.academicYears.length > 0) {
                    setSelectedAS(filterData.academicYears[0]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoadingFilters(false);
            }
        };
        fetchFilters();
    }, []);

    const isSelectionComplete = selectedAS && selectedTeacher && selectedClass && selectedPeriod && selectedSubject;

    // Load Data when selection changes
    useEffect(() => {
        if (!isSelectionComplete) {
            setData(null);
            return;
        }

        const fetchNotes = async () => {
            setLoadingData(true);
            setError(null);
            try {
                const params = {
                    as: selectedAS,
                    iuense: selectedTeacher,
                    codeclass: selectedClass,
                    period: selectedPeriod,
                    subject: selectedSubject
                };

                const query = new URLSearchParams(params).toString();
                const res = await fetch(`/api/notes?${query}`);
                if (!res.ok) throw new Error('Failed to load notes');
                const notesData = await res.json();
                setData(notesData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoadingData(false);
            }
        };
        fetchNotes();
    }, [selectedAS, selectedTeacher, selectedClass, selectedPeriod, selectedSubject]);

    // Update subjects when class/teacher/AS changes
    useEffect(() => {
        if (!selectedAS || !selectedTeacher || !selectedClass) return;

        const refreshSubjects = async () => {
            try {
                const query = new URLSearchParams({
                    as: selectedAS,
                    iuense: selectedTeacher,
                    codeclass: selectedClass
                }).toString();

                const res = await fetch(`/api/notes/filters?${query}`);
                if (!res.ok) return;
                const newFilters = await res.json();

                setFilters(prev => ({
                    ...prev,
                    subjects: newFilters.subjects,
                    periods: newFilters.periods
                }));

                // Clear dependent selections if they are no longer valid
                if (!newFilters.subjects.some((s: any) => s.id === selectedSubject)) {
                    setSelectedSubject('');
                }
                if (!newFilters.periods.includes(selectedPeriod)) {
                    setSelectedPeriod('');
                }
            } catch (err) {
                console.error("Error refreshing subjects:", err);
            }
        };

        refreshSubjects();
    }, [selectedAS, selectedTeacher, selectedClass]);

    // Group columns by Period then Subject for multi-level headers
    const groupedHeaders = useMemo(() => {
        if (!data) return [];

        const periodsMap = new Map<string, { period: string, subject: string, exams: ExamColumn[] }[]>();

        data.examTypes.forEach(exam => {
            if (!periodsMap.has(exam.period)) {
                periodsMap.set(exam.period, []);
            }
            const subjects = periodsMap.get(exam.period)!;
            let subjectGroup = subjects.find(s => s.subject === exam.subject);
            if (!subjectGroup) {
                subjectGroup = { period: exam.period, subject: exam.subject, exams: [] };
                subjects.push(subjectGroup);
            }
            subjectGroup.exams.push(exam);
        });

        return Array.from(periodsMap.entries()).map(([period, subjects]) => ({
            period,
            subjects,
            count: subjects.reduce((acc, s) => acc + s.exams.length, 0)
        }));
    }, [data]);

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 space-y-8" dir="rtl">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                        <FileText className="w-10 h-10 text-indigo-600" />
                        دفتر العلامات الموحد
                    </h1>
                    <p className="text-slate-500 font-medium">عرض شامل لنتائج الطلاب عبر الفترات والمواد المختلفة.</p>
                </div>

                <Link
                    href="/notes/saisie"
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 border-2 border-indigo-100 px-6 py-3 rounded-2xl font-bold shadow-sm transition-all hover:shadow-md active:scale-95"
                >
                    <FileText className="w-5 h-5" />
                    <span>محرر Eduserv</span>
                </Link>
            </div>

            {/* Filter Section */}
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/40 p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {/* Academic Year Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            السنة الدراسية
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedAS}
                                onChange={(e) => setSelectedAS(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none font-bold text-slate-700 disabled:opacity-50"
                                disabled={loadingFilters}
                            >
                                <option value="" disabled>اختر السنة...</option>
                                {filters.academicYears.map(as => (
                                    <option key={as} value={as}>{as}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Teacher Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            الأستاذ
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedTeacher}
                                onChange={(e) => setSelectedTeacher(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none font-bold text-slate-700"
                            >
                                <option value="" disabled>اختر الأستاذ...</option>
                                {filters.teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Class Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-indigo-500" />
                            القسم
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none font-bold text-slate-700"
                            >
                                <option value="" disabled>اختر القسم...</option>
                                {filters.classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Period Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            الفترة
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none font-bold text-slate-700"
                            >
                                <option value="">اختر الفترة ...</option>
                                {filters.periods.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>

                    {/* Subject Select */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-500" />
                            المادة
                        </label>
                        <div className="relative group">
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3.5 outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none font-bold text-slate-700"
                            >
                                <option value="">اختر المادة ...</option>
                                {filters.subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold shadow-sm"
                    >
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Section */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
                {loadingData ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                            <Loader2 className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <p className="text-slate-400 font-bold animate-pulse text-lg">جاري تحميل النتائج...</p>
                    </div>
                ) : !isSelectionComplete ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-8 text-center bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white/60">
                        <div className="relative">
                            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
                                <Filter className="w-12 h-12 text-indigo-400 opacity-60" />
                            </div>
                            <div className="absolute -top-2 -right-2 bg-amber-400 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-amber-100">!</div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black text-slate-800 tracking-tight">يرجى استكمال الاختيارات</p>
                            <p className="text-slate-500 font-medium max-w-sm">الرجاء اختيار السنة، الأستاذ، القسم، الفترة والمادة لعرض النتائج.</p>
                        </div>
                    </div>
                ) : data ? (
                    <div className="flex-1 overflow-x-auto rounded-[2rem] border border-slate-200/60 shadow-2xl shadow-slate-200/40 relative group/table bg-white">
                        <table className="w-full text-right border-collapse" dir="rtl">
                            <thead className="sticky top-0 z-20 shadow-sm">
                                {/* Level 1: Periods */}
                                <tr className="bg-slate-900 text-white divide-x divide-x-reverse divide-slate-800">
                                    <th rowSpan={3} className="px-8 py-5 text-right font-black text-xl sticky right-0 bg-slate-900 z-30 border-l border-slate-800">
                                        الاسم و اللقب
                                    </th>
                                    {groupedHeaders.map(p => (
                                        <th key={p.period} colSpan={p.count} className="px-6 py-4 text-center border-r border-slate-800 text-indigo-300 uppercase tracking-widest font-black text-xs">
                                            {p.period}
                                        </th>
                                    ))}
                                </tr>
                                {/* Level 2: Subjects */}
                                <tr className="bg-indigo-600 text-white divide-x divide-x-reverse divide-indigo-500">
                                    {/* Name column spanned by Level 1 TH */}
                                    {groupedHeaders.flatMap(p => p.subjects).map(s => (
                                        <th key={`${s.period}-${s.subject}`} colSpan={s.exams.length} className="px-6 py-3 text-center border-r border-indigo-500 font-bold text-sm">
                                            {s.subject}
                                        </th>
                                    ))}
                                </tr>
                                {/* Level 3: Exam Types */}
                                <tr className="bg-[#f8fafc] border-b border-slate-200 divide-x divide-x-reverse divide-slate-200">
                                    {data.examTypes.map(type => (
                                        <th key={type.key} className="px-6 py-4 text-center border-r border-slate-100 min-w-[140px]">
                                            <div className="flex flex-col items-center gap-0.5">
                                                <span className="text-slate-800 font-bold text-base leading-tight">{type.abreType}.</span>
                                                <span className="text-slate-400 font-medium text-[10px] leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">{type.label}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {data.students.map((student, idx) => (
                                    <motion.tr
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={student.id}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-5 sticky right-0 bg-white group-hover:bg-slate-50/50 z-10 shadow-sm font-bold text-slate-800 text-lg border-l border-slate-100">
                                            {student.name}
                                        </td>
                                        {data.examTypes.map(type => (
                                            <td key={type.key} className="px-6 py-5 text-center border-r border-slate-100">
                                                <div className="flex justify-center">
                                                    <span className={`
                                                        inline-flex items-center justify-center min-w-[65px] h-[32px] px-2 rounded-lg font-bold text-sm
                                                        ${student.grades[type.key] !== null && student.grades[type.key] !== undefined
                                                            ? Number(student.grades[type.key]) >= 10
                                                                ? 'bg-blue-50 text-600 border border-blue-200'
                                                                : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                            : 'bg-slate-50 text-slate-200 border border-slate-100'}
                                                    `}>
                                                        {student.grades[type.key] !== null && student.grades[type.key] !== undefined
                                                            ? Number(student.grades[type.key]).toFixed(2).padStart(5, '0')
                                                            : '--.--'}
                                                    </span>
                                                </div>
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 gap-6 bg-white/40 backdrop-blur-sm rounded-[3rem] border border-white/60">
                        <div className="bg-amber-50 p-8 rounded-full">
                            <AlertCircle className="w-16 h-16 text-amber-400" />
                        </div>
                        <div className="space-y-1 text-center">
                            <p className="text-xl font-black text-slate-400">لا توجد نتائج</p>
                            <p className="text-slate-400 font-medium text-sm">لم يتم العثور على ملاحظات مسجلة لهذا الاختيار.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;
