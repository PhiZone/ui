import { serialize } from 'object-to-formdata';

import type API from '.';
import type { UserDto } from '.';
import type { EventDivisionDto } from './event.division';
import type {
  Accessibility,
  CodeDto,
  FilterBase,
  PatchElement,
  PublicResourceFilterBase,
  R,
} from './types';

import { createQueryCreator, stringifyFilter } from './common';
import EventDivisionAPI from './event.division';
import EventResourceAPI from './event.resource';
import EventTaskAPI from './event.task';
import EventTeamAPI from './event.team';

export interface EventDto {
  accessibility: number;
  dateCreated: string;
  dateLiked: string | null;
  dateUnveiled: string;
  dateUpdated: string;
  description: string | null;
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
  dateCreated: string;
  description: string | null;
  divisionId: string;
  isAnonymous: boolean | null;
  label: string | null;
  resourceId: string;
  teamId: string | null;
  type: number;
}

export interface DivisionDto {
  status: number;
  subtitle: string | null;
  title: string;
  type: number;
}

export interface ReservedFieldDto {
  index: number;
  content: string | null;
}

export interface HostDto extends UserDto {
  position: string | null;
}

export interface HostshipDto {
  eventId: string;
  isAdmin: boolean;
  isUnveiled: boolean;
  permissions: number[] | null;
  position: string | null;
  userId: number;
}

export interface EventHostInviteDto {
  code: string | null;
  dateExpired: string;
  event: EventDto;
  inviter: UserDto;
  isAdmin: boolean;
  isUnveiled: boolean;
  permissions: number[] | null;
  position: string | null;
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

export interface HostshipFilter extends FilterBase {
  rangeEventId?: string[];
  rangeUserId?: number[];
  isAdmin?: boolean;
  isUnveiled?: boolean;
  containsPosition?: string;
  equalsPosition?: string;
}

export interface DivisionListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  id: string;
}

export interface HostshipInfoOpts extends InfoOpts {
  userId: number;
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

export interface HostshipCreateOpts {
  eventId: string;
  isAdmin: boolean;
  isUnveiled: boolean;
  permissions: number[] | null;
  position: string | null;
  userId: number;
}

export interface EventHostInviteOpts extends InfoOpts {
  isAdmin: boolean;
  isUnveiled: boolean;
  permissions?: number[] | null;
  position?: string | null;
}

export default class EventAPI {
  constructor(private api: API) {
    this.division = new EventDivisionAPI(api);
    this.team = new EventTeamAPI(api);
    this.task = new EventTaskAPI(api);
    this.resource = new EventResourceAPI(api);
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

  listHostships = createQueryCreator(
    'event.hostship.list',
    (opts: HostshipFilter): R<HostshipDto[]> =>
      this.api.GET('/events/hostships?' + stringifyFilter(opts)),
  );

  listAllHostships = createQueryCreator(
    'event.hostship.listAll',
    (opts: HostshipFilter): R<HostshipDto[]> =>
      this.api.GET('/events/hostships?' + stringifyFilter(opts, true)),
  );

  createHostship(opts: HostshipCreateOpts): R {
    return this.api.POST('/events/hostships', opts);
  }

  updateHostship({ id, userId }: HostshipInfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/events/hostships/${id}/${userId}`, patch);
  }

  infoInvite = createQueryCreator(
    'event.team.invite.info',
    ({ code }: CodeDto): R<EventHostInviteDto> => this.api.GET(`/events/hostships/invites/${code}`),
  );

  acceptInvite({ code }: CodeDto): R {
    return this.api.POST(`/events/hostships/invites/${code}/accept`);
  }

  createInvite({ id, ...rest }: EventHostInviteOpts): R<CodeDto> {
    return this.api.POST(`/events/${id}/invite`, rest);
  }

  division;
  team;
  task;
  resource;
}

export type { EventDivisionDto } from './event.division';
export type { EventTaskDto } from './event.task';
export type { EventTeamDto } from './event.team';
