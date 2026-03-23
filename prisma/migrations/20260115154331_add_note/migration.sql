-- CreateTable
CREATE TABLE "Note" (
    "id" SERIAL NOT NULL,
    "as" TEXT,
    "libperiodexam" TEXT,
    "idenelev" TEXT,
    "prenomnom" TEXT,
    "libematier" TEXT,
    "codematiere" TEXT,
    "abretypeeprear" TEXT,
    "libTypeEpr" TEXT,
    "iuense" TEXT,
    "libens" TEXT,
    "noteepre" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);
