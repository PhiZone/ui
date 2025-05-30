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

export interface ResponseDtoOk<T> extends ResponseDtoBase {
  status: ResponseDtoStatus.Ok;
  code: 'Ok';
  data: T;
  message: null;
  errors: null;
  dateAvailable: null;
}

interface ResponseDtoErrorBrief extends ResponseDtoBase {
  httpStatus: number;
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
  httpStatus: number;
  status: ResponseDtoStatus.ErrorDetailed;
  code: string;
  data: null;
  message: null;
  errors: ModelErrorDto[];
  dateAvailable: null;
}

interface ResponseDtoErrorWithMessage extends ResponseDtoBase {
  httpStatus: number;
  status: ResponseDtoStatus.ErrorWithMessage;
  code: string;
  data: null;
  message: string;
  errors: null;
  dateAvailable: null;
}

interface ResponseDtoErrorTemporarilyUnavailable extends ResponseDtoBase {
  httpStatus: number;
  status: ResponseDtoStatus.ErrorTemporarilyUnavailable;
  code: string;
  data: null;
  message: null;
  errors: null;
  dateAvailable: string;
}

interface ResponseDtoErrorWithData extends ResponseDtoBase {
  httpStatus: number;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TypedResponse<OK extends boolean = boolean, T = any> extends Response {
  ok: OK;
  json(): Promise<T>;
}

export type R<T = void> = Promise<
  TypedResponse<true, ResponseDtoOk<T>> | TypedResponse<false, ResponseDtoError>
>;

export interface FilterBase {
  order?: string[];
  desc?: boolean[];
  page?: number;
  perPage?: number;
  search?: string;
  predicate?: string;
}

export interface PublicResourceFilterBase extends FilterBase {
  rangeId?: string[];
  containsTitle?: string;
  equalsTitle?: string;
  containsIllustrator?: string;
  equalsIllustrator?: string;
  containsDescription?: string;
  equalsDescription?: string;
  rangeAccessibility?: number[];
  isHidden?: boolean;
  isLocked?: boolean;
  minOwnerId?: number;
  maxOwnerId?: number;
  rangeOwnerId?: number[];
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
  earliestDateUpdated?: Date;
  latestDateUpdated?: Date;
  minLikeCount?: number;
  maxLikeCount?: number;
  rangeLikeCount?: number[];
}

export interface PatchElement {
  op: 'add' | 'replace' | 'remove';
  path: string;
  value: unknown;
}

export interface FileUpdateOpts {
  id: number | string;
  File: Blob;
}

export interface StringArrayOpt {
  strings: string[];
}

export interface CodeDto {
  code: string;
}

export enum Accessibility {
  Public,
  ReviewRequired,
  Private,
}

export enum EditionType {
  Original, // the original edition of the song
  EditedByAuthor, // an edition of the song made by the author themselves
  EditedBySecondParty, // a version edited by a second party (licensed by the author)
  EditedByUploaderLicensed, // a version edited by the uploader (licensed by the author)
  EditedByUploaderUnlicensed, // a version edited by the uploader (not licensed by the author)
  EditedByThirdParty, // a version edited by a third party (not licensed by the author)
}
