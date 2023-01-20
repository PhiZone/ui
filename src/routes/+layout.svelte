<script>
	import { locale } from "$lib/translations/config";
	import { page } from "$app/stores";
	import { convertLanguageCode } from "$lib/utils";
	import { browser } from "$app/environment";

	let language;
	try {
		const user = $page.data.user;
		language = user.language.toString();
		locale.set(language);
		console.log("Language:", language, "(from user data)");
	} catch (error) {
		if (browser) {
			language = convertLanguageCode(window.navigator.language);
			locale.set(language);
			console.log("Language:", language, "(from nagivator)");
		}
	}
</script>

<slot />
