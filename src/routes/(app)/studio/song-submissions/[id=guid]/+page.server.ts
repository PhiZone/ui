import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

const reviewSchema = z.object({
  id: z.string(),
  status: z.number().min(1).max(2),
  isOriginal: z.boolean(),
  isHidden: z.boolean(),
  message: z.string().optional(),
});

const collabSchema = z.object({
  type: z.enum(['songs', 'charts']),
  id: z.string(),
  inviteeId: z.number(),
  position: z.string().optional(),
});

type ReviewSchema = z.infer<typeof reviewSchema>;
type CollabSchema = z.infer<typeof collabSchema>;

export const load = async () => {
  const reviewForm = await superValidate(reviewSchema);
  const collabForm = await superValidate(collabSchema);
  return { reviewForm, collabForm };
};

export const actions = {
  review: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const reviewForm = await superValidate(formData, reviewSchema);

    if (!reviewForm.valid) {
      console.log(reviewForm.errors);
      return fail(400, { reviewForm });
    }
    const resp = await api.song.submission.review(reviewForm.data);
    if (resp.ok) {
      return;
    } else {
      console.log('error!')
      try {
        const error = await resp.json();
        console.log(error);
        reviewForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          reviewForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          reviewForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          reviewForm.errors = {};
          error.errors.forEach(
            ({ field, errors }) => void (reviewForm.errors[field as keyof ReviewSchema] = errors),
          );
        }

        return fail(resp.status, { reviewForm });
      } catch (e) {
        return fail(resp.status);
      }
    }
  },

  collab: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const collabForm = await superValidate(formData, collabSchema);

    if (!collabForm.valid) {
      console.log(collabForm.errors);
      return fail(400, { collabForm });
    }
    const resp = await api.collaboration.create(collabForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.log(error);
        collabForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          collabForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          collabForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          collabForm.errors = {};
          error.errors.forEach(
            ({ field, errors }) => void (collabForm.errors[field as keyof CollabSchema] = errors),
          );
        }

        return fail(resp.status, { collabForm });
      } catch (e) {
        return fail(resp.status);
      }
    }
  },
};
