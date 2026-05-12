/*
  Warnings:

  - A unique constraint covering the columns `[slug,locale]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Post_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_locale_key" ON "Post"("slug", "locale");
