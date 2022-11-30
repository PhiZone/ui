<script>
    import { locale } from '$lib/translations/config';
    import { page } from '$app/stores';
    import { convertLanguageCode } from '$lib/utils';
    import { browser } from '$app/environment';

    const user = $page.data.user;
    try {
        locale.set(user.language.toString());
        console.log('Language:', locale.get(), '(from user data)');
    } catch (error) {
        if (browser) {
            locale.set(convertLanguageCode(window.navigator.language));
            console.log('Language:', locale.get(), '(from nagivator)');
        }
    }
</script>

<slot />
