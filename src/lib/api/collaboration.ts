import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface CollaborationDto {
  dateCreated: Date;
  id: string;
  inviteeId: number;
  inviterId: number;
  position: null | string;
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
  position?: null | string;
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

  review({ id, ...rest }: ReviewOpts): R {
    return this.api.POST(`/collaborations/${id}/review`, rest);
  }

  delete({ id }: InfoOpts): R {
    return this.api.DELETE(`/collaborations/${id}`);
  }
}
