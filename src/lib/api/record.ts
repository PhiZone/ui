import queryString from 'query-string';
import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface RecordDto {
  accuracy: number;
  applicationId: string;
  bad: number;
  chartId: string;
  dateCreated: Date;
  dateLiked: Date | null;
  goodEarly: number;
  goodJudgment: number;
  goodLate: number;
  id: string;
  isFullCombo: boolean;
  likeCount: number;
  maxCombo: number;
  miss: number;
  ownerId: number;
  perfect: number;
  perfectJudgment: number;
  position: number;
  rks: number;
  score: number;
  stdDeviation: number;
}

// list
export interface Filter extends FilterBase {
  order?: 'ownerId' | 'score' | 'accuracy' | 'rks' | 'stdDeviation' | 'dateCreated';
  rangeId?: string[];
  rangeChartId?: string[];
  rangeOwnerId?: number[];
}

export interface FilterChart extends Filter {
  chartId: string;
}

// info
export interface InfoOpts {
  id: string;
}

export default class RecordAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'record.list',
    (opts: Filter): R<RecordDto[]> => this.api.GET('/records?' + stringifyFilter(opts)),
  );

  listAll = createQueryCreator(
    'record.listAll',
    (opts: Filter): R<RecordDto[]> => this.api.GET('/records?' + stringifyFilter(opts, true)),
  );

  listChart = createQueryCreator(
    'record.listChart',
    ({ chartId, ...rest }: FilterChart): R<RecordDto[]> =>
      this.api.GET(`/chart/${chartId}/records?` + stringifyFilter(rest)),
  );

  info = createQueryCreator(
    'record.info',
    ({ id, ...rest }: InfoOpts): R<RecordDto> =>
      this.api.GET(`/records/${id}?` + queryString.stringify(rest)),
  );
}
