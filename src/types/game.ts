export interface BuildInfo {
  id: string;
  version: string;
  platform: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

export interface PhotoInfo {
  id: string;
  url: string;
  isCover: boolean;
}

/**
 * DTO representing a game and its assets
 */
export interface GameDto {
  id: string;
  teamId: string;
  name: string;
  slug: string;
  visibility: string;
  contentRating: string;
  createdAt: string;
  updatedAt: string;
  builds: BuildInfo[];
  photos: PhotoInfo[];
} 