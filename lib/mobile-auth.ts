import prisma from './prisma';

export async function isParentActive(parentId: number | string): Promise<boolean> {
    if (!parentId) return false;
    
    const parent = await prisma.parent.findUnique({
        where: { id: Number(parentId) },
        select: { active: true }
    });
    
    // If parent doesn't exist or active is specifically false, return false.
    // Default to true if active is null/undefined (as per schema @default(true))
    return parent?.active !== false;
}
