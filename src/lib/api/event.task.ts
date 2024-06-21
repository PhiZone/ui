import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';

export interface EventTaskDto {
  code: null | string;
  dateCreated: Date;
  dateExecuted: Date | null;
  dateUpdated: Date;
  description: null | string;
  divisionId: string;
  id: string;
  isHidden: boolean;
  name: string;
  type: number;
}

export interface Filter extends PublicResourceFilterBase {
  containsSubtitle?: string;
  equalsSubtitle?: string;
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
  Title: string;
  Subtitle?: string;
  Illustration: string;
  Illustrator: string;
  Description?: string;
  Accessibility: Accessibility;
  IsHidden: boolean;
  IsLocked: boolean;
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
    return this.api.POST('/events/tasks', serialize(opts));
  }
}
