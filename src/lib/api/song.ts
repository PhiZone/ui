import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, R } from './types';
import type { ChapterAdmitterDto } from './chapter';
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

export interface SongAdmitteeDto extends SongDto {
  label: null | string;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  containsTitle?: string;
  equalsTitle?: string;
  minEditionType?: number;
  maxEditionType?: number;
  rangeEditionType?: number[];
  containsEdition?: string;
  equalsEdition?: string;
  containsAuthorName?: string;
  equalsAuthorName?: string;
  containsIllustrator?: string;
  equalsIllustrator?: string;
  rangeOwnerId?: number[];
  rangeAccessibility?: number[];
  minDuration?: number;
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

export interface AdmissionCreateOpts extends InfoOpts {
  admitterId: string;
  label?: string;
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
    'song.listAllAdmitters',
    ({ id, ...rest }: AdmissionListOpts): R<ChapterAdmitterDto[]> =>
      this.api.GET(`/songs/${id}/chapters?` + stringifyFilter(rest, true)),
  );

  info = createQueryCreator(
    'song.info',
    ({ id }: InfoOpts): R<SongDto> => this.api.GET(`/songs/${id}`),
  );

  createAdmission({ id, ...rest }: AdmissionCreateOpts): R {
    return this.api.POST(`/songs/${id}/chapters`, rest);
  }

  submission;
}
