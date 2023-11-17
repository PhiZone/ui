<script lang="ts">
  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ lang, langs } = data);
</script>

<svelte:head>
  <title>{$t('common.legal.terms_of_service')} | {$t('common.title')}</title>
</svelte:head>

<select
  class="select transition border-2 border-gray-700 hover:select-secondary self-end w-full max-w-xs"
  on:input={(e) => {
    goto(`/legal/${e.currentTarget.value}/terms-of-service`);
  }}
>
  {#each langs as l}
    <option value={l} selected={l.toLowerCase() == lang.toLowerCase()}>
      {$t(`common.lang.${l}`)}
    </option>
  {/each}
</select>

{#if lang.toLowerCase() == 'en'}
  <h1 id="terms-of-service">Terms of Service</h1>
  <p>Before you use services we provide, you must read and agree with the following terms.</p>
  <p>
    By visiting and using the services offered by the websites (
    <a href="https://www.phi.zone/">www.phi.zone</a>
    ,
    <a href="https://insider.phizone.cn/">insider.phizone.cn</a>
    ) or the APIs (
    <a href="https://api.phi.zone/">api.phi.zone</a>
    ,
    <a href="https://api.phizone.cn/">api.phizone.cn</a>
    ) (henceforth referenced as "PhiZone"), you are acknowledging your full compliance to the terms and
    conditions listed here, and guaranteeing that you will not use PhiZone and any of its content for
    any purpose prohibited by the Terms of Service or in violation of the laws of the People's Republic
    of China.
  </p>
  <p>
    In addition to this policy, please also make sure to visit and understand our <a
      href="privacy-policy"
    >
      Privacy Policy
    </a>
    .
  </p>
  <p>
    If you violate any of these Terms of Use, your permission to use PhiZone automatically
    terminates.
  </p>
  <h2 id="description-of-service">Description of Service</h2>
  <p>
    PhiZone is an online platform that hosts content centered around Phigros fanmade charts and
    provides users with ways to upload, download and share content free of charge.
  </p>
  <p>
    We assume no responsibility to review or disable User Submissions, or to guarantee that users
    have the rights to distribute Content and that we're responsible for the resulting consequences.
  </p>
  <h2 id="modifications-to-terms-of-service">Modifications to Terms of Service</h2>
  <p>
    PhiZone reserves the right to modify the Terms of Service. The latest version of the policy
    shall prevail.
  </p>
  <p>The last modification date of the Terms of Service is November 18, 2023.</p>
  <h2 id="modifications-to-service">Modifications to Service</h2>
  <p>
    PhiZone reserves the right to modify or discontinue the Service. The Terms of Service is only
    applicable to the latest version of the Service.
  </p>
  <p>
    PhiZone shall not be liable to User or any third party should PhiZone exercise its right to
    modify or discontinue the Service.
  </p>
  <h2 id="disclaimer-of-warranties">Disclaimer of Warranties</h2>
  <p>
    User expressly agrees that use of the Service is at User's sole risk. The Service is provided on
    an "As Is" and "As Available" basis.
  </p>
  <p>
    You understand and expressly agree that use of PhiZone's services is at your sole risk, that any
    material and data downloaded or otherwise obtained through the use of PhiZone's websites, APIs
    (and any other service driven by the APIs) is at your own discretion and risk and that you will
    be solely responsible for any damage to your computer system or loss of data that results from
    the download of such material and data.
  </p>
  <p>
    Except as expressly set forth on our services, PhiZone disclaims all warranties of any kind,
    express or implied, including without limitation any warranty of merchantability, fitness for a
    particular purpose, non-infringement or title; and it makes no warranty or representation
    regarding the results that may be obtained from the use of PhiZone's services, regarding the
    accuracy or reliability of any information obtained through PhiZone's services, regarding any
    goods or services purchased or obtained through PhiZone's services, regarding any transactions
    entered into through PhiZone's services or that PhiZone's services will meet any user's
    requirements, be uninterrupted, timely, secure or error free.
  </p>
  <p>
    The links to third-party sites on PhiZone are for your convenience only, and the inclusion of
    such links does not imply any endorsement, guarantee, warranty or representation by PhiZone.
  </p>
  <p>
    User agrees that PhiZone is hereby absolved from any and all liabilities, losses, costs and
    claims, including attorney's fees asserted against PhiZone, its managers, administrators,
    employees, or any other collaborators, that may arise or result from any service provided,
    performed, be agreed to be performed by PhiZone.
  </p>
  <p>
    PhiZone makes no warranty that the Service will meet your requirements, or that the Service will
    be uninterrupted, timely, secure, or error-free; nor does PhiZone make any warranty as to the
    results that may be obtained from the use of the Service or as to the accuracy or reliability of
    any information obtained through the Service or that defects in the Service will be corrected.
  </p>
  <h2 id="limitation-of-liability">Limitation of Liability</h2>
  <p>
    In no event shall PhiZone, its managers, administrators, employees, or any other collaborators,
    be liable to you for any direct, indirect, incidental, special, punitive, or consequential
    damages whatsoever resulting from:
  </p>
  <ol>
    <li>any errors, mistakes, or inaccuracies of content;</li>
    <li>
      any personal injury or property damage, of any nature whatsoever, resulting from your access
      to and use of our services;
    </li>
    <li>
      any unauthorized access to or use of our secure servers and/or any and all personal
      information and/or financial information stored therein;
    </li>
    <li>any interruption or cessation of transmission to or from our services;</li>
    <li>
      any bugs, viruses, trojan horses, or the like, which may be transmitted to or through our
      services by any third party;
    </li>
    <li>
      any errors or omissions in any content or for any loss or damage of any kind incurred as a
      result of your use of any content posted, transmitted, or otherwise made available via
      PhiZone, whether based on warranty, contract, tort, or any other legal theory, and whether or
      not we are advised of the possibility of such damages.
    </li>
  </ol>
  <p>
    You specifically acknowledge that PhiZone shall not be liable for user submissions or the
    defamatory, offensive, or illegal conduct of any third party and that the risk of harm or damage
    from the foregoing rests entirely with you.
  </p>
  <p>
    PhiZone provides its services using facilities located within the People's Republic of China and
    strictly complies with the laws of the People's Republic of China. Users accessing PhiZone from
    other jurisdictions are responsible for compliance with local laws.
  </p>
  <h2 id="indemnity">Indemnity</h2>
  <p>
    You agree to defend, indemnify and hold harmless PhiZone, its managers, administrators,
    employees, or any other collaborators, from and against any and all claims, damages,
    obligations, losses, liabilities, costs or debt, and expenses (including but not limited to
    attorney's fees) arising from:
  </p>
  <ol>
    <li>your use of and access to PhiZone;</li>
    <li>your violation of any term of these Terms of Service;</li>
    <li>
      your violation of any third-party right, including without limitation any copyright, property,
      or privacy right;
    </li>
    <li>any claim that one of your User Submissions caused damage to a third party.</li>
  </ol>
  <p>
    This defense and indemnification obligation will survive these Terms of Service and your use of
    PhiZone.
  </p>
  <h2 id="your-use-of-content-on-the-service">Your Use of Content on the Service</h2>
  <p>
    You understand that when using PhiZone, you will be exposed to User Submissions from a variety
    of sources, and that PhiZone is not responsible for the accuracy, usefulness, safety, or
    intellectual property rights of or relating to such User Submissions.
  </p>
  <p>
    You further understand and acknowledge that you may be exposed to User Submissions that are
    inaccurate, offensive, indecent, or objectionable, and you agree to waive, and hereby do waive,
    any legal or equitable rights or remedies you have or may have against PhiZone with respect
    thereto, and agree to indemnify and hold PhiZone, its owners, operators and/or licensors,
    harmless to the fullest extent allowed by law regarding all matters related to your use of the
    site.
  </p>
  <h2 id="user-submissions-and-content-removal">User Submissions and Content Removal</h2>
  <p>
    You shall be solely responsible for your own User Submissions and the consequences of posting or
    publishing them.
  </p>
  <p>
    In connection with User Submissions, you affirm, represent, and/or warrant that: you own or have
    the necessary licenses, rights, consents, and permissions to use and authorize PhiZone to use
    all patent, trademark, trade secret, copyright or other proprietary rights in and to any and all
    User Submissions to enable inclusion and use of the User Submissions in the manner contemplated
    by the Website and these Terms of Service.
  </p>
  <p>
    In connection with User Submissions, you further agree that you will not submit material that is
    copyrighted, protected by trade secret or otherwise subject to third-party proprietary rights,
    including privacy and publicity rights, unless you are the owner of such rights or have
    permission from their rightful owner to post the material and to grant PhiZone all of the
    license rights granted herein.
  </p>
  <p>
    PhiZone does not endorse any User Submission or any opinion, recommendation, or advice expressed
    therein, and PhiZone expressly disclaims any and all liability in connection with User
    Submissions.
  </p>
  <p>
    PhiZone does not permit copyright infringing activities and infringement of intellectual
    property rights on its Service, and PhiZone will remove all Content and User Submissions if
    properly notified that such Content or User Submission infringes on another's intellectual
    property rights.
  </p>
  <p>PhiZone reserves the right to remove Content and User Submissions without prior notice.</p>
  <h2 id="privacy-policies">Privacy Policies</h2>
  <p>
    Please refer to the <a href="privacy-policy">Privacy Policy</a>
    .
  </p>
  <h2 id="proprietary-rights-to-content">Proprietary Rights to Content</h2>
  <p>
    User acknowledges that Content, including but not limited to text, software, music, sound,
    photographs, video, graphics, name references or other material contained in either sponsor
    advertisements or search results, provided to or accessed by User via the Service by PhiZone, is
    protected by copyrights, trademarks, service marks, patents or other proprietary rights and
    laws; therefore, User is only permitted to use this Content as expressly authorized by the
    Service.
  </p>
  <p>
    Unless authorized by laws or licenses, User may not use this Content for activities that
    allegedly infringe the rights of the copyright owner, such as distributing or creating
    derivative works.
  </p>
  <h2 id="third-party-links">Third-Party Links</h2>
  <p>PhiZone may provide links to third-party sites or resources.</p>
  <p>
    User acknowledges and agrees that PhiZone is not responsible for the availability of such sites
    or resources, and does not endorse and is not responsible or liable for any content,
    advertising, products, or other materials on or available from such sites or resources.
  </p>
  <p>
    User agrees that PhiZone shall not be responsible or liable, directly or indirectly, for any
    damage or loss caused or alleged to be caused by or in connection with use of or reliance on any
    such content, goods or services available on such sites or resources.
  </p>
  <h2 id="law-constraints">Law Constraints</h2>
  <p>
    All activities, measures, and content of PhiZone, including these Terms, are subject to the laws
    of the People's Republic of China. When accessing PhiZone, User must abide by the laws of
    his/her jurisdiction and the laws of the People's Republic of China.
  </p>
  <h2 id="attribution">Attribution</h2>
  <p>
    Part of this text is based on "
    <a href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Terms/en.md">
      osu! terms of service
    </a>
    ", which is licensed under CC-BY-NC 4.0.
  </p>
{:else if lang.toLowerCase() == 'zh-cn'}
  <h1 id="服务条款">服务条款</h1>
  <p>在使用我们提供的服务之前，你必须阅读并同意以下内容。</p>
  <p>
    访问与使用网站（
    <a href="https://www.phi.zone/">www.phi.zone</a>
    、
    <a href="https://insider.phizone.cn/">insider.phizone.cn</a>
    ）与 API（
    <a href="https://api.phi.zone/">api.phi.zone</a>
    、
    <a href="https://api.phizone.cn/">api.phizone.cn</a>
    ）（以下统称“PhiZone”）即代表你完全理解并遵守此处列出的条款，且保证你不会将 PhiZone 及其提供的任何内容用于任何被条款禁止或违反中华人民共和国法律的目的。
  </p>
  <p>
    除此条款之外，请确保你阅读并理解我们的
    <a href="privacy-policy">隐私政策</a>
    。
  </p>
  <p>如果我们发现你违反服务条款的任何内容，你对 PhiZone 的使用权将自动终止。</p>
  <h2 id="服务描述">服务描述</h2>
  <p>
    PhiZone 是一个内容托管平台，向用户免费提供上传、下载与分享内容的方式。平台的主要内容为 Phigros
    二创谱面。
  </p>
  <p>
    对于用户发布内容，PhiZone
    没有义务进行任何审查或禁用；不保证用户拥有分发内容的权利，并且不对由此造成的后果承担责任。
  </p>
  <h2 id="服务条款的更改">服务条款的更改</h2>
  <p>PhiZone 保留自由更改服务条款的权利。该条款以最新版为准。</p>
  <p>服务条款的最后更改日期为 2023 年 11 月 18 日。</p>
  <h2 id="服务的更改">服务的更改</h2>
  <p>PhiZone 保留更改或终止服务的权利。该条款仅适用于最新版服务。</p>
  <p>PhiZone 不就行使更改或终止服务的权利对任何用户或第三方负责。</p>
  <h2 id="责任的免除">责任的免除</h2>
  <p>用户明确同意对本服务的使用由用户自行承担风险。服务“以原样”和“以可用性”原则提供。</p>
  <p>
    你知晓并明确同意对 PhiZone 服务的使用由你自己承担风险，即以访问 PhiZone 网站、使用 PhiZone
    API（及由其驱动的任何服务）等方式从 PhiZone
    获取的资料与数据都是由你自己决定，并由你自己承担风险，同时你应独自承担任何因获取该类资料与数据造成的对你所使用的计算机系统的任何（潜在）破坏的责任。
  </p>
  <p>
    除非在我们的服务上明确规定，否则 PhiZone
    不对任何类型的保证承担责任，包括但不限于对适销性、特定用途的适用性、非侵权或所有权的任何保证；并且对于使用
    PhiZone 的服务可能获得的结果，通过 PhiZone 的服务获得的任何信息的准确性或可靠性，通过 PhiZone
    的服务购买或获取的任何商品或服务，通过 PhiZone 的服务进行的任何交易，或者 PhiZone
    的服务能否满足任何用户的要求，是否连续、及时、安全或无错误，PhiZone 不提供任何保证或陈述。
  </p>
  <p>
    除非明确说明，否则 PhiZone 提供的指向第三方站点的链接仅出于用户的便利，并不能代表 PhiZone
    的任何保证或背书。
  </p>
  <p>
    用户明确同意免除可能由任何 PhiZone
    提供的、履行的或同意履行的任何服务导致的全部债务、损失、费用和索赔，包括起诉
    PhiZone、其管理人员、行政人员、雇员及其他合作人员的律师费。
  </p>
  <p>
    PhiZone 不保证服务能否满足你的要求，是否连续、及时、安全或无错误；PhiZone
    不对通过使用服务得到的可能的结果、通过使用服务获取信息的准确性和可靠性或服务中存在的缺陷的改进做出任何保证。
  </p>
  <h2 id="责任的限制">责任的限制</h2>
  <p>
    在任何情况下，PhiZone、其管理人员、行政人员、雇员及其他合作人员都不应因以下事件对你造成的任何直接、间接、附加、特殊的任何损害或后果负责：
  </p>
  <ol>
    <li>内容的任何误差、错误或不准确；</li>
    <li>因你访问并使用我们的服务造成的任何形式的人身伤害或财产损失；</li>
    <li>任何对我们安全服务器和/或其中储存的所有个人信息和/或财产信息的未授权访问或使用；</li>
    <li>在我们服务上的任何传输的中断或停止；</li>
    <li>由任何第三方传输到或通过我们服务器的任何错误、病毒、木马或类似物；</li>
    <li>
      因你使用通过 PhiZone
      发布、转发或以其他方式提供的任何内容而导致的任何错误或遗漏，或任何种类的损失或损害，无论它们是否基于保证、合约、民事侵权行为或任何法律理论，无论我们是否被告知可能发生此类损害。
    </li>
  </ol>
  <p>
    你明确知晓 PhiZone
    不对用户的发布和任何来自第三方的诽谤、攻击性或违法行为负责，并且由以上行为导致的伤害和损失的风险完全由你承担。
  </p>
  <p>
    PhiZone
    使用位于中华人民共和国内的设施提供服务，并严格遵守中华人民共和国的法律。于其他司法管辖区访问
    PhiZone 的用户应有责任遵守当地法律。
  </p>
  <h2 id="赔偿条款">赔偿条款</h2>
  <p>
    你同意保护并使
    PhiZone、其管理人员、行政人员、雇员及其他合作人员免受任何索赔、损害、义务、损失、责任、债务和费用（包括但不限于律师费）的影响，包括但不限于以下情况：
  </p>
  <ol>
    <li>你对 PhiZone 的访问与使用；</li>
    <li>你对服务条款的任何形式的违反；</li>
    <li>你对任何第三方权利的侵害，包括但不限于版权、财产或隐私权；</li>
    <li>任何声称你所提交的内容对第三方造成了损害的索赔。</li>
  </ol>
  <p>保护和赔偿的义务将在本服务条款或你对 PhiZone 的使用结束后继续有效。</p>
  <h2 id="服务内容的使用">服务内容的使用</h2>
  <p>
    你知晓当使用 PhiZone 时，你将会看到不同来源的用户发布内容，并且 PhiZone
    不对这些用户发布内容的准确性、实用性、安全性和与之相关的知识产权负责。
  </p>
  <p>
    你同时知晓并了解你可能遇到不准确的、淫秽的、令人反感的、具有攻击性的用户发布内容，你同意并在此放弃你对
    PhiZone 在此方面可能具有的任何法律或公平权利或救济措施，并同意在法律允许的最大范围内使 PhiZone
    及其所有者、运营商和/或许可方免受与你使用 PhiZone 相关的所有事项的侵害。
  </p>
  <h2 id="用户发布内容与内容移除">用户发布内容与内容移除</h2>
  <p>你应对你所发布的内容及其后果完全负责。</p>
  <p>
    在与用户发布内容相关的事项上，你确认、声明和/或保证：你拥有或具备必要的许可、权利和权限，以使用并授权
    PhiZone
    使用一切用户发布内容中的专利、商标、商业秘密、版权或其他专有权利，以使用户发布内容能够按照
    PhiZone 与服务条款所设计的方式包含和使用。
  </p>
  <p>
    在与用户发布内容相关的事项上，你同时同意，除非你是此类权利的所有者（或由合法所有者授权）并授予
    PhiZone
    所有在此授予的许可权，否则你将不会发布明确声称受版权保护的、受商业机密保护的或以其它方式受制于包括私有和公有权利在内的第三方所有权的内容。
  </p>
  <p>
    PhiZone 不支持任何用户发布内容或其中的任何观点、推荐或建议，同时 PhiZone
    明确地拒绝承担任何与用户发布内容相关的责任。
  </p>
  <p>
    PhiZone 不允许著作权侵犯活动和对知识产权的侵犯。如果 PhiZone
    被明确告知有内容或用户发布内容侵犯了他人的知识产权，PhiZone 将删除所有相关内容和用户发布内容。
  </p>
  <p>PhiZone 保留在不另行通知的情况下移除内容和用户发布内容的权利。</p>
  <h2 id="隐私政策">隐私政策</h2>
  <p>
    请参阅
    <a href="privacy-policy">隐私政策</a>
    。
  </p>
  <h2 id="内容所有权">内容所有权</h2>
  <p>
    用户知晓 PhiZone
    提供给用户通过服务访问的内容，包括但不限于文本、软件、音乐、声音、照片、视频、图形、名称参考或其他材料（包括在赞助商广告与搜索结果中的），受版权、商标、服务标志、专利或其他专有权利和法律的保护。因此，用户只能按照服务的明确授权来使用上述内容。
  </p>
  <p>
    在没有法律或许可授权的情况下，用户不得使用 PhiZone
    的内容用于诸如分发或二次创作等涉嫌侵犯版权所有者权益的活动。
  </p>
  <h2 id="第三方链接">第三方链接</h2>
  <p>PhiZone 可能提供指向第三方站点或资源的链接。</p>
  <p>
    用户知晓并同意 PhiZone
    对此类第三方站点或资源的可用性不负责任，并且不对任何在此类站点或资源可用的内容、宣传、物品或其他材料支持、负责。
  </p>
  <p>
    用户同意 PhiZone
    不对因使用或依赖此类外部站点或资源上的任何内容、商品或服务而导致或声称导致的任何损害或损失承担直接或间接的责任。
  </p>
  <h2 id="法律约束">法律约束</h2>
  <p>
    PhiZone 的一切活动、措施、内容，包括本条款在内，均受到中华人民共和国法律的约束。用户在使用
    PhiZone 时，须遵守用户所在地区的法律与中华人民共和国法律。
  </p>
  <h2 id="归属">归属</h2>
  <p>
    本文部分内容基于“
    <a href="https://github.com/ppy/osu-wiki/blob/master/wiki/Legal/Terms/zh.md">osu! 服务条款</a>
    ”，并已通过 CC-BY-NC 4.0 获得许可。
  </p>
{/if}

<style>
  h1 {
    @apply text-6xl font-bold mb-6 mt-8;
  }

  h2 {
    @apply text-4xl font-bold mb-4 mt-6;
  }

  p {
    @apply text-lg mb-2;
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
    @apply mb-2;
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
