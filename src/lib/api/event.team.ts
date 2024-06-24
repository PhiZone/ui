import { stringifyFilter, createQueryCreator } from './common';
import type {
  FileUpdateOpts,
  FilterBase,
  PatchElement,
  PublicResourceFilterBase,
  R,
} from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { UserDto } from '.';

export interface EventTeamDto {
  claimedParticipantCount: number;
  claimedSubmissionCount: number;
  dateCreated: string;
  dateLiked: string | null;
  description: string | null;
  divisionId: string;
  icon: string | null;
  id: string;
  likeCount: number;
  name: string;
  ownerId: number;
  participants: ParticipantDto[];
  position: number | null;
  score: number | null;
  status: number;
}

export interface ParticipantDto extends UserDto {
  position: string | null;
}

export interface EventTeamInviteDto {
  dateExpired: string;
  inviter: UserDto;
  team: EventTeamDto;
}

export interface Filter extends PublicResourceFilterBase {
  containsSubtitle?: string;
  equalsSubtitle?: string;
}

export interface TeamListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  id: string;
}

export interface ParticipantInfoOpts extends InfoOpts {
  participantId: number;
}

export interface CodeDto {
  code: string;
}

export interface InviteAcceptOpts {
  code: string;
  position: string;
}

export interface CreateOpts {
  Name: string;
  Icon?: Blob;
  Description?: string;
  ClaimedParticipantCount: number;
  ClaimedSubmissionCount: number;
  DivisionId: string;
}

export default class EventTeamAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'event.team.list',
    (opts: Filter): R<EventTeamDto[]> => this.api.GET('/events/teams?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'event.team.listAll',
    (opts: Filter): R<EventTeamDto[]> =>
      this.api.GET('/events/teams?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'event.team.info',
    ({ id }: InfoOpts): R<EventTeamDto> => this.api.GET(`/events/teams/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/events/teams', serialize(opts));
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/events/teams/${id}`, patch);
  }

  updateIcon({ id, ...rest }: FileUpdateOpts): R {
    return this.api.PATCH(`/events/teams/${id}/icon`, serialize(rest));
  }

  updateParticipant({ id, participantId }: ParticipantInfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/events/teams/${id}/participants/${participantId}`, patch);
  }

  infoInvite = createQueryCreator(
    'event.team.invite.info',
    ({ code }: CodeDto): R<EventTeamInviteDto> => this.api.GET(`/events/teams/invites/${code}`),
  );

  acceptInvite(opts: InviteAcceptOpts): R {
    return this.api.POST(`/events/teams/invites/${opts.code}/accept?position=${opts.position}`);
  }

  createInvite({ id }: InfoOpts): R<CodeDto> {
    return this.api.POST(`/events/teams/${id}/invite`);
  }
}
