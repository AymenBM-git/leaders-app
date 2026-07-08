"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, Users } from "lucide-react";
import { ScheduleEntry, Class, Subject, Teacher, Room, DAYS, BASIC_SLOTS, SUBJECT_COLORS, DEFAULT_SUBJECT_COLOR } from "../../../../services/scheduler/types";

interface TeacherScheduleGridProps {
    schedule: ScheduleEntry[];
    classes: Class[];
    subjects: Subject[];
    teachers: Teacher[];
    rooms: Room[];
}

const LEVEL_NAMES: Record<string, string> = { "1": "7ème", "2": "8ème", "3": "9ème" };

const getSlotRange = (start: string) => {
    const [hStr, mStr] = start.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const totalMinutes = h * 60 + m + 30;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${start} - ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
};

export default function TeacherScheduleGrid({ schedule, classes, subjects, teachers, rooms }: TeacherScheduleGridProps) {
    const [selectedTeacherIdx, setSelectedTeacherIdx] = useState(0);
    const selectedTeacher = teachers[selectedTeacherIdx];

    if (!selectedTeacher) {
        return (
            <div className="text-center py-8 text-slate-500">
                Aucun enseignant disponible.
            </div>
        );
    }

    const teacherEntries = schedule.filter(e => e.teacherId === selectedTeacher.id);

    // Build lookup maps
    const classMap = new Map(classes.map(c => [c.id, c]));
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const roomMap = new Map(rooms.map(r => [r.id, r]));

    // Build grid data: for each (day, slotIdx, subCol), find the entry
    const gridEntries = new Map<string, ScheduleEntry>(); // "day-slotIdx-subCol" -> entry
    const coveredCells = new Set<string>(); // "day-slotIdx-subCol"

    for (const entry of teacherEntries) {
        const startIdx = BASIC_SLOTS.indexOf(entry.start);
        if (startIdx === -1) continue;

        const durationSlots = Math.round(entry.duration / 0.5);

        if (!entry.group) {
            if (entry.week && entry.week !== "all") {
                // Quinzaine session — Semaine A goes in subCol 0, Semaine B in subCol 1
                const subCol = entry.week === "A" ? 0 : 1;
                gridEntries.set(`${entry.day}-${startIdx}-${subCol}`, entry);
                // Mark only this subCol as covered for subsequent slots
                for (let i = 1; i < durationSlots; i++) {
                    coveredCells.add(`${entry.day}-${startIdx + i}-${subCol}`);
                }
            } else {
                // Entire class session (week="all")
                gridEntries.set(`${entry.day}-${startIdx}-0`, entry);
                gridEntries.set(`${entry.day}-${startIdx}-1`, entry);
                // Mark both subCols as covered for subsequent slots
                for (let i = 1; i < durationSlots; i++) {
                    coveredCells.add(`${entry.day}-${startIdx + i}-0`);
                    coveredCells.add(`${entry.day}-${startIdx + i}-1`);
                }
            }
        } else {
            // Group session
            const subCol = entry.group === 1 ? 0 : 1;
            gridEntries.set(`${entry.day}-${startIdx}-${subCol}`, entry);

            // Mark this subCol as covered for subsequent slots
            for (let i = 1; i < durationSlots; i++) {
                coveredCells.add(`${entry.day}-${startIdx + i}-${subCol}`);
            }
        }
    }

    const renderEntryCell = (entry: ScheduleEntry, durationSlots: number, colSpan: number, cellKey: string) => {
        const subject = subjectMap.get(entry.subjectId);
        const cls = classMap.get(entry.classId);
        const room = roomMap.get(entry.roomId);
        const colors = SUBJECT_COLORS[entry.subjectId] || DEFAULT_SUBJECT_COLOR;

        const renderClasses = () => {
            return cls ? `${LEVEL_NAMES[cls.level]} ${cls.name}` : `Classe ${entry.classId}`;
        };

        return (
            <td
                key={cellKey}
                rowSpan={durationSlots}
                colSpan={colSpan}
                className="px-1 border-r border-slate-200 last:border-r-0"
                style={{ verticalAlign: 'top', height: `${durationSlots * 40}px`, padding: '2px 4px', overflow: 'hidden' }}
            >
                <div
                    className="rounded-md px-2 py-1 flex flex-col justify-center h-full transition-all hover:shadow-md cursor-default overflow-hidden"
                    style={{
                        backgroundColor: colors.bg,
                        border: `1.5px solid ${colors.border}`,
                        width: '100%',
                    }}
                >
                    <div>
                        <p className="text-xs font-black leading-tight flex items-center gap-1" style={{ color: colors.text }}>
                            {subject?.name || `Matière ${entry.subjectId}`}
                            {entry.week && entry.week !== "all" && (
                                <span className="ml-1 text-[10px] font-bold text-purple-700">Semaine {entry.week}</span>
                            )}
                            {entry.group && (
                                <span className="ml-1 text-[10px] font-bold text-amber-700">G{entry.group}</span>
                            )}
                        </p>
                        <div className="mt-1 space-y-0.5">
                            <p className="text-[10px] font-medium text-slate-600 truncate">
                                {renderClasses()} | {room?.name || `Salle ${entry.roomId}`}
                            </p>
                        </div>
                    </div>
                    {entry.duration > 0.5 && (
                        <span className="text-[10px] font-bold opacity-60" style={{ color: colors.text }}>
                            {entry.duration}h
                        </span>
                    )}
                </div>
            </td>
        );
    };

    const renderEmptyCell = (colSpan: number, cellKey: string) => {
        return (
            <td key={cellKey} colSpan={colSpan} className="px-1 border-r border-slate-200 last:border-r-0" style={{ height: '40px', padding: '2px 4px' }}>
                <div className="rounded-md bg-slate-50/50 flex items-center justify-center h-full">
                    <span className="text-slate-300 text-xs">—</span>
                </div>
            </td>
        );
    };

    const renderCellsForDay = (day: string, slotIdx: number) => {
        const key0 = `${day}-${slotIdx}-0`;
        const key1 = `${day}-${slotIdx}-1`;

        const isCovered0 = coveredCells.has(key0);
        const isCovered1 = coveredCells.has(key1);

        if (isCovered0 && isCovered1) {
            return null;
        }

        if (isCovered0) {
            const entry1 = gridEntries.get(key1);
            return (
                <React.Fragment key={day}>
                    {entry1 ? (
                        renderEntryCell(entry1, Math.round(entry1.duration / 0.5), 1, key1)
                    ) : (
                        renderEmptyCell(1, key1)
                    )}
                </React.Fragment>
            );
        }

        if (isCovered1) {
            const entry0 = gridEntries.get(key0);
            return (
                <React.Fragment key={day}>
                    {entry0 ? (
                        renderEntryCell(entry0, Math.round(entry0.duration / 0.5), 1, key0)
                    ) : (
                        renderEmptyCell(1, key0)
                    )}
                </React.Fragment>
            );
        }

        const entry0 = gridEntries.get(key0);
        const entry1 = gridEntries.get(key1);

        if (!entry0 && !entry1) {
            return (
                <React.Fragment key={day}>
                    {renderEmptyCell(2, `${day}-${slotIdx}-both`)}
                </React.Fragment>
            );
        }

        if (entry0 && !entry0.group && (!entry0.week || entry0.week === "all")) {
            return (
                <React.Fragment key={day}>
                    {renderEntryCell(entry0, Math.round(entry0.duration / 0.5), 2, `${day}-${slotIdx}-both`)}
                </React.Fragment>
            );
        }

        return (
            <React.Fragment key={day}>
                {entry0 ? (
                    renderEntryCell(entry0, Math.round(entry0.duration / 0.5), 1, key0)
                ) : (
                    renderEmptyCell(1, key0)
                )}
                {entry1 ? (
                    renderEntryCell(entry1, Math.round(entry1.duration / 0.5), 1, key1)
                ) : (
                    renderEmptyCell(1, key1)
                )}
            </React.Fragment>
        );
    };

    const prevTeacher = () => setSelectedTeacherIdx(Math.max(0, selectedTeacherIdx - 1));
    const nextTeacher = () => setSelectedTeacherIdx(Math.min(teachers.length - 1, selectedTeacherIdx + 1));

    const getTeacherSubjectName = () => {
        const sub = subjectMap.get(selectedTeacher.subjectId);
        return sub ? sub.name : "";
    };

    return (
        <div className="space-y-4">
            {/* Teacher Navigator */}
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-5 py-3">
                <button
                    onClick={prevTeacher}
                    disabled={selectedTeacherIdx === 0}
                    className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>

                <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-fuchsia-500" />
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-slate-800">
                            {selectedTeacher.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                            Enseignant {selectedTeacherIdx + 1} sur {teachers.length} • {getTeacherSubjectName()} • {teacherEntries.length} heures de cours
                        </p>
                    </div>
                </div>

                <button
                    onClick={nextTeacher}
                    disabled={selectedTeacherIdx === teachers.length - 1}
                    className="p-2 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Quick teacher jump */}
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto p-1 border border-slate-100 rounded-lg bg-slate-50/30 custom-scrollbar">
                {teachers.map((teach, idx) => (
                    <button
                        key={teach.id}
                        onClick={() => setSelectedTeacherIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            idx === selectedTeacherIdx
                                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-200'
                                : 'bg-white text-slate-500 border border-slate-200 hover:border-fuchsia-300 hover:text-fuchsia-600'
                        }`}
                    >
                        {teach.name}
                    </button>
                ))}
            </div>

            {/* Schedule Grid */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead>
                            <tr className="bg-slate-800 text-white">
                                <th className="py-3 px-4 text-left text-sm font-bold w-[90px] border-r border-slate-700">Heure</th>
                                {DAYS.map(day => (
                                    <th key={day} colSpan={2} className="py-3 px-4 text-center text-sm font-bold border-r border-slate-700 last:border-r-0">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {BASIC_SLOTS.map((slot, slotIdx) => {
                                const isMidiBreak = slot === "13:00";

                                return (
                                    <React.Fragment key={slotIdx}>
                                        {isMidiBreak && (
                                            <tr key="midi-break">
                                                <td colSpan={11} className="bg-slate-100 text-center py-1.5">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                                                        — Pause Midi —
                                                    </span>
                                                </td>
                                            </tr>
                                        )}
                                        <tr key={slot} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors" style={{ height: '40px' }}>
                                            <td className="px-4 border-r border-slate-200 bg-slate-50" style={{ height: '40px', padding: '2px 16px' }}>
                                                <span className="text-sm font-bold text-slate-700">{slot}</span>
                                                <span className="block text-[10px] text-slate-400">
                                                    {getSlotRange(slot)}
                                                </span>
                                            </td>
                                            {DAYS.map(day => renderCellsForDay(day, slotIdx))}
                                        </tr>
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
