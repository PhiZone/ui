import queryString from 'query-string';
import { stringifyListOpts, type ListOptsBase, createQueryCreator, type Q } from './common';
import type API from '.';
import type { RecordDto } from '$lib/models';

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

  list = createQueryCreator('record.list', (opts: ListOpts): Q<RecordDto[]> => {
    return this.api.GET('/records?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('record.listAll', (opts: ListOpts): Q<RecordDto[]> => {
    return this.api.GET('/records?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('record.info', (opts: InfoOpts): Q<RecordDto> => {
    const { id, ...rest } = opts;
    return this.api.GET(`/records/${id}?` + queryString.stringify(rest));
  });
}
