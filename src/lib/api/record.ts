import type { ChartDto, UserDto } from '.';
import type API from '.';
import type { FilterBase, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface RecordDto {
  accuracy: number;
  applicationId: string;
  bad: number;
  chart?: ChartDto;
  chartId: string;
  dateCreated: string;
  dateLiked: string | null;
  goodEarly: number;
  goodJudgment: number;
  goodLate: number;
  id: string;
  isFullCombo: boolean;
  likeCount: number;
  maxCombo: number;
  miss: number;
  owner: UserDto | null;
  ownerId: number | null;
  perfect: number;
  perfectJudgment: number;
  position: number;
  rks: number;
  score: number;
  stdDeviation: number;
}

// list
export interface Filter extends FilterBase {
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

  info = createQueryCreator(
    'record.info',
    ({ id }: InfoOpts): R<RecordDto> => this.api.GET(`/records/${id}`),
  );
}
