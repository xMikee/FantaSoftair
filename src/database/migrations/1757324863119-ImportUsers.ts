import { MigrationInterface, QueryRunner } from "typeorm";

export class ImportUsers1757324863119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const users = [
            { id: 5, name: 'Teddy', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Roma7' },
            { id: 6, name: 'Siux', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Milano3' },
            { id: 7, name: 'Selvaggio', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Napoli9' },
            { id: 8, name: 'Koala', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Torino2' },
            { id: 9, name: 'Edward', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Palermo5' },
            { id: 10, name: 'Ombra', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Genova8' },
            { id: 11, name: 'Sciacallo', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Bologna4' },
            { id: 12, name: 'Hannibal', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Firenze1' },
            { id: 13, name: 'Libano', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Bari6' },
            { id: 14, name: 'C17', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Catania3' },
            { id: 15, name: 'Spritz', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Venezia9' },
            { id: 16, name: 'Let', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Verona2' },
            { id: 17, name: 'Pasquale Tamborra', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Messina7' },
            { id: 18, name: 'Joker', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Padova5' },
            { id: 19, name: 'Cocorito', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Trieste8' },
            { id: 20, name: 'Django', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Brescia1' },
            { id: 21, name: 'Cowboy', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Taranto4' },
            { id: 22, name: 'Balik', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Prato6' },
            { id: 23, name: 'Homer', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Reggio3' },
            { id: 24, name: 'Bobcat', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Modena9' },
            { id: 25, name: 'Proposta', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Parma2' },
            { id: 26, name: 'Attila', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Perugia7' },
            { id: 27, name: 'Silenzio', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Livorno5' },
            { id: 28, name: 'Artù', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Ravenna8' },
            { id: 29, name: 'Tulipao', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Cagliari1' },
            { id: 30, name: 'Cavaletta', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Foggia4' },
            { id: 31, name: 'The mask', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Rimini6' },
            { id: 32, name: 'Rabbit', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Salerno3' },
            { id: 33, name: 'Grizzly', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Ferrara9' },
            { id: 34, name: 'Fog', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Sassari2' },
            { id: 35, name: 'Diana', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Latina7' },
            { id: 36, name: 'Crostatina', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Giugliano5' },
            { id: 37, name: 'Cuoido', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Monza8' },
            { id: 38, name: 'Lost', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Bergamo1' },
            { id: 39, name: 'Pio', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Trento4' },
            { id: 40, name: 'Lazzaro', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Vicenza6' },
            { id: 41, name: 'Sciagura', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Terni3' },
            { id: 42, name: 'Pasquale Tragni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Bolzano9' },
            { id: 43, name: 'Apu', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Novara2' },
            { id: 44, name: 'Zero zero', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Piacenza7' },
            { id: 45, name: 'Renegade', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Ancona5' },
            { id: 46, name: 'Stone', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Andria8' },
            { id: 1, name: 'Lipo', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Arezzo1' },
            { id: 2, name: 'Denny Lorusso', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Udine4' },
            { id: 3, name: 'Antonio Picerno', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Cesena6' },
            { id: 4, name: 'Bravo', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: 'Pescara3' }
        ];

        for (const user of users) {
            await queryRunner.query(
                `INSERT IGNORE INTO users (id, name, credits, total_points, created_at, team_password) VALUES (?, ?, ?, ?, ?, ?)`,
                [user.id, user.name, user.credits, user.total_points, user.created_at, user.team_password]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const userIds = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
        
        await queryRunner.query(
            `DELETE FROM users WHERE id IN (${userIds.map(() => '?').join(', ')})`,
            userIds
        );
    }

}
