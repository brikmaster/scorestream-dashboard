export interface Game {
  gameId: number;
  homeTeamId: number;
  awayTeamId: number;
  dateTime: string;
  lastScore: {
    homeTeamScore: number;
    awayTeamScore: number;
    confidenceGrade: number;
    gameSegmentId: number;
  } | null;
  totalPosts: number;
  totalPictures: number;
  totalVideos: number;
  url: string;
}

export interface Team {
  teamId: number;
  teamName: string;
  mascot: string;
  imageUrl: string;
  city: string;
  state: string;
}

export interface Squad {
  squadId: number;
  display: string;
  gender: string;
  level: string;
}

export interface GameScore {
  gameScoreId: number;
  gameId: number;
  homeTeamScore: number;
  awayTeamScore: number;
  confidenceGrade: number;
  influencerScore: number;
  branchName: string;
  creatorUserId: number;
  dateCreated: string;
}

export interface ScoreStreamResponse {
  jsonrpc: string;
  result: {
    gameIds: number[];
    collections: {
      gameCollection: { list: Game[] };
      teamCollection: { list: Team[] };
      squadCollection: { list: Squad[] };
    };
    total: number;
  };
}

export interface ScoreStreamScoresResponse {
  jsonrpc: string;
  result: {
    gameScoreIds: number[];
    collections: {
      gameScoreCollection: { list: GameScore[] };
      userCollection?: {
        list: {
          userId: number;
          firstName: string;
          lastName: string;
          gameScoreTrustLevelId: number;
          userRankId: number;
        }[];
      };
    };
    total: number;
  };
}

export interface SearchParams {
  state: string;
  afterDateTime: string;
  beforeDateTime: string;
  sportName: string;
  squadId: number;
}

export enum SettlementTier {
  Verified = "Verified",
  Provisional = "Provisional",
  Unverified = "Unverified",
  NoData = "No Data",
}

export function getSettlementTier(grade: number | null): SettlementTier {
  if (grade === null || grade === 2) return SettlementTier.NoData;
  if (grade >= 80) return SettlementTier.Verified;
  if (grade >= 50) return SettlementTier.Provisional;
  return SettlementTier.Unverified;
}

export const TIER_COLORS: Record<SettlementTier, string> = {
  [SettlementTier.Verified]: "#10B981",
  [SettlementTier.Provisional]: "#F59E0B",
  [SettlementTier.Unverified]: "#EF4444",
  [SettlementTier.NoData]: "#6B7280",
};
