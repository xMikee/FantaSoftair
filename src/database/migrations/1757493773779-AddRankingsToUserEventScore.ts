import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRankingsToUserEventScore1757493773779 implements MigrationInterface {
    name = 'AddRankingsToUserEventScore1757493773779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` ADD \`team_ranking_snapshot\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` ADD \`player_ranking_snapshot\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` DROP COLUMN \`player_ranking_snapshot\``);
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` DROP COLUMN \`team_ranking_snapshot\``);
    }

}
