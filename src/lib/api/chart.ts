import queryString from 'query-string';

import type API from '.';
import type { RecordDto, SongDto } from '.';
import type { ChartAssetDto } from './chart.asset';
import type { CollectionAdmitterDto } from './collection';
import type { TagDto } from './tag';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';

import ChartAssetAPI from './chart.asset';
import ChartSubmissionAPI from './chart.submission';
import { createQueryCreator, stringifyFilter } from './common';

export enum ChartFormat {
  RpeJson,
  Pec,
  PhiZone,
  Phigrim,
  Unsupported,
}

export enum ChartLevel {
  EZ,
  HD,
  IN,
  AT,
  SP,
}

export interface ChartDto {
  accessibility: Accessibility;
  authorName: string | null;
  assets: ChartAssetDto[];
  commentCount: number;
  dateCreated: string;
  dateFileUpdated: string;
  dateLiked: string | null;
  dateUpdated: string;
  description: string | null;
  difficulty: number;
  file: string | null;
  format: ChartFormat;
  id: string;
  illustration: string | null;
  illustrator: string | null;
  isHidden: boolean;
  isLocked: boolean;
  isRanked: boolean;
  level: string;
  levelType: number;
  likeCount: number;
  noteCount: number;
  ownerId: number | null;
  playCount: number;
  rating: number;
  ratingOnArrangement: number;
  ratingOnConcord: number;
  ratingOnCreativity: number;
  ratingOnGameplay: number;
  ratingOnImpression: number;
  ratingOnVisualEffects: number;
  score: number;
  song: SongDto;
  songId: string;
  tags: TagDto[];
  title: string | null;
}

export interface ChartAdmitteeDto extends ChartDto {
  label: string | null;
}

// list
export interface Filter extends PublicResourceFilterBase {
  rangeId?: string[];
  rangeSongId?: string[];
  rangeOwnerId?: number[];
  rangeAccessibility?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

export interface ExtendedInfoOpts extends InfoOpts {
  includeAssets?: boolean;
}

export interface LeaderboardOpts extends InfoOpts {
  topRange?: number;
  neighborhoodRange?: number;
}

export interface AdmissionListOpts extends InfoOpts, FilterBase {
  rangeStatus?: number[];
  containsLabel?: string;
  equalsLabel?: string;
}

export interface AdmissionCreateOpts extends InfoOpts {
  admitterId: string;
  label?: string;
}

export interface PlayDto {
  chartId: string;
  configurationId: string;
  applicationId: string;
}

export interface PlayResponseDto {
  timestamp?: number;
  token?: string;
}

export default class ChartAPI {
  constructor(private api: API) {
    this.submission = new ChartSubmissionAPI(api);
    this.asset = new ChartAssetAPI(api);
  }

  list = createQueryCreator(
    'chart.list',
    (opts: Filter): R<ChartDto[]> => this.api.GET('/charts?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'chart.listAll',
    (opts: Filter): R<ChartDto[]> => this.api.GET('/charts?' + stringifyFilter(opts, true)),
  );

  listAllAdmitters = createQueryCreator(
    'chart.listAllAdmitters',
    ({ id, ...rest }: AdmissionListOpts): R<CollectionAdmitterDto[]> =>
      this.api.GET(`/charts/${id}/collections?` + stringifyFilter(rest, true)),
  );

  listTag = createQueryCreator(
    'chart.listTag',
    ({ id, ...rest }: InfoOpts & Filter): R<ChartDto[]> =>
      this.api.GET(`/tags/${id}/charts?` + stringifyFilter(rest)),
  );

  info = createQueryCreator(
    'chart.info',
    ({ id, ...rest }: ExtendedInfoOpts): R<ChartDto> =>
      this.api.GET(`/charts/${id}?` + queryString.stringify(rest)),
  );

  leaderboard = createQueryCreator(
    'chart.leaderboard',
    ({ id, ...rest }: LeaderboardOpts): R<RecordDto[]> =>
      this.api.GET(`/charts/${id}/leaderboard?` + queryString.stringify(rest)),
  );

  createAdmission({ id, ...rest }: AdmissionCreateOpts): R {
    return this.api.POST(`/charts/${id}/collections`, rest);
  }

  play(opts: PlayDto): R<PlayResponseDto> {
    return this.api.GET('/player/play?' + queryString.stringify(opts));
  }

  submission;
  asset;
}
