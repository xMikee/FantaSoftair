export class BulkUpdateScoreDto {
  updates: Array<{
    playerId: number;
    points: number;
    description?: string;
    gameEventId: number;
  }>;
}