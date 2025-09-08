import { MigrationInterface, QueryRunner } from "typeorm";

export class ImportPlayers1757323826690 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const players = [
            { id: 1, name: 'ADMIN', base_value: 99999999, current_points: 0, yearly_points: 0, position: null, created_at: '2025-09-02 14:41:06' },
            { id: 11, name: 'Carlo Tedesco', base_value: 10, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 12, name: 'Nicola Maino', base_value: 12, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 13, name: 'Miki Braná', base_value: 12, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 14, name: 'Filippo Tafuni', base_value: 9, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 15, name: 'Bartolo Diele', base_value: 7, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 16, name: 'Antonio Petrara', base_value: 15, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 17, name: 'Michele Farella', base_value: 9, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 18, name: 'Marcantonio Dambrosio', base_value: 14, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 19, name: 'Carlo Traetta', base_value: 7, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 20, name: 'Francesco Perrucci', base_value: 6, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 21, name: 'Michele Picerno', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 22, name: 'Antonio Clemente', base_value: 7, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 23, name: 'Pasquale Tamborra', base_value: 2, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 24, name: 'Vincenzo Rotunno', base_value: 2, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 25, name: 'Michele Ardino', base_value: 10, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 26, name: 'Sandro Squicciarini', base_value: 9, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 27, name: 'Antonio Robortella', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 28, name: 'Giacomo Caserta', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 29, name: 'Vincenzo Cisterna', base_value: 6, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 30, name: 'Antonio Denora', base_value: 7, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 31, name: 'Francesco Tafuni', base_value: 5, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 32, name: 'Leonardo Di noya', base_value: 9, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 33, name: 'Domenico Carone', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 34, name: 'Antonio Miglionico', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 35, name: 'Vincenzo Cicirelli', base_value: 7, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 36, name: 'Giuseppe Baldini Anastasio', base_value: 2, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 37, name: 'Michele Morgese', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 38, name: 'Andrea Lauriero', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 39, name: 'Nicola Colonna', base_value: 5, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 40, name: 'Michele Caggiano', base_value: 3, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 41, name: 'Eleonora Varone', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 42, name: 'Tommaso Rinaldi', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 45, name: 'Giovanni Ragone', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 46, name: 'Saverio Leone', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 47, name: 'Angelo Ostuni', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 48, name: 'Pasquale Tragni', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 49, name: 'Stefano Maggio', base_value: 3, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 50, name: 'Claudio Lanza', base_value: 3, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 51, name: 'Paolo Colonna', base_value: 3, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 52, name: 'Vito Tafuno', base_value: 2, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 53, name: 'Giuseppe Monitillo', base_value: 2, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 54, name: 'Pietro Colonna', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 55, name: 'Giovanni Pepe', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 56, name: 'Denny Lorusso', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 57, name: 'Antonio Picerno', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 58, name: 'Adriano Rizzo', base_value: 1, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 10:11:57' },
            { id: 66, name: 'Lorenzo Tritto', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-08-29 14:52:47' },
            { id: 67, name: 'Angelo Tragni', base_value: 4, current_points: 0, yearly_points: 0, position: null, created_at: '2025-09-03 19:05:51' }
        ];

        for (const player of players) {
            await queryRunner.query(
                `INSERT IGNORE INTO players (id, name, base_value, current_points, yearly_points, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [player.id, player.name, player.base_value, player.current_points, player.yearly_points, player.position, player.created_at]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const playerIds = [1, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 66, 67];
        
        await queryRunner.query(
            `DELETE FROM players WHERE id IN (${playerIds.map(() => '?').join(', ')})`,
            playerIds
        );
    }

}
