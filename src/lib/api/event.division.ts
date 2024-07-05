import { stringifyFilter, createQueryCreator } from './common';
import type { Accessibility, FilterBase, PublicResourceFilterBase, R } from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { EventTeamDto } from './event.team';
import queryString from 'query-string';
import type { ChartDto, RecordDto, SongDto } from '.';
import type { TagDto } from './tag';
import type { PreservedFieldDto } from './event';

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

export interface PreservedFieldOpts {
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

  listPreservedFields = createQueryCreator(
    'event.division.preservedFields',
    ({ id }: InfoOpts): R<(PreservedFieldDto | null)[]> =>
      this.api.GET(`/events/divisions/${id}/preservedFields`),
  );

  leaderboard = createQueryCreator(
    'event.division.leaderboard',
    ({ id, ...rest }: LeaderboardOpts): R<EventTeamDto[]> =>
      this.api.GET(`/events/divisions/${id}/leaderboard?` + queryString.stringify(rest)),
  );

  listSongPrompts = createQueryCreator(
    'event.division.prompts.songs',
    ({ id, ...rest }: InfoOpts): R<SongDto[]> =>
      this.api.GET(`/events/divisions/${id}/prompts/songs?` + queryString.stringify(rest)),
  );

  listChartPrompts = createQueryCreator(
    'event.division.prompts.charts',
    ({ id, ...rest }: InfoOpts): R<ChartDto[]> =>
      this.api.GET(`/events/divisions/${id}/prompts/charts?` + queryString.stringify(rest)),
  );

  listTags = createQueryCreator(
    'event.division.tags',
    ({ id, ...rest }: InfoOpts): R<TagDto[]> =>
      this.api.GET(`/events/divisions/${id}/tags?` + queryString.stringify(rest)),
  );

  listSongEntries = createQueryCreator(
    'event.division.entries.songs',
    ({ id, ...rest }: InfoOpts): R<SongDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/songs?` + queryString.stringify(rest)),
  );

  listChartEntries = createQueryCreator(
    'event.division.entries.charts',
    ({ id, ...rest }: InfoOpts): R<ChartDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/charts?` + queryString.stringify(rest)),
  );

  listRecordEntries = createQueryCreator(
    'event.division.entries.records',
    ({ id, ...rest }: InfoOpts): R<RecordDto[]> =>
      this.api.GET(`/events/divisions/${id}/entries/records?` + queryString.stringify(rest)),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/events/divisions', serialize(opts));
  }

  updatePreservedField({ type, id, index, ...rest }: PreservedFieldOpts): R {
    return this.api.POST(`/events/${type}/${id}/preservedFields/${index}`, rest);
  }
}
