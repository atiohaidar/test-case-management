-- CreateTable
CREATE TABLE `testcases` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('positive', 'negative') NOT NULL,
    `priority` ENUM('high', 'medium', 'low') NOT NULL,
    `steps` JSON NOT NULL,
    `expectedResult` TEXT NOT NULL,
    `tags` JSON NOT NULL,
    `embedding` TEXT NULL,
    `aiGenerated` BOOLEAN NOT NULL DEFAULT false,
    `originalPrompt` TEXT NULL,
    `aiConfidence` DOUBLE NULL,
    `aiSuggestions` TEXT NULL,
    `aiGenerationMethod` VARCHAR(191) NULL,
    `tokenUsage` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testcase_references` (
    `id` VARCHAR(191) NOT NULL,
    `sourceId` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `similarityScore` DOUBLE NULL,
    `referenceType` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `testcase_references_sourceId_targetId_key`(`sourceId`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `testcase_references` ADD CONSTRAINT `testcase_references_sourceId_fkey` FOREIGN KEY (`sourceId`) REFERENCES `testcases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testcase_references` ADD CONSTRAINT `testcase_references_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `testcases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
