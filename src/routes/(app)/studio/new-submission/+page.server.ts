/* eslint-disable prefer-const */
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { Accessibility, EditionType, ResponseDtoStatus } from '$lib/api/types';
import { TAG_JOINER } from '$lib/constants';
import { t } from '$lib/translations/config';
// import { parseFile } from '$lib/utils';

const songSchema = z
  .object({
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

type SongSchema = z.infer<typeof songSchema>;

export const load = async () => {
  const songForm = await superValidate(zod(songSchema));
  return { songForm };
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
    const resp = await api.song.submission.create(
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
      return;
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
};
