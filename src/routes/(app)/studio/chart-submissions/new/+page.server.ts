import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import API from '$lib/api';
import { t } from '$lib/translations/config';
import { Accessibility, ResponseDtoStatus } from '$lib/api/types';
import { ChartLevel } from '$lib/api/chart';
import { TAG_JOINER } from '$lib/constants';

const schema = z.object({
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

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) {
      return fail(400, { form });
    }
    // eslint-disable-next-line prefer-const
    let { File, Illustration, Tags: tagsRaw, ...rest } = form.data;
    File = formData.get('File') as File;
    Illustration = formData.get('Illustration') as File;
    const Tags = tagsRaw ? tagsRaw.split(TAG_JOINER).map((tag: string) => tag.trim()) : [];
    const resp = await api.chart.submission.create({ File, Illustration, Tags, ...rest });
    if (resp.ok) {
      redirect(303, '/studio/chart-submissions' + url.search);
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
            form.errors[field as keyof Schema] = errors.map((value) => {
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
