import type API from '.';
import type { FilterBase, PatchElement, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface ServiceScriptDto {
  code: string;
  dateCreated: Date;
  dateUpdated: Date;
  description: string | null;
  id: string;
  name: string;
  parameters: string[];
  resourceId: string | null;
  targetType: number;
}

export interface Filter extends FilterBase {
  containsName?: string;
  equalsName?: string;
  rangeId?: string[];
  rangeResourceId?: string[];
  rangeTargetType?: number[];
}

export interface TaskListFilter extends FilterBase {
  id: string;
}

export interface InfoOpts {
  id: string;
}

export interface CreateOpts {
  resourceId?: string;
  name: string;
  targetType: number;
  code: string;
  description?: string;
  parameters: string[];
}

export interface UseOpts extends InfoOpts {
  parameters: Record<string, string>;
}

export interface ServiceResponseDto {
  message: string | null;
  redirectUri: string | null;
  type: number;
}

export default class ServiceScriptAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'service.list',
    (opts: Filter): R<ServiceScriptDto[]> => this.api.GET('/services?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'service.listAll',
    (opts: Filter): R<ServiceScriptDto[]> =>
      this.api.GET('/services?' + stringifyFilter(opts, true)),
  );

  info = createQueryCreator(
    'service.info',
    ({ id }: InfoOpts): R<ServiceScriptDto> => this.api.GET(`/services/${id}`),
  );

  create(opts: CreateOpts): R {
    return this.api.POST('/services', opts);
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/services/${id}`, patch);
  }

  use({ id, ...rest }: UseOpts): R<ServiceResponseDto> {
    return this.api.POST(`/services/${id}/use`, rest);
  }

  useOnResource(
    resourcePath: string,
    resourceId: string,
    { id, ...rest }: UseOpts,
  ): R<ServiceResponseDto> {
    return this.api.POST(`/${resourcePath}/${resourceId}/useService/${id}`, rest);
  }
}
