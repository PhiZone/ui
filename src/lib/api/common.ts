import { PAGINATION_PER_PAGE } from '$lib/constants';
import type { FetchQueryOptions, QueryKey, QueryObserverOptions } from '@tanstack/svelte-query';
import camelcaseKeys from 'camelcase-keys';
import queryString from 'query-string';
import { serialize } from 'object-to-formdata';
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
    { arrayFormat: 'comma', skipEmptyString: true },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formdata<T extends Record<string, any>>(obj: T) {
  const form = new FormData();
  return serialize(camelcaseKeys(obj, { pascalCase: true }), undefined, form);
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
      if (resp.status === 401) throw new Error('Unauthorized');
      const data = await resp.json();
      if (data.status === ResponseDtoStatus.Ok) return data;
      else throw data;
    },
    ...options,
  });
}
