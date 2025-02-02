<script lang="ts">
  import type { ChapterAdmissionDto } from '$lib/api/admission';

  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';

  import AdmissionDelete from './AdmissionDelete.svelte';
  import Chapter from './Chapter.svelte';
  import Song from './Song.svelte';
  import User from './User.svelte';

  export let admission: ChapterAdmissionDto;
  export let showSong = true;
  export let showRequestee = false;
  export let editable = false;

  $: ({ user, api } = $page.data);

  let disabled = false;

  const review = async (approve: boolean) => {
    disabled = true;
    const resp = await api.admission.review({
      type: 'chapters',
      admitterId: admission.admitter.id,
      admitteeId: admission.admittee.id,
      approve,
    });
    disabled = false;
    if (resp.ok) {
      admission.status = approve ? 1 : 2;
    }
  };
</script>

<div class="card overflow-hidden bg-base-200 border-2 normal-border transition hover:shadow-lg">
  <div class="card-body">
    <div class="flex flex-col {showSong ? 'lg:flex-row' : 'md:flex-row'} gap-6 mx-auto">
      <div class="flex flex-col w-full md:flex-row">
        {#if showSong}
          <Song song={admission.admittee} kind="full" showLike={false} />
          <div class="divider md:divider-horizontal">
            <i class="fa-solid fa-arrow-right fa-2xl hidden md:inline"></i>
            <i class="fa-solid fa-arrow-down fa-lg md:hidden"></i>
          </div>
        {/if}
        <Chapter chapter={admission.admitter} fixedHeight={false} showLike={false} />
      </div>
      <div
        class="flex flex-col {showSong
          ? 'md:flex-row lg:flex-col md:gap-[45px] lg:gap-4'
          : ''} gap-4 w-fit"
      >
        {#if !showRequestee && user && admission.requesteeId == user.id}
          <User id={admission.requesterId} kind="full" showFollow={false} />
        {:else}
          <User id={admission.requesteeId} kind="full" showFollow={false} />
        {/if}
        <div class="flex flex-col gap-4">
          {#if admission.label}
            <div
              class={admission.label.length > 10 ? 'tooltip tooltip-bottom' : ''}
              data-tip={admission.label}
            >
              <label class="join w-full">
                <span class="btn w-1/4 btn-active cursor-default no-animation join-item">
                  {$t('common.label')}
                </span>
                <button
                  class="btn w-3/4 btn-shallow btn-active cursor-default no-animation join-item text-lg"
                >
                  {admission.label.length > 10
                    ? `${admission.label.substring(0, 10)}...`
                    : admission.label}
                </button>
              </label>
            </div>
          {/if}
          {#if !disabled && admission.status === 0}
            {#if user && admission.requesteeId === user.id}
              <div class="join w-80">
                <button
                  class="btn hover:btn-primary border-2 normal-border btn-outline join-item w-1/2"
                  on:click={() => {
                    review(true);
                  }}
                >
                  {$t('studio.request.accept')}
                </button>
                <button
                  class="btn hover:btn-accent border-2 normal-border btn-outline join-item w-1/2"
                  on:click={() => {
                    review(false);
                  }}
                >
                  {$t('studio.request.reject')}
                </button>
              </div>
            {:else}
              <button class="btn btn-disabled w-80">
                {$t('common.pending')}
              </button>
            {/if}
            {#if editable}
              <AdmissionDelete target={admission} type="chapter" class="" />
            {/if}
          {:else}
            <button class="btn btn-disabled w-80">
              {$t(
                admission.status === 1
                  ? 'studio.request.accepted'
                  : !disabled
                    ? 'studio.request.rejected'
                    : 'common.waiting',
              )}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
