import { PAGINATION_PER_PAGE } from '$lib/constants';
import type { FetchQueryOptions, QueryKey, QueryObserverOptions } from '@tanstack/svelte-query';
import camelcaseKeys from 'camelcase-keys';
import queryString from 'query-string';
import {
  type FilterBase,
  type ResponseDtoError,
  type ResponseDtoOk,
  type R,
  ResponseDtoStatus,
} from './types';

export function stringifyFilter<T extends FilterBase>(opts: T, all = false) {
  const { perPage, ...rest } = opts;
  return queryString.stringify(
    camelcaseKeys(
      { perPage: all ? -1 : perPage ?? PAGINATION_PER_PAGE, ...rest },
      { pascalCase: true },
    ),
    { arrayFormat: 'none', skipEmptyString: true },
  );
}

type Options<TQueryFnData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey> =
  | QueryObserverOptions<TQueryFnData, TError, TQueryFnData, TQueryFnData, TQueryKey>
  | FetchQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>;

type QueryResponseDtoOptions<T, K extends QueryKey> = Options<
  ResponseDtoOk<T>,
  ResponseDtoError,
  K
>;

export type QueryCreator<T, O, K extends QueryKey> = (
  opts: O,
  options?: Partial<QueryResponseDtoOptions<T, K>>,
) => QueryResponseDtoOptions<T, K>;

export function createQueryCreator<T, O, K extends string>(
  key: K,
  func: (opts: O) => R<T>,
): QueryCreator<T, O, [K, O]> {
  return (opts, options) => ({
    queryKey: [key, opts],
    queryFn: async () => {
      const resp = await func(opts);
      try {
        const data = await resp.json();
        if (data.status === ResponseDtoStatus.Ok) return data;
        else throw { ...data, httpStatus: resp.status };
      } catch (e) {
        throw { httpStatus: resp.status };
      }
    },
    retry: (failureCount, error) => {
      return ![401, 404, 502].includes(error.httpStatus) && failureCount < 1;
    },
    ...options,
  });
}
