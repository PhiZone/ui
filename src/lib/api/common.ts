import type { FetchQueryOptions, QueryKey, QueryObserverOptions } from '@tanstack/svelte-query';
import camelcaseKeys from 'camelcase-keys';
import queryString from 'query-string';
import { serialize } from 'object-to-formdata';

export enum ResponseDtoStatus {
  Ok,
  ErrorBrief,
  ErrorDetailed,
  ErrorWithMessage,
  ErrorTemporarilyUnavailable,
  ErrorWithData,
}

interface ResponseDtoBase {
  status: ResponseDtoStatus;
  code: string;
  total: number | null;
  perPage: number | null;
  hasNext: boolean | null;
  hasPrevious: boolean | null;
}

interface ResponseDtoOk<T> extends ResponseDtoBase {
  status: ResponseDtoStatus.Ok;
  code: 'Ok';
  data: T;
  message: null;
  errors: null;
  dateAvailable: null;
}

interface ResponseDtoErrorBrief extends ResponseDtoBase {
  status: ResponseDtoStatus.ErrorBrief;
  code: string;
  data: null;
  message: null;
  errors: null;
  dateAvailable: null;
}

export interface ModelErrorDto {
  field: string;
  errors: string[];
}

interface ResponseDtoErrorDetailed extends ResponseDtoBase {
  status: ResponseDtoStatus.ErrorDetailed;
  code: string;
  data: null;
  message: null;
  errors: ModelErrorDto[];
  dateAvailable: null;
}

interface ResponseDtoErrorWithMessage extends ResponseDtoBase {
  status: ResponseDtoStatus.ErrorWithMessage;
  code: string;
  data: null;
  message: string;
  errors: null;
  dateAvailable: null;
}

interface ResponseDtoErrorTemporarilyUnavailable extends ResponseDtoBase {
  status: ResponseDtoStatus.ErrorTemporarilyUnavailable;
  code: string;
  data: null;
  message: null;
  errors: null;
  dateAvailable: string;
}

interface ResponseDtoErrorWithData extends ResponseDtoBase {
  status: ResponseDtoStatus.ErrorWithData;
  code: string;
  data: unknown;
  message: null;
  errors: null;
  dateAvailable: null;
}

export type ResponseDtoError =
  | ResponseDtoErrorBrief
  | ResponseDtoErrorDetailed
  | ResponseDtoErrorWithMessage
  | ResponseDtoErrorTemporarilyUnavailable
  | ResponseDtoErrorWithData;

export type ResponseDto<T> = ResponseDtoOk<T> | ResponseDtoError;

export interface TypedResponse<T> extends Response {
  json(): Promise<T>;
}

export type TypedResponseDtoResponse<T> = TypedResponse<ResponseDto<T>>;

export interface TypedEmptyOkResponse<S extends 201 | 204> extends TypedResponse<never> {
  ok: true;
  status: S;
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
    { arrayFormat: 'comma', skipEmptyString: true },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formdata<T extends Record<string, any>>(obj: T) {
  return serialize(camelcaseKeys(obj, { pascalCase: true }));
}

type Options<TQueryFnData = unknown, TError = unknown, TQueryKey extends QueryKey = QueryKey> =
  | QueryObserverOptions<TQueryFnData, TError, TQueryFnData, TQueryFnData, TQueryKey>
  | FetchQueryOptions<TQueryFnData, TError, TQueryFnData, TQueryKey>;

type QueryResponseDtoOptions<T, K extends QueryKey> = Options<
  ResponseDtoOk<T>,
  ResponseDtoError | Error,
  K
>;

export type QueryCreator<T, O, K extends QueryKey> = (
  opts: O,
  options?: Partial<QueryResponseDtoOptions<T, K>>,
) => QueryResponseDtoOptions<T, K>;

export function createQueryCreator<T, O, K extends string>(
  key: K,
  func: (opts: O) => Promise<TypedResponseDtoResponse<T>>,
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

export type Q<T> = Promise<TypedResponseDtoResponse<T>>;
