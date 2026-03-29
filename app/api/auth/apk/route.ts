import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "public", "leaders-parent.apk");
        
        if (!fs.existsSync(filePath)) {
            return new NextResponse("File not found", { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/vnd.android.package-archive",
                "Content-Disposition": 'attachment; filename="leaders-parent.apk"',
            },
        });
    } catch (error) {
        console.error("Error downloading APK:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
