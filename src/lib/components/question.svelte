<script lang="ts">
	import { getCompressedImage, parseLatex } from "$lib/utils";
	import { math } from "mathlifier";
	import { t } from "$lib/translations/config";

	interface Trunk {
		qid: number;
		qtype: number;
		text: string;
		image: string | null;
	}

	interface Choice {
		cid: number;
		text: string | null;
		image: string | null;
	}

	interface Question {
		q: Trunk;
		c?: Choice[];
	}

	export let obj: Question;

	let choice = 0;
	let text: string;

	export function getChoice() {
		return {
			id: obj.q.qid,
			choice: choice,
		};
	}

	export function getAnswer() {
		return {
			id: obj.q.qid,
			text: text,
			chart: {
				chart,
				song,
				illustration,
				songName,
				level,
				difficulty,
			},
		};
	}

	let chart: File | null = null,
		song: File | null = null,
		illustration: File | null = null,
		songName: string | null = null,
		level: string | null = null,
		difficulty: number | null = null;

	const handleChart = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			chart = target.files[0];
		}
	};

	const handleSong = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			song = target.files[0];
		}
	};

	const handleIllustration = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			illustration = target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(illustration);
			reader.onload = () => {
				// console.log(reader.result);
			};
		}
	};
</script>

<div class="indicator">
	<span class="indicator-item indicator-start badge badge-secondary text-xl"
		>{obj.q.qid}</span
	>
</div>
<div class="card w-full bg-base-100 shadow-lg">
	<div class="card-body content">
		<div class="pb-2 text-xl">
			{#each parseLatex(obj.q.text) as e}
				{#if e.latex}
					{@html math(e.text)}
				{:else}
					{e.text}
				{/if}
			{/each}
		</div>
		{#if obj.c}
			{#each obj.c as c}
				<div class="form-control">
					<div class="pt-3 text-lg">
						<input
							type="radio"
							bind:group={choice}
							name={`${obj.q.qid}`}
							value={c.cid}
							class="radio radio-primary mr-2"
						/>
						<div class="choice">
							{#if c.text}
								{#each parseLatex(c.text) as e}
									{#if e.latex}
										{@html math(e.text)}
									{:else}
										{e.text}
									{/if}
								{/each}
							{/if}
							{#if c.image}
								<img
									class="rounded-3xl w-1/3 h-1/3"
									src={getCompressedImage(c.image)}
									alt="Choice"
								/>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		{:else if obj.q.qtype == 2}
			{#if obj.q.qid == 15}
				<div class="form-control">
					<div>
						<span class="w-1/4">{$t("chart.chart")}</span>
						<input
							type="file"
							accept=".json, .pec"
							class="my-2 ml-6 w-2/3 file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
							on:change={handleChart}
						/>
					</div>
					<div>
						<span class="w-1/4">{$t("song.song")}</span>
						<input
							type="file"
							accept=".mp3, .ogg"
							class="my-2 ml-6 w-2/3 file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
							on:change={handleSong}
						/>
					</div>
					<div>
						<span class="w-1/4">{$t("song.illustration")}</span>
						<input
							type="file"
							accept=".jpg, .png, .webp"
							class="my-2 ml-6 w-2/3 file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
							on:change={handleIllustration}
						/>
					</div>
					<label class="input-group my-2">
						<span class="w-1/4 min-w-[64px] max-w-[180px]"
							>{$t("song.name")}</span
						>
						<input
							type="text"
							placeholder={$t("song.name")}
							class="input input-bordered input-primary w-3/4 min-w-[180px]"
							bind:value={songName}
						/>
					</label>
					<label class="input-group my-2">
						<span class="w-1/4 min-w-[64px] max-w-[180px]"
							>{$t("chart.level")}</span
						>
						<input
							type="text"
							placeholder="IN"
							class="input input-bordered input-primary w-3/4 min-w-[180px]"
							bind:value={level}
						/>
					</label>
					<label class="input-group my-2">
						<span class="w-1/4 min-w-[64px] max-w-[180px]"
							>{$t("chart.difficulty")}</span
						>
						<input
							type="text"
							placeholder={(Math.random() * (16 - 12) + 12).toFixed(1)}
							class="input input-bordered input-primary w-3/4 min-w-[180px]"
							bind:value={difficulty}
						/>
					</label>
				</div>
			{:else}
				<textarea
					class="textarea textarea-primary text-base"
					placeholder={$t("challenge.placeholder")}
					bind:value={text}
				/>
			{/if}
		{/if}
	</div>
</div>

<style>
	.choice {
		float: right;
		width: calc(100% - 32px);
	}
</style>
