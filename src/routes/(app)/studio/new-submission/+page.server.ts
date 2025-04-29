/* eslint-disable prefer-const */
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { Accessibility, EditionType, ResponseDtoStatus } from '$lib/api/types';
import { TAG_JOINER } from '$lib/constants';
import { t } from '$lib/translations/config';
import { ChartLevel } from '$lib/api/chart';

const songSchema = z
  .object({
    Id: z.string(),
    Title: z.string().max(100, t.get('error.ValueTooLong')),
    EditionType: z.nativeEnum(EditionType),
    Edition: z.string().optional(),
    AuthorName: z.string(),
    Illustrator: z.string(),
    Description: z.string().optional(),
    Accessibility: z.nativeEnum(Accessibility),
    Bpm: z.number(),
    MinBpm: z.number(),
    MaxBpm: z.number(),
    Lyrics: z.string().optional(),
    License: z.custom<File>().optional(),
    OriginalityProof: z.custom<File>().optional(),
    Offset: z.number(),
    PreviewStart: z.string(),
    PreviewEnd: z.string(),
    Tags: z.string(),
  })
  .refine(({ EditionType, Edition }) => EditionType === 0 || Edition, {
    message: t.get('error.FieldEmpty'),
    path: ['Edition'],
  })
  .refine(({ EditionType, License }) => EditionType !== 3 || License, {
    message: t.get('error.FieldEmpty'),
    path: ['License'],
  })
  .refine(({ MinBpm, Bpm }) => MinBpm <= Bpm, {
    message: t.get('studio.submission.min_bpm_error'),
    path: ['MinBpm'],
  })
  .refine(({ MaxBpm, Bpm }) => MaxBpm >= Bpm, {
    message: t.get('studio.submission.max_bpm_error'),
    path: ['MaxBpm'],
  });

const chartSchema = z.object({
  Id: z.string(),
  Title: z.string().max(100, t.get('error.ValueTooLong')).optional(),
  LevelType: z.nativeEnum(ChartLevel),
  Level: z.string(),
  Difficulty: z.number(),
  File: z.custom<File>(),
  AuthorName: z.string(),
  Illustration: z.custom<File>().optional(),
  Illustrator: z.string().optional(),
  Description: z.string().optional(),
  Accessibility: z.nativeEnum(Accessibility),
  IsRanked: z.boolean(),
  SongId: z.string(),
  SongSubmissionId: z.string(),
  Tags: z.string(),
});

type SongSchema = z.infer<typeof songSchema>;
type ChartSchema = z.infer<typeof chartSchema>;

export const load = async () => {
  const songForm = await superValidate(zod(songSchema));
  const chartForm = await superValidate(zod(chartSchema));
  return { songForm, chartForm };
};

const parsePreviewTime = (time: string) => {
  return /^\d{1,2}:\d{1,2}.\d+$/g.test(time) ? `00:${time}` : time;
};

export const actions = {
  song: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const form = await superValidate(formData, zod(songSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    let {
      Id,
      EditionType,
      Edition,
      PreviewStart,
      PreviewEnd,
      License,
      OriginalityProof,
      Tags: tagsRaw,
      ...rest
    } = form.data;
    License = formData.get('License') as File;
    OriginalityProof = formData.get('OriginalityProof') as File | undefined;
    PreviewStart = parsePreviewTime(PreviewStart);
    PreviewEnd = parsePreviewTime(PreviewEnd);
    const Tags = tagsRaw ? tagsRaw.split(TAG_JOINER).map((tag: string) => tag.trim()) : [];
    const resp = await api.submission.createSong(
      Id,
      EditionType !== 0
        ? {
            EditionType,
            Edition,
            PreviewStart,
            PreviewEnd,
            License,
            OriginalityProof,
            Tags,
            ...rest,
          }
        : {
            EditionType,
            PreviewStart,
            PreviewEnd,
            License,
            OriginalityProof,
            Tags,
            ...rest,
          },
    );
    if (resp.ok) {
      const data = await resp.json();
      return { id: data.data.id, form };
    } else {
      const respBackup = resp.clone();
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        form.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          form.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          form.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          form.message = t.get(`error.${error.code}`);
          form.errors = {};
          error.errors.forEach(({ field, errors }) => {
            form.errors[field as keyof SongSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { form });
      } catch {
        const error = await respBackup.text();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        return fail(resp.status, { form });
      }
    }
  },
  chart: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const form = await superValidate(formData, zod(chartSchema));

    if (!form.valid) {
      return fail(400, { form });
    }
    // eslint-disable-next-line prefer-const
    let { Id, File, Illustration, Tags: tagsRaw, ...rest } = form.data;
    File = formData.get('File') as File;
    Illustration = formData.get('Illustration') as File;
    const Tags = tagsRaw ? tagsRaw.split(TAG_JOINER).map((tag: string) => tag.trim()) : [];
    const resp = await api.submission.uploadChart(Id, { File, Illustration, Tags, ...rest });
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        form.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          form.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          form.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          form.message = t.get(`error.${error.code}`);
          form.errors = {};
          error.errors.forEach(({ field, errors }) => {
            form.errors[field as keyof ChartSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { form });
      } catch {
        return fail(resp.status);
      }
    }
  },
};
