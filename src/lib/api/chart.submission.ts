import { serialize } from 'object-to-formdata';
import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';
import type { CollaborationDto } from './collaboration';

export interface ChartSubmissionDto {
  accessibility: number;
  admissionStatus: number;
  authorName: string;
  dateCreated: Date;
  dateUpdated: Date;
  dateVoted: Date | null;
  description: null | string;
  difficulty: number;
  file: string;
  format: number;
  id: string;
  illustration: null | string;
  illustrator: null | string;
  isRanked: boolean;
  level: null | string;
  levelType: number;
  noteCount: number;
  ownerId: number;
  representationId: null | string;
  songId: null | string;
  songSubmissionId: null | string;
  status: number;
  title: null | string;
  volunteerStatus: number;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  rangeOwnerId?: number[];
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
  Description?: string | undefined;
  Difficulty: number;
  File: File;
  Illustration?: File | undefined;
  Illustrator?: string | undefined;
  IsRanked: boolean;
  Level?: string | undefined;
  LevelType: number;
  SongId?: string | undefined;
  SongSubmissionId?: string | undefined;
  Title?: string | undefined;
}

// delete
export interface DeleteOpts {
  id: string;
}

export default class ChartSubmissionAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'chart.submission.list',
    (opts: Filter): R<ChartSubmissionDto[]> =>
      this.api.GET('/studio/charts?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'chart.submission.listAll',
    (opts: Filter): R<ChartSubmissionDto[]> =>
      this.api.GET('/studio/charts?' + stringifyFilter(opts, true)),
  );

  listAllCollaborations = createQueryCreator(
    'collaboration.list',
    ({ id }: InfoOpts): R<CollaborationDto[]> =>
      this.api.GET(`/collaborations?all=true&rangeSubmissionId=${id}`),
  );

  info = createQueryCreator(
    'chart.submission.info',
    ({ id }: InfoOpts): R<ChartSubmissionDto> => this.api.GET(`/studio/charts/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/studio/charts', serialize(opts));
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/studio/charts/${id}`, patch);
  }

  updateChart({ id, ...rest }: FileUpdateOpts): R {
    return this.api.PATCH(`/studio/charts/${id}/file`, serialize(rest));
  }

  delete(opts: DeleteOpts): R {
    return this.api.DELETE(`/studio/charts/${opts.id}`);
  }
}
