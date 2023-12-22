<script lang="ts">
  import { locale, t } from '$lib/translations/config';

  const emailAddress = 'contact@phizone.cn';
</script>

<footer class="footer pt-[24px] pb-3 px-10 bg-base-300 text-base">
  <div>
    <span class="footer-title text-lg">{$t('common.footer.internal_links')}</span>
    <a href="https://www.phi.zone/" target="_blank" rel="noreferrer" class="link link-hover">
      {$t('common.footer.main')}
    </a>
    <a href="https://insider.phizone.cn/" target="_blank" rel="noreferrer" class="link link-hover">
      {$t('common.footer.insider')}
    </a>
    <a href="https://status.phi.zone/" target="_blank" rel="noreferrer" class="link link-hover">
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
    <a href="https://www.phigrim.cn/" target="_blank" rel="noreferrer" class="link link-hover">
      {$t('common.footer.phigrim')}
    </a>
    <a href="https://phira.moe/" target="_blank" rel="noreferrer" class="link link-hover">
      {$t('common.footer.phira')}
    </a>
    <a href="https://phitogether.fun/" target="_blank" rel="noreferrer" class="link link-hover">
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
      <a
        href="https://h5.qun.qq.com/h5/qun-share-page/?_wv=1027&k=HzHKfikWjKaAnnen4iMDWIEUF2knfqrh&authKey=IIY1TB7aOS%2BWS0LCr7AGTzSdOnyBs0TJ2BzRrwS1XuKNh6T0Qj2IX2Yqf%2BA19S1f&market_channel_source=587121959_1&noverify=0&group_code=587121959"
        target="_blank"
        rel="noreferrer"
      >
        <i class="fa-brands fa-qq fa-lg"></i>
      </a>
      <a
        href="https://pd.qq.com/s/ebe35nz6y"
        target="_blank"
        rel="noreferrer"
        class="w-5 h-5 pt-[1px] hidden dark:inline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 768">
          <g>
            <circle fill="currentColor" cx="384.37" cy="383.63" r="384.37" />
          </g>
          <g>
            <path
              d="M577,319.29l5.7-36H507.33L518.47,213h-36l-11.14,70.29H328L339.12,213h-36L292,283.29H216.72l-5.7,36h75.26L267,441.19H191.72l-5.71,36h75.27L249,555h36l12.33-77.81H369L432.42,529l31.88,26,12.32-77.81H552l5.71-36H482.33l19.3-121.9ZM446.33,441.19l-5.71,36L438.12,493l-63.47-51.79H303l19.3-121.9H465.63Z"
            />
          </g>
        </svg>
      </a>
      <a href="https://pd.qq.com/s/ebe35nz6y" target="_blank" rel="noreferrer" class="dark:hidden">
        <i class="fa-solid fa-hashtag fa-lg"></i>
      </a>
      <a href="https://space.bilibili.com/325599863" target="_blank" rel="noreferrer">
        <i class="fa-brands fa-bilibili fa-lg"></i>
      </a>
    </div>
  </div>
</footer>
