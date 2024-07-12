<script lang="ts">
  import { locale, t } from '$lib/translations/config';

  const emailAddress = 'contact@phi.zone';
</script>

<footer class="footer pt-[24px] pb-3 px-10 bg-base-300 text-base">
  <div>
    <span class="footer-title text-lg">{$t('common.footer.internal_links')}</span>
    <a
      href="https://www.phi.zone/"
      target="_blank"
      rel="noopener noreferrer"
      class="link link-hover"
    >
      {$t('common.footer.main')}
    </a>
    <a
      href="https://insider.phizone.cn/"
      target="_blank"
      rel="noopener noreferrer"
      class="link link-hover"
    >
      {$t('common.footer.insider')}
    </a>
    <a
      href="https://status.phi.zone/"
      target="_blank"
      rel="noopener noreferrer"
      class="link link-hover"
    >
      {$t('common.footer.status')}
    </a>
    <!-- <a href="/about" class="link link-hover">{$t('common.footer.about')}</a>
    <a href="/feedback" class="link link-hover">{$t('common.footer.feedback')}</a> -->
  </div>
  <div>
    <span class="footer-title text-lg">{$t('common.footer.legal')}</span>
    <a href="/legal/{$locale}/terms-of-service" class="link link-hover">
      {$t('common.legal.terms_of_service')}
    </a>
    <a href="/legal/{$locale}/privacy-policy" class="link link-hover">
      {$t('common.legal.privacy_policy')}
    </a>
    <a href="/legal/{$locale}/copyright-policy" class="link link-hover">
      {$t('common.legal.copyright_policy')}
    </a>
  </div>
  <div>
    <span class="footer-title text-lg">{$t('common.footer.external_links')}</span>
    <a
      href="https://www.phigrim.cn/"
      target="_blank"
      rel="noopener noreferrer"
      class="link link-hover"
    >
      {$t('common.footer.phigrim')}
    </a>
    <a href="https://phira.moe/" target="_blank" rel="noopener noreferrer" class="link link-hover">
      {$t('common.footer.phira')}
    </a>
    <a
      href="https://phitogether.fun/"
      target="_blank"
      rel="noopener noreferrer"
      class="link link-hover"
    >
      {$t('common.footer.phitogether')}
    </a>
    <!-- <a href="/" class="link link-hover"
				>{$t("common.footer.phifans")}</a
			> -->
  </div>
  <div>
    <span class="footer-title text-lg">{$t('common.footer.contact')}</span>
    <div class="flex gap-2 items-center">
      <i class="fa-solid fa-envelope fa-lg"></i>
      <a class="link link-hover" href="mailto:{emailAddress}">{emailAddress}</a>
    </div>
  </div>
</footer>
<footer class="footer px-10 py-5 text-base bg-base-300">
  <div class="items-center grid-flow-col">
    <p class="copyright text-base">{$t('common.footer.copyright')}</p>
  </div>
  <div class="md:place-self-center md:justify-self-end">
    <div class="grid grid-flow-col gap-4">
      <a href="https://discord.gg/q5MVeHeRhv" target="_blank" rel="noopener noreferrer">
        <i class="fa-brands fa-discord fa-lg"></i>
      </a>
      <a href="https://space.bilibili.com/325599863" target="_blank" rel="noopener noreferrer">
        <i class="fa-brands fa-bilibili fa-lg"></i>
      </a>
    </div>
  </div>
</footer>
