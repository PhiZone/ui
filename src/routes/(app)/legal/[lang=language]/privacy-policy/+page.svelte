<script lang="ts">
  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ lang, langs } = data);
</script>

<svelte:head>
  <title>{$t('common.legal.privacy_policy')} | {$t('common.site_name')}</title>
</svelte:head>

<select
  class="select transition border-2 normal-border hover:select-secondary self-end w-full max-w-xs"
  on:input={(e) => {
    goto(`/legal/${e.currentTarget.value}/privacy-policy`);
  }}
>
  {#each langs as l}
    <option value={l} selected={l.toLowerCase() == lang.toLowerCase()}>
      {$t(`common.lang.${l}`)}
    </option>
  {/each}
</select>

{#if lang.toLowerCase() == 'en-us'}
  <h1 id="privacy-policy">Privacy Policy</h1>
  <p>
    PhiZone is a rhythm game community website centered around Phigros fanmade charts, dedicated to
    providing a unified platform for Phigros fanmade chart makers. In order to achieve our purposes,
    we need to collect, store, present (or transmit) certain necessary personal information.
  </p>
  <p>
    In addition to this policy, please also make sure to visit and understand our <a
      href="terms-of-service"
    >
      Terms of Service
    </a>
    .
  </p>
  <h2 id="modifications-to-the-privacy-policy">Modifications to the Privacy Policy</h2>
  <p>
    PhiZone reserves the right to modify the Privacy Policy at any time. The latest version of the
    policy shall prevail.
  </p>
  <p>The last modification date of the Privacy Policy is March 21, 2024.</p>
  <h2 id="information-we-collect-and-store">Information We Collect and Store</h2>
  <p>
    Unless you register an account with PhiZone, we will not collect or store any personal
    information about you.
  </p>
  <h3 id="during-account-registration">During Account Registration</h3>
  <p>During the registration of your account, we collect and store the following information:</p>
  <ol>
    <li>your avatar;</li>
    <li>your email address;</li>
    <li>your username;</li>
    <li>
      your password (PBKDF2 with HMAC-SHA256, 128-bit salt, 256-bit subkey, 10,000 iterations);
    </li>
    <li>your language preference;</li>
    <li>your region preference.</li>
  </ol>
  <p>
    The above list of information is necessary for registering an account. If you do not wish to
    provide your information to us, please do not register an account.
  </p>
  <h3 id="during-user-profile-updates">During User Profile Updates</h3>
  <p>During the update of your user profile, we collect and store the following information:</p>
  <ol>
    <li>your avatar;</li>
    <li>your gender;</li>
    <li>your username;</li>
    <li>your language preference;</li>
    <li>your region preference;</li>
    <li>your date of birth;</li>
    <li>your personal biography.</li>
  </ol>
  <p>
    We do not require you to provide the above list of information. You should be aware that
    providing personal information during user profile updates is voluntary.
  </p>
  <h3 id="during-password-reset">During Password Reset</h3>
  <p>During the password reset process, we collect and store the following information:</p>
  <ol>
    <li>your email address;</li>
    <li>
      your password (PBKDF2 with HMAC-SHA256, 128-bit salt, 256-bit subkey, 10,000 iterations).
    </li>
  </ol>
  <p>
    We do not require you to reset your password. You should be aware that providing personal
    information during the password reset process is voluntary.
  </p>
  <h3 id="during-resource-upload">During Resource Upload</h3>
  <p>
    During the upload of resources, we collect and store all information about the resources you
    upload.
  </p>
  <p>
    In the case of uploading an authorization statement for a song (if required), please clarify
    with the copyright owner in advance that, such statements will be visible to everyone after the
    song is approved.
  </p>
  <p>
    We do not require you to upload resources. You should be aware that providing information during
    resource uploads is voluntary.
  </p>
  <h2 id="information-we-present-or-transmit">Information We Present (or Transmit)</h2>
  <p>
    <em>
      "Present" means the information is visible to everyone; "Transmit" means the information is
      visible to PhiZone staff or legally authorized third parties.
    </em>
  </p>
  <p>
    <em>
      Due to our inability to determine the policies of third parties, "Transmit" is equivalent to
      "Present" in extreme cases.
    </em>
  </p>
  <p>
    Your avatar, username, gender, language preference, region preference, date of birth, personal
    biography, and the approved resources you upload are visible to everyone.
  </p>
  <p>In addition, we may present (or transmit) your other personal information when:</p>
  <ol>
    <li>you expressly make personal information public;</li>
    <li>
      we find that you have violated the Terms of Service or the laws of the People's Republic of
      China and need to take measures;
    </li>
    <li>other measures are necessary to ensure the implementation of the Terms of Service.</li>
  </ol>
  <h2 id="your-rights">Your Rights</h2>
  <p>
    As a user you have the right to update or delete your personal information. This can be done
    primarily from the settings. You can also delete or undo your interactions with various public
    resources, including likes, comments, replies, etc.
  </p>
  <p>
    You have the option of deleting your account from our services. Please note that this is
    currently a manual process and may take several days to complete. If you have a need for this,
    please send an email to <a href="mailto:contact@phizone.cn" target="_blank" class="url">
      contact@phizone.cn
    </a>
    from the email address associated with the target account, stating the specific reasons. Upon receiving
    the email, we will take action within 7 business days. In the case of account deletion, public resources
    you previously uploaded will still remain visible to everyone.
  </p>
  <p>
    You cannot request the deletion of ranked charts or non-original songs at your own discretion.
    If you indeed have a legitimate need to delete the aforementioned resources, or if you have the
    intention or need to delete other types of resources, please send an email to <a
      href="mailto:contact@phizone.cn"
      target="_blank"
      class="url"
    >
      contact@phizone.cn
    </a>
    from the email address associated with the account of the resource owner, stating the specific reasons.
    Upon receiving the email, we will take action within 7 business days.
  </p>
  <h2 id="cookies">Cookies</h2>
  <p>
    We use cookies, as does the rest of the internet. We strictly use them to maintain your session
    state and login credentials across multiple sessions. If you're allergic to cookies, please do
    not use our services.
  </p>
  <h2 id="third-party-links">Third-Party Links</h2>
  <p>
    Our website may contain links to third-party websites. We are not responsible for the privacy
    practices or the content of those websites. We encourage you to review the privacy policies of
    those third-party websites before providing any personal information.
  </p>
  <h2 id="age-restriction">Age Restriction</h2>
  <p>
    We attach great importance to children's privacy. We believe that children under the age of 13
    do not have sufficient subjective judgment ability and need to be under the supervision of legal
    guardians to use our services. Therefore, once it is confirmed that personal information has
    been filled out by children under the age of 13 without the consent of their legal guardians, we
    will take measures to remove this information from the database.
  </p>
  <p>
    Unfortunately, we're unable to determine the occurrence of such situations based on the
    information we collect and store. If you, as a legal guardian, discover such a situation and
    wish for us to take action, please send an email to <a href="mailto:contact@phizone.cn">
      contact@phizone.cn
    </a>
    from the email address associated with the target account, indicating the specific situation and
    the measures you would like us to take. Upon receiving the email, if the situation is determined
    to be true, we will take corresponding measures within 7 business days.
  </p>
  <h2 id="attribution">Attribution</h2>
  <p>
    Part of this text is based on "
    <a href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Privacy/en.md" target="_blank">
      osu! privacy policy
    </a>
    ", which is licensed under CC-BY-NC 4.0.
  </p>
{:else if lang.toLowerCase() == 'zh-cn'}
  <h1 id="隐私政策">隐私政策</h1>
  <p>
    PhiZone 是一个以 Phigros 二创谱面为核心内容的音乐游戏社区网站，致力于为 Phigros
    二创谱面创作者提供统一的谱面分享平台。为了实现以上目的，我们不得不收集、储存、呈现（或传输）一些必要的个人信息。
  </p>
  <p>
    除此政策之外，请确保你阅读并理解我们的
    <a href="terms-of-service">服务条款</a>
    。
  </p>
  <h2 id="隐私政策的更改">隐私政策的更改</h2>
  <p>PhiZone 保留自由更改隐私政策的权利。该政策以最新版为准。</p>
  <p>隐私政策的最后更改日期为 2024 年 3 月 21 日。</p>
  <h2 id="我们收集并储存的信息">我们收集并储存的信息</h2>
  <p>除非你在 PhiZone 注册账户，否则我们不会收集或储存任何关于你的个人信息。</p>
  <h3 id="注册账户时">注册账户时</h3>
  <p>在你注册账户时，我们会收集并储存：</p>
  <ol>
    <li>你的头像；</li>
    <li>你的邮箱地址；</li>
    <li>你的用户名；</li>
    <li>你的密码（PBKDF2 与 HMAC-SHA256，128 位盐值，256 位子密钥，1 万次迭代）；</li>
    <li>你的语言偏好；</li>
    <li>你的地区偏好。</li>
  </ol>
  <p>以上信息是注册账户所必需的。如你不愿提供你的信息给我们，请不要注册账户。</p>
  <h3 id="更新用户资料时">更新用户资料时</h3>
  <p>在你更新你的用户资料时，我们会收集并储存：</p>
  <ol>
    <li>你的头像；</li>
    <li>你的性别；</li>
    <li>你的用户名；</li>
    <li>你的语言偏好；</li>
    <li>你的地区偏好；</li>
    <li>你的出生日期；</li>
    <li>你的个人简介。</li>
  </ol>
  <p>我们不会强制要求你提供以上信息。你应知悉任何在更新用户资料时提供个人信息的行为系自愿行为。</p>
  <h3 id="重置密码时">重置密码时</h3>
  <p>在你重置密码时，我们会收集并储存：</p>
  <ol>
    <li>你的邮箱地址；</li>
    <li>你的密码（PBKDF2 与 HMAC-SHA256，128 位盐值，256 位子密钥，1 万次迭代）。</li>
  </ol>
  <p>我们不会强制要求你重置密码。你应知悉任何在重置密码时提供个人信息的行为系自愿行为。</p>
  <h3 id="上传资源时">上传资源时</h3>
  <p>在你上传资源时，我们会收集并储存关于你所上传资源的所有信息。</p>
  <p>
    其中，在上传曲目的授权声明（如有要求）时，请事先与版权所有人交代，该授权声明将在曲目通过审核后对所有人可见。
  </p>
  <p>我们不会强制要求你上传资源。你应知悉任何在上传资源时提供信息的行为系自愿行为。</p>
  <h2 id="我们呈现或传输）的信息">我们呈现（或传输）的信息</h2>
  <p>
    <em>
      “呈现”意味着该信息对所有人可见；“传输”意味着该信息对 PhiZone
      工作人员或具有法律效力的第三方可见。
    </em>
  </p>
  <p><em>由于我们无法确定第三方的政策，“传输”在极端情形下等同于“呈现”。</em></p>
  <p>
    你的头像、用户名、性别、语言偏好、地区偏好、出生日期、个人简介，以及你所上传的、通过审核的资源对所有人可见。
  </p>
  <p>除此之外，我们还将在以下情形呈现（或传输）你的其他个人信息：</p>
  <ol>
    <li>你明确表达公示个人信息的意愿时；</li>
    <li>我们发现你违反服务条款或中华人民共和国法律，需要采取措施时；</li>
    <li>其他为确保服务条款正常施行而需要采取措施时。</li>
  </ol>
  <h2 id="你的权利">你的权利</h2>
  <p>
    作为用户，你有权更新或删除您的个人信息。你可以通过设置来实现以上目的。你也可以删除或撤回你对各类资源的交互，包括点赞、评论、回复等。
  </p>
  <p>
    你也可以申请删除你的账户。请注意，目前此过程需要人工处理并可能需要几天来完成。如确实有此类需求，请使用目标账户的邮箱地址向
    <a href="mailto:contact@phizone.cn" target="_blank" class="url">contact@phizone.cn</a>
    发送邮件，并注明具体原因。在收到邮件后，我们会在 7 个工作日内采取相应的措施。在账户删除的情况下，你之前已上传的各类公开资源将仍对所有人可见。
  </p>
  <p>
    你无法因个人意愿申请删除你上传的 Ranked
    谱面或非原创曲目。如确实对于上述资源有删除的正当需求，或对于其他类型的资源有删除的意愿或需求，请使用目标资源所有者账户的邮箱地址向
    <a href="mailto:contact@phizone.cn" target="_blank" class="url">contact@phizone.cn</a>
    发送邮件，并注明具体原因。在收到邮件后，我们会在 7 个工作日内采取相应的措施。
  </p>
  <h2 id="cookies">Cookies</h2>
  <p>
    同绝大多数网站一样，我们严格地使用 Cookies 来保持你的会话状态和多个会话间的登录信息。如你对
    Cookies 敏感，请不要使用我们的服务。
  </p>
  <h2 id="第三方链接">第三方链接</h2>
  <p>
    我们的网站可能会包含指向第三方网站的链接。我们不对这些网站的内容或隐私策略负责。在你提供任何个人信息之前，我们建议先查阅这些网站的隐私政策。
  </p>
  <h2 id="年龄限制">年龄限制</h2>
  <p>
    我们十分注重儿童的隐私。我们认为 13
    岁以下的儿童不具有完善的主观判断能力，需要在法定监护人看管下才能保证相对的安全。因此，一旦确认存在
    13 岁以下儿童在未经法定监护人同意下填写个人信息，我们将采取措施从数据库中移除这些信息。
  </p>
  <p>
    然而，我们无法根据我们收集并储存的信息确定上述情况的发生。如你作为法定监护人发现存在相关情况，并希望我们采取措施，请使用目标账户的邮箱地址向
    <a href="mailto:contact@phizone.cn" target="_blank" class="url">contact@phizone.cn</a>
    发送邮件，并注明具体情况以及希望我们采取的措施。在收到邮件后，如认为情况属实，我们会在 7 个工作日内采取相应的措施。
  </p>
  <h2 id="归属">归属</h2>
  <p>
    本文部分内容基于“
    <a href="https://github.com/ppy/osu-wiki/blob/master/wiki/Legal/Privacy/zh.md" target="_blank">
      osu! 隐私政策
    </a>
    ”，并已通过 CC-BY-NC 4.0 获得许可。
  </p>
{/if}

<style>
  h1 {
    @apply text-6xl font-bold mb-6 mt-8;
  }

  h2 {
    @apply text-4xl font-bold mb-6 mt-7;
  }

  h3 {
    @apply text-2xl font-bold mb-6 mt-6;
  }

  p {
    @apply text-lg mb-6;
  }

  a {
    @apply text-accent;
  }

  a:hover {
    @apply underline;
  }

  ol {
    list-style-type: none;
    padding-left: 0;
    counter-reset: item-counter;
    @apply mb-6;
  }

  li {
    display: flex;
    align-items: flex-start;
    @apply text-lg;
  }

  li::before {
    content: counter(item-counter) '.';
    counter-increment: item-counter;
    margin-right: 0.5rem;
    unicode-bidi: isolate;
    font-variant-numeric: tabular-nums;
  }
</style>
