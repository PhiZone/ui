import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';
import { serialize } from 'object-to-formdata';

export interface ChartAssetDto {
  chartId: string;
  dateCreated: Date;
  dateUpdated: Date;
  file: string;
  id: string;
  name: string;
  ownerId: number;
  type: number;
}

// list
export interface Filter extends FilterBase {
  chartId: string;
  containsName?: string;
  equalsName?: string;
  rangeType?: number[];
  rangeId?: string[];
  rangeOwnerId?: number[];
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
}

// info
export interface InfoOpts {
  chartId: string;
  id: string;
}

// create
export interface CreateOpts {
  chartId: string;
  File: Blob;
  Name: string;
  Type: number;
}

export interface AssetFileUpdateOpts extends FileUpdateOpts {
  chartId: string;
}

// delete
export interface DeleteOpts {
  chartId: string;
  id: string;
}

export default class ChartAssetAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'chart.asset.list',
    ({ chartId, ...rest }: Filter): R<ChartAssetDto[]> =>
      this.api.GET(`/charts/${chartId}/assets?` + stringifyFilter(rest)),
  );

  listAll = createQueryCreator(
    'chart.asset.listAll',
    ({ chartId, ...rest }: Filter): R<ChartAssetDto[]> =>
      this.api.GET(`/charts/${chartId}/assets?` + stringifyFilter(rest, true)),
  );

  info = createQueryCreator(
    'chart.asset.info',
    ({ chartId, id }: InfoOpts): R<ChartAssetDto> =>
      this.api.GET(`/charts/${chartId}/assets/${id}`),
  );

  create({ chartId, ...rest }: CreateOpts): R {
    return this.api.POST(`/charts/${chartId}/assets`, serialize(rest));
  }

  update({ chartId, id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/charts/${chartId}/assets/${id}`, patch);
  }

  updateFile({ chartId, id, ...rest }: AssetFileUpdateOpts): R {
    return this.api.PATCH(`/charts/${chartId}/assets/${id}/file`, serialize(rest));
  }

  delete({ chartId, id }: DeleteOpts): R {
    return this.api.DELETE(`/charts/${chartId}/assets/${id}`);
  }
}
