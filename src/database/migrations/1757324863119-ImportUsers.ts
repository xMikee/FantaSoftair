import { MigrationInterface, QueryRunner } from "typeorm";

export class ImportUsers1757324863119 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const users = [
            { id: 5, name: 'Carlo Tedesco', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 6, name: 'Nicola Maino', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 7, name: 'Miki Braná', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 8, name: 'Filippo Tafuni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 9, name: 'Bartolo Diele', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 10, name: 'Antonio Petrara', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 11, name: 'Michele Farella', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 12, name: 'Marcantonio Dambrosio', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 13, name: 'Carlo Traetta', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 14, name: 'Francesco Perrucci', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 15, name: 'Michele Picerno', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 16, name: 'Antonio Clemente', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 17, name: 'Pasquale Tamborra', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 18, name: 'Vincenzo Rotunno', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 19, name: 'Michele Ardino', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 20, name: 'Sandro Squicciarini', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 21, name: 'Antonio Robortella', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 22, name: 'Giacomo Caserta', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 23, name: 'Vincenzo Cisterna', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 24, name: 'Antonio Denora', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 25, name: 'Francesco Tafuni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 26, name: 'Leonardo Di noya', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 27, name: 'Domenico Carone', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 28, name: 'Antonio Miglionico', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 29, name: 'Vincenzo Cicirelli', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 30, name: 'Giuseppe Baldini Anastasio', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 31, name: 'Michele Morgese', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 32, name: 'Andrea Lauriero', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 33, name: 'Nicola Colonna', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 34, name: 'Michele Caggiano', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 35, name: 'Eleonora Varone', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 36, name: 'Tommaso Rinaldi', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 37, name: 'Angelo Tragni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 38, name: 'Lorenzo Tritto', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 39, name: 'Giovanni Ragone', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 40, name: 'Saverio Leone', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 41, name: 'Angelo Ostuni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 42, name: 'Pasquale Tragni', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 43, name: 'Paolo Colonna', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 44, name: 'Vito Tafuno', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 45, name: 'Giuseppe Monitillo', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 46, name: 'Pietro Colonna', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 1, name: 'Giovanni Pepe', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 2, name: 'Denny Lorusso', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 3, name: 'Antonio Picerno', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' },
            { id: 4, name: 'Adriano Rizzo', credits: 80, total_points: 0, created_at: '2025-08-29 10:14:50', team_password: '1111' }
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
