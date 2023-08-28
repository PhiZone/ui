import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import API from '$lib/api';
import { t } from '$lib/translations/config';
import { Accessibility, ResponseDtoStatus } from '$lib/api/types';
import { ChartLevel } from '$lib/api/chart';

const schema = z
  .object({
    Title: z
      .string()
      .length(100, t.get('error.ValueTooLong')),
    LevelType: z.nativeEnum(ChartLevel),
    Level: z.string(),
    Difficulty: z.number(),
    File: z.custom<File>((file) => file instanceof File),
    AuthorName: z.string(),
    Illustration: z.custom<File>((file) => file instanceof File).optional(),
    Illustrator: z.string().optional(),
    Description: z.string().optional(),
    Accessibility: z.nativeEnum(Accessibility),
    IsRanked: z.boolean(),
    SongId: z.string(),
    SongSubmissionId: z.string()
  });

type Schema = z.infer<typeof schema>;

export const load = async () => {
  const form = await superValidate(schema);
  return { form };
};

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }
    const { ...opts } = form.data;

    const resp = await api.chart.submission.create(opts);
    if (resp.ok) {
      throw redirect(303, '/studio/chart-submissions' + url.search);
    } else {
      const error = await resp.json();
      console.log(error);
      form.valid = false;
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        form.message = t.get(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        form.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        form.errors = {};
        error.errors.forEach(
          ({ field, errors }) => void (form.errors[field as keyof Schema] = errors),
        );
      }

      return fail(resp.status, { form });
    }
  },
};
