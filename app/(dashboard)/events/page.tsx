"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, LayoutGrid, List as ListIcon, Loader2, Calendar, Calendar1Icon, CalendarArrowDown, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Event {
    id: number;
    name: string;
    target: number;
    dateEvent: string;
}
export default function RoomsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("next");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/events?filter=${selectedFilter}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getCookie = (name: string) => {
        if (typeof document === "undefined") return null;

        return document.cookie
            .split("; ")
            .find(row => row.startsWith(name + "="))
            ?.split("=")[1] ?? null;
        };

    const [role, setRole] = useState('');

    useEffect(() => {
            setRole(getCookie("user-role") ?? "N/A");
        }, []);
    let isReadOnly = role !== 'admin';

    const handleChangeFilter = async (filter: string) => {
        try {
            const res = await fetch(`/api/events?filter=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
                setSelectedFilter(filter);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce event ?")) {
            try {
                await fetch(`/api/events/${id}`, { method: 'DELETE' });
                setEvents(events.filter(e => e.id !== id));
            } catch (err) {
                console.error("Failed to delete", err);
                alert("Erreur lors de la suppression");
            }
        }
    };

    const filteredEvents = events.filter(event =>
        (event.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );


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
                    <h1 className="text-3xl font-bold text-slate-900">Evénements</h1>
                    <p className="text-slate-500 mt-1">Gestion des événements.</p>
                </div>
                {!isReadOnly && <Link href="/events/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-95">
                    <Plus className="w-5 h-5" />
                    Nouvel Événement
                </Link>}
            </div>
            

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Rechercher une salle..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Date Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                    <label className="text-xl text-slate-900 my-2">Filtrer par date :</label>
                    <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                    <select
                        defaultValue={selectedFilter}
                        name="filter"
                        onChange={(e) => handleChangeFilter(e.target.value)}
                        className="appearance-none pl-10 pr-8 py-2 bg-slate-50 text-slate-600 rounded-xl font-medium hover:bg-slate-100 border border-slate-200/50 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                    >

                        <option value="next">Prochains</option>
                        <option value="all">Tous les événemens</option>
                    </select>
                    </div>
                </div>
                {/** View Mode Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <ListIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEvents.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-indigo-100 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                    <Calendar className="w-6 h-6" />
                                </div>
                            </div>

                            <Link href={`/events/${event.id}`} className="block">
                                <h3 className="text-xl font-bold text-slate-900 mb-1 hover:text-indigo-600 transition-colors">{event.name}</h3>
                            </Link>
                            <p className="text-slate-500 text-sm mb-4">{event.target === 1 ? "Parent" : event.target === 2 ? "Enseignant" : "Parent/Enseignant"}</p>

                            <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 p-2 rounded-lg justify-center">
                                <Calendar1Icon className="w-4 h-4" />
                                <span>Date: <b>{event.dateEvent ? new Date(event.dateEvent).toLocaleDateString("fr-FR") : "Pas de date"}</b></span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Nom</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Publique Cible</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                                    {/* Name */}
                                    <td className="px-6 py-4">
                                        <Link href={`/events/${event.id}`} className="font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                                            {event.name}
                                        </Link>
                                    </td>
                                    {/* Target */}
                                    <td className="px-6 py-4 text-slate-600">{event.target === 1 ? "Parent" : event.target === 2 ? "Enseignant" : "Parent/Enseignant"}</td>
                                    {/* Date */}
                                    <td className="px-6 py-4 text-slate-600">
                                        <div className="flex items-center gap-2">
                                            <CalendarArrowDown className="w-4 h-4 text-slate-400" />
                                            {event.dateEvent? new Date(event.dateEvent).toLocaleDateString("fr-FR") : "Pas de date"}
                                        </div>
                                    </td>
                                    {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/events/${event.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all" title="Voir profil">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {!isReadOnly && <button
                                                    onClick={() => handleDelete(event.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>}
                                            </div>
                                        </td>
                                </tr>
                            ))} 
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
