<script lang="ts">
  import { t } from '$lib/translations/config';
</script>

<div class="drawer xl:drawer-open">
  <input id="studio-sidebar" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <slot />
  </div>
  <div class="pt-[60px] drawer-side z-50">
    <label for="studio-sidebar" class="drawer-overlay"></label>
    <ul
      class="menu px-4 min-w-fit w-60 h-full border-r-2 normal-border bg-base-200 bg-opacity-70 backdrop-blur-lg text-base-content text-lg"
    >
      <li>
        <a href="/studio">{$t('studio.homepage')}</a>
      </li>
      <li>
        <a href="/studio/song-submissions">{$t('studio.song_submissions')}</a>
      </li>
      <li>
        <a href="/studio/chart-submissions">{$t('studio.chart_submissions')}</a>
      </li>
      <li>
        <a href="/studio/collaborations">{$t('studio.collaborations')}</a>
      </li>
      <li>
        <details>
          <summary>{$t('studio.admissions')}</summary>
          <ul>
            <li><a href="/studio/admissions/chapters">{$t('studio.chapter_admissions')}</a></li>
            <li>
              <a href="/studio/admissions/collections">{$t('studio.collection_admissions')}</a>
            </li>
            <li><a href="/studio/admissions/songs">{$t('studio.song_admissions')}</a></li>
            <li>
              <a href="/studio/admissions/song-submissions">
                {$t('studio.song_submission_admissions')}
              </a>
            </li>
          </ul>
        </details>
      </li>
    </ul>
  </div>
</div>
