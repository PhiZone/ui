<script lang="ts">
  import type { User } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, parseDateTime } from '$lib/utils';

  export let id: number,
    name: string,
    illustration: string,
    level: string,
    difficulty: string,
    status: number,
    showUser: boolean,
    user: User,
    replier: User | null,
    requested_at: string,
    replied_at: string | null;
</script>

<a href={`/recorder/requests/${id}`}>
  <div class="card min-w-[900px] h-44 card-side bg-base-100 shadow-lg glass overflow-hidden">
    <figure class="min-w-[30%] max-w-[30%] h-44">
      <img
        class="object-cover w-full h-full"
        src={getCompressedImage(illustration)}
        alt="Illustration"
      />
    </figure>
    <div class="card-body w-[70%]">
      <h2 class="card-title text-2xl mb-3 min-w-fit">
        {name}
        <button class="btn btn-secondary btn-sm text-2xl no-animation">
          {level}
          {difficulty}
        </button>
      </h2>
      <div class="flex items-center min-w-fit">
        {#if showUser}
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">{$t('recorder.requester')}</span>
            {user.username}
          </p>
        {/if}
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">{$t('recorder.status')}</span>
          {$t(`recorder.statuses.${status}`)}
        </p>
        {#if replier}
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">{$t('recorder.replier')}</span>
            {replier.username}
          </p>
        {/if}
      </div>
      <div class="flex items-center min-w-fit">
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">{$t('recorder.requested_at')}</span>
          {parseDateTime(requested_at)}
        </p>
        {#if replied_at}
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">{$t('recorder.replied_at')}</span>
            {parseDateTime(replied_at)}
          </p>
        {/if}
      </div>
    </div>
  </div>
</a>
