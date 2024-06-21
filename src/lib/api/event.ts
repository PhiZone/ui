import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type { EventDivisionDto } from './event.division';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { UserDto } from '.';
import EventDivisionAPI from './event.division';
import EventTeamAPI from './event.team';
import EventTaskAPI from './event.task';

export interface EventDto {
  accessibility: number;
  dateCreated: Date;
  dateLiked: Date | null;
  dateUnveiled: Date;
  dateUpdated: Date;
  description: null | string;
  divisions: DivisionDto[];
  hosts: HostDto[];
  id: string;
  illustration: string;
  illustrator: string;
  isHidden: boolean;
  isLocked: boolean;
  likeCount: number;
  ownerId: number;
  subtitle: string | null;
  title: string;
}

export interface EventResourceDto {
  dateCreated: Date;
  description: null | string;
  divisionId: string;
  isAnonymous: boolean | null;
  label: null | string;
  resourceId: string;
  teamId: null | string;
  type: number;
}

export interface DivisionDto {
  status: number;
  subtitle: null | string;
  title: string;
  type: number;
}

export interface HostDto extends UserDto {
  position: null | string;
}

export interface Filter extends PublicResourceFilterBase {
  containsSubtitle?: string;
  equalsSubtitle?: string;
}

export interface ResourceFilter extends FilterBase {
  rangeDivisionId?: string[];
  rangeType?: number[];
  rangeTeamId?: string[];
}

export interface DivisionListFilter extends FilterBase {
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

export default class EventAPI {
  constructor(private api: API) {
    this.division = new EventDivisionAPI(api);
    this.team = new EventTeamAPI(api);
    this.task = new EventTaskAPI(api);
  }

  list = createQueryCreator(
    'event.list',
    (opts: Filter): R<EventDto[]> => this.api.GET('/events?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'event.listAll',
    (opts: Filter): R<EventDto[]> => this.api.GET('/events?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'event.info',
    ({ id }: InfoOpts): R<EventDto> => this.api.GET(`/events/${id}`),
  );

  listDivisions = createQueryCreator(
    'event.listDivisions',
    ({ id, ...rest }: DivisionListFilter): R<EventDivisionDto[]> =>
      this.api.GET(`/events/${id}/divisions?` + stringifyFilter(rest, true)),
  );

  listResources = createQueryCreator(
    'event.resource.list',
    (opts: ResourceFilter): R<EventResourceDto[]> =>
      this.api.GET('/events/resources?' + stringifyFilter(opts)),
  );

  listAllResources = createQueryCreator(
    'event.resource.listAll',
    (opts: ResourceFilter): R<EventResourceDto[]> =>
      this.api.GET('/events/resources?' + stringifyFilter(opts, true)),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/events', serialize(opts));
  }

  division;
  team;
  task;
}
