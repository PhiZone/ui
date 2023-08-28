import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, R } from './types';
import type { ChapterDto } from './chapter';
import type API from '.';
import SongSubmissionAPI from './song.submission';

export interface ChartLevelDto {
  count: number;
  levelType: number;
}

export interface SongDto {
  accessibility: Accessibility;
  authorName: string;
  bpm: number;
  chartLevels: ChartLevelDto[];
  commentCount: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUpdated: Date;
  description: null | string;
  duration: string;
  edition: null | string;
  editionType: number;
  file: string;
  id: string;
  illustration: string;
  illustrator: string;
  isHidden: boolean;
  isLocked: boolean;
  isOriginal: boolean;
  license: null | string;
  likeCount: number;
  lyrics: null | string;
  maxBpm: number;
  minBpm: number;
  offset: number;
  ownerId: number;
  previewEnd: string;
  previewStart: string;
  title: string;
}

export interface AdmissionDto<T, R> {
  admittee: T;
  admitter: R;
  dateCreated: Date;
  label: null | string;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface SongAdmitteeDto extends SongDto {
  label: null | string;
}

// list
export interface Filter extends FilterBase {
  order?: 'title' | 'authorName' | 'illustrator' | 'duration' | 'ownerId' | 'dateCreated';
  rangeId?: string[];
  rangeOwnerId?: number[];
  rangeAccessibility?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

export interface AdmissionListOpts extends InfoOpts, FilterBase {
  rangeStatus?: number[];
  containsLabel?: string;
  equalsLabel?: string;
}

export default class SongAPI {
  constructor(private api: API) {
    this.submission = new SongSubmissionAPI(api);
  }

  list = createQueryCreator(
    'song.list',
    (opts: Filter): R<SongDto[]> => this.api.GET('/songs?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'song.listAll',
    (opts: Filter): R<SongDto[]> => this.api.GET('/songs?' + stringifyFilter(opts, true)),
  );

  listAllAdmitters = createQueryCreator(
    'song.listAll',
    ({ id, ...rest }: AdmissionListOpts): R<AdmissionDto<SongDto, ChapterDto>[]> =>
      this.api.GET(`/songs/${id}/chapters?` + stringifyFilter(rest, true)),
  );

  info = createQueryCreator(
    'song.info',
    ({ id }: InfoOpts): R<SongDto> => this.api.GET(`/songs/${id}`),
  );

  submission;
}
