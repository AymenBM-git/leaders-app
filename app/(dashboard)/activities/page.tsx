"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Filter, Eye, Trash2, Loader2, Activity, User } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Activity {
    id: number;
    nameUser: string;
    description: string;
    dateActivity: string;
}

export default function StudentsPage() {
    const currentYear = (() => {
                    const now = new Date();
                    const year = now.getFullYear();
                    return year.toString();
                })  ();

    const [activities, setActivities] = useState<Activity[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAS, setSelectedAS] = useState(currentYear);
    const [anneeScolaires, setAnneeScolaires] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [activitiesRes] = await Promise.all([
                fetch('/api/activities/all'),
            ]);

            if (activitiesRes.ok) {
                console.log("Fetched activities successfully");
                const activitiesData = await activitiesRes.json();
                setActivities(activitiesData);

                const yearsInDB = Array.from(new Set(activitiesData.map((e: any) => new Date(e.dateActivity).getFullYear().toString()))).filter(Boolean) as string[];
                const allYears = Array.from(new Set([currentYear, ...yearsInDB])).sort((a, b) => b.localeCompare(a));
                setAnneeScolaires(allYears);

            }
        } catch (error) {
            console.error("Failed to fetch data", error);        
        } finally {
            setIsLoading(false);
        }
    };


    const filteredActivities = activities.filter(activity => {
        const matchesSearch = `${activity.nameUser}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAS = selectedAS ? new Date(activity.dateActivity).getFullYear().toString() === selectedAS : true;
        return matchesSearch && matchesAS;
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
                    <h1 className="text-3xl font-bold text-slate-900">Activitées Récentes</h1>
                    <p className="text-slate-500 mt-1">Voir la liste des activitées.</p>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                {/* Nom Parent Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher une activité par utilisateur..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Annee Scolaire Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                        value={selectedAS}
                        name="dateActivity"
                        onChange={(e) => setSelectedAS(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium hover:bg-slate-100 border border-slate-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >

                        {
                            anneeScolaires.map((as, index) => <option key={index} value={as}>{as}</option>)
                        }
                    </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        {/* Entete tableau */}
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Utilisateur</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Description</th>
                                <th className="p-4 text-xs font-semibold uppercase text-slate-500 tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredActivities.map((activity, index) => {

                                return (
                                    <motion.tr
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-slate-50/80 transition-colors group  ${activity.description.includes("supprimé") ? "text-red-500" : activity.description.includes("modifié") ? "text-yellow-500" : ""}`}
                                    >
                                        {/* User */}
                                        <td className="p-4">
                                            {activity.nameUser ? (
                                                <div className="flex justify-left items-start">
                                                    <div className="p-1.5 bg-slate-100 rounded-full group-hover/parent:bg-indigo-100 transition-colors">
                                                        <User className="w-3.5 h-3.5" />
                                                    </div>
                                                    <span className="text-sm font-medium mx-6">{activity.nameUser}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Non assigné</span>
                                            )}
                                        </td>
                                        {/* Description */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{activity.description}</span>
                                        </td>
                                        {/* Date    */}
                                        <td className="p-4">
                                            <span className="text-sm font-medium">{new Date(activity.dateActivity).toLocaleDateString("fr-FR")} à {new Date(activity.dateActivity).getHours()}:{new Date(activity.dateActivity).getMinutes().toString().padStart(2, '0')}</span>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredActivities.length === 0 && (
                    <div className="p-12 text-center text-slate-400 bg-slate-50/50">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucune activité trouvée.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


