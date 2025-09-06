import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1757118937706 implements MigrationInterface {
    name = 'InitialSchema1757118937706'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`events\` (\`id\` int NOT NULL AUTO_INCREMENT, \`player_id\` int NOT NULL, \`points\` int NOT NULL, \`description\` varchar(255) NULL, \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`players\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`base_value\` int NOT NULL DEFAULT '100', \`current_points\` int NOT NULL DEFAULT '0', \`yearly_points\` int NOT NULL DEFAULT '0', \`position\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_players\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`player_id\` int NOT NULL, \`selected_for_lineup\` tinyint NOT NULL DEFAULT 0, \`is_in_formation\` tinyint NOT NULL DEFAULT 0, \`purchase_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_3aa61a201ebc08f54f04c3840f\` (\`user_id\`, \`player_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`credits\` int NOT NULL DEFAULT '1000', \`total_points\` int NOT NULL DEFAULT '0', \`team_password\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_51b8b26ac168fbe7d6f5653e6c\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_events\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`date\` datetime NOT NULL, \`description\` text NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`closed\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`event_scores\` (\`id\` int NOT NULL AUTO_INCREMENT, \`player_id\` int NOT NULL, \`game_event_id\` int NOT NULL, \`points\` int NOT NULL, \`description\` varchar(255) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_cd4a60f1a79deb85ec41d77d48\` (\`player_id\`, \`game_event_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_event_scores\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`game_event_id\` int NOT NULL, \`total_points\` int NOT NULL DEFAULT '0', \`formation_snapshot\` text NULL, \`calculated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_8f9cb224d2a681e771386d4895\` (\`user_id\`, \`game_event_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_9e87c94433f7cc940af3529d35c\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_players\` ADD CONSTRAINT \`FK_eab074a9a822a89b1e85feb5fb4\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_players\` ADD CONSTRAINT \`FK_5dbae93c27d8120456a35381bc8\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_scores\` ADD CONSTRAINT \`FK_858824fb91af8064f29c6ddd6cc\` FOREIGN KEY (\`player_id\`) REFERENCES \`players\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`event_scores\` ADD CONSTRAINT \`FK_6a9a03902a8a764e427dfac2223\` FOREIGN KEY (\`game_event_id\`) REFERENCES \`game_events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` ADD CONSTRAINT \`FK_439e92bcf20fe6d8dd5e4d7005e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` ADD CONSTRAINT \`FK_bcb81a333aaa0f050869055b199\` FOREIGN KEY (\`game_event_id\`) REFERENCES \`game_events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` DROP FOREIGN KEY \`FK_bcb81a333aaa0f050869055b199\``);
        await queryRunner.query(`ALTER TABLE \`user_event_scores\` DROP FOREIGN KEY \`FK_439e92bcf20fe6d8dd5e4d7005e\``);
        await queryRunner.query(`ALTER TABLE \`event_scores\` DROP FOREIGN KEY \`FK_6a9a03902a8a764e427dfac2223\``);
        await queryRunner.query(`ALTER TABLE \`event_scores\` DROP FOREIGN KEY \`FK_858824fb91af8064f29c6ddd6cc\``);
        await queryRunner.query(`ALTER TABLE \`user_players\` DROP FOREIGN KEY \`FK_5dbae93c27d8120456a35381bc8\``);
        await queryRunner.query(`ALTER TABLE \`user_players\` DROP FOREIGN KEY \`FK_eab074a9a822a89b1e85feb5fb4\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_9e87c94433f7cc940af3529d35c\``);
        await queryRunner.query(`DROP INDEX \`IDX_8f9cb224d2a681e771386d4895\` ON \`user_event_scores\``);
        await queryRunner.query(`DROP TABLE \`user_event_scores\``);
        await queryRunner.query(`DROP INDEX \`IDX_cd4a60f1a79deb85ec41d77d48\` ON \`event_scores\``);
        await queryRunner.query(`DROP TABLE \`event_scores\``);
        await queryRunner.query(`DROP TABLE \`game_events\``);
        await queryRunner.query(`DROP INDEX \`IDX_51b8b26ac168fbe7d6f5653e6c\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_3aa61a201ebc08f54f04c3840f\` ON \`user_players\``);
        await queryRunner.query(`DROP TABLE \`user_players\``);
        await queryRunner.query(`DROP TABLE \`players\``);
        await queryRunner.query(`DROP TABLE \`events\``);
    }

}
