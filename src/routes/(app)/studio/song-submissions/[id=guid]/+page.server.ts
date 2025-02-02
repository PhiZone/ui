import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { toCamel } from '$lib/utils';

const reviewSchema = z.object({
  id: z.string(),
  status: z.number().min(1).max(2),
  isOriginal: z.boolean(),
  isHidden: z.boolean(),
  isLocked: z.boolean(),
  message: z.string().optional(),
});

const collabSchema = z.object({
  type: z.enum(['songs', 'charts']),
  id: z.string(),
  inviteeId: z.number(),
  position: z.string().optional(),
});

const chapterSchema = z.object({
  id: z.string(),
  admitterId: z.string(),
  label: z.string().optional(),
});

type ReviewSchema = z.infer<typeof reviewSchema>;
type CollabSchema = z.infer<typeof collabSchema>;
type ChapterSchema = z.infer<typeof chapterSchema>;

export const load = async () => {
  const reviewForm = await superValidate(zod(reviewSchema));
  const collabForm = await superValidate(zod(collabSchema));
  const chapterForm = await superValidate(zod(chapterSchema));
  return { reviewForm, collabForm, chapterForm };
};

export const actions = {
  review: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const reviewForm = await superValidate(formData, zod(reviewSchema));

    if (!reviewForm.valid) {
      return fail(400, { reviewForm });
    }
    const resp = await api.song.submission.review(reviewForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        reviewForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          reviewForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          reviewForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          reviewForm.message = t.get(`error.${error.code}`);
          reviewForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            reviewForm.errors[toCamel(field) as keyof ReviewSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { reviewForm });
      } catch {
        return fail(resp.status);
      }
    }
  },

  collab: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const collabForm = await superValidate(formData, zod(collabSchema));

    if (!collabForm.valid) {
      return fail(400, { collabForm });
    }
    const resp = await api.collaboration.create(collabForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        collabForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          collabForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          collabForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          collabForm.message = t.get(`error.${error.code}`);
          collabForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            collabForm.errors[toCamel(field) as keyof CollabSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { collabForm });
      } catch {
        return fail(resp.status);
      }
    }
  },

  chapter: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const chapterForm = await superValidate(formData, zod(chapterSchema));

    if (!chapterForm.valid) {
      return fail(400, { chapterForm });
    }
    const resp = await api.song.createAdmission(chapterForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        chapterForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          chapterForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          chapterForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          chapterForm.message = t.get(`error.${error.code}`);
          chapterForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            chapterForm.errors[toCamel(field) as keyof ChapterSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { chapterForm });
      } catch {
        return fail(resp.status);
      }
    }
  },
};
