import { serialize } from 'object-to-formdata';

import type API from '.';
import type { SongDto, SongSubmissionDto } from '.';
import type { CollaborationDto } from './collaboration';
import type { EventDivisionDto, EventTeamDto } from './event';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';

import ChartAssetSubmissionAPI from './chart.submission.asset';
import { createQueryCreator, stringifyFilter } from './common';

export interface ChartSubmissionDto {
  accessibility: number;
  admissionStatus: number;
  authorName: string;
  dateCreated: string;
  dateFileUpdated: string;
  dateUpdated: string;
  dateVoted: string | null;
  description: string | null;
  difficulty: number;
  file: string;
  format: number;
  id: string;
  illustration: string | null;
  illustrator: string | null;
  isRanked: boolean;
  level: string | null;
  levelType: number;
  noteCount: number;
  ownerId: number;
  representationId: string | null;
  song: SongDto | null;
  songId: string | null;
  songSubmission: SongSubmissionDto | null;
  songSubmissionId: string | null;
  status: number;
  tags: string[];
  title: string | null;
  volunteerStatus: number;
}

export interface EventParticipationInfoDto {
  division?: EventDivisionDto;
  team?: EventTeamDto;
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
  File: Blob;
  Illustration?: Blob | undefined;
  Illustrator?: string | undefined;
  IsRanked: boolean;
  Level?: string | undefined;
  LevelType: number;
  SongId?: string | undefined;
  SongSubmissionId?: string | undefined;
  Tags: string[];
  Title?: string | undefined;
}

// delete
export interface DeleteOpts {
  id: string;
}

export default class ChartSubmissionAPI {
  constructor(private api: API) {
    this.asset = new ChartAssetSubmissionAPI(api);
  }

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

  checkEvent = createQueryCreator(
    'chart.submission.checkEvent',
    ({ strings, userId }: { strings: string[]; userId: number }): R<EventParticipationInfoDto> =>
      this.api.POST(`/studio/charts/checkEvent?userId=${userId}`, { strings }),
  );

  asset;
}
