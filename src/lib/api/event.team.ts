import { serialize } from 'object-to-formdata';

import type API from '.';
import type { UserDto } from '.';
import type { ReservedFieldDto } from './event';
import type { CodeDto, FileUpdateOpts, FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

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
  reservedFields?: (ReservedFieldDto | null)[];
}

export interface ParticipantDto extends UserDto {
  position: string | null;
}

export interface EventTeamInviteDto {
  dateExpired: string;
  inviter: UserDto;
  team: EventTeamDto;
}

export interface Filter extends FilterBase {
  rangeDivisionId?: string[];
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

export interface InviteAcceptOpts {
  code: string;
  position: string;
}

export interface CreateOpts {
  Name: string;
  Icon: Blob | null;
  Description: string | null;
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

  listReservedFields = createQueryCreator(
    'event.team.reservedFields',
    (opts: Filter): R<(ReservedFieldDto | null)[][]> =>
      this.api.GET('/events/teams/reservedFields?' + stringifyFilter(opts)),
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
