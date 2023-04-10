import type { FetchQueryOptions, QueryKey, QueryObserverOptions } from '@tanstack/svelte-query';
import queryString from 'query-string';

// export interface CommonError extends Record<string, string | string[] | undefined> {
export interface CommonError {
  detail?: string;
}

// export interface RecorderRequestError extends CommonError {
//   chart?: string[];
//   difficulty?: string[];
//   illustration?: string[];
//   level?: string[];
//   name?: string[];
//   note_size?: string[];
//   resolution?: string[];
//   song?: string[];
//   total_score?: string[];
//   charter?: string[];
//   illustrator?: string[];
//   composer?: string[];
//   music_volume?: string[];
//   hitsound_volume?: string[];
//   tip?: string[];
//   avatar?: string[];
//   username?: string[];
//   rks?: string[];
//   challenge_color?: string[];
//   challenge_difficulty?: string[];
//   addition?: string[];
//   config?: string[];
// }

// export interface SongSubmissionError extends CommonError {
//   name?: string[];
//   song?: string[];
//   edition?: string[];
//   illustration?: string[];
//   composer?: string[];
//   illustrator?: string[];
//   bpm?: string[];
//   offset?: string[];
//   preview_start?: string[];
//   preview_end?: string[];
//   description?: string[];
//   chapters?: string[];
// }

// export interface ChartSubmissionError extends CommonError {
//   song?: string[];
//   song_upload?: string[];
//   chart?: string[];
//   level_type?: string[];
//   level?: string[];
//   difficulty?: string[];
//   description?: string[];
//   charter?: string[];
//   event_part?: string[];
// }

export interface PagedResults<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListOptsBase {
  order_by?: string;
  order?: 'asc' | 'desc';
  page?: number;
}

export function stringifyListOpts<T extends ListOptsBase>(opts: T, all = false) {
  const { order_by, order, ...rest } = opts;
  return queryString.stringify(
    {
      order: order_by ? (order === 'desc' ? '-' : '') + order_by : undefined,
      ...rest,
      pagination: all ? 0 : undefined,
    },
    { arrayFormat: 'comma', skipEmptyString: true }
  );
}

type Options<TQueryFnData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey> =
  | QueryObserverOptions<TQueryFnData, TError, TQueryFnData, TQueryFnData, TQueryKey>
  | FetchQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>;

export type QueryCreator<K extends QueryKey, O, T, E> = (
  opts: O,
  options?: Partial<Options<T, CommonError, K>>
) => Options<T, E, K>;

export function createQueryCreator<K extends string, O, T>(
  key: K,
  func: (opts: O) => Promise<TypedResponse<T, CommonError>>
): QueryCreator<[K, O], O, T, CommonError> {
  return (opts, options) => ({
    queryKey: [key, opts],
    queryFn: async () => {
      const resp = await func(opts);
      if (!resp.ok) throw await resp.json();
      if (resp.status === 204) return {} as T;
      return await resp.json();
    },
    ...options,
  });
}
