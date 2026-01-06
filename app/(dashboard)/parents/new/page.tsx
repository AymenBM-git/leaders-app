"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ParentForm from "@/components/forms/ParentForm";

export default function NewParentPage() {
    const router = useRouter();

    const handleSuccess = () => {
        router.push("/parents");
        router.refresh();
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link
                    href="/parents"
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nouveau Parent</h1>
                    <p className="text-slate-500 text-sm">Ajouter un tuteur au système.</p>
                </div>
            </div>

            <ParentForm
                onSuccess={handleSuccess}
                onCancel={() => router.back()}
            />
        </div>
    );
}
