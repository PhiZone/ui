import API from '$lib/api';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms/server';
import { fail } from '@sveltejs/kit';
import { t } from '$lib/translations/config';
import { ResponseDtoStatus } from '$lib/api/types';
import { toCamel } from '$lib/utils.js';

const schema = z.object({
  aspectRatio1: z.number().optional().default(16),
  aspectRatio2: z.number().optional().default(9),
  backgroundBlur: z.number().positive().default(1),
  backgroundLuminance: z.number().positive().default(50),
  chartMirroring: z.number(),
  chartOffset: z.number(),
  fcApIndicator: z.boolean().default(true),
  goodJudgment: z.number().positive().default(160),
  hitSoundVolume: z.number().positive().default(100),
  musicVolume: z.number().positive().default(100),
  name: z.string().optional(),
  noteSize: z.number().positive().default(1),
  perfectJudgment: z.number().positive().default(80),
  simultaneousNoteHint: z.boolean().default(true),
});

type Schema = z.infer<typeof schema>;

export const load = async ({ url, cookies }) => {
  const preferredPlayConfiguration = url.searchParams.get('preferredPlayConfiguration');
  if (preferredPlayConfiguration) {
    if (preferredPlayConfiguration != 'none') {
      cookies.set('preferred_play_configuration', preferredPlayConfiguration, { path: '/' });
    } else {
      cookies.delete('preferred_play_configuration', { path: '/' });
    }
  }
  const form = await superValidate(schema);
  return { form, preferredPlayConfiguration: cookies.get('preferred_play_configuration') };
};

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);

    const formData = await request.formData();
    const form = await superValidate(formData, schema);

    if (!form.valid) {
      return fail(400, { form });
    }

    const {
      aspectRatio1,
      aspectRatio2,
      backgroundLuminance,
      hitSoundVolume,
      musicVolume,
      ...rest
    } = form.data;
    const resp = await api.playConfiguration.create({
      aspectRatio: aspectRatio1 > 0 && aspectRatio2 > 0 ? [aspectRatio1, aspectRatio2] : undefined,
      backgroundLuminance: backgroundLuminance / 100,
      hitSoundVolume: hitSoundVolume / 100,
      musicVolume: musicVolume / 100,
      ...rest,
    });
    if (resp.ok) {
      return;
    } else {
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
          form.errors[toCamel(field) as keyof Schema] = errors.map((value) => {
            return t.get(`error.${value}`);
          });
        });
      }

      return fail(resp.status, { form });
    }
  },
};
