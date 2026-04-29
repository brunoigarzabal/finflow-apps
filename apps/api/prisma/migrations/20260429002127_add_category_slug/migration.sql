-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "slug" TEXT;

-- Backfill slug for fallback categories
UPDATE "categories" SET "slug" = 'other'
WHERE "is_default" = true AND (
  ("name" = 'Outros' AND "type" = 'EXPENSE') OR
  ("name" = 'Outras receitas' AND "type" = 'INCOME')
);
