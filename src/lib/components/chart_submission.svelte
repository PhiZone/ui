<script lang="ts">
	import type { ChartSubmission, User } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { getCompressedImage, parseDateTime } from "$lib/utils";

	export let submission: ChartSubmission;
	let song = submission.song ? submission.song : submission.song_upload;
</script>

<a href={`/studio/chart-submissions/${submission.id}`}>
	<div
		class="card min-w-[500px] card-side overflow-hidden bg-base-100 shadow-lg glass"
	>
		<figure class="min-w-[30%] max-w-[30%]">
			<img
				class="object-cover w-full h-full"
				src={getCompressedImage(song?.illustration)}
				alt="Illustration"
			/>
		</figure>
		<div class="card-body w-[70%] max-h-fit">
			<h2 class="card-title text-2xl mb-3 min-w-fit">
				{song?.name}
				<button class="btn btn-secondary btn-sm text-2xl no-animation">
					{submission.level}
					{Math.floor(submission.difficulty)}
				</button>
			</h2>
			<div class="flex items-center min-w-fit">
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("studio.submission.overall_status")}</span
					>
					{$t(`studio.submission.statuses.${submission.status}`)}
				</p>
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("studio.submission.volunteer_status")}</span
					>
					{$t(`studio.submission.bi_statuses.${submission.volunteer_status}`)}
				</p>
			</div>
			<div class="flex items-center min-w-fit">
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("studio.submission.collab_status")}</span
					>
					{$t(`studio.submission.bi_statuses.${submission.collab_status}`)}
				</p>
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("studio.submission.adm_status")}</span
					>
					{$t(`studio.submission.bi_statuses.${submission.adm_status}`)}
				</p>
			</div>
			<div class="flex items-center min-w-fit">
				{#if typeof submission.uploader === "object"}
					<p class="min-w-fit">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("studio.submission.uploader")}</span
						>
						{submission.uploader.username}
					</p>
				{/if}
				<p class="min-w-fit">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("studio.submission.uploaded_at")}</span
					>
					{parseDateTime(submission.time)}
				</p>
			</div>
		</div>
	</div>
</a>
