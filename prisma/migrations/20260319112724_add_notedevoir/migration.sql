-- CreateTable
CREATE TABLE "NoteDevoir" (
    "id" SERIAL NOT NULL,
    "as" TEXT,
    "libperiodexam" TEXT,
    "libTypeEpr" TEXT,
    "studentId" INTEGER,
    "subjectId" INTEGER,
    "classId" INTEGER,
    "noteepre" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteDevoir_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NoteDevoir" ADD CONSTRAINT "NoteDevoir_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDevoir" ADD CONSTRAINT "NoteDevoir_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteDevoir" ADD CONSTRAINT "NoteDevoir_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
