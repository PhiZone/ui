import type { ChartSubmission } from '$lib/models';
import { serialize } from 'object-to-formdata';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'level' | 'song';
  id?: number | number[];
  level?: string | string[];
  song?: number | number[];
  song_upload?: number | number[];
  status?: number | number[];
  uploader?: number | number[];
  representation?: string;
  highest_difficulty?: number;
  lowest_difficulty?: number;
  highest_note_count?: number;
  lowest_note_count?: number;
}

// info
export interface InfoOpts {
  id: number;
}

// upload
export interface UploadOpts {
  chart: Blob;
  level: string;
  difficulty: number;
  description?: string;
  charter: number;
  // notes: number;
  song?: number;
  song_upload?: number;
}

// modify
export interface ModifyOpts {
  id: number;
  chart?: Blob;
  level?: string;
  difficulty?: number;
  description?: string;
  charter?: string;
  // notes?: number;
  song?: number;
  song_upload?: number;
}

// delete
export interface DelOpts {
  id: number;
}

export default class ChartSubmissionAPI {
  constructor(private api: API) {}

  list = createQueryCreator('chart.submission.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<ChartSubmission>>(
      '/chart_uploads/?' + stringifyListOpts(opts)
    );
  });

  listAll = createQueryCreator('chart.submission.listAll', (opts: ListOpts) => {
    return this.api.GET<ChartSubmission[]>('/chart_uploads/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('chart.submission.info', (opts: InfoOpts) => {
    return this.api.GET<ChartSubmission>(`/chart_uploads/${opts.id}`);
  });

  upload(opts: UploadOpts) {
    return this.api.POST<FormData, void>('/chart_uploads/', serialize(opts));
  }

  modify(opts: ModifyOpts) {
    const { id, ...rest } = opts;
    return this.api.PATCH<FormData | typeof rest, void>(
      `/chart_uploads/${id}/`,
      rest.chart ? serialize(rest) : rest
    );
  }

  del(opts: DelOpts) {
    return this.api.DELETE<void>(`/chart_uploads/${opts.id}`);
  }
}
