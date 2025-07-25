-- CreateEnum
CREATE TYPE "HelpType" AS ENUM ('QUERY', 'COMPLAINT');

-- CreateTable
CREATE TABLE "help_requests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "HelpType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_requests_pkey" PRIMARY KEY ("id")
);
