<script lang="ts">
  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ lang, langs } = data);
</script>

<svelte:head>
  <title>{$t('common.legal.copyright_policy')} | {$t('common.title')}</title>
</svelte:head>

<select
  class="select transition border-2 normal-border hover:select-secondary self-end w-full max-w-xs"
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

{#if lang.toLowerCase() == 'en-us'}
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
  <p>The last modification date of the Copyright Policy is March 21, 2024.</p>
  <h2 id="active-defense-against-copyright-infringements">
    Active Defense Against Copyright Infringements
  </h2>
  <p>
    PhiZone has a built-in system that actively reports potential copyright infringements on user
    submissions. We store <a href="/resource-records">Resource Records</a>
    in our database, which help the system identify user submissions that need restricting or rejecting.
    A Resource Record is comprised of the following fields:
  </p>
  <ol>
    <li>title;</li>
    <li>
      type (i.e. <code>0</code>
      for "Music" and
      <code>1</code>
      for "Illustration");
    </li>
    <li>
      edition type (i.e. <code>0</code>
      for "Original Ver.",
      <code>1</code>
      for "Author's Edit", and
      <code>2</code>
      for "Second-Party Edit");
    </li>
    <li>
      name/origin of edition (e.g. "Arcaea Edit"; leaving blank is suggested when the edition type
      is <code>0</code>
      );
    </li>
    <li>
      strategy (i.e. <code>0</code>
      for "Accept",
      <code>1</code>
      for "Make hidden",
      <code>2</code>
      for "Make locked",
      <code>3</code>
      for "Make hidden and locked", and
      <code>4</code>
      for "Reject");
    </li>
    <li>author's name;</li>
    <li>copyright owner's name;</li>
    <li>source URL;</li>
    <li>description (optional).</li>
  </ol>
  <p>
    The system searches for Resource Records that match the title, the edition (both the edition
    type and the name/origin of edition), and the author's name of a user submission, and that has a
    strategy other than "Accept". If any Resource Records satisfy these conditions, they will be
    displayed on the submission page and, if the user insists, on the info page of the submission.
    Moderators are responsible for implementing the strategy specified by the corresponding Resource
    Records. In cases where multiple Resource Records with different strategies match, moderators
    act upon the strictest one.
  </p>
  <p>
    If you, as a copyright owner, want your content included in this system, please create a pull
    request at our repository <a href="https://github.com/PhiZone/resource-records" target="_blank">
      resource-records
    </a>
    with a CSV file that contains information aforementioned. The file should be created within a directory
    titled as the (concise) name of the copyright owner, following a naming convention in the form of
    <code>&lt;game/work&gt;-&lt;update/operation&gt;.csv</code>
    (e.g.
    <code>lowiro/arcaea-imagining-after.csv</code>
    ,
    <code>rayark/cytusii-5.0-update.csv</code>
    ). An example for this CSV file is as follows:
  </p>
  <div class="mockup-code max-w-fit mb-2">
    <pre><code>Title,Type,Edition Type,Edition,Strategy,Author,Copyright Owner,Source,Description</code></pre>
    <pre><code>Used to be,0,0,,4,KIVΛ,Rayark Inc.,https://www.youtube.com/watch?v=hGaJNvkRfo0,</code></pre>
    <pre><code>Abstruse Dilemma,0,1,"""D"" side long ver.",4,Ashrount vs. 打打だいず,lowiro Ltd.,https://www.youtube.com/watch?v=7VOuvpq20NQ,</code></pre>
    <pre><code>Sheriruth (Laur Remix),0,0,,4,Laur,"lowiro Ltd., Marvelous Inc. & HARDCORE TANO*C",https://www.youtube.com/watch?v=e09aoYJcNSU,</code></pre>
    <pre><code>Einherjar Joker,0,1,Requiem EXTENDED MIX,4,DJ Genki vs Gram,lowiro Ltd. & HARDCORE TANO*C,https://www.youtube.com/watch?v=pdmtqN68vOg,</code></pre>
    <pre><code>Wish Upon a Snow,0,0,,4,打打だいず,lowiro Ltd.,https://www.youtube.com/watch?v=0L0J8PhHy0E,"Winning entry in Arcaea Song Contest - 3rd Movement ""Imagining After""".</code></pre>
    <pre><code>今年も「雪降り、メリクリ」目指して頑張ります！！,0,0,,4,AiSS vs. 华牧狸 w/ 夜輪 ft. 結月ゆかり,"Xiamen Pigeon Games Network Co., Ltd.",https://www.bilibili.com/video/BV1ic41157r1/,</code></pre>
  </div>
  <p>
    Please adhere to the specified order of the fields as illustrated in the example and ensure that
    they are separated by commas without any spaces before or after them. To include commas in your
    data, enclose the field in quotation marks. To preserve in-data quotation marks, double them in
    a quoted field. Upon receiving the pull request, we will take action within 7 business days.
  </p>
  <p>
    Alternatively, you may join our group chat on QQ (
    <a
      href="https://h5.qun.qq.com/h5/qun-share-page/?_wv=1027&k=O2GbdboCc4etoeMMkJk8dCFVO6BueaKY&authKey=%2FZ810eNpglqIj6Ft7AJtVKHrZTP1VFmWVYQlvhhjur9s1IReWUXz38IqWDPwNRwF&market_channel_source=714344319_1&noverify=0&group_code=714344319"
      target="_blank"
    >
      714344319
    </a>
    ) to discuss related issues.
  </p>

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
    <a
      href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Copyright/en.md"
      target="_blank"
    >
      osu! copyright policy
    </a>
    ", which is licensed under CC-BY-NC 4.0.
  </p>
  <h2 id="designated-agent-contact-details">Designated Agent Contact Details</h2>
  <p>
    <strong>Email:</strong>
    <a href="mailto:copyright@phi.zone">copyright@phi.zone</a>
    (responds in 7 business days)
  </p>
  <p><strong>Postal Address:</strong></p>
  <div class="mockup-code max-w-fit mb-2">
    <pre><code>PhiZone Designated Agent</code></pre>
    <pre><code>D5-f1205, Guangzhou International Campus, South China University of Technology</code></pre>
    <pre><code>Guangzhou, Guangdong, 511442</code></pre>
    <pre><code>People's Republic of China</code></pre>
  </div>
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
  <p>版权政策的最后更改日期为 2024 年 3 月 21 日。</p>
  <h2 id="针对侵权行为的主动防御">针对侵权行为的主动防御</h2>
  <p>
    PhiZone
    内置主动报告用户稿件中的涉嫌侵权行为的系统。我们在数据库中储存用于协助识别需要限制或退回的用户稿件的
    <a href="/resource-records">资源记录</a>
    。一条资源记录包含以下字段：
  </p>
  <ol>
    <li>标题；</li>
    <li>
      类型（
      <code>0</code>
      对应“曲目”，
      <code>1</code>
      对应“插画”）；
    </li>
    <li>
      版本类型（
      <code>0</code>
      对应“原版”，
      <code>1</code>
      对应“作者改编版”，
      <code>2</code>
      对应“第二方改编版”）；
    </li>
    <li>
      版本名称或出处（例如“Arcaea Edit”；当版本类型为 <code>0</code>
      时建议留空）；
    </li>
    <li>
      策略（
      <code>0</code>
      对应“允许”，
      <code>1</code>
      对应“隐藏”，
      <code>2</code>
      对应“锁定”，
      <code>3</code>
      对应“隐藏并锁定”，
      <code>4</code>
      对应“禁止”）；
    </li>
    <li>作者名义；</li>
    <li>版权所有者名义；</li>
    <li>发布源 URL；</li>
    <li>简介（选填）。</li>
  </ol>
  <p>
    系统搜索与用户稿件的标题、版本（包括版本类型和版本名称或出处）和作者名义匹配的、不以“接受”为策略的资源记录。满足这些条件的资源记录将显示在上传页面；如果用户坚持提交，亦将显示在稿件的详情页面。版主负责执行相应资源记录指定的策略。在多个具有不同策略的资源记录匹配的情况下，版主将根据最严格的策略执行操作。
  </p>
  <p>
    如你作为版权所有者希望你的内容包含在本系统中，请在我们的仓库 <a
      href="https://github.com/PhiZone/resource-records"
      target="_blank"
    >
      resource-records
    </a>
    上创建拉取请求，并提供包含上述信息的 CSV 文件。文件应创建在版权所有者名义（简称）目录下，并以
    <code>&lt;游戏或作品名&gt;-&lt;操作或更新名&gt;.csv</code>
    的格式命名（例：
    <code>lowiro/arcaea-imagining-after.csv</code>
    、
    <code>rayark/cytusii-5.0-update.csv</code>
    ）。以下为 CSV 文件示例：
  </p>
  <div class="mockup-code max-w-fit mb-2">
    <pre><code>标题,类型,版本类型,版本,策略,作者,版权所有者,来源,简介</code></pre>
    <pre><code>Used to be,0,0,,4,KIVΛ,Rayark Inc.,https://www.youtube.com/watch?v=hGaJNvkRfo0,</code></pre>
    <pre><code>Abstruse Dilemma,0,1,"""D"" side long ver.",4,Ashrount vs. 打打だいず,lowiro Ltd.,https://www.youtube.com/watch?v=7VOuvpq20NQ,</code></pre>
    <pre><code>Sheriruth (Laur Remix),0,0,,4,Laur,"lowiro Ltd., Marvelous Inc. & HARDCORE TANO*C",https://www.youtube.com/watch?v=e09aoYJcNSU,</code></pre>
    <pre><code>Einherjar Joker,0,1,Requiem EXTENDED MIX,4,DJ Genki vs Gram,lowiro Ltd. & HARDCORE TANO*C,https://www.youtube.com/watch?v=pdmtqN68vOg,</code></pre>
    <pre><code>Wish Upon a Snow,0,0,,4,打打だいず,lowiro Ltd.,https://www.youtube.com/watch?v=0L0J8PhHy0E,"Winning entry in Arcaea Song Contest - 3rd Movement ""Imagining After""".</code></pre>
    <pre><code>今年も「雪降り、メリクリ」目指して頑張ります！！,0,0,,4,AiSS vs. 华牧狸 w/ 夜輪 ft. 結月ゆかり,"Xiamen Pigeon Games Network Co., Ltd.",https://www.bilibili.com/video/BV1ic41157r1/,</code></pre>
  </div>
  <p>
    请注意，字段的顺序须为示例所述，并且须以前后无空格的逗号分隔字段；如字段存在逗号，请使用双引号（
    <code>"</code>
    ）括起该字段；如字段存在双引号，请将其双写并用双引号括起该字段。在收到拉取请求后，我们会在 7 个工作日内采取相应的措施。
  </p>
  <p>
    或者，你亦可以加入 QQ 群（
    <a
      href="https://h5.qun.qq.com/h5/qun-share-page/?_wv=1027&k=O2GbdboCc4etoeMMkJk8dCFVO6BueaKY&authKey=%2FZ810eNpglqIj6Ft7AJtVKHrZTP1VFmWVYQlvhhjur9s1IReWUXz38IqWDPwNRwF&market_channel_source=714344319_1&noverify=0&group_code=714344319"
      target="_blank"
    >
      714344319
    </a>
    ）进行相关事宜的讨论。
  </p>

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
    若指定代理人收到反通知，PhiZone
    会向原始举报者发送一份反通知的副本以声明被移除或被禁用访问的内容可能在 10
    个工作日内被恢复或解除访问禁用。除非版权所有者针对内容提供者、社区成员或用户提起诉讼寻求法院命令，否则在收到反通知后的
    10 ~ 14 个工作日或更长时间内，PhiZone
    将自行决定替换被移除或被禁用访问的内容或解除对其的访问禁用。
  </p>
  <h2 id="归属">归属</h2>
  <p>
    本文部分内容基于“
    <a
      href="https://github.com/ppy/osu-wiki/tree/master/wiki/Legal/Copyright/zh.md"
      target="_blank"
    >
      osu! 版权政策
    </a>
    ”，并已通过 CC-BY-NC 4.0 获得许可。
  </p>
  <h2 id="指定代理人联系方式">指定代理人联系方式</h2>
  <p>
    <strong>电子邮件地址：</strong>
    <a href="mailto:copyright@phi.zone">copyright@phi.zone</a>
    （7 个工作日内回复）
  </p>
  <p><strong>邮寄地址：</strong></p>
  <div class="mockup-code hover:shadow-lg max-w-fit mb-2">
    <pre><code>邮政编码 511442</code></pre>
    <pre><code>中华人民共和国 广东省 广州市</code></pre>
    <pre><code>华南理工大学 广州国际校区 D5f-1205</code></pre>
    <pre><code>PhiZone 指定代理人	收</code></pre>
  </div>
{/if}

<style>
  h1 {
    @apply text-6xl font-bold mb-6 mt-8;
  }

  h2 {
    @apply text-4xl font-bold mb-6 mt-7;
  }

  p {
    @apply text-lg mb-6;
  }

  li {
    @apply inline-flex gap-1;
  }

  code {
    font-family: 'Noto Sans Mono', 'Noto Sans SC', monospace;
    @apply text-lg;
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
