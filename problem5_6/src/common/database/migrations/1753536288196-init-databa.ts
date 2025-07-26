import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDataba1753536288196 implements MigrationInterface {
    name = 'InitDataba1753536288196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "auth_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "username" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar(10) NOT NULL DEFAULT ('user'), "isActive" integer NOT NULL DEFAULT (1), "userId" integer NOT NULL, "lastLoginAt" datetime, "refreshToken" varchar(500), CONSTRAINT "UQ_8852f85982c3947febf76e36810" UNIQUE ("username"), CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email"), CONSTRAINT "REL_b8bf46285ef3a7663104a8179b" UNIQUE ("userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b0a95c7db643642759f1443438" ON "auth_users" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_810e125f6755a4bbc7ff7bcd5f" ON "auth_users" ("role") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b8bf46285ef3a7663104a8179b" ON "auth_users" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8852f85982c3947febf76e3681" ON "auth_users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13d8b49e55a8b06bee6bbc828f" ON "auth_users" ("email") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "name" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "age" integer NOT NULL, "status" varchar(20) NOT NULL DEFAULT ('active'), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e78774d95a5d698bb248e1c7d2" ON "users" ("age") `);
        await queryRunner.query(`CREATE INDEX "IDX_51b8b26ac168fbe7d6f5653e6c" ON "users" ("name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`DROP INDEX "IDX_b0a95c7db643642759f1443438"`);
        await queryRunner.query(`DROP INDEX "IDX_810e125f6755a4bbc7ff7bcd5f"`);
        await queryRunner.query(`DROP INDEX "IDX_b8bf46285ef3a7663104a8179b"`);
        await queryRunner.query(`DROP INDEX "IDX_8852f85982c3947febf76e3681"`);
        await queryRunner.query(`DROP INDEX "IDX_13d8b49e55a8b06bee6bbc828f"`);
        await queryRunner.query(`CREATE TABLE "temporary_auth_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "username" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar(10) NOT NULL DEFAULT ('user'), "isActive" integer NOT NULL DEFAULT (1), "userId" integer NOT NULL, "lastLoginAt" datetime, "refreshToken" varchar(500), CONSTRAINT "UQ_8852f85982c3947febf76e36810" UNIQUE ("username"), CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email"), CONSTRAINT "REL_b8bf46285ef3a7663104a8179b" UNIQUE ("userId"), CONSTRAINT "FK_b8bf46285ef3a7663104a8179b3" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_auth_users"("id", "createdAt", "updatedAt", "deletedAt", "username", "email", "password", "role", "isActive", "userId", "lastLoginAt", "refreshToken") SELECT "id", "createdAt", "updatedAt", "deletedAt", "username", "email", "password", "role", "isActive", "userId", "lastLoginAt", "refreshToken" FROM "auth_users"`);
        await queryRunner.query(`DROP TABLE "auth_users"`);
        await queryRunner.query(`ALTER TABLE "temporary_auth_users" RENAME TO "auth_users"`);
        await queryRunner.query(`CREATE INDEX "IDX_b0a95c7db643642759f1443438" ON "auth_users" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_810e125f6755a4bbc7ff7bcd5f" ON "auth_users" ("role") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b8bf46285ef3a7663104a8179b" ON "auth_users" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8852f85982c3947febf76e3681" ON "auth_users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13d8b49e55a8b06bee6bbc828f" ON "auth_users" ("email") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_13d8b49e55a8b06bee6bbc828f"`);
        await queryRunner.query(`DROP INDEX "IDX_8852f85982c3947febf76e3681"`);
        await queryRunner.query(`DROP INDEX "IDX_b8bf46285ef3a7663104a8179b"`);
        await queryRunner.query(`DROP INDEX "IDX_810e125f6755a4bbc7ff7bcd5f"`);
        await queryRunner.query(`DROP INDEX "IDX_b0a95c7db643642759f1443438"`);
        await queryRunner.query(`ALTER TABLE "auth_users" RENAME TO "temporary_auth_users"`);
        await queryRunner.query(`CREATE TABLE "auth_users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "deletedAt" datetime, "username" varchar(255) NOT NULL, "email" varchar(255) NOT NULL, "password" varchar(255) NOT NULL, "role" varchar(10) NOT NULL DEFAULT ('user'), "isActive" integer NOT NULL DEFAULT (1), "userId" integer NOT NULL, "lastLoginAt" datetime, "refreshToken" varchar(500), CONSTRAINT "UQ_8852f85982c3947febf76e36810" UNIQUE ("username"), CONSTRAINT "UQ_13d8b49e55a8b06bee6bbc828fb" UNIQUE ("email"), CONSTRAINT "REL_b8bf46285ef3a7663104a8179b" UNIQUE ("userId"))`);
        await queryRunner.query(`INSERT INTO "auth_users"("id", "createdAt", "updatedAt", "deletedAt", "username", "email", "password", "role", "isActive", "userId", "lastLoginAt", "refreshToken") SELECT "id", "createdAt", "updatedAt", "deletedAt", "username", "email", "password", "role", "isActive", "userId", "lastLoginAt", "refreshToken" FROM "temporary_auth_users"`);
        await queryRunner.query(`DROP TABLE "temporary_auth_users"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13d8b49e55a8b06bee6bbc828f" ON "auth_users" ("email") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_8852f85982c3947febf76e3681" ON "auth_users" ("username") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b8bf46285ef3a7663104a8179b" ON "auth_users" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_810e125f6755a4bbc7ff7bcd5f" ON "auth_users" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_b0a95c7db643642759f1443438" ON "auth_users" ("isActive") `);
        await queryRunner.query(`DROP INDEX "IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "IDX_51b8b26ac168fbe7d6f5653e6c"`);
        await queryRunner.query(`DROP INDEX "IDX_e78774d95a5d698bb248e1c7d2"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "IDX_13d8b49e55a8b06bee6bbc828f"`);
        await queryRunner.query(`DROP INDEX "IDX_8852f85982c3947febf76e3681"`);
        await queryRunner.query(`DROP INDEX "IDX_b8bf46285ef3a7663104a8179b"`);
        await queryRunner.query(`DROP INDEX "IDX_810e125f6755a4bbc7ff7bcd5f"`);
        await queryRunner.query(`DROP INDEX "IDX_b0a95c7db643642759f1443438"`);
        await queryRunner.query(`DROP TABLE "auth_users"`);
    }

}
