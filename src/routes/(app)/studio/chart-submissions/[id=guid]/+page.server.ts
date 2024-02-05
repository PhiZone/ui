import API from '$lib/api';
import { ResponseDtoStatus } from '$lib/api/types';
import { t } from '$lib/translations/config';
import { toCamel } from '$lib/utils';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';

const voteSchema = z.object({
  chartId: z.string(),
  score: z.number(),
  suggestedDifficulty: z.number(),
  message: z.string(),
});

const collabSchema = z.object({
  type: z.enum(['songs', 'charts']),
  id: z.string(),
  inviteeId: z.number(),
  position: z.string().optional(),
});

const collectionSchema = z.object({
  id: z.string(),
  admitterId: z.string(),
  label: z.string().optional(),
});

type VoteSchema = z.infer<typeof voteSchema>;
type CollabSchema = z.infer<typeof collabSchema>;
type CollectionSchema = z.infer<typeof collectionSchema>;

export const load = async () => {
  const voteForm = await superValidate(voteSchema);
  const collabForm = await superValidate(collabSchema);
  const collectionForm = await superValidate(collectionSchema);
  return { voteForm, collabForm, collectionForm };
};

export const actions = {
  vote: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const voteForm = await superValidate(formData, voteSchema);

    if (!voteForm.valid) {
      return fail(400, { voteForm });
    }
    const resp = await api.vote.volunteer.create(voteForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        voteForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          voteForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          voteForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          voteForm.message = t.get(`error.${error.code}`);
          voteForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            voteForm.errors[toCamel(field) as keyof VoteSchema] = errors.map((value) => {
              return t.get(`error.${value}`);
            });
          });
        }

        return fail(resp.status, { voteForm });
      } catch (e) {
        return fail(resp.status);
      }
    }
  },

  collab: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const collabForm = await superValidate(formData, collabSchema);

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
      } catch (e) {
        return fail(resp.status);
      }
    }
  },

  collection: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const collectionForm = await superValidate(formData, collectionSchema);

    if (!collectionForm.valid) {
      return fail(400, { collectionForm });
    }
    const resp = await api.chart.createAdmission(collectionForm.data);
    if (resp.ok) {
      return;
    } else {
      try {
        const error = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
        collectionForm.valid = false;
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          collectionForm.message = t.get(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          collectionForm.message = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          collectionForm.message = t.get(`error.${error.code}`);
          collectionForm.errors = {};
          error.errors.forEach(({ field, errors }) => {
            collectionForm.errors[toCamel(field) as keyof CollectionSchema] = errors.map(
              (value) => {
                return t.get(`error.${value}`);
              },
            );
          });
        }

        return fail(resp.status, { collectionForm });
      } catch (e) {
        return fail(resp.status);
      }
    }
  },
};
