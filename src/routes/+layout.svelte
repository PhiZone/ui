<script lang="ts">
	import { locale } from "$lib/translations/config";
	import { page } from "$app/stores";
	import { convertLanguageCode } from "$lib/utils";
	import { browser } from "$app/environment";

	if (
		!$page.data.access_token &&
		$page.data.refresh_token &&
		browser &&
		!$page.url.pathname.startsWith("/session") &&
		!$page.url.pathname.startsWith("/auth")
	) {
		window.location.href = `/session/refresh?redirect=${encodeURIComponent(
			$page.url.pathname + $page.url.search
		)}`;
	}

	let language;
	try {
		language = $page.data.user.language.toString();
		locale.set(language);
		if (browser) {
			console.log("Language:", language, "(from user data)");
		}
	} catch (error) {
		if (browser) {
			language = convertLanguageCode(window.navigator.language);
			locale.set(language);
			console.log("Language:", language, "(from nagivator)");
		}
	}
</script>

<slot />
