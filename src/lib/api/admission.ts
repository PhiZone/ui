import type {
  ChartSubmissionDto,
  SongSubmissionDto,
  ChartDto,
  SongDto,
  CollectionDto,
  ChapterDto,
} from '.';
import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface ChapterAdmissionDto {
  admittee: SongDto;
  admitter: ChapterDto;
  dateCreated: string;
  label: string | null;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface CollectionAdmissionDto {
  admittee: ChartDto;
  admitter: CollectionDto;
  dateCreated: string;
  label: string | null;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface SongAdmissionDto {
  admittee: ChartSubmissionDto;
  admitter: SongDto;
  dateCreated: string;
  label: string | null;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface SongSubmissionAdmissionDto {
  admittee: ChartSubmissionDto;
  admitter: SongSubmissionDto;
  dateCreated: string;
  label: string | null;
  requesteeId: number;
  requesterId: number;
  status: number;
}

export interface Filter extends FilterBase {
  rangeRequesterId?: number[];
  rangeRequesteeId?: number[];
  rangeAdmitterId?: string[];
  rangeAdmitteeId?: string[];
}

// info
export interface InfoOpts {
  admitterId: string;
  admitteeId: string;
}

// create
export interface CreateOpts {
  type: 'chapters' | 'collections';
  id: string;
  admitterId: string;
  label: string | null;
}

// review
export interface ReviewOpts {
  type: 'chapters' | 'collections' | 'songs' | 'songSubmissions';
  admitterId: string;
  admitteeId: string;
  approve: boolean;
}

// delete
export interface DeleteOpts {
  type: 'chapters' | 'collections';
  admitterId: string;
  admitteeId: string;
}

export default class AdmissionAPI {
  constructor(private api: API) {}

  listChapter = createQueryCreator(
    'admission.list.chapter',
    (opts: Filter): R<ChapterAdmissionDto[]> =>
      this.api.GET('/admissions/chapters?' + stringifyFilter(opts)),
  );

  listCollection = createQueryCreator(
    'admission.list.collection',
    (opts: Filter): R<CollectionAdmissionDto[]> =>
      this.api.GET('/admissions/collections?' + stringifyFilter(opts)),
  );

  listSong = createQueryCreator(
    'admission.list.song',
    (opts: Filter): R<SongAdmissionDto[]> =>
      this.api.GET('/admissions/songs?' + stringifyFilter(opts)),
  );

  listSongSubmission = createQueryCreator(
    'admission.list.songSubmission',
    (opts: Filter): R<SongSubmissionAdmissionDto[]> =>
      this.api.GET('/admissions/songSubmissions?' + stringifyFilter(opts)),
  );

  infoChapter = createQueryCreator(
    'admission.info.chapter',
    ({ admitterId, admitteeId }: InfoOpts): R<ChapterAdmissionDto> =>
      this.api.GET(`/admissions/chapters/${admitterId}/${admitteeId}`),
  );

  infoCollection = createQueryCreator(
    'admission.info.collection',
    ({ admitterId, admitteeId }: InfoOpts): R<CollectionAdmissionDto> =>
      this.api.GET(`/admissions/collections/${admitterId}/${admitteeId}`),
  );

  infoSong = createQueryCreator(
    'admission.info.song',
    ({ admitterId, admitteeId }: InfoOpts): R<SongAdmissionDto> =>
      this.api.GET(`/admissions/songs/${admitterId}/${admitteeId}`),
  );

  infoSongSubmission = createQueryCreator(
    'admission.info.songSubmission',
    ({ admitterId, admitteeId }: InfoOpts): R<SongSubmissionAdmissionDto> =>
      this.api.GET(`/admissions/songSubmissions/${admitterId}/${admitteeId}`),
  );

  createAdmission({ type, id, ...rest }: CreateOpts): R {
    return this.api.POST(`/${type == 'chapters' ? 'songs' : 'charts'}/${id}/${type}`, rest);
  }

  review({ type, admitterId, admitteeId, ...rest }: ReviewOpts): R {
    return this.api.POST(`/admissions/${type}/${admitterId}/${admitteeId}/review`, rest);
  }

  deleteAdmission({ type, admitterId, admitteeId }: DeleteOpts): R {
    return this.api.DELETE(`/admissions/${type}/${admitterId}/${admitteeId}`);
  }
}
