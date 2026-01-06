"use client";

import { use, useState, useEffect } from "react";
import { ChevronLeft, Save, Trash2, Loader2, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Mat {
    id: number;
    name: string;
}


export default function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [isLoading, setIsLoading] = useState(false);
    const [taf, setTaf] = useState<any>();
    const [subjects, setSubjects] = useState<Mat[]>([]);
    const [classes, setClasses] = useState<Mat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {

                const [tafRes, subjectsRes, classesRes] = await Promise.all([
                    fetch(`/api/tafs/${unwrappedParams.id}`),
                    fetch('/api/subjects'),
                    fetch('/api/classes'),
                ]);

                if (tafRes.ok && subjectsRes.ok && classesRes.ok) {
                    const [tafData, subjectsData, classesData] = await Promise.all([
                        tafRes.json(),
                        subjectsRes.json(),
                        classesRes.json()
                    ]);
                    setTaf(tafData);
                    setSubjects(subjectsData);
                    setClasses(classesData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [unwrappedParams.id]);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);


        try {
            const res = await fetch(`/api/tafs/${unwrappedParams.id}`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    subjectId: formData.get("subjectId"), 
                    classId: formData.get("classId"), 
                    dateTaf: formData.get("dateTaf"), 
                    type: formData.get("type"), 
                    description: formData.get("description")}),
            });

            if (res.ok) {
                router.push("/tafs");
            } else {
                alert("Erreur lors de la mise à jour");
            }
        } catch (error) {
            console.error("Failed to update taf", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer ce TAF ?")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tafs/${unwrappedParams.id}`, { method: 'DELETE' });
            if (res.ok) {
                router.push("/tafs");
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Failed to delete taf", error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading || !taf) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/payments"
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Modifier TAF</h1>
                        <p className="text-slate-500 text-sm">ID: {taf?.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Supprimer
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">

                        {/* Titre */}
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-500" />
                            Informations du TAF
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Matiere */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Matière</label>
                                <select
                                    name="subjectId"
                                    defaultValue={taf?.subjectId}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner une matière...</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Classe */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Classe</label>
                                <select
                                    name="classId"
                                    defaultValue={taf?.classId}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="">Sélectionner une classe...</option>
                                    {classes.map((classe) => (
                                        <option key={classe.id} value={classe.id}>
                                            {classe.id===1 ? "السابعة أساسي " + classe.name : (classe.id===2 ? "الثامنة أساسي " + classe.name : (classe.id===3 ? "التاسعة أساسي " + classe.name : classe.name))}
                                        </option>
                                    ))}
                                </select>
                            </div>                          
                            {/* Type */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type</label>
                                <select
                                    name="type"
                                    defaultValue={taf?.type}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                >
                                    <option value="devoir">Devoir</option>
                                    <option value="taf">Travail à faire</option>
                                </select>
                            </div>
                            {/* Date */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Date</label>
                                <input
                                    type="date"
                                    name="dateTaf"
                                    defaultValue={new Date(taf?.dateTaf).toISOString().split('T')[0]}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                            {/** Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={taf?.description}
                                    placeholder="Ex: Description"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    
                    {/* Boutons */}
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
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Mise à jour...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Mettre à jour
                                </>
                            )}
                        </button>
                    </div>
                
            </form>
        </div>
    );
}
