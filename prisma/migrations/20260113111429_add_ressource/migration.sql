-- CreateTable
CREATE TABLE "Ressouce" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "planingId" INTEGER,
    "classId" INTEGER,

    CONSTRAINT "Ressouce_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ressouce" ADD CONSTRAINT "Ressouce_planingId_fkey" FOREIGN KEY ("planingId") REFERENCES "Planing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ressouce" ADD CONSTRAINT "Ressouce_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
