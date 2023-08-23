import { serialize } from 'object-to-formdata';
import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FilterBase, R } from './types';

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
  status: number;
  title: null | string;
}

// list
export interface Filter extends FilterBase {
  order?: 'title' | 'authorName' | 'illustrator' | 'duration' | 'ownerId' | 'dateCreated';
  rangeId?: string[];
  rangeOwnerId?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  accessibility: number;
  authorName: null | string;
  bpm: number;
  description: null | string;
  duration: string;
  edition: null | string;
  editionType: number;
  file: Blob;
  illustration: Blob;
  illustrator: string;
  license: null | string;
  lyrics: null | string;
  maxBpm: number;
  minBpm: number;
  offset: number;
  originalityProof: null | Blob;
  previewEnd: string;
  previewStart: string;
  title: null | string;
}

// delete
export interface DeleteOpts {
  id: string;
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

  info = createQueryCreator(
    'song.submission.info',
    ({ id }: InfoOpts): R<SongSubmissionDto> => this.api.GET(`/studio/songs/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/studio/songs/', serialize(opts));
  }

  delete(opts: DeleteOpts): R {
    return this.api.DELETE(`/studio/charts/${opts.id}`);
  }
}
