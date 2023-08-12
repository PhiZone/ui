import queryString from 'query-string';
import type { RecordDto } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order?: 'ownerId' | 'score' | 'accuracy' | 'rks' | 'stdDeviation' | 'dateCreated';
  rangeId?: string[];
  rangeChartId?: string[];
  rangeOwnerId?: number[];
}

// info
export interface InfoOpts {
  id: string;
}

export default class RecordAPI {
  constructor(private api: API) {}

  list = createQueryCreator('record.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<RecordDto[]>>('/records?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('record.listAll', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<RecordDto[]>>('/records?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('record.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<RecordDto>>(`/records/${id}?` + queryString.stringify(rest));
  });
}
