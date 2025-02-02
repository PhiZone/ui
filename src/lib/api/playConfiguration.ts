import type API from '.';
import type { FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface PlayConfigurationDto {
  aspectRatio: number[] | null;
  backgroundBlur: number;
  backgroundLuminance: number;
  chartMirroring: number;
  chartOffset: number;
  dateCreated: string;
  fcApIndicator: boolean;
  goodJudgment: number;
  hitSoundVolume: number;
  id: string;
  musicVolume: number;
  name: string | null;
  noteSize: number;
  ownerId: number;
  perfectJudgment: number;
  simultaneousNoteHint: boolean;
}

// list
export interface Filter extends FilterBase {
  rangeId?: string[];
  rangeOwnerId?: number[];
  minPerfectJudgment?: number;
  maxPerfectJudgment?: number;
  rangePerfectJudgment?: number[];
  minGoodJudgment?: number;
  maxGoodJudgment?: number;
  rangeGoodJudgment?: number[];
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  aspectRatio?: number[];
  backgroundBlur: number;
  backgroundLuminance: number;
  chartMirroring: number;
  chartOffset: number;
  fcApIndicator: boolean;
  goodJudgment: number;
  hitSoundVolume: number;
  musicVolume: number;
  name?: string;
  noteSize: number;
  perfectJudgment: number;
  simultaneousNoteHint: boolean;
}

// delete
export interface DeleteOpts {
  id: string;
}

export default class PlayConfigurationAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'playConfiguration.list',
    (opts: Filter): R<PlayConfigurationDto[]> =>
      this.api.GET('/player/configurations?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'playConfiguration.listAll',
    (opts: Filter): R<PlayConfigurationDto[]> =>
      this.api.GET('/player/configurations?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'playConfiguration.info',
    ({ id }: InfoOpts): R<PlayConfigurationDto> => this.api.GET(`/player/configurations/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/player/configurations', opts);
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/player/configurations/${id}`, patch);
  }

  delete(opts: DeleteOpts): R {
    return this.api.DELETE(`/player/configurations/${opts.id}`);
  }
}
