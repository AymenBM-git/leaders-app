import { Users, UserCheck, GraduationCap, School } from "lucide-react";
import { STUDENTS, TEACHERS, PARENTS, CLASSES } from "@/lib/data";

export default function DashboardPage() {
    const stats = [
        {
            label: "Total Élèves",
            value: STUDENTS.length.toString(),
            icon: GraduationCap,
            change: "+12%",
            color: "text-violet-600",
            bg: "bg-violet-100",
        },
        {
            label: "Enseignants",
            value: TEACHERS.length.toString(),
            icon: UserCheck,
            change: "+4%",
            color: "text-emerald-600",
            bg: "bg-emerald-100",
        },
        {
            label: "Parents",
            value: PARENTS.length.toString(),
            icon: Users,
            change: "+8%",
            color: "text-pink-600",
            bg: "bg-pink-100",
        },
        {
            label: "Classes",
            value: CLASSES.length.toString(),
            icon: School,
            change: "0%",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                    Bonjour, Admin
                </h1>
                <p className="text-slate-500 mt-2">
                    Voici un aperçu de l'activité de votre établissement aujourd'hui.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800 mt-2 group-hover:scale-105 transition-transform origin-left">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm">
                            <span className="text-emerald-500 font-medium">{stat.change}</span>
                            <span className="text-slate-400 ml-2">depuis le mois dernier</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity / Charts Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Activités Récentes</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                    JM
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">Jean Martin a ajouté une note</p>
                                    <p className="text-xs text-slate-400">Il y a 2 heures</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Conseil de Classe</h3>
                        <p className="text-indigo-100 mb-6 max-w-sm">
                            Le conseil de classe pour les 2ème année commence dans 3 jours. Préparez les bulletins.
                        </p>
                        <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
                            Voir le planning
                        </button>
                    </div>

                    {/* Decorative circles */}
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute right-20 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}
