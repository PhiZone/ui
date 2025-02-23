<script lang="ts">
  import type { RegionDto } from '$lib/api/user';

  import { t } from '$lib/translations/config';

  interface Props {
    region?: RegionDto | string;
    width?: number;
    showFlag?: boolean;
    showText?: boolean;
    overallCss?: string;
    flagCss?: string;
    textCss?: string;
  }
  let {
    region,
    width = 21,
    showFlag = true,
    showText = true,
    overallCss = '',
    flagCss = '',
    textCss = '',
  }: Props = $props();

  const code = typeof region == 'object' ? region.code : region;
  const nonrecognized = ['TW'];
</script>

<div class="flex h-fit gap-1 items-center {overallCss}">
  {#if showFlag}
    {#if !code || code.length !== 2 || nonrecognized.includes(code.toUpperCase())}
      <span
        class="badge badge-sm badge-neutral w-[{width}px] h-[{(width * 2) / 3}px] {flagCss}"
        style:border-radius="{width / 5}px"
        style:font-size="{width / 2.5}px"
      >
        {code ?? '?'}
      </span>
    {:else}
      <img
        src="https://flagcdn.com/{code.toLowerCase()}.svg"
        class={flagCss}
        style:width="{width}px"
        style:border-radius="{width / 5}px"
        alt="Flag"
      />
    {/if}
  {/if}
  {#if showText}
    <div class={textCss} style:font-size="{width / 1.5}px">
      {!code ? $t('common.unknown') : code.length !== 2 ? code.toUpperCase() : $t(`region.${code}`)}
    </div>
  {/if}
</div>
