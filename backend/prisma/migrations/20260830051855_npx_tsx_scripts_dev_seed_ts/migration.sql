-- CreateIndex
CREATE INDEX "Test_status_featured_idx" ON "Test"("status", "featured");

-- CreateIndex
CREATE INDEX "Test_status_categoryId_idx" ON "Test"("status", "categoryId");

-- CreateIndex
CREATE INDEX "Test_status_difficulty_idx" ON "Test"("status", "difficulty");
