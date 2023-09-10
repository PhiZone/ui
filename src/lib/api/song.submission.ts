import { serialize } from 'object-to-formdata';
import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';
import type { CollaborationDto } from './collaboration';

export interface SongSubmissionDto {
  accessibility: number;
  authorName: string;
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
  title: string;
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
    ({ id }: InfoOpts): R<CollaborationDto[]> =>
      this.api.GET(`/collaborations?all=true&rangeSubmissionId=${id}`),
  );

  info = createQueryCreator(
    'song.submission.info',
    ({ id }: InfoOpts): R<SongSubmissionDto> => this.api.GET(`/studio/songs/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/studio/songs', serialize(opts));
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/studio/songs/${id}`, patch);
  }

  updateFile(type: string, { id, ...rest }: FileUpdateOpts): R {
    return this.api.PATCH(`/studio/songs/${id}/${type}`, serialize(rest));
  }

  delete(opts: DeleteOpts): R {
    return this.api.DELETE(`/studio/songs/${opts.id}`);
  }

  review({ id, ...rest }: ReviewOpts): R {
    console.log(rest);
    return this.api.POST(`/studio/songs/${id}/review`, rest);
  }
}
