"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Plus, X, BookOpen, User, Home, Layers, Trash2, Pencil, Printer, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

interface ScheduleEntry {
    id: number;
    day: string;
    start: string;
    duration: number;
    subjectId: number;
    subject?: { name: string };
    classId: string;
    teacherId: string;
    roomId: string;
    as: string;
    color: string;
}

const COLORS = [
    "bg-indigo-100 border-indigo-200 text-indigo-700",
    "bg-pink-100 border-pink-200 text-pink-700",
    "bg-emerald-100 border-emerald-200 text-emerald-700",
    "bg-amber-100 border-amber-200 text-amber-700",
    "bg-sky-100 border-sky-200 text-sky-700",
    "bg-violet-100 border-violet-200 text-violet-700",
];

export default function SchedulePage() {
    const [currentWeek, setCurrentWeek] = useState("Semaine actuelle");
    const [viewMode, setViewMode] = useState<"class" | "teacher" | "room">("class");
    const [selectedId, setSelectedId] = useState("");
    const [selectedAS, setSelectedAS] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    });
    const [anneeScolaires, setAnneeScolaires] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [entries, setEntries] = useState<ScheduleEntry[]>([]);

    // Data states
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        subjectId: "",
        day: "Lundi",
        start: "08:00",
        duration: "1",
        roomId: "",
        teacherId: "",
        classId: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [scheduleRes, classesRes, teachersRes, roomsRes, subjectsRes] = await Promise.all([
                fetch('/api/schedule'),
                fetch('/api/classes'),
                fetch('/api/teachers'),
                fetch('/api/rooms'),
                fetch('/api/subjects')
            ]);

            if (scheduleRes.ok) {
                const data = await scheduleRes.json();
                // Map API data to ScheduleEntry format
                setEntries(data.map((e: any) => ({
                    ...e,
                    classId: String(e.classId),
                    teacherId: String(e.teacherId),
                    roomId: String(e.roomId),
                    subjectId: e.subjectId,
                    color: COLORS[e.id % COLORS.length]
                })));

                // Update anneeScolaires from data
                const yearsInDB = Array.from(new Set(data.map((e: any) => e.as))).filter(Boolean) as string[];
                const currentYear = (() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    return now.getMonth() >= 8 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
                })();

                const allYears = Array.from(new Set([currentYear, ...yearsInDB])).sort((a, b) => b.localeCompare(a));
                setAnneeScolaires(allYears);
            }
            if (classesRes.ok) setClasses(await classesRes.json());
            if (teachersRes.ok) setTeachers(await teachersRes.json());
            if (roomsRes.ok) setRooms(await roomsRes.json());
            if (subjectsRes.ok) setSubjects(await subjectsRes.json());
        } catch (error) {
            console.error("Failed to fetch schedule data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredEntries = useMemo(() => {
        if (!selectedId) return [];
        return entries.filter(entry => {
            const matchesYear = entry.as === selectedAS;
            if (!matchesYear) return false;

            if (viewMode === "class") return String(entry.classId) === selectedId;
            if (viewMode === "teacher") return String(entry.teacherId) === selectedId;
            return String(entry.roomId) === selectedId;
        });
    }, [entries, viewMode, selectedId, selectedAS]);

    const handleAnneeScolaireChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAS(e.target.value);
    };

    const handleAddEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        const entryData = {
            subjectId: formData.subjectId ? parseInt(formData.subjectId) : null,
            day: formData.day,
            start: formData.start,
            duration: parseFloat(formData.duration),
            roomId: viewMode === "room" ? selectedId : formData.roomId,
            teacherId: viewMode === "teacher" ? selectedId : formData.teacherId,
            classId: viewMode === "class" ? selectedId : formData.classId,
            as: selectedAS
        };

        try {
            if (editingId) {
                const res = await fetch(`/api/schedule/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entryData)
                });
                if (res.ok) {
                    const updated = await res.json();
                    setEntries(entries.map(e => e.id === editingId ? { ...updated, classId: String(updated.classId), teacherId: String(updated.teacherId), roomId: String(updated.roomId), color: e.color } : e));
                }
            } else {
                const res = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entryData)
                });
                if (res.ok) {
                    const newEntry = await res.json();
                    setEntries([...entries, { ...newEntry, classId: String(newEntry.classId), teacherId: String(newEntry.teacherId), roomId: String(newEntry.roomId), color: COLORS[entries.length % COLORS.length] }]);
                }
            }
        } catch (err) {
            console.error("Failed to save entry", err);
        }

        setIsAdding(false);
        setEditingId(null);
        setFormData({ ...formData, subjectId: "" });
    };

    const handleEditEntry = (entry: ScheduleEntry) => {
        setEditingId(entry.id);
        setFormData({
            subjectId: String(entry.subjectId),
            day: entry.day,
            start: entry.start,
            duration: entry.duration.toString(),
            roomId: entry.roomId,
            teacherId: entry.teacherId,
            classId: entry.classId
        });
        setIsAdding(true);
    };

    const handleDeleteEntry = async (id: number) => {
        if (window.confirm("Voulez-vous vraiment supprimer ce cours ?")) {
            try {
                await fetch(`/api/schedule/${id}`, { method: 'DELETE' });
                setEntries(entries.filter(e => e.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col relative">
            {/* Print Header (Only visible on print) */}
            <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Emploi du temps</h1>
                        <p className="text-lg font-bold text-slate-700 mt-1">
                            {viewMode === "class" ? "Classe : " : viewMode === "teacher" ? "Enseignant : " : "Salle : "}
                            {selectedId ? (
                                viewMode === "class" ? classes.find(c => String(c.id) === selectedId)?.name :
                                    viewMode === "teacher" ? teachers.find(t => String(t.id) === selectedId)?.name :
                                        rooms.find(r => String(r.id) === selectedId)?.name
                            ) : "Aucun sélectionné"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold">{currentWeek}</p>
                        <p className="text-xs text-slate-500">Généré le {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                :root {
                    --print-hour-height: 6rem;
                }
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0.5cm;
                    }
                    :root {
                        --print-hour-height: 3.2rem;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                        background: white !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    /* Scale down fonts for print */
                    .text-3xl { font-size: 1.5rem !important; }
                    .text-2xl { font-size: 1.25rem !important; }
                    .text-sm { font-size: 0.7rem !important; }
                    .text-xs { font-size: 0.6rem !important; }
                    .p-4 { padding: 0.5rem !important; }
                    .p-3 { padding: 0.15rem 0.4rem !important; }
                    .mb-8 { margin-bottom: 0.75rem !important; }
                    .gap-1 { gap: 0.05rem !important; }
                    .gap-1.5 { gap: 0.15rem !important; }
                    
                    /* Specific scaling for block content */
                    .group\/item span { font-size: 9px !important; line-height: 1 !important; }
                    .group\/item .font-bold { font-size: 10px !important; }
                    .group\/item .text-\[13px\] { font-size: 11px !important; }
                    .group\/item .text-\[12px\] { font-size: 10px !important; }
                    .group\/item .text-\[10px\] { font-size: 9px !important; }
                    .group\/item svg { width: 10px !important; height: 10px !important; }
                    
                    /* Remove transitions and transforms for better printing */
                    * {
                        transition: none !important;
                        transform: none !important;
                    }
                    .custom-scrollbar {
                        overflow: visible !important;
                    }
                    /* Ensure containers take full width and don't scroll */
                    .flex-1 {
                        height: auto !important;
                        overflow: visible !important;
                    }
                    div[class*="h-[calc(100vh"] {
                        height: auto !important;
                    }
                    main {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        padding-top: 0 !important;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 shrink-0 no-print">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-indigo-600" />
                        Emploi du temps
                    </h1>
                    <p className="text-slate-500 mt-1">Gérer les plannings par classe ou enseignant.</p>
                </div>

                {/** Annee Scolaire */}
                <div className="flex flex-wrap items-center gap-4">
                    <label className="text-sm font-medium text-slate-700">Année Scolaire</label>
                    <select
                        value={selectedAS}
                        name="as"
                        onChange={handleAnneeScolaireChange}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-700 min-w-[200px]"
                    >

                        {
                            anneeScolaires.map((as, index) => <option key={index} value={as}>{as}</option>)
                        }
                    </select>
                </div>
            </div><br />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0 no-print">
                <div className="flex flex-wrap items-center gap-4">
                    {/* View Switcher */}
                    <div className="bg-slate-100 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => { setViewMode("class"); setSelectedId(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "class" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <Home className="w-4 h-4 inline-block mr-2" />
                            Classe
                        </button>
                        <button
                            onClick={() => { setViewMode("teacher"); setSelectedId(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "teacher" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <User className="w-4 h-4 inline-block mr-2" />
                            Enseignant
                        </button>
                        <button
                            onClick={() => { setViewMode("room"); setSelectedId(""); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "room" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            <MapPin className="w-4 h-4 inline-block mr-2" />
                            Salle
                        </button>
                    </div>

                    {/* Selector Dropdown */}
                    <select
                        value={selectedId}
                        onChange={(e) => setSelectedId(e.target.value)}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-medium text-slate-700 min-w-[200px]"
                    >
                        <option value="">Sélectionner {viewMode === "class" ? "une classe" : viewMode === "teacher" ? "un enseignant" : "une salle"}...</option>
                        {viewMode === "class" ? (
                            classes.map(c => <option key={c.id} value={c.id}>{(c.level === "1") ? `السابعة أساسي ${c.name}` : (c.level === "2") ? `الثامنة أساسي ${c.name}` : (c.level === "3") ? `التاسعة أساسي ${c.name}` : ""}</option>)
                        ) : viewMode === "teacher" ? (
                            teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                        ) : (
                            rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                        )}
                    </select>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setIsAdding(true);
                            if (viewMode === "teacher") {
                                const teacher = teachers.find(t => String(t.id) === selectedId);
                                setFormData(prev => ({ ...prev, subjectId: String(teacher?.subjectId || ""), teacherId: selectedId, classId: "", roomId: "" }));
                            } else if (viewMode === "class") {
                                setFormData(prev => ({ ...prev, roomId: "", classId: selectedId, teacherId: "", subjectId: "" }));
                            } else {
                                setFormData(prev => ({ ...prev, roomId: selectedId, classId: "", teacherId: "", subjectId: "" }));
                            }
                        }}
                        disabled={!selectedId}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Ajouter un cours
                    </button>

                    <button
                        onClick={handlePrint}
                        disabled={!selectedId}
                        className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-slate-500/20 flex items-center gap-2 transition-all active:scale-95 no-print"
                    >
                        <Printer className="w-5 h-5" />
                        Imprimer
                    </button>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                {/* Days Header */}
                <div className="grid grid-cols-[80px_1fr] border-b border-slate-200 bg-slate-50/50">
                    <div className="p-4 border-r border-slate-200 flex items-center justify-center text-slate-400">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="grid grid-cols-6">
                        {DAYS.map(day => (
                            <div key={day} className="p-4 text-center text-sm font-semibold text-slate-600 uppercase tracking-wider border-l border-slate-100 first:border-l-0">
                                {day}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-[80px_1fr] min-h-[600px]">
                        {/* Hours Column */}
                        <div className="border-r border-slate-200 bg-slate-50/30">
                            {HOURS.map(hour => (
                                <div key={hour} className="border-b border-slate-100 flex items-start justify-center pt-2" style={{ height: 'var(--print-hour-height)' }}>
                                    <span className="text-xs font-bold text-slate-400">{hour}</span>
                                </div>
                            ))}
                        </div>

                        {/* Schedule Body */}
                        <div className="grid grid-cols-6 relative">
                            {/* Background Grid Lines & Events */}
                            {DAYS.map((day, i) => (
                                <div key={i} className="border-l border-slate-100 first:border-l-0 relative">
                                    {HOURS.map((_, hi) => (
                                        <div key={hi} className="border-b border-slate-50" style={{ height: 'var(--print-hour-height)' }} />
                                    ))}

                                    {/* Events for this day */}
                                    {filteredEntries.filter(item => item.day === day).map((item) => {
                                        const startHour = parseInt(item.start.split(":")[0]);
                                        const startMin = parseInt(item.start.split(":")[1] || "0");
                                        const offset = (startHour - 8) + (startMin / 60);
                                        const top = `calc(var(--print-hour-height) * ${offset})`;
                                        const height = `calc(var(--print-hour-height) * ${item.duration})`;

                                        const room = rooms.find(r => String(r.id) === item.roomId);
                                        const teacher = teachers.find(t => String(t.id) === item.teacherId);
                                        const studentClass = classes.find(c => String(c.id) === item.classId);

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="px-1 py-1 absolute w-full left-0"
                                                style={{
                                                    top: top,
                                                    height: height,
                                                    zIndex: 10
                                                }}
                                            >
                                                <div className={`w-full h-full rounded-xl border p-3 pointer-events-auto hover:scale-[1.02] transition-transform cursor-pointer shadow-sm relative group/item ${item.color}`}>
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-all z-20 no-print">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditEntry(item);
                                                            }}
                                                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 text-current transition-all"
                                                            title="Modifier ce cours"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteEntry(item.id);
                                                            }}
                                                            className="p-1.5 rounded-lg bg-white/20 hover:bg-red-500 hover:text-white transition-all"
                                                            title="Supprimer ce cours"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col h-full justify-between">
                                                        <div>
                                                            <span className="text-xs font-bold uppercase opacity-70 block mb-1 truncate">{item.subject?.name}</span>
                                                            <div className="flex flex-col gap-1">
                                                                <div className={`flex items-center gap-1.5 ${viewMode === "teacher" ? "no-print" : ""}`}>
                                                                    <User className="w-3 h-3 text-current opacity-60" />
                                                                    <span className="font-bold text-[13px] block truncate">
                                                                        {teacher?.name}
                                                                    </span>
                                                                </div>
                                                                <div className={`flex items-center gap-1.5 ${viewMode === "class" ? "no-print" : ""}`}>
                                                                    <Home className="w-3 h-3 text-current opacity-60" />
                                                                    <span className="font-medium text-[12px] block truncate opacity-90">
                                                                        {//studentClass?.name
                                                                            (studentClass?.level === "1") ? `السابعة أساسي ${studentClass?.name}` : (studentClass?.level === "2") ? `الثامنة أساسي ${studentClass?.name}` : (studentClass?.level === "3") ? `التاسعة أساسي ${studentClass?.name}` : ""
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {viewMode !== "room" && (
                                                            <div className="flex items-center gap-1 text-[10px] font-bold opacity-80 uppercase tracking-tight">
                                                                <MapPin className="w-2.5 h-2.5" />
                                                                {room?.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            ))}

                            {filteredEntries.length === 0 && selectedId && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 flex-col gap-4">
                                    <CalendarIcon className="w-16 h-16 text-slate-300" />
                                    <p className="font-medium text-slate-400">Aucun cours planifié</p>
                                </div>
                            )}

                            {!selectedId && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-[2px] z-20">
                                    <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm">
                                        <Layers className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">Sélectionnez une vue</h3>
                                        <p className="text-slate-500 text-sm">Choisissez une classe, un enseignant ou une salle pour gérer son emploi du temps.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Entry Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden relative"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    {editingId ? (
                                        <Pencil className="w-5 h-5 text-indigo-600" />
                                    ) : (
                                        <Plus className="w-5 h-5 text-indigo-600" />
                                    )}
                                    {editingId ? "Modifier le cours" : "Ajouter un cours"}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingId(null);
                                    }}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddEntry} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Matière</label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        {viewMode === "teacher" ? (
                                            <input
                                                required
                                                readOnly
                                                type="text"
                                                value={subjects.find(s => String(s.id) === formData.subjectId)?.name || ""}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed text-sm"
                                            />
                                        ) : (
                                            <select
                                                required
                                                value={formData.subjectId}
                                                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value, teacherId: "" })}
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                                            >
                                                <option value="">Sélectionner une matière...</option>
                                                {subjects.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Jour</label>
                                        <select
                                            value={formData.day}
                                            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        >
                                            {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Heure de début</label>
                                        <select
                                            value={formData.start}
                                            onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        >
                                            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Durée (heures)</label>
                                        <input
                                            type="number"
                                            step="0.5"
                                            min="0.5"
                                            max="4"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Salle</label>
                                        <div className="relative">
                                            {viewMode === "room" ? (
                                                <input
                                                    readOnly
                                                    type="text"
                                                    value={rooms.find(r => String(r.id) === formData.roomId)?.name || ""}
                                                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 cursor-not-allowed text-sm"
                                                />
                                            ) : (
                                                <select
                                                    required
                                                    value={formData.roomId}
                                                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                                >
                                                    <option value="">Sélectionner une salle...</option>
                                                    {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {viewMode === "room" ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Enseignant</label>
                                            <select
                                                required
                                                value={formData.teacherId}
                                                onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            >
                                                <option value="">Choisir...</option>
                                                {teachers.filter(t => !formData.subjectId || String(t.subjectId) === formData.subjectId).map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Classe</label>
                                            <select
                                                required
                                                value={formData.classId}
                                                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                            >
                                                <option value="">Choisir...</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>
                                                    {(c.level === "1") ? `السابعة أساسي ${c.name}` : (c.level === "2") ? `الثامنة أساسي ${c.name}` : (c.level === "3") ? `التاسعة أساسي ${c.name}` : ""}
                                                </option>)}
                                            </select>
                                        </div>
                                    </div>
                                ) : viewMode === "class" ? (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Enseignant</label>
                                        <select
                                            required
                                            value={formData.teacherId}
                                            onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        >
                                            <option value="">Sélectionner un enseignant...</option>
                                            {teachers.filter(t => !formData.subjectId || String(t.subjectId) === formData.subjectId).map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Classe</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                        >
                                            <option value="">Sélectionner une classe...</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>
                                                {(c.level === "1") ? `السابعة أساسي ${c.name}` : (c.level === "2") ? `الثامنة أساسي ${c.name}` : (c.level === "3") ? `التاسعة أساسي ${c.name}` : ""}
                                            </option>)}
                                        </select>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setEditingId(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all"
                                    >
                                        {editingId ? "Mettre à jour" : "Enregistrer"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
