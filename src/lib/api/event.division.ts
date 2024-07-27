import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { EventTeamDto, ReservedFieldDto } from './event';
import queryString from 'query-string';
import type { ChartDto, RecordDto, SongDto } from '.';
import type { TagDto } from './tag';

export interface EventDivisionDto {
  accessibility: number;
  anonymization: boolean;
  dateCreated: string;
  dateEnded: string;
  dateLiked: string | null;
  dateStarted: string;
  dateUnveiled: string;
  description: string | null;
  entryCount: number;
  eventId: string;
  id: string;
  illustration: string | null;
  illustrator: string | null;
  isHidden: boolean;
  isLocked: boolean;
  likeCount: number;
  maxParticipantPerTeamCount: number | null;
  maxSubmissionCount: number | null;
  maxTeamCount: number | null;
  minParticipantPerTeamCount: number | null;
  minSubmissionCount: number | null;
  minTeamCount: number | null;
  ownerId: number;
  status: number;
  suggestedEntrySearch: string | null;
  subtitle: string | null;
  tagId: string | null;
  team: EventTeamDto | null;
  teamCount: number;
  title: string;
  type: number;
}

export interface SongPromptDto extends SongDto {
  eventDescription: string | null;
  label: string | null;
}

export interface ChartPromptDto extends ChartDto {
  eventDescription: string | null;
  label: string | null;
}

export interface Filter extends PublicResourceFilterBase {
  containsSubtitle?: string;
  equalsSubtitle?: string;
}

export interface DivisionListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  id: string;
}

export interface ResourceFilter extends InfoOpts, FilterBase {}

export interface LeaderboardOpts extends InfoOpts {
  topRange?: number;
  neighborhoodRange?: number;
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

export interface ReservedFieldOpts {
  type: 'resources' | 'teams';
  id: string;
  index: number;
  content: string | null;
}

export default class EventDivisionAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'event.division.list',
    (opts: Filter): R<EventDivisionDto[]> =>
      this.api.GET('/events/divisions?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'event.division.listAll',
    (opts: Filter): R<EventDivisionDto[]> =>
      this.api.GET('/events/divisions?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'event.division.info',
    ({ id }: InfoOpts): R<EventDivisionDto> => this.api.GET(`/events/divisions/${id}`),
  );

  listReservedFields = createQueryCreator(
    'event.division.reservedFields',
    ({ id }: InfoOpts): R<(ReservedFieldDto | null)[]> =>
      this.api.GET(`/events/divisions/${id}/reservedFields`),
  );

  leaderboard = createQueryCreator(
    'event.division.leaderboard',
    ({ id, ...rest }: LeaderboardOpts): R<EventTeamDto[]> =>
      this.api.GET(`/events/divisions/${id}/leaderboard?` + queryString.stringify(rest)),
  );

  listSongPrompts = createQueryCreator(
    'event.division.prompts.songs',
    ({ id, ...rest }: ResourceFilter): R<SongDto[]> =>
      this.api.GET(`/events/divisions/${id}/prompts/songs?` + stringifyFilter(rest)),
  );

  listChartPrompts = createQueryCreator(
    'event.division.prompts.charts',
    ({ id, ...rest }: ResourceFilter): R<ChartDto[]> =>
      this.api.GET(`/events/divisions/${id}/prompts/charts?` + stringifyFilter(rest)),
  );

  listTags = createQueryCreator(
    'event.division.tags',
    ({ id, ...rest }: ResourceFilter): R<TagDto[]> =>
      this.api.GET(`/events/divisions/${id}/tags?` + stringifyFilter(rest)),
  );

  listAllTags = createQueryCreator(
    'event.division.tagsAll',
    ({ id, ...rest }: ResourceFilter): R<TagDto[]> =>
      this.api.GET(`/events/divisions/${id}/tags?` + stringifyFilter(rest, true)),
  );

  listSongEntries = createQueryCreator(
    'event.division.entries.songs',
    ({ id, ...rest }: ResourceFilter): R<SongDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/songs?` + stringifyFilter(rest)),
  );

  listChartEntries = createQueryCreator(
    'event.division.entries.charts',
    ({ id, ...rest }: ResourceFilter): R<ChartDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/charts?` + stringifyFilter(rest)),
  );

  listRecordEntries = createQueryCreator(
    'event.division.entries.records',
    ({ id, ...rest }: ResourceFilter): R<RecordDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/records?` + stringifyFilter(rest)),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/events/divisions', serialize(opts));
  }

  updateReservedField({ type, id, index, ...rest }: ReservedFieldOpts): R {
    return this.api.POST(`/events/${type}/${id}/reservedFields/${index}`, rest);
  }
}
