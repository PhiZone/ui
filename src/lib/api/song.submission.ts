import { serialize } from 'object-to-formdata';

import type API from '.';
import type { CollaborationDto } from './collaboration';
import type { EventDivisionDto, EventTeamDto } from './event';
import type { SongRecognitionSummaryDto } from './submission';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface SongSubmissionDto {
  accessibility: number;
  authorName: string;
  bpm: number;
  dateCreated: string;
  dateFileUpdated: string;
  dateUpdated: string;
  description: string | null;
  duration: string;
  edition: string | null;
  editionType: number;
  file: string;
  id: string;
  illustration: string;
  illustrator: string;
  license: string | null;
  lyrics: string | null;
  maxBpm: number;
  message: string | null;
  minBpm: number;
  offset: number;
  originalityProof: string | null;
  ownerId: number;
  previewEnd: string;
  previewStart: string;
  recognitionSummary: SongRecognitionSummaryDto | null;
  representationId: string | null;
  reviewerId: number | null;
  status: number;
  tags: string[];
  title: string;
}

export interface EventParticipationInfoDto {
  division?: EventDivisionDto;
  team?: EventTeamDto;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  rangeOwnerId?: number[];
  rangeAccessibility?: number[];
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
  earliestDateUpdated?: Date;
  latestDateUpdated?: Date;
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
  Tags: string[];
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
  isLocked: boolean;
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
    return this.api.POST(`/studio/songs/${id}/review`, rest);
  }

  checkEvent = createQueryCreator(
    'song.submission.checkEvent',
    ({ strings, userId }: { strings: string[]; userId: number }): R<EventParticipationInfoDto> =>
      this.api.POST(`/studio/songs/checkEvent?userId=${userId}`, { strings }),
  );
}
