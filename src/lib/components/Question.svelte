<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { PetQuestionDto } from '$lib/api/pet';

  export let id: number;
  export let question: PetQuestionDto;
  export let choices: number[] | null = [];
  export let text: string | null;
  export let textAreaCss = 'text-base h-52';
  export let answer: string | undefined = undefined;
</script>

<div class="indicator my-4 w-full">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
    style:--tw-translate-x="0"
  >
    {id} ({question.type == 0 ? 2 : question.type == 1 ? 4 : id == 19 ? 30 : 10}
    {$t('pet.points')})
  </span>
  <div class="card w-full bg-base-100 shadow-lg">
    <div class="card-body">
      {#if question.content}
        <div class="pb-2 text-xl {question.type == 2 && answer ? 'opacity-60' : ''}">
          {@html question.content}
        </div>
      {/if}
      {#if question.choices && question.choices.length > 0}
        {#each question.choices as choice, i}
          <div class="pt-3 text-lg flex gap-2 items-center">
            {#if question.type == 0}
              <input
                type="radio"
                bind:group={choices}
                name={`${id}`}
                value={[i]}
                class="radio radio-primary"
              />
            {:else}
              <input
                type="checkbox"
                bind:group={choices}
                name={`${id}`}
                value={i}
                class="checkbox checkbox-primary"
              />
            {/if}
            <div>
              {@html choice}
            </div>
          </div>
        {/each}
      {:else if question.type == 2}
        {#if !answer}
          <textarea
            class="textarea textarea-secondary {textAreaCss}"
            placeholder={$t('pet.placeholder')}
            bind:value={text}
          />
        {:else}
          <div class="divider"></div>
          <p class="text-lg content">
            {@html answer
              .replaceAll(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '')
              .replaceAll(
                /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi,
                '<a href="$1" target="_blank" class="richtext-link">$1</a>',
              )}
          </p>
        {/if}
      {/if}
    </div>
  </div>
</div>
