import type { FetchQueryOptions, QueryKey, QueryObserverOptions } from '@tanstack/svelte-query';
import queryString from 'query-string';

export interface ResponseDto<T> {
  code: null | string;
  data: T;
  dateAvailable: Date | null;
  errors: null;
  hasNext: boolean | null;
  hasPrevious: boolean | null;
  message: null | string;
  perPage: number | null;
  status: number;
  total: number | null;
}

export interface ListOptsBase {
  order?: string;
  desc?: boolean;
  page?: number;
  perPage?: number;
}

export function stringifyListOpts<T extends ListOptsBase>(opts: T, all = false) {
  const { order, desc, perPage, ...rest } = opts;
  return queryString.stringify(
    {
      order,
      desc,
      perPage: all ? -1 : perPage,
      ...rest,
    },
    { arrayFormat: 'comma', skipEmptyString: true }
  );
}

type Options<TQueryFnData = unknown, TQueryKey extends QueryKey = QueryKey> =
  | QueryObserverOptions<TQueryFnData, TQueryFnData, TQueryFnData, TQueryKey>
  | FetchQueryOptions<TQueryFnData, TQueryFnData, TQueryKey>;

export type QueryCreator<K extends QueryKey, O, T> = (
  opts: O,
  options?: Partial<Options<T, K>>
) => Options<T, K>;

export function createQueryCreator<K extends string, O, T>(
  key: K,
  func: (opts: O) => Promise<TypedResponse<T>>
): QueryCreator<[K, O], O, T> {
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
