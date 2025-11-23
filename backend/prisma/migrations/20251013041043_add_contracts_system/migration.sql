-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('PROFESSIONAL', 'AMATEUR', 'TRAINING', 'LOAN', 'TRIAL');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'PENDING_PLAYER', 'PENDING_CLUB', 'SIGNED', 'EXPIRED', 'TERMINATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "club_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "status" "ContractStatus" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "salary" DECIMAL(10,2),
    "bonus" DECIMAL(10,2),
    "terms" TEXT,
    "notes" TEXT,
    "signed_at" TIMESTAMP(3),
    "signed_by_player" BOOLEAN NOT NULL DEFAULT false,
    "signed_by_club" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL,
    "club_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "contract_type" "ContractType" NOT NULL,
    "template" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contracts_club_id_idx" ON "contracts"("club_id");

-- CreateIndex
CREATE INDEX "contracts_player_id_idx" ON "contracts"("player_id");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contract_templates_club_id_idx" ON "contract_templates"("club_id");

-- CreateIndex
CREATE INDEX "contract_templates_is_default_idx" ON "contract_templates"("is_default");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
