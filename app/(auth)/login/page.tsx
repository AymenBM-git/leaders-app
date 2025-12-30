"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { School, UserCheck, ShieldCheck, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [role, setRole] = useState<"admin" | "prof" | null>("admin");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Erreur lors de la connexion via API");
            }

            const userData = await res.json();

            if (role && userData.role !== role) {
                setError("Rôle incorrect pour cet utilisateur.");
                setIsLoading(false);
                return;
            }

            // Set cookies for session
            document.cookie = `auth-token=authenticated; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
            document.cookie = `user-name=${encodeURIComponent(userData.displayName)}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
            document.cookie = `user-role=${userData.role}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;

            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Une erreur est survenue lors de la connexion.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50">
            {/* Left Side - Form */}
            <div className="w-full lg:w-[45%] p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white shadow-2xl z-10">
                <div className="max-w-md w-full mx-auto space-y-8">

                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-6">
                            {/*<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center">
                                <School className="text-white w-6 h-6" />
                            </div>*/}<div className="w-10 h-10 rounded-xl"><img src="logo.png" alt="Logo" className="w-10 h-10" /></div>
                            <h1 className="text-xl font-bold text-slate-900">GSI Collège Les Leaders Boumhel</h1>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                            Bienvenue
                        </h2>
                        <p className="text-slate-500">
                            Connectez-vous pour accéder à votre espace de gestion.
                        </p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setRole("admin");
                                setError(null);
                            }}
                            className={cn(
                                "p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200",
                                role === "admin"
                                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200"
                                    : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                role === "admin" ? "bg-indigo-200" : "bg-slate-100"
                            )}>
                                <ShieldCheck className={cn("w-6 h-6", role === "admin" ? "text-indigo-600" : "text-slate-500")} />
                            </div>
                            <span className="font-semibold">Admin</span>
                        </button>

                        <button
                            onClick={() => {
                                setRole("prof");
                                setError(null);
                            }}
                            className={cn(
                                "p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all duration-200",
                                role === "prof"
                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                                    : "border-slate-200 hover:border-emerald-200 hover:bg-slate-50 text-slate-600"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                                role === "prof" ? "bg-emerald-200" : "bg-slate-100"
                            )}>
                                <UserCheck className={cn("w-6 h-6", role === "prof" ? "text-emerald-600" : "text-slate-500")} />
                            </div>
                            <span className="font-semibold">Enseignant</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-3 text-sm"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Identifiant</label>
                            <input
                                type="text"
                                required
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="votre login"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-900">Mot de passe</label>
                                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Oublié ?</a>
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !role}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Se connecter
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </motion.form>

                </div>

                <div className="mt-auto text-center">
                    <p className="text-slate-400 text-sm">© 2025 Collège Les Leaders Boumhel. Tous droits réservés.</p>
                </div>
            </div>

            {/* Right Side - Image/Decoration */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 to-violet-600/90 z-10 mix-blend-multiply" />
                {/* Abstract shapes */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/30 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/30 blur-3xl" />

                <div className="relative z-20 flex flex-col items-center justify-center p-16 text-center h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold text-white mb-6">Gestion Scolaire Intelligente</h2>
                        <p className="text-indigo-100 text-lg max-w-lg leading-relaxed">
                            Une plateforme unifiée pour connecter élèves, parents et enseignants.
                            Suivez la progression, gérez les emplois du temps et communiquez efficacement.
                        </p>
                    </motion.div>

                    {/* Floating Elements Animation Mockup */}
                    <div className="mt-12 relative w-full max-w-md aspect-video bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm shadow-2xl p-6 flex flex-col gap-4">
                        {/*<div className="w-full h-2 bg-white/20 rounded-full animate-pulse" />
                        <div className="w-2/3 h-2 bg-white/20 rounded-full animate-pulse delay-75" />
                        <div className="w-1/2 h-2 bg-white/20 rounded-full animate-pulse delay-150" />

                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <div className="h-20 bg-emerald-500/20 rounded-lg border border-emerald-500/30"></div>
                            <div className="h-20 bg-indigo-500/20 rounded-lg border border-indigo-500/30"></div>
                        </div>*/}
                        <img src="img.jpg" alt="Collège Les Leaders Boumhel" />
                    </div>
                </div>
            </div>
        </div>
    );
}
