<script lang="ts">
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';

  interface Props {
    timeDue?: Date;
    timeUp?: boolean;
    text: string;
    onTimeUp?: () => void;
  }
  let { timeDue = new Date(), timeUp = $bindable(false), text, onTimeUp }: Props = $props();

  // TODO: rewrite this
  let hour = $state(0);
  let min = $state(0);
  let sec = $state(1);

  let timer = setInterval(() => {
    const diff = timeDue.getTime() - new Date().getTime();
    if ((hour === 0 && min === 0 && sec === 0) || diff < 0) {
      hour = 0;
      min = 0;
      sec = 0;
      clearInterval(timer);
      timeUp = true;
      onTimeUp?.();
      return;
    }
    hour = Math.floor(diff / (1000 * 60 * 60));
    min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    sec = Math.floor((diff % (1000 * 60)) / 1000);
  }, 100);
</script>

{#if hour < 100}
  <div class="flex flex-col items-center gap-1">
    <span class="countdown font-mono text-4xl tracking-wide">
      <span style="--value:{hour};"></span>
      :
      <span style="--value:{min};"></span>
      :
      <span style="--value:{sec};"></span>
    </span>
    <p class="text-sm opacity-70">
      {$t(text, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        date: parseDateTime(timeDue),
      })}
    </p>
  </div>
{:else}
  <p class="text-lg">
    {$t(text, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      date: parseDateTime(timeDue),
    })}
  </p>{/if}
