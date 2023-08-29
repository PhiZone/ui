import queryString from 'query-string';
import { stringifyFilter, createQueryCreator } from './common';
// import ChartSubmissionAPI from './chart.submission';
import type { Accessibility, FilterBase, R } from './types';
import type API from '.';
import ChartSubmissionAPI from './chart.submission';

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
  authorName: string;
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
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
  ownerId: number;
  playCount: number;
  rating: number;
  ratingOnArrangement: number;
  ratingOnConcord: number;
  ratingOnCreativity: number;
  ratingOnFeel: number;
  ratingOnImpression: number;
  ratingOnVisualEffects: number;
  score: number;
  songId: string;
  title: string | null;
}

// list
export interface Filter extends FilterBase {
  order?:
    | 'dateCreated'
    | 'dateUpdated'
    | 'ownerId'
    | 'authorName'
    | 'level'
    | 'ranked'
    | 'difficulty'
    | 'noteCount'
    | 'score'
    | 'rating';
  rangeId?: string[];
  rangeSongId?: string[];
  rangeOwnerId?: number[];
  rangeAccessibility?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

export default class ChartAPI {
  constructor(private api: API) {
    this.submission = new ChartSubmissionAPI(api);
  }

  list = createQueryCreator(
    'chart.list',
    (opts: Filter): R<ChartDto[]> => this.api.GET('/charts?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'chart.listAll',
    (opts: Filter): R<ChartDto[]> => this.api.GET('/charts?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'chart.info',
    ({ id, ...rest }: InfoOpts): R<ChartDto> =>
      this.api.GET(`/charts/${id}?` + queryString.stringify(rest)),
  );

  submission;
}
