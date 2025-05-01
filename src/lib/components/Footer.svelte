<script lang="ts">
  import { PUBLIC_ICP_LICENSE, PUBLIC_SECURITY_LICENSE } from '$env/static/public';
  import { PUBLIC_PLAYER_PATH } from '$env/static/public';
  import { locale, t } from '$lib/translations/config';

  const emailAddress = 'contact@phizone.cn';
</script>

<footer class="footer relative pt-[24px] pb-3 px-10 bg-base-300 text-base z-1">
  <div>
    <span class="footer-title text-lg">{$t('common.footer.internal_links')}</span>
    <a href="/" class="link link-hover">
      {$t('common.footer.homepage')}
    </a>
    <a href={PUBLIC_PLAYER_PATH} class="link link-hover">
      {$t('common.footer.player')}
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
<footer class="footer relative px-10 py-5 text-base bg-base-300 z-1">
  <div class="items-center grid-flow-col">
    <p class="copyright text-base">{$t('common.footer.copyright')}</p>
  </div>
  <div class="items-center grid-flow-col opacity-80">
    <a
      href="https://beian.miit.gov.cn/"
      rel="noreferrer"
      target="_blank"
      class="text-base transition hover:opacity-100 hover:text-accent"
    >
      {PUBLIC_ICP_LICENSE}
    </a>
  </div>
  <div class="items-center grid-flow-col opacity-80">
    <img src="/license_icon.png" class="w-5 h-5" alt="Public Security Bureau" />
    <a
      href="https://beian.mps.gov.cn/#/query/webSearch?code=37018102000886"
      rel="noreferrer"
      target="_blank"
      class="text-base transition hover:opacity-100 hover:text-accent"
    >
      {PUBLIC_SECURITY_LICENSE}
    </a>
  </div>
  <div class="md:place-self-center md:justify-self-end">
    <div class="grid grid-flow-col gap-4">
      <a
        href="https://discord.gg/q5MVeHeRhv"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
      >
        <i class="fa-brands fa-discord fa-lg"></i>
      </a>
      <a
        href="https://space.bilibili.com/325599863"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bilibili"
      >
        <i class="fa-brands fa-bilibili fa-lg"></i>
      </a>
    </div>
  </div>
</footer>
