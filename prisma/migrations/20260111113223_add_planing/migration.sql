-- CreateTable
CREATE TABLE "Planing" (
    "id" SERIAL NOT NULL,
    "teacherId" INTEGER,
    "as" TEXT,
    "name" TEXT,
    "type" TEXT,
    "datePlaning" TIMESTAMP(3),
    "description" TEXT,

    CONSTRAINT "Planing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Planing" ADD CONSTRAINT "Planing_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
