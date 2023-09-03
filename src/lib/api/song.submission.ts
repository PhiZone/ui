import { serialize } from 'object-to-formdata';
import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FilterBase, R } from './types';
import queryString from 'query-string';
import type { CollaborationDto } from './collaboration';

export interface SongSubmissionDto {
  accessibility: number;
  authorName: null | string;
  bpm: number;
  dateCreated: Date;
  dateUpdated: Date;
  description: null | string;
  duration: string;
  edition: null | string;
  editionType: number;
  file: string;
  id: string;
  illustration: string;
  illustrator: string;
  license: null | string;
  lyrics: null | string;
  maxBpm: number;
  message: null | string;
  minBpm: number;
  offset: number;
  originalityProof: null | string;
  ownerId: number;
  previewEnd: string;
  previewStart: string;
  representationId: null | string;
  reviewerId: number | null;
  status: number;
  title: null | string;
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

// create
export interface CreateOpts {
  Accessibility: number;
  AuthorName: string;
  Bpm: number;
  Description?: string | undefined;
  Edition?: string | undefined;
  EditionType: number;
  File?: Blob | undefined;
  Illustration?: Blob | undefined;
  Illustrator: string;
  License?: Blob | undefined;
  Lyrics?: string | undefined;
  MaxBpm: number;
  MinBpm: number;
  Offset: number;
  OriginalityProof?: Blob | undefined;
  PreviewEnd: string;
  PreviewStart: string;
  Title: string;
}

// delete
export interface DeleteOpts {
  id: string;
}

// review
export interface ReviewOpts {
  id: string;
  status: number;
  isOriginal: boolean;
  isHidden: boolean;
  message?: string | undefined;
}

export default class SongSubmissionAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'song.submission.list',
    (opts: Filter): R<SongSubmissionDto[]> =>
      this.api.GET('/studio/songs?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'song.submission.listAll',
    (opts: Filter): R<SongSubmissionDto[]> =>
      this.api.GET('/studio/songs?' + stringifyFilter(opts, true)),
  );

  listAllCollaborations = createQueryCreator(
    'collaboration.list',
    ({ id }: InfoOpts): R<CollaborationDto[]> => this.api.GET(`/collaborations?rangeSubmissionId=${id}`),
  );

  info = createQueryCreator(
    'song.submission.info',
    ({ id }: InfoOpts): R<SongSubmissionDto> => this.api.GET(`/studio/songs/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/studio/songs', serialize(opts));
  }

  delete(opts: DeleteOpts): R {
    return this.api.DELETE(`/studio/songs/${opts.id}`);
  }

  review({ id, ...rest }: ReviewOpts): R {
    console.log(rest);
    return this.api.POST(`/studio/songs/${id}/review`, rest);
  }
}
