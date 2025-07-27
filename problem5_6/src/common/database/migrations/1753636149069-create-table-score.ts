import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableScore1753636149069 implements MigrationInterface {
    name = 'CreateTableScore1753636149069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scores" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "userId" integer NOT NULL, "pointsEarned" integer NOT NULL DEFAULT (0), "actionDescription" varchar(255), "actionType" varchar(50), "metadata" varchar(500))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0508b319d67f890b411809968" ON "scores" ("userId") `);
        await queryRunner.query(`DROP INDEX "IDX_c0508b319d67f890b411809968"`);
        await queryRunner.query(`CREATE TABLE "temporary_scores" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "userId" integer NOT NULL, "pointsEarned" integer NOT NULL DEFAULT (0), "actionDescription" varchar(255), "actionType" varchar(50), "metadata" varchar(500), CONSTRAINT "FK_c0508b319d67f890b4118099680" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_scores"("id", "createdAt", "updatedAt", "deletedAt", "userId", "pointsEarned", "actionDescription", "actionType", "metadata") SELECT "id", "createdAt", "updatedAt", "deletedAt", "userId", "pointsEarned", "actionDescription", "actionType", "metadata" FROM "scores"`);
        await queryRunner.query(`DROP TABLE "scores"`);
        await queryRunner.query(`ALTER TABLE "temporary_scores" RENAME TO "scores"`);
        await queryRunner.query(`CREATE INDEX "IDX_c0508b319d67f890b411809968" ON "scores" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_c0508b319d67f890b411809968"`);
        await queryRunner.query(`ALTER TABLE "scores" RENAME TO "temporary_scores"`);
        await queryRunner.query(`CREATE TABLE "scores" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "userId" integer NOT NULL, "pointsEarned" integer NOT NULL DEFAULT (0), "actionDescription" varchar(255), "actionType" varchar(50), "metadata" varchar(500))`);
        await queryRunner.query(`INSERT INTO "scores"("id", "createdAt", "updatedAt", "deletedAt", "userId", "pointsEarned", "actionDescription", "actionType", "metadata") SELECT "id", "createdAt", "updatedAt", "deletedAt", "userId", "pointsEarned", "actionDescription", "actionType", "metadata" FROM "temporary_scores"`);
        await queryRunner.query(`DROP TABLE "temporary_scores"`);
        await queryRunner.query(`CREATE INDEX "IDX_c0508b319d67f890b411809968" ON "scores" ("userId") `);
        await queryRunner.query(`DROP INDEX "IDX_c0508b319d67f890b411809968"`);
        await queryRunner.query(`DROP TABLE "scores"`);
    }

}
