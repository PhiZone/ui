<script>
    import { goto } from '$app/navigation';

    import Question from '$lib/components/question.svelte';
    import { Status } from '$lib/constants';
    import { t } from '$lib/translations/config';

    /** @type {import('./$types').PageData} */
    export let data;
    $: ({ status, questions, error } = data);

    console.log('objective_questions:', questions);
    console.log('error:', error);

    let min = 29,
        sec = 59;

    let timeUp = false;

    let timer = setInterval(() => {
        if (sec == 0) {
            if (min == 0) {
                clearInterval(timer);
                timeUp = true;
            } else {
                min--;
                sec = 59;
            }
        } else {
            sec--;
        }
    }, 1000);

    /**
     * @type {any[]}
     */
    let getChoices = [];

    async function handleSubmit() {
        /**
         * @type {any[]}
         */
        let choices = [];
        getChoices
            .sort((a, b) => b.id - a.id)
            .forEach((e) => {
                console.log(e().choice);
                choices.push(e().choice);
            });
        goto(`subjective?answers=${choices.toString()}`);
    }
</script>

<div class="bg-base-200">
    {#if status === Status.OK}
        <div
            class="card fixed top-[100px] right-3 px-6 py-3 bg-base-100 shadow-xl z-10 grid grid-flow-col gap-5 text-center auto-cols-max"
        >
            <div class="flex flex-col">
                <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-red-600' : ''}`}>
                    <span style={`--value:${min};`} />
                </span>
                min
            </div>
            <div class="flex flex-col">
                <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-red-600' : ''}`}>
                    <span style={`--value:${sec};`} />
                </span>
                sec
            </div>
        </div>
    {/if}
    <div class="pt-32 flex justify-center">
        <div class="w-3/4 max-w-6xl min-w-20">
            <h1 class="text-4xl font-bold mb-6">{$t('challenge.objective')}</h1>
            {#if status === Status.OK}
                <ul class="px-10">
                    {#each questions as question}
                        <li class="py-4">
                            <Question
                                obj={question}
                                bind:getChoice={getChoices[question.q.qid - 1]}
                            />
                        </li>
                    {/each}
                </ul>
                <button
                    class={`btn btn-outline ${
                        timeUp
                            ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error'
                            : 'btn-primary'
                    } glass float-right my-5 text-lg`}
                    data-tip={$t('challenge.time_up')}
                    on:click={handleSubmit}>{$t('common.continue')}</button
                >
            {:else}
                <div class="text-center py-[30vh]">
                    <p class="text-lg text-red-600 my-8">{$t(`challenge.${error}`)}</p>
                    <a href="/challenge"
                        ><button class="btn btn-primary text-lg">{$t('common.back')}</button></a
                    >
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    * {
        font-family: 'Saira', sans-serif;
    }
</style>
