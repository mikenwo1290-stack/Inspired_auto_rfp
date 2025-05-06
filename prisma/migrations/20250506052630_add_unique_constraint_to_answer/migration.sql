/*
  Warnings:

  - A unique constraint covering the columns `[questionId]` on the table `answers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "answers_questionId_key" ON "answers"("questionId");
