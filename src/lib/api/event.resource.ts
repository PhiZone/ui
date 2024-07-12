import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, PatchElement, R } from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { PreservedFieldDto } from './event';

export interface EventResourceDto {
  dateCreated: string;
  description: string | null;
  divisionId: string;
  isAnonymous: boolean | null;
  label: string | null;
  resourceId: string;
  score: number | null;
  teamId: string | null;
  type: number;
  preservedFields?: (PreservedFieldDto | null)[];
}
export interface Filter extends FilterBase {
  rangeDivisionId?: string[];
  rangeType?: number[];
}

export interface ResourceListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  divisionId: string;
  resourceId: string;
}

export interface CreateOpts {
  resourceType: 'songs' | 'charts' | 'records' | 'tags';
  id: string;
  divisionId: string;
  type: number;
  label?: string;
  description?: string;
  isAnonymous?: boolean;
  score?: number;
  teamId?: string;
}

export default class EventResourceAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'event.resource.list',
    (opts: Filter): R<EventResourceDto[]> =>
      this.api.GET('/events/resources?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'event.resource.listAll',
    (opts: Filter): R<EventResourceDto[]> =>
      this.api.GET('/events/resources?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'event.resource.info',
    ({ divisionId, resourceId }: InfoOpts): R<EventResourceDto> =>
      this.api.GET(`/events/resources/${divisionId}/${resourceId}`),
  );

  listPreservedFields = createQueryCreator(
    'event.resource.preservedFields',
    (opts: Filter): R<(PreservedFieldDto | null)[][]> =>
      this.api.GET('/events/resources/preservedFields?' + stringifyFilter(opts)),
  );

  create({ resourceType, id, ...opts }: CreateOpts): R {
    return this.api.POST(`/${resourceType}/${id}/event`, opts);
  }

  update({ divisionId, resourceId }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/events/resources/${divisionId}/${resourceId}`, patch);
  }
}
