"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Loader2, Save, MapPin, Users, BookOpen, Layers, LayoutDashboard, Calendar, List } from "lucide-react";
import { SchedulerEngine, SchedulerConfig } from "../../../services/scheduler/engine";
import { Class, Subject, Room, Teacher, CurriculumRequirement, ScheduleEntry, DAYS, BASIC_SLOTS, SessionRequirement } from "../../../services/scheduler/types";
import ScheduleGrid from "./components/ScheduleGrid";
import TeacherScheduleGrid from "./components/TeacherScheduleGrid";
import QualityDashboard from "./components/QualityDashboard";

const DEFAULT_SUBJECTS = [
    { id: 1, name: "Mathématiques", isSpecialized: false },
    { id: 2, name: "Arabe", isSpecialized: false },
    { id: 3, name: "Français", isSpecialized: false },
    { id: 4, name: "Anglais", isSpecialized: false },
    { id: 5, name: "Informatique", isSpecialized: true, specializedRoomType: "Labo Info" },
    { id: 6, name: "Technique", isSpecialized: true, specializedRoomType: "Atelier Tech" },
    { id: 7, name: "Physique", isSpecialized: true, specializedRoomType: "Labo Science" },
    { id: 8, name: "SVT", isSpecialized: true, specializedRoomType: "Labo Science" },
    { id: 9, name: "Sport", isSpecialized: true, specializedRoomType: "Terrain de Sport" },
];

const LEVELS = ["1", "2", "3"]; // 7eme, 8eme, 9eme
const LEVEL_NAMES: Record<string, string> = { "1": "7ème Année", "2": "8ème Année", "3": "9ème Année" };

