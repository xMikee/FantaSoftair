export class BatchUpdateScoresDto {
  gameEventId: number;
  scores: Array<{
    playerId: number;
    points: number;
    description?: string;
  }>;
}