import { User } from './user';

export enum Visibility {
  PUBLIC = 'PUBLIC',
  UNLISTED = 'UNLISTED',
  DRAFT = 'DRAFT',
  PRIVATE = 'PRIVATE'
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface JamTag {
  id: string;
  jamId: string;
  tagId: string;
  tag?: Tag;
}

export interface TeamInfo {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
}

export interface GameInfo {
  id: string;
  name: string;
  slug: string;
  isHighlighted?: boolean;
  submittedAt?: Date;
}

export interface JamCreator {
  id: string;
  username: string | null;
  avatarUrl?: string | null;
}

export interface Jam {
  id: string;
  name: string;
  slug: string;
  description?: string;
  theme?: string;
  logoUrl?: string;
  bannerUrl?: string;
  startDate: Date;
  endDate: Date;
  isFeatured: boolean;
  isTrending: boolean;
  visibility: Visibility;
  createdByUserId: string;
  createdBy?: JamCreator;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
}

export interface JamWithTeams extends Jam {
  teams?: TeamInfo[];
}

export interface JamWithGames extends Jam {
  games?: GameInfo[];
}

export interface JamWithTeamsAndGames extends Jam {
  teams?: TeamInfo[];
  games?: GameInfo[];
}

export interface CreateJamFormData {
  name: string;
  slug: string;
  description?: string;
  theme?: string;
  startDate: Date | string;
  endDate: Date | string;
  isFeatured?: boolean;
  visibility?: Visibility;
  tagIds?: string[];
}

export interface UpdateJamFormData extends Partial<CreateJamFormData> {
  logoUrl?: string;
  bannerUrl?: string;
  isTrending?: boolean;
}

export interface AttachTeamToJamData {
  teamId: string;
}

export interface SubmitGameToJamData {
  gameId: string;
} 