<script lang="ts">
  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ lang, langs } = data);
</script>

<svelte:head>
  <title>{$t('common.legal.copyrigt_policy')} | {$t('common.title')}</title>
</svelte:head>

<select
  class="select transition border-2 border-gray-700 hover:select-secondary self-end w-full max-w-xs"
  on:input={(e) => {
    goto(`/legal/${e.currentTarget.value}/copyright-policy`);
  }}
>
  {#each langs as l}
    <option value={l} selected={l.toLowerCase() == lang.toLowerCase()}>
      {$t(`common.lang.${l}`)}
    </option>
  {/each}
</select>

{#if lang.toLowerCase() == 'en'}
  <h1 id="copyright-policy">Copyright Policy</h1>
  <p>
    PhiZone serves as a rhythm game community website. All game levels (charts) as well as songs are
    created and/or uploaded by community members, often without correctly obtaining permission from
    relevant copyright holders. We go out of our way to not profit directly from uploaded content,
    and the website relies solely on user donations.
  </p>
  <p>
    Considering copyright infringement is inevitable, PhiZone adopts the following policy, in
    accordance with the Digital Millennium Copyright Act.
  </p>
  <p>It is PhiZone's policy to:</p>
  <ol>
    <li>
      expeditiously block access to or remove content that it believes in good faith may contain
      material that infringes the copyrights of third parties;
    </li>
    <li>remove and discontinue service to repeat offenders.</li>
  </ol>
  <p>
    The contact information for PhiZone's Designated Agent to Receive Notification of Claimed
    Infringement ("Designated Agent") is listed at the end of this policy. PhiZone takes copyright
    and other intellectual property rights very seriously.
  </p>
  <h2 id="modifications-to-the-copyright-policy">Modifications to the Copyright Policy</h2>
  <p>
    PhiZone reserves the right to modify the Copyright Policy at any time. The latest version of the
    policy shall prevail.
  </p>
  <p>The last modification date of the Copyright Policy is November 18, 2023.</p>
  <h2 id="reporting-copyright-infringements">Reporting Copyright Infringements</h2>
  <p>
    If you believe that content residing on PhiZone's services infringes your copyright, please send
    a notice of claimed copyright infringement containing the following information to the
    Designated Agent listed below (consult legal counsel to confirm these requirements):
  </p>
  <ol>
    <li>
      a physical or electronic signature of a person authorized to act on behalf of the owner of the
      copyright that has been allegedly infringed;
    </li>
    <li>
      a representative list of the copyrighted works claimed to have been infringed at our site;
    </li>
    <li>
      identification of the material that is claimed to be infringing or to be the subject of
      infringing activity and that is to be removed or access to which is to be disabled, and
      information reasonably sufficient to permit PhiZone to locate the material;
    </li>
    <li>
      contact information for the notifier (such as an address, telephone number and e-mail
      address);
    </li>
    <li>
      a statement that the notifier has a good faith belief that use of the material in the manner
      complained of is not authorized by the copyright owner, its agent, or the law;
    </li>
    <li>
      a statement that the information in the notification is accurate, and under penalty of
      perjury, that the notifying party is authorized to act on behalf of the owner of the copyright
      that is allegedly infringed.
    </li>
  </ol>
  <p>
    Once a complete and proper notice of claimed copyright infringement is received by the
    Designated Agent, or if PhiZone otherwise comes to believe in good faith that a file on
    PhiZone's services may contain content that infringes copyright, it is PhiZone's policy to:
  </p>
  <ol>
    <li>
      remove or disable access to the content identified in the notice of claimed infringement;
    </li>
    <li>
      notify the content provider, member or user that it has removed or disabled access to the
      content;
    </li>
    <li>
      terminate in appropriate circumstances subscribers and account holders who are repeat
      infringers.
    </li>
  </ol>
  <h2 id="submitting-counter-notices">Submitting Counter-Notices</h2>
  <p>
    If the content provider, member or user believes that the content that was removed or to which
    access was disabled is not infringing, or the content provider, member or user believes that it
    has the right to post and use such content from the copyright owner, the copyright owner's
    agent, or pursuant to the law, the content provider, member or user may send a counter-notice
    containing the following information to the Designated Agent listed below:
  </p>
  <ol>
    <li>a physical or electronic signature of the content provider, member or user;</li>
    <li>
      identification of the content that has been removed or to which access has been disabled and
      the location at which the material appeared before it was removed or access to it was
      disabled;
    </li>
    <li>
      a statement under penalty of perjury that the content provider, member or user has a good
      faith belief that the material was removed or disabled as a result of mistake or a
      misidentification of the material to be removed or disabled;
    </li>
    <li>
      content provider's, member's or user's name, address, telephone number, e-mail address, and a
      statement that such person or entity consents to the jurisdiction of the judicial district in
      which the content provider's, member's or user's address is located.
    </li>
  </ol>
  <p>
    If a counter-notice is received by the Designated Agent, PhiZone may send a copy of the
    counter-notice to the original complaining party informing that person that it may replace the
    removed content or cease disabling it in 10 business days. Unless the copyright owner files an
    action seeking a court order against the content provider, member or user, the removed content
    may be replaced, or access to it restored, in 10 to 14 business days or more after receipt of
    the counter-notice, at PhiZone's sole discretion.
  </p>
  <h2 id="attribution">Attribution</h2>
  <p>
    Part of this text is based on "
    <a href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Copyright/en.md">
      osu! copyright policy
    </a>
    ", which is licensed under CC-BY-NC 4.0.
  </p>
  <h2 id="designated-agent-contact-details">Designated Agent Contact Details</h2>
  <p>
    <strong>Email:</strong>
    <a href="mailto:copyright@phizone.cn">copyright@phizone.cn</a>
    (responds in 7 business days)
  </p>
  <p><strong>Postal Address:</strong></p>
  <pre><code>PhiZone Designated Agent
D5-f1205, Guangzhou International Campus, South China University of Technology
Guangzhou, Guangdong, 511442
People's Republic of China
</code></pre>
{:else if lang.toLowerCase() == 'zh-cn'}
  <h1 id="版权政策">版权政策</h1>
  <p>
    PhiZone
    是一个音乐游戏社区网站。所有游戏关卡（谱面）与曲目均由社区成员创作和/或上传。这些行为通常没有正确地从相关版权所有者获得授权。我们努力不直接从这些内容中获利，并且网站的运行完全依赖于用户捐款。
  </p>
  <p>考虑到侵权的问题在所难免，PhiZone 根据数字千年版权法案，采取如下版权政策。</p>
  <p>根据 PhiZone 采取的版权政策，我们将：</p>
  <ol>
    <li>迅速禁用对 PhiZone 根据诚信原则认为侵犯第三方版权的内容的公开访问或进行删除；</li>
    <li>对长期进行侵权行为的用户实施账户删除并停止对其服务。</li>
  </ol>
  <p>
    PhiZone 的指定接受侵权声明通知的代理人（“指定代理人”）的联系信息写在文末。PhiZone
    以十分严肃的态度对待版权和其它知识产权。
  </p>
  <h2 id="版权政策的更改">版权政策的更改</h2>
  <p>PhiZone 保留自由更改版权政策的权利。该政策以最新版为准。</p>
  <p>版权政策的最后更改日期为 2023 年 11 月 18 日。</p>
  <h2 id="举报侵权行为">举报侵权行为</h2>
  <p>
    如你认为 PhiZone
    服务上的内容侵犯了你的版权，请向指定代理人发送包含以下信息的版权侵犯通知（对于以下要求的进一步明确，请联系专业律师）:
  </p>
  <ol>
    <li>授权代表被涉嫌侵权的版权所有者行事的人的实体或电子签名；</li>
    <li>指称被涉嫌侵权的版权作品的清单；</li>
    <li>
      指称进行涉嫌侵权行为的，且需被移除或被禁用访问的材料或主题的清单（需提供足够的信息以使我们能够定位到这些内容）；
    </li>
    <li>申诉者的联系信息（如地址、电话号码、电子邮件地址）；</li>
    <li>
      声明申诉者根据诚信原则认为所投诉的材料的使用未经版权所有者、其代理人或法律的授权的声明；
    </li>
    <li>
      声明该通知的信息准确，并且在知晓所言不实可受伪证罪处罚的情况下，通知方有权代表指称被涉嫌侵权的版权所有者采取行动的声明。
    </li>
  </ol>
  <p>
    当一个完整、适当的版权侵犯通知被指定代理人接收，或 PhiZone 以其它方式根据诚信原则认为 PhiZone
    服务上的任何材料可能包含侵犯版权的内容时，根据 PhiZone 采取的版权政策，我们将：
  </p>
  <ol>
    <li>移除或禁止访问在版权侵犯通知中提及的，指称进行涉嫌侵权行为的内容；</li>
    <li>向内容提供者、社区成员或用户通知，材料已被移除或被禁用访问；</li>
    <li>在合适的条件下终止对被认定长期进行侵权行为的用户提供服务。</li>
  </ol>
  <h2 id="递交反通知">递交反通知</h2>
  <p>
    如果被移除或被禁用访问内容的提供者、社区成员或用户认为其没有侵权，或内容提供者、社区成员或用户认为其已从版权拥有者、其代理人，或依法得到授权，有权发表并使用涉及的内容时，内容提供者、社区成员或用户可以向指定代理人发送包含以下信息的反通知：
  </p>
  <ol>
    <li>内容提供者、社区成员或用户的实体或电子签名；</li>
    <li>被移除或被禁用访问的材料清单及其在被移除或被禁用访问前所处的位置；</li>
    <li>
      声明内容提供者、社区成员或用户，在知晓所言不实可受伪证罪处罚的情况下，根据诚信原则认为涉及的材料因差错，或对原本需要移除或禁用访问的材料的错误识别而被移除或被禁用访问的声明；
    </li>
    <li>
      内容提供者、社区成员或用户的姓名、地址、电话号码、电子邮件地址，以及声明此人或实体同意接受内容提供者、社区成员或用户所在地的司法管辖的声明。
    </li>
  </ol>
  <p>
    若指定代理人收到反对通知书，PhiZone
    会向原始举报者发送一份反通知的副本以声明被移除或被禁用访问的内容可能在 10
    个工作日内被恢复或解除访问禁用。除非版权所有者针对内容提供者、社区成员或用户提起诉讼寻求法院命令，否则在收到反通知后的
    10 ~ 14 个工作日或更长时间内，PhiZone
    将自行决定替换被移除或被禁用访问的内容或解除对其的访问禁用。
  </p>
  <h2 id="归属">归属</h2>
  <p>
    本文部分内容基于“
    <a href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Copyright/zh.md">
      osu! 版权政策
    </a>
    ”，并已通过 CC-BY-NC 4.0 获得许可。
  </p>
  <h2 id="指定代理人联系方式">指定代理人联系方式</h2>
  <p>
    <strong>电子邮件地址：</strong>
    <a href="mailto:copyright@phizone.cn">copyright@phizone.cn</a>
    （7 个工作日内回复）
  </p>
  <p><strong>邮寄地址：</strong></p>
  <pre><code>邮政编码 511442
中华人民共和国 广东省 广州市
华南理工大学 广州国际校区 D5f-1205
PhiZone 指定代理人	收
</code></pre>
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
