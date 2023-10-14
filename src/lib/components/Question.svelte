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

<div class="indicator">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
    style:--tw-translate-x="0"
  >
    {id}
  </span>
</div>
<div class="card w-full bg-base-100 shadow-lg">
  <div class="card-body">
    {#if question.content}
      <div class="pb-2 text-xl">
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
        <p class="text-lg content">
          {answer}
        </p>
      {/if}
    {/if}
  </div>
</div>
