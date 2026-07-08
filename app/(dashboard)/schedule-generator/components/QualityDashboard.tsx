"use client";

import { AlertTriangle, CheckCircle, Clock, Calendar, Users, Percent, ShieldAlert } from "lucide-react";
import { QualityMetrics } from "../../../../services/scheduler/types";

interface QualityDashboardProps {
    metrics: QualityMetrics;
}

export default function QualityDashboard({ metrics }: QualityDashboardProps) {
    const {
        totalLessons,
        placedLessons,
        unassignedCount,
        qualityScore,
        dayDistribution,
        teacherLoad,
        teacherHalfDayRespect,
        gapCount,
        warnings
    } = metrics;

    const placementRate = totalLessons > 0 ? Math.round((placedLessons / totalLessons) * 100) : 0;

    // Get color based on score
    const getScoreColor = (score: number) => {
        if (score >= 85) return { text: "text-emerald-600", bg: "bg-emerald-55 border-emerald-200", ring: "ring-emerald-500/20", progress: "bg-emerald-500" };
        if (score >= 60) return { text: "text-amber-600", bg: "bg-amber-50 border-amber-200", ring: "ring-amber-500/20", progress: "bg-amber-500" };
        return { text: "text-red-600", bg: "bg-red-50 border-red-200", ring: "ring-red-500/20", progress: "bg-red-500" };
    };

    const colors = getScoreColor(qualityScore);

    // Find the max lessons in any single day to scale the bar chart
    const maxDayLessons = Math.max(1, ...Object.values(dayDistribution));

    return (
        <div className="space-y-6">
            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Global Quality Score */}
                <div className={`p-5 rounded-2xl border bg-white shadow-sm flex flex-col justify-between`}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-500">Score de Qualité</span>
                        <Percent className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-4xl font-black ${colors.text}`}>{qualityScore}%</span>
                    </div>
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${colors.progress}`} style={{ width: `${qualityScore}%` }} />
                    </div>
                </div>

                {/* Placement Rate */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-500">Cours Assignés</span>
                        {unassignedCount === 0 ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        ) : (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        )}
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-800">{placementRate}%</span>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            {placedLessons} / {totalLessons} séances placées
                        </p>
                    </div>
                    {unassignedCount > 0 && (
                        <div className="mt-2 text-[11px] font-bold text-amber-600">
                            {unassignedCount} séances non placées
                        </div>
                    )}
                </div>

                {/* Teacher Half-day Respect */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-500">Respect Demi-Journée Profs</span>
                        <Users className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-800">{teacherHalfDayRespect}%</span>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            Taux où le prof n'a pas matin ET après-midi
                        </p>
                    </div>
                    <div className="mt-2 text-[11px] font-bold text-indigo-600">
                        Favorise le confort des profs
                    </div>
                </div>

                {/* Gaps in Schedule */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-500">Heures Creuses (Trous)</span>
                        <Clock className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                        <span className="text-4xl font-black text-slate-800">{gapCount}</span>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                            Trous dans l'emploi du temps des classes
                        </p>
                    </div>
                    <div className={`mt-2 text-[11px] font-bold ${gapCount === 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {gapCount === 0 ? "Emplois du temps compacts !" : "Optimisation des trous possible"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Day Distribution Chart */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        Distribution des Cours sur la Semaine
                    </h3>
                    <div className="space-y-3.5">
                        {Object.entries(dayDistribution).map(([day, hours]) => {
                            const percent = maxDayLessons > 0 ? (hours / maxDayLessons) * 100 : 0;
                            return (
                                <div key={day} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                        <span>{day}</span>
                                        <span>{hours} heures</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                                        <div 
                                            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Teacher Workload Analysis */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-500" />
                            Charge de Travail des Enseignants
                        </h3>
                        <div className="max-h-[190px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                            {teacherLoad.length === 0 ? (
                                <p className="text-slate-400 text-xs italic py-4 text-center">Aucun enseignant assigné.</p>
                            ) : (
                                teacherLoad.map(teacher => {
                                    const isOverloaded = teacher.hours > teacher.maxHours;
                                    const loadPercent = Math.min(100, (teacher.hours / teacher.maxHours) * 100);
                                    
                                    return (
                                        <div key={teacher.id} className="text-xs">
                                            <div className="flex justify-between font-bold text-slate-600 mb-1">
                                                <span className="truncate max-w-[150px]">{teacher.name}</span>
                                                <span className={isOverloaded ? "text-red-600" : "text-slate-500"}>
                                                    {teacher.hours}h / {teacher.maxHours}h max
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-500 ${isOverloaded ? "bg-red-500" : "bg-emerald-500"}`} 
                                                    style={{ width: `${loadPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warnings and Unassigned Lessons */}
            {warnings.length > 0 && (
                <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-sm">
                    <h3 className="text-sm font-black text-amber-800 mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
                        Alertes et Séances Non Placées ({warnings.length})
                    </h3>
                    <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
                        {warnings.map((warning, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs font-medium text-amber-700 bg-white border border-amber-100 p-2.5 rounded-lg">
                                <span className="text-amber-500 shrink-0 font-bold">•</span>
                                <span>{warning}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
