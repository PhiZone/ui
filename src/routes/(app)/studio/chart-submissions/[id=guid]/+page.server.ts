import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

const voteSchema = z.object({
  chartId: z.string(),
  score: z.number(),
  message: z.string(),
});

const collabSchema = z.object({
  type: z.enum(['songs', 'charts']),
  id: z.string(),
  inviteeId: z.number(),
  position: z.string().optional(),
});

type VoteSchema = z.infer<typeof voteSchema>;
type CollabSchema = z.infer<typeof collabSchema>;

export const load = async () => {
  const voteForm = await superValidate(voteSchema);
  const collabForm = await superValidate(collabSchema);
  return { voteForm, collabForm };
};

export const actions = {
  vote: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const voteForm = await superValidate(formData, voteSchema);

    if (!voteForm.valid) {
      console.log(voteForm.errors);
      return fail(400, { form: voteForm });
    }
    const resp = await api.vote.volunteer.create(voteForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.log(error);
        voteForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          voteForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          voteForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          voteForm.errors = {};
          error.errors.forEach(
            ({ field, errors }) => void (voteForm.errors[field as keyof VoteSchema] = errors),
          );
        }

        return fail(resp.status, { voteForm });
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
      return fail(400, { form: collabForm });
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
