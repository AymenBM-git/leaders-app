-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER,
    "sendTo" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sendTo_fkey" FOREIGN KEY ("sendTo") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
