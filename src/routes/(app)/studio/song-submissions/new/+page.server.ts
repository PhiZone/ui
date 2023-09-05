/* eslint-disable prefer-const */
import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import API from '$lib/api';
import { t } from '$lib/translations/config';
import { Accessibility, EditionType, ResponseDtoStatus } from '$lib/api/types';

const schema = z
  .object({
    Title: z.string().max(100, t.get('error.ValueTooLong')),
    EditionType: z.nativeEnum(EditionType),
    Edition: z.string().optional(),
    File: z.custom<File>(),
    AuthorName: z.string(),
    Illustration: z.custom<File>(),
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
  })
  .refine(({ EditionType, Edition }) => EditionType! in [2, 5] || Edition, {
    message: t.get('error.FieldEmpty'),
    path: ['Edition'],
  })
  .refine(({ EditionType, License }) => EditionType !== 3 || License, {
    message: t.get('error.FieldEmpty'),
    path: ['License'],
  })
  .refine(({ MinBpm, Bpm }) => MinBpm <= Bpm, {
    message: t.get('common.form.errors.min_bpm'),
    path: ['MinBpm'],
  })
  .refine(({ MaxBpm, Bpm }) => MaxBpm >= Bpm, {
    message: t.get('common.form.errors.max_bpm'),
    path: ['MaxBpm'],
  });

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};
const parsePreviewTime = (time: string) => {
  return /^\d{1,2}:\d{1,2}.\d+$/g.test(time) ? `00:${time}` : time;
};

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }
    let {
      EditionType,
      Edition,
      PreviewStart,
      PreviewEnd,
      File,
      Illustration,
      License,
      OriginalityProof,
      ...rest
    } = form.data;
    File = formData.get('File') as File;
    Illustration = formData.get('Illustration') as File;
    License = formData.get('License') as File;
    OriginalityProof = formData.get('OriginalityProof') as File | undefined;
    PreviewStart = parsePreviewTime(PreviewStart);
    PreviewEnd = parsePreviewTime(PreviewEnd);
    const resp = await api.song.submission.create(
      EditionType !== 0
        ? {
            EditionType,
            Edition,
            PreviewStart,
            PreviewEnd,
            File,
            Illustration,
            License,
            OriginalityProof,
            ...rest,
          }
        : {
            EditionType,
            PreviewStart,
            PreviewEnd,
            File,
            Illustration,
            License,
            OriginalityProof,
            ...rest,
          },
    );
    if (resp.ok) {
      throw redirect(303, '/studio/song-submissions' + url.search);
    } else {
      const respBackup = resp.clone();
      try {
        const error = await resp.json();
        console.log(error);
        form.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          form.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          form.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          form.errors = {};
          error.errors.forEach(({ field, errors }) => {
            form.errors[field as keyof Schema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { form });
      } catch (e) {
        const error = await respBackup.text();
        console.log(error);
        return fail(resp.status, { error });
      }
    }
  },
};
