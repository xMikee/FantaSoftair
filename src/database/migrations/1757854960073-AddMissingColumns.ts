import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumns1757854960073 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if user_event_scores table exists, if not create it
        const userEventScoresTableExists = await queryRunner.hasTable('user_event_scores');
        
        if (!userEventScoresTableExists) {
            await queryRunner.query(`
                CREATE TABLE user_event_scores (
                    id int NOT NULL AUTO_INCREMENT,
                    user_id int NOT NULL,
                    game_event_id int NOT NULL,
                    total_points int DEFAULT 0,
                    formation_snapshot text NULL,
                    team_ranking_snapshot text NULL,
                    player_ranking_snapshot text NULL,
                    calculated_at datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                    PRIMARY KEY (id),
                    UNIQUE KEY IDX_user_event (user_id, game_event_id)
                ) ENGINE=InnoDB
            `);
        } else {
            // Add missing columns if they don't exist
            const hasTeamRankingSnapshot = await queryRunner.hasColumn('user_event_scores', 'team_ranking_snapshot');
            if (!hasTeamRankingSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores ADD COLUMN team_ranking_snapshot text NULL`);
            }
            
            const hasPlayerRankingSnapshot = await queryRunner.hasColumn('user_event_scores', 'player_ranking_snapshot');
            if (!hasPlayerRankingSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores ADD COLUMN player_ranking_snapshot text NULL`);
            }
            
            const hasFormationSnapshot = await queryRunner.hasColumn('user_event_scores', 'formation_snapshot');
            if (!hasFormationSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores ADD COLUMN formation_snapshot text NULL`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userEventScoresTableExists = await queryRunner.hasTable('user_event_scores');
        
        if (userEventScoresTableExists) {
            const hasTeamRankingSnapshot = await queryRunner.hasColumn('user_event_scores', 'team_ranking_snapshot');
            if (hasTeamRankingSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores DROP COLUMN team_ranking_snapshot`);
            }
            
            const hasPlayerRankingSnapshot = await queryRunner.hasColumn('user_event_scores', 'player_ranking_snapshot');
            if (hasPlayerRankingSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores DROP COLUMN player_ranking_snapshot`);
            }
            
            const hasFormationSnapshot = await queryRunner.hasColumn('user_event_scores', 'formation_snapshot');
            if (hasFormationSnapshot) {
                await queryRunner.query(`ALTER TABLE user_event_scores DROP COLUMN formation_snapshot`);
            }
        }
    }
}
