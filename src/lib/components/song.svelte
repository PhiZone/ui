<script lang="ts">
    import type { Song } from '$lib/models';
    import { t } from '$lib/translations/config';
    import { convertDuration } from '$lib/utils';

    export let song: Song;
</script>

<div class="card w-80 bg-base-100 shadow-xl glass overflow-hidden">
    <a href={`/songs/${song.id}`}>
        <figure class="h-[180px]">
            <img src={song.illustration} alt="Illustration" class="object-cover" />
        </figure>
        <div class="card-body">
            <h2 class="card-title">
                {song.name}
                {#if song.original}
                    <div class="badge badge-secondary">{$t('song.original')}</div>
                {/if}
            </h2>
            <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.composer')}</span
                >{song.composer}
            </p>
            <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.illustrator')}</span
                >{song.illustrator}
            </p>
            <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.bpm')}</span
                >{song.bpm}
            </p>
            <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.duration')}</span
                >{convertDuration(song.duration)}
            </p>
            {#if typeof song.owner === 'object'}
                <p>
                    <span class="badge badge-primary badge-outline mr-1"
                        >{$t(song.original ? 'song.author' : 'song.uploader')}</span
                    >{song.owner.username}
                </p>
            {/if}
            <p />
        </div>
    </a>
</div>
