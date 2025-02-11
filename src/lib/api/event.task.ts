import type API from '.';
import type { FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface EventTaskDto {
  code: string | null;
  dateCreated: string;
  dateExecuted: string | null;
  dateUpdated: string;
  description: string;
  divisionId: string;
  id: string;
  isHidden: boolean;
  name: string;
  type: number;
}

export interface Filter extends FilterBase {
  containsName?: string;
  equalsName?: string;
  rangeDivisionId?: string[];
  rangeType?: number[];
}

export interface TaskListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  id: string;
}

export interface CreateOpts {
  divisionId: string;
  isHidden: boolean;
  name: string;
  type: number;
  description: string;
  dateExecuted?: Date;
  code?: string;
}

export default class EventTaskAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'event.task.list',
    (opts: Filter): R<EventTaskDto[]> => this.api.GET('/events/tasks?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'event.task.listAll',
    (opts: Filter): R<EventTaskDto[]> =>
      this.api.GET('/events/tasks?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'event.task.info',
    ({ id }: InfoOpts): R<EventTaskDto> => this.api.GET(`/events/tasks/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/events/tasks', opts);
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/events/tasks/${id}`, patch);
  }
}
