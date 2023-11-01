<script lang="ts">
  export let score: number, message: string;

  let step = 0,
    scores: number[] = [],
    bonuses: boolean[] = [],
    realScores: number[] = [],
    realScore = 0,
    questions = [
      '这张谱面的采音怎么样？',
      '这张谱面的配置怎么样？',
      '这张谱面的契合度怎么样？',
      '这张谱面的手感怎么样？',
      '这张谱面的特效怎么样？',
    ];

  const calculate = () => {
    for (var i = 0; i < 5; i++) {
      if (scores[i] == 2) {
        realScores[i] = bonuses[i] ? 3 : 2;
      } else {
        realScores[i] = scores[i] || 0;
      }
    }
    realScore =
      realScores[0] * 0.15 +
      realScores[1] * 0.15 +
      realScores[2] * 0.2 +
      realScores[3] * 0.2 +
      realScores[4] * 0.3;
    const disqualifiedCount = realScores.filter((s) => s == -3).length;
    if (disqualifiedCount === 1) {
      realScore = Math.min(realScore, 1);
    } else if (disqualifiedCount === 2) {
      realScore = Math.min(realScore, 0);
    } else if (disqualifiedCount >= 3) {
      realScore = Math.min(realScore, -1);
    }
    score = Math.round(realScore);
  };
</script>

<input type="checkbox" id="vote-helper" class="modal-toggle" />
<div class="modal">
  <div class="modal-box">
    <label for="vote-helper" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
      ✕
    </label>
    <h3 class="font-bold text-lg mb-3">谱面评分助手</h3>
    <ul class="steps w-full my-1">
      <li class="step {step >= 0 ? 'step-primary' : ''}">采音</li>
      <li class="step {step >= 1 ? 'step-primary' : ''}">配置</li>
      <li class="step {step >= 2 ? 'step-primary' : ''}">契合度</li>
      <li class="step {step >= 3 ? 'step-primary' : ''}">手感</li>
      <li class="step {step >= 4 ? 'step-primary' : ''}">特效</li>
    </ul>
    <div class="m-6 flex flex-col gap-3">
      <p class="text-lg font-bold pt-2 pb-1">{questions[step]}</p>
      <div class="flex gap-2">
        <input
          type="radio"
          name="score"
          class="radio radio-secondary"
          bind:group={scores[step]}
          on:change={calculate}
          value={3}
        />
        <p class="text-base">高度符合标准</p>
      </div>
      <div class="flex gap-2">
        <input
          type="radio"
          name="score"
          class="radio radio-secondary"
          bind:group={scores[step]}
          on:change={calculate}
          value={2}
        />
        <p class="text-base">满足谱面需求</p>
      </div>
      <div class="flex gap-2">
        <input
          type="radio"
          name="score"
          class="radio radio-secondary"
          bind:group={scores[step]}
          on:change={calculate}
          value={0}
        />
        <p class="text-base">勉强满足谱面基本需求</p>
      </div>
      <div class="flex gap-2">
        <input
          type="radio"
          name="score"
          class="radio radio-secondary"
          bind:group={scores[step]}
          on:change={calculate}
          value={-3}
        />
        <p class="text-base">不能满足谱面基本需求</p>
      </div>
    </div>
    {#if scores[step] == 2}
      <div class="m-6 flex flex-col gap-3">
        <p class="text-lg font-bold pt-2 pb-1">你认可该方面的创新吗？</p>
        <div class="flex gap-2">
          <input
            type="radio"
            name="bonus"
            class="radio radio-secondary"
            bind:group={bonuses[step]}
            on:change={calculate}
            value={true}
          />
          <p class="text-base">可以认可</p>
        </div>
        <div class="flex gap-2">
          <input
            type="radio"
            name="bonus"
            class="radio radio-secondary"
            bind:group={bonuses[step]}
            on:change={calculate}
            value={false}
          />
          <p class="text-base">不能认可或无创新点</p>
        </div>
      </div>
    {/if}
    <div class="mt-1 flex justify-between">
      <p class="text-lg">当前分数：{realScore.toFixed(2)}</p>
      <div class="flex join">
        <button
          class="btn btn-outline btn-secondary join-item"
          disabled={step <= 0}
          on:click={() => {
            step--;
          }}
        >
          返回
        </button>
        {#if step < 4}
          <button
            class="btn btn-outline btn-secondary join-item"
            on:click={() => {
              step++;
            }}
            on:change={calculate}
          >
            继续
          </button>
        {:else}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <label
            for="vote-helper"
            class="btn btn-outline btn-primary join-item"
            on:click={() => {
              calculate();
              if (message) {
                message += `\n采音：${realScores[0]}；配置：${realScores[1]}；契合度：${realScores[2]}；手感：${realScores[3]}；特效：${realScores[4]}\n`;
              } else {
                message = `采音：${realScores[0]}；配置：${realScores[1]}；契合度：${realScores[2]}；手感：${realScores[3]}；特效：${realScores[4]}\n`;
              }
            }}
          >
            确定
          </label>
        {/if}
      </div>
    </div>
  </div>
</div>
