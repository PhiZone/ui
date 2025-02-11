import type API from '.';
import type { FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface CollaborationDto {
  dateCreated: string;
  id: string;
  inviteeId: number;
  inviterId: number;
  position: string | null;
  status: number;
  submissionId: string;
}

export interface Filter extends FilterBase {
  containsPosition?: string;
  equalsPosition?: string;
  rangeInviterId?: number[];
  rangeInviteeId?: number[];
  rangeSubmissionId?: string[];
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  type: 'songs' | 'charts';
  id: string;
  inviteeId: number;
  position?: string | null;
}

// review
export interface ReviewOpts {
  id: string;
  approve: boolean;
}

export default class CollaborationAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'collaboration.list',
    (opts: Filter): R<CollaborationDto[]> =>
      this.api.GET('/collaborations?' + stringifyFilter(opts)),
  );

  info = createQueryCreator(
    'collaboration.info',
    ({ id }: InfoOpts): R<CollaborationDto> => this.api.GET(`/collaborations/${id}`),
  );

  create({ type, id, ...rest }: CreateOpts): R {
    return this.api.POST(`/studio/${type}/${id}/collaborations`, rest);
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/collaborations/${id}`, patch);
  }

  review({ id, ...rest }: ReviewOpts): R {
    return this.api.POST(`/collaborations/${id}/review`, rest);
  }

  delete({ id }: InfoOpts): R {
    return this.api.DELETE(`/collaborations/${id}`);
  }
}