export default function ScheduleGeneratorPage() {
    const [isLoading, setIsLoading] = useState(false);
    
    // Config State
    const [normalRoomsCount, setNormalRoomsCount] = useState(10);
    const [specRoomsCount, setSpecRoomsCount] = useState({
        "Labo Info": 2,
        "Atelier Tech": 2,
        "Labo Science": 2,
        "Terrain de Sport": 1
    });

    const [classCountPerLevel, setClassCountPerLevel] = useState({
        "1": 3,
        "2": 3,
        "3": 3
    });

    const [activeSubjects, setActiveSubjects] = useState<number[]>(DEFAULT_SUBJECTS.map(s => s.id));
    const [teachersPerSubject, setTeachersPerSubject] = useState<Record<number, number>>(() => {
        const init: Record<number, number> = {};
        DEFAULT_SUBJECTS.forEach(s => init[s.id] = 2);
        return init;
    });
    const [subjectDaysOff, setSubjectDaysOff] = useState<Record<number, string>>(() => {
        const init: Record<number, string> = {};
        DEFAULT_SUBJECTS.forEach(s => init[s.id] = "");
        return init;
    });

    // Curriculum: subjectId -> level -> array of sessions
    const [curriculumConfig, setCurriculumConfig] = useState<Record<number, Record<string, SessionRequirement[]>>>(() => {
        const init: any = {};
        DEFAULT_SUBJECTS.forEach(s => {
            init[s.id] = {
                "1": [],
                "2": [],
                "3": [],
            };
        });
        return init;
    });

    // Result State
    const [scheduleResult, setScheduleResult] = useState<ScheduleEntry[] | null>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [generatedConfig, setGeneratedConfig] = useState<SchedulerConfig | null>(null);
    const [activeTab, setActiveTab] = useState<"grid" | "teachers" | "metrics" | "raw">("grid");

    const handleSubjectToggle = (id: number) => {
        if (activeSubjects.includes(id)) setActiveSubjects(activeSubjects.filter(sid => sid !== id));
        else setActiveSubjects([...activeSubjects, id]);
    };

    const handleGenerate = () => {
        // Validation
        const totalClasses = Object.values(classCountPerLevel).reduce((sum, count) => sum + count, 0);
        if (totalClasses === 0) {
            alert("Erreur: Vous devez configurer au moins une classe.");
            return;
        }

        if (normalRoomsCount <= 0) {
            alert("Erreur: Vous devez avoir au moins 1 salle normale.");
            return;
        }

        if (activeSubjects.length === 0) {
            alert("Erreur: Veuillez sélectionner au moins une matière active.");
            return;
        }

        let totalSessionsCount = 0;
        activeSubjects.forEach(subId => {
            LEVELS.forEach(lvl => {
                const sessions = curriculumConfig[subId]?.[lvl] || [];
                totalSessionsCount += sessions.length;
            });
        });
        if (totalSessionsCount === 0) {
            alert("Erreur: Votre répartition des matières est vide. Veuillez ajouter au moins une séance de cours.");
            return;
        }

        // Check if specialized rooms are available for active specialized subjects in the curriculum
        for (const subId of activeSubjects) {
            const sub = DEFAULT_SUBJECTS.find(s => s.id === subId);
            if (sub?.isSpecialized && sub.specializedRoomType) {
                let hasSessions = false;
                LEVELS.forEach(lvl => {
                    if (curriculumConfig[subId]?.[lvl]?.length > 0) hasSessions = true;
                });

                if (hasSessions) {
                    const count = specRoomsCount[sub.specializedRoomType as keyof typeof specRoomsCount] || 0;
                    if (count <= 0) {
                        alert(`Erreur: La matière "${sub.name}" est planifiée mais aucune salle de type "${sub.specializedRoomType}" n'est configurée.`);
                        return;
                    }
                }
            }
        }

        // Check if active subjects in the curriculum have at least one teacher
        for (const subId of activeSubjects) {
            const sub = DEFAULT_SUBJECTS.find(s => s.id === subId);
            if (sub) {
                let hasSessions = false;
                LEVELS.forEach(lvl => {
                    if (curriculumConfig[subId]?.[lvl]?.length > 0) hasSessions = true;
                });

                if (hasSessions) {
                    const teacherCount = teachersPerSubject[subId] || 0;
                    if (teacherCount <= 0) {
                        alert(`Erreur: La matière "${sub.name}" est planifiée mais aucun enseignant n'est configuré.`);
                        return;
                    }
                }
            }
        }

        setIsLoading(true);

        setTimeout(() => {
            try {
                // 1. Build Classes
                const configClasses: Class[] = [];
                let classIdCounter = 1;
                LEVELS.forEach(lvl => {
                    for (let i = 0; i < classCountPerLevel[lvl as keyof typeof classCountPerLevel]; i++) {
                        configClasses.push({ id: classIdCounter++, level: lvl as any, name: `B${i + 1}` });
                    }
                });

                // 2. Build Rooms
                const configRooms: Room[] = [];
                let roomIdCounter = 1;
                for (let i = 0; i < normalRoomsCount; i++) {
                    configRooms.push({ id: roomIdCounter++, name: `Salle ${i + 1}`, type: "Normal" });
                }
                Object.entries(specRoomsCount).forEach(([type, count]) => {
                    for (let i = 0; i < count; i++) {
                        configRooms.push({ id: roomIdCounter++, name: `${type} ${i + 1}`, type });
                    }
                });

                // 3. Build Subjects & Teachers
                const configSubjects = DEFAULT_SUBJECTS.filter(s => activeSubjects.includes(s.id)).map(s => ({
                    ...s,
                    dayOff: subjectDaysOff[s.id] || undefined
                }));
                const configTeachers: Teacher[] = [];
                let teacherIdCounter = 1;
                
                configSubjects.forEach(sub => {
                    const count = teachersPerSubject[sub.id] || 1;
                    for (let i = 0; i < count; i++) {
                        configTeachers.push({
                            id: teacherIdCounter++,
                            name: `Prof ${sub.name} ${i + 1}`,
                            subjectId: sub.id,
                            maxHoursPerWeek: 18
                        });
                    }
                });

                // 4. Build Curriculum Requirements
                const configCurriculum: CurriculumRequirement[] = [];
                let reqIdCounter = 1;

                configSubjects.forEach(sub => {
                    LEVELS.forEach(lvl => {
                        const sessions = curriculumConfig[sub.id][lvl];
                        if (sessions && sessions.length > 0) {
                            configCurriculum.push({
                                id: reqIdCounter++,
                                level: lvl as any,
                                subjectId: sub.id,
                                sessions: sessions
                            });
                        }
                    });
                });

                const config: SchedulerConfig = {
                    classes: configClasses,
                    subjects: configSubjects,
                    rooms: configRooms,
                    teachers: configTeachers,
                    curriculum: configCurriculum
                };

                const engine = new SchedulerEngine(config);
                const { schedule, metrics } = engine.generate();
                setScheduleResult(schedule);
                setMetrics(metrics);
                setGeneratedConfig(config);
                setActiveTab("grid");

            } catch (err) {
                console.error(err);
                alert("Erreur lors de la génération. Consultez la console.");
            } finally {
                setIsLoading(false);
            }
        }, 500); // small delay to allow UI to update to loading state
    };


    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                    <Wand2 className="w-8 h-8 text-fuchsia-600" />
                    Générateur d'Emplois du Temps
                </h1>
                <p className="text-slate-500 mt-2 text-lg">Configurez vos contraintes pour générer automatiquement une grille optimale.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURATION COLUMN */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Classes Count */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-lg font-bold text-slate-800">Nombre de Classes</h2>
                        </div>
                        <div className="space-y-3">
                            {LEVELS.map(lvl => (
                                <div key={lvl} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{LEVEL_NAMES[lvl]}</span>
                                    <input 
                                        type="number" min="1" max="20"
                                        value={classCountPerLevel[lvl as keyof typeof classCountPerLevel]}
                                        onChange={e => setClassCountPerLevel({...classCountPerLevel, [lvl]: parseInt(e.target.value) || 0})}
                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rooms */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <MapPin className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-bold text-slate-800">Salles Disponibles</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Salles Normales</span>
                                <input 
                                    type="number" min="1" max="50"
                                    value={normalRoomsCount}
                                    onChange={e => setNormalRoomsCount(parseInt(e.target.value) || 0)}
                                    className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-sm"
                                />
                            </div>
                            <hr className="border-slate-100" />
                            {Object.entries(specRoomsCount).map(([type, count]) => (
                                <div key={type} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">{type}</span>
                                    <input 
                                        type="number" min="0" max="20"
                                        value={count}
                                        onChange={e => setSpecRoomsCount({...specRoomsCount, [type]: parseInt(e.target.value) || 0})}
                                        className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-fuchsia-500/20 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SUBJECTS & CURRICULUM COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-bold text-slate-800">Matières & Répartition</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="py-3 px-2 font-semibold text-slate-500 text-sm w-[200px]">Matière</th>
                                        <th className="py-3 px-2 font-semibold text-slate-500 text-sm w-[80px]">Profs</th>
                                        <th className="py-3 px-2 font-semibold text-slate-500 text-sm w-[120px]">Jour Off</th>
                                        {LEVELS.map(lvl => (
                                            <th key={lvl} className="py-3 px-2 font-semibold text-slate-500 text-sm text-center">
                                                {LEVEL_NAMES[lvl]}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DEFAULT_SUBJECTS.map(sub => {
                                        const isActive = activeSubjects.includes(sub.id);
                                        return (
                                            <tr key={sub.id} className={`border-b border-slate-50 transition-colors ${!isActive ? 'opacity-50 grayscale' : 'hover:bg-slate-50'}`}>
                                                <td className="py-4 px-2">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isActive} 
                                                            onChange={() => handleSubjectToggle(sub.id)}
                                                            className="w-4 h-4 text-fuchsia-600 rounded border-slate-300 focus:ring-fuchsia-500"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-800">{sub.name}</p>
                                                            {sub.isSpecialized && <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">[{sub.specializedRoomType}]</p>}
                                                        </div>
                                                    </label>
                                                </td>
                                                <td className="py-4 px-2">
                                                    <input 
                                                        type="number" min="1" max="20" disabled={!isActive}
                                                        value={teachersPerSubject[sub.id]}
                                                        onChange={e => setTeachersPerSubject({...teachersPerSubject, [sub.id]: parseInt(e.target.value) || 1})}
                                                        className="w-16 px-2 py-1 border border-slate-200 rounded-lg outline-none disabled:bg-slate-100 text-center text-sm font-medium"
                                                    />
                                                </td>
                                                <td className="py-4 px-2">
                                                    <select
                                                        disabled={!isActive}
                                                        value={subjectDaysOff[sub.id] || ""}
                                                        onChange={e => setSubjectDaysOff({...subjectDaysOff, [sub.id]: e.target.value})}
                                                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg outline-none disabled:bg-slate-100 text-sm font-medium focus:ring-2 focus:ring-fuchsia-500/20"
                                                    >
                                                        <option value="">Aucun</option>
                                                        {DAYS.map(day => (
                                                            <option key={day} value={day}>{day}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                {LEVELS.map(lvl => {
                                                    const sessions = curriculumConfig[sub.id][lvl] || [];
                                                    return (
                                                        <td key={lvl} className="py-4 px-2 min-w-[150px] align-top">
                                                            <div className="flex flex-col gap-2">
                                                                {sessions.map((session, sIdx) => (
                                                                    <div key={session.id} className="flex flex-col gap-1 p-2 bg-slate-50 border border-slate-200 rounded-lg relative group">
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const newSessions = [...sessions];
                                                                                newSessions.splice(sIdx, 1);
                                                                                setCurriculumConfig({...curriculumConfig, [sub.id]: {...curriculumConfig[sub.id], [lvl]: newSessions}});
                                                                            }}
                                                                            className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                                                                        >×</button>
                                                                        <div className="flex items-center gap-2">
                                                                             <div className="flex flex-col w-1/2">
                                                                                 <span className="text-[9px] font-bold text-slate-400 mb-0.5">Durée</span>
                                                                                 <div className="flex items-center gap-1">
                                                                                     <input 
                                                                                         type="number" min="0.5" max="4" step="0.5" disabled={!isActive}
                                                                                         value={session.duration}
                                                                                         onChange={e => {
                                                                                             const newSessions = [...sessions];
                                                                                             newSessions[sIdx].duration = parseFloat(e.target.value) || 0;
                                                                                             if (!newSessions[sIdx].totalHours || newSessions[sIdx].totalHours < newSessions[sIdx].duration) {
                                                                                                 newSessions[sIdx].totalHours = newSessions[sIdx].duration;
                                                                                             }
                                                                                             setCurriculumConfig({...curriculumConfig, [sub.id]: {...curriculumConfig[sub.id], [lvl]: newSessions}});
                                                                                         }}
                                                                                         className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-semibold outline-none"
                                                                                         title="Durée de la séance (h)"
                                                                                     />
                                                                                     <span className="text-[9px] font-bold text-slate-400">h</span>
                                                                                 </div>
                                                                             </div>
                                                                             <div className="flex flex-col w-1/2">
                                                                                 <span className="text-[9px] font-bold text-slate-400 mb-0.5">Total</span>
                                                                                 <div className="flex items-center gap-1">
                                                                                     <input 
                                                                                         type="number" min="0.5" max="20" step="0.5" disabled={!isActive}
                                                                                         value={session.totalHours ?? session.duration}
                                                                                         onChange={e => {
                                                                                             const newSessions = [...sessions];
                                                                                             newSessions[sIdx].totalHours = parseFloat(e.target.value) || 0;
                                                                                             setCurriculumConfig({...curriculumConfig, [sub.id]: {...curriculumConfig[sub.id], [lvl]: newSessions}});
                                                                                         }}
                                                                                         className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-[11px] font-semibold outline-none"
                                                                                         title="Total des heures pour cette config"
                                                                                     />
                                                                                     <span className="text-[9px] font-bold text-slate-400">h</span>
                                                                                 </div>
                                                                             </div>
                                                                         </div>
                                                                        <select
                                                                            disabled={!isActive}
                                                                            value={session.type}
                                                                            onChange={e => {
                                                                                const newSessions = [...sessions];
                                                                                newSessions[sIdx].type = e.target.value as any;
                                                                                setCurriculumConfig({...curriculumConfig, [sub.id]: {...curriculumConfig[sub.id], [lvl]: newSessions}});
                                                                            }}
                                                                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-medium outline-none"
                                                                        >
                                                                            <option value="Entiere">Entière</option>
                                                                            <option value="Groupe">Groupes</option>
                                                                            <option value="Quinzaine">Quinzaine A/B</option>
                                                                        </select>
                                                                    </div>
                                                                ))}
                                                                <button
                                                                    type="button"
                                                                    disabled={!isActive}
                                                                    onClick={() => {
                                                                        const newSessions = [...sessions, { id: Math.random().toString(36).substr(2, 9), duration: 1, totalHours: 1, type: "Entiere" as const }];
                                                                        setCurriculumConfig({...curriculumConfig, [sub.id]: {...curriculumConfig[sub.id], [lvl]: newSessions}});
                                                                    }}
                                                                    className="w-full py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
                                                                >
                                                                    + Ajouter
                                                                </button>
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-900 rounded-2xl p-6 shadow-xl flex items-center justify-between sticky bottom-8 z-50">
                <div>
                    <h3 className="text-white font-bold">Prêt à répertorier ?</h3>
                    <p className="text-slate-400 text-sm">Vérifiez vos contraintes avant de lancer le moteur.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-fuchsia-500/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    Lancer la Génération
                </button>
            </div>

            {/* Results Output */}
            {scheduleResult && metrics && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
                    <div className="bg-emerald-50 border-b border-emerald-100 p-6 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-emerald-800">Génération Terminée</h2>
                            <p className="text-emerald-600 font-medium text-sm mt-1">
                                {metrics.placedLessons} leçons placées sur {metrics.totalLessons} ({metrics.unassignedCount} non-assignées).
                            </p>
                        </div>
                        <button className="bg-white border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-emerald-100 transition-all flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Sauvegarder dans la DB
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab("grid")}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                                activeTab === "grid"
                                    ? "border-fuchsia-600 text-fuchsia-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <Calendar className="w-4 h-4" />
                            Grille d'Emplois du Temps
                        </button>
                        <button
                            onClick={() => setActiveTab("teachers")}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                                activeTab === "teachers"
                                    ? "border-fuchsia-600 text-fuchsia-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Emploi du temps Enseignants
                        </button>
                        <button
                            onClick={() => setActiveTab("metrics")}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                                activeTab === "metrics"
                                    ? "border-fuchsia-600 text-fuchsia-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Analyse & Métriques de Qualité
                        </button>
                        <button
                            onClick={() => setActiveTab("raw")}
                            className={`flex items-center gap-2 py-4 px-4 text-sm font-bold border-b-2 transition-all ${
                                activeTab === "raw"
                                    ? "border-fuchsia-600 text-fuchsia-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                            <List className="w-4 h-4" />
                            Aperçu de Liste
                        </button>
                    </div>

                    <div className="p-6">
                        {activeTab === "grid" && generatedConfig && (
                            <ScheduleGrid
                                schedule={scheduleResult}
                                classes={generatedConfig.classes}
                                subjects={generatedConfig.subjects}
                                teachers={generatedConfig.teachers}
                                rooms={generatedConfig.rooms}
                            />
                        )}

                        {activeTab === "teachers" && generatedConfig && (
                            <TeacherScheduleGrid
                                schedule={scheduleResult}
                                classes={generatedConfig.classes}
                                subjects={generatedConfig.subjects}
                                teachers={generatedConfig.teachers}
                                rooms={generatedConfig.rooms}
                            />
                        )}

                        {activeTab === "metrics" && (
                            <QualityDashboard metrics={metrics} />
                        )}

                        {activeTab === "raw" && (
                            <div>
                                <p className="text-slate-500 text-sm italic mb-4">Aperçu basique des emplois du temps générés. Pour une vue complète, reportez-vous à la grille principale.</p>
                                
                                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden custom-scrollbar max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 text-slate-600">
                                                <th className="p-3 border-b border-slate-200">Classe</th>
                                                <th className="p-3 border-b border-slate-200">Jour</th>
                                                <th className="p-3 border-b border-slate-200">Heure</th>
                                                <th className="p-3 border-b border-slate-200">Durée</th>
                                                <th className="p-3 border-b border-slate-200">Semaine/Grp</th>
                                                <th className="p-3 border-b border-slate-200">Infos (Matière / Salle / Prof ID)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {scheduleResult.slice(0, 100).map((entry, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-white">
                                                    <td className="p-3 font-semibold text-slate-800">Classe ID {entry.classId}</td>
                                                    <td className="p-3">{entry.day}</td>
                                                    <td className="p-3 font-medium text-indigo-600">{entry.start}</td>
                                                    <td className="p-3">{entry.duration}h</td>
                                                    <td className="p-3">
                                                        {entry.week !== "all" && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold mr-1">Semaine {entry.week}</span>}
                                                        {entry.group && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">Groupe {entry.group}</span>}
                                                        {entry.week === "all" && !entry.group && <span className="text-slate-400">-</span>}
                                                    </td>
                                                    <td className="p-3 text-slate-600">
                                                        Matière ID: {entry.subjectId} | Salle ID: {entry.roomId} | Prof ID: {entry.teacherId}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {scheduleResult.length > 100 && (
                                        <p className="text-center text-slate-400 text-xs p-4 bg-slate-100 border-t border-slate-200">Affichage limité aux 100 premières leçons générées...</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
