"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// Mock Schedule Data
const SCHEDULE_ITEMS = [
    { id: 1, day: "Lundi", start: "08:00", duration: 2, subject: "Mathématiques", class: "2ème B", room: "S12", color: "bg-indigo-100 border-indigo-200 text-indigo-700" },
    { id: 2, day: "Lundi", start: "10:00", duration: 1, subject: "Anglais", class: "2ème B", room: "L3", color: "bg-pink-100 border-pink-200 text-pink-700" },
    { id: 3, day: "Mardi", start: "14:00", duration: 2, subject: "Physique", class: "3ème A", room: "Labo 1", color: "bg-emerald-100 border-emerald-200 text-emerald-700" },
    { id: 4, day: "Jeudi", start: "09:00", duration: 1.5, subject: "Histoire-Géo", class: "1ère C", room: "H2", color: "bg-amber-100 border-amber-200 text-amber-700" },
    { id: 5, day: "Vendredi", start: "15:00", duration: 2, subject: "Informatique", class: "Terminal D", room: "Info 2", color: "bg-sky-100 border-sky-200 text-sky-700" },
];

export default function SchedulePage() {
    const [currentWeek, setCurrentWeek] = useState("Semaine du 23 Décembre 2024");

    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Emploi du temps</h1>
                    <p className="text-slate-500 mt-1">Planification des cours et des salles.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 font-medium text-slate-700 min-w-[200px] text-center">
                        {currentWeek}
                    </span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
                        <ChevronRight className="w-5 h-5" />
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
                                <div key={hour} className="h-24 border-b border-slate-100 flex items-start justify-center pt-2">
                                    <span className="text-xs font-bold text-slate-400">{hour}</span>
                                </div>
                            ))}
                        </div>

                        {/* Schedule Body */}
                        <div className="grid grid-cols-6 relative">
                            {/* Background Grid Lines */}
                            {DAYS.map((_, i) => (
                                <div key={i} className="border-l border-slate-100 first:border-l-0 relative">
                                    {HOURS.map((_, hi) => (
                                        <div key={hi} className="h-24 border-b border-slate-50" />
                                    ))}
                                </div>
                            ))}

                            {/* Events Overlay */}
                            <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                                {SCHEDULE_ITEMS.map((item) => {
                                    const dayIndex = DAYS.indexOf(item.day);
                                    const startHour = parseInt(item.start.split(":")[0]);
                                    const offset = startHour - 8; // Starts at 8:00
                                    const top = `${offset * 6}rem`; // 6rem = h-24 = 96px
                                    const height = `${item.duration * 6}rem`;

                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="px-1 py-1 absolute w-full"
                                            style={{
                                                gridColumnStart: dayIndex + 1,
                                                top: top,
                                                height: height,
                                                zIndex: 10
                                            }}
                                        >
                                            <div className={`w-full h-full rounded-xl border p-3 pointer-events-auto hover:scale-[1.02] transition-transform cursor-pointer shadow-sm ${item.color}`}>
                                                <div className="flex flex-col h-full justify-between">
                                                    <div>
                                                        <span className="text-xs font-bold uppercase opacity-70 block mb-1">{item.subject}</span>
                                                        <span className="font-bold text-sm block">{item.class}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs font-medium opacity-80">
                                                        <MapPin className="w-3 h-3" />
                                                        {item.room}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
