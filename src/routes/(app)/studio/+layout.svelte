<script lang="ts">
  import { t } from '$lib/translations/config';
</script>

<div class="drawer lg:drawer-open">
  <input id="studio-sidebar" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <slot />
  </div>
  <div class="pt-[60px] drawer-side z-50">
    <label for="studio-sidebar" class="drawer-overlay" />
    <ul
      class="menu px-4 min-w-fit w-72 h-full shadow-lg bg-base-200 bg-opacity-70 backdrop-blur-lg text-base-content text-lg"
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
      <!-- <li><a href="/studio/admissions">{$t("studio.admissions")}</a></li> -->
    </ul>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
