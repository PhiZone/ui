<script lang="ts">
  import { t } from '$lib/translations/config';
  import { range } from '$lib/utils';

  const charts = [
    {
      title: 'Lanterns [SP 2023] [+采音 +特效]',
      description:
        '[谱师自荐] 整体思路利用渐变式的流动背景线组来体现穿梭于繁华街道的感觉，屏幕上端来回摆动的黄键来象征着街道上璀璨的灯笼群，背景线做了一定取舍使其尽量不晓得多余和晃眼。缓动多用24缓振动来表现具有国风特色的琵音和拨奏。特效思路简单，实现起来也没那么难，个人觉得可以作为纯良谱面的背景线范例。采音方面核心思路使用tap，短ln和extap表现lead和鼓，flick表现快板，drag表现拨奏。出于歌曲节奏型比较单一的原因采音思路并没有很多创新，但个人认为思路足够清晰合理，可以作为一般通过的低难范例来学习。',
      link: 'https://www.bilibili.com/video/BV1pK411q7Tt/',
    },
    {
      title: 'reboot*the Starlight [IN 14] [+契合度 -配置 -手感]',
      description:
        '[茗忻] 该谱面作者对于氛围的把控十分到位：从开头的失真感，到200+的note区分音色，到480左右的段落区分，再到600的灵动感，均能从配置和特效中体现。美中不足的方面是多指及下落的处理：从560开始强制多指后，后续并没有多少有效的多指排布。此时以多指为框架，600-613左右两侧双押后接hold+tap是典型的纯双指或多指均卡手的不足之处。后续较多的是双指同样可解（hold不按完长度）的伪三押，且曲目本身不足以支撑正常的多指量。下落的变速是该谱面作者常用但效果两面的处理方式，如560的骤停对氛围提升的同时削弱了手感，200左右两侧高速drag会影响中部tap的双指处理手感等。',
      link: 'https://www.bilibili.com/video/BV1Vu4y1D7nW/',
    },
    {
      title: 'Blackest Luxury Car [IN 14] [+配置 +契合度 +特效]',
      description:
        '[Naptie] 别具一格的选曲搭配别具一格的配置与特效，使得谱面成为真正意义上的“音乐的表现载体”。整张谱面中，flick用得很节制，大篇幅采用tap与hold进行采音。除此之外，也使用note动效与判定线动效对一些特殊vfx音效进行了表现，使谱面与音乐的契合度大大提高。对于超界note与假note的使用，系创新领域，仁者见仁智者见智，个人认为应当在必要的地方添加引导，从而提高游玩体验。总之，该谱是一张非常不错的具有创新风格的谱面。',
      link: 'https://www.bilibili.com/video/BV19p4y1L751/',
    },
    {
      title: 'Unwelcome School (takehirotei hardcore remix) [IN 15] [-配置 -契合度 -手感 -特效]',
      description:
        '[Naptie] 该谱大量使用非常规配置，包括但不限于重叠tap双押、竖直下落并被立即判定的flick。大量note与判定线的表演严重遮挡视线，给人一种很乱的感觉，造成读谱困难，影响游玩体验。此外，即使是使用如此丰富的特效，也不是提高契合度的优解，反而更像谱师想到哪就写到哪。该谱是配置、契合度、手感、特效四方面的典型反面示例。鉴于以上因素，评分建议不超过unranked标准。',
      link: 'https://www.bilibili.com/video/BV11Y4y1A7fx/',
    },
    {
      title: 'Infinite Strife, [IN 16] [+契合度 -手感 -特效]',
      description:
        '[Naptie] 配置和特效方面，与音乐相当契合。然而特效的数量可能超过了一张谱面的最大承载量，尤其是同种特效的多次使用（包括主判定线拆线、note差速下落、判定线震动、背景线表演）非常容易使人审美疲劳，最终导致整个谱面的观感下降，从而影响游玩体验。该谱的定位也有模糊，有些段落双指可拆，而有些段落因排键位移过大而不得不使用多指，其中一部分甚至非常卡手。总之，该谱可作为特效过剩、手感有待提高的示例谱面，评分建议不超过ranked标准。',
      link: 'https://www.bilibili.com/video/BV1Qh4y1d726/?p=2',
    },
    {
      title: 'Arghena [IN 15] [+特效 +契合度 -手感]',
      description:
        '[谱师自荐] 该谱的特效建立在对曲目的理解与契合之上（例如用于表现弦乐器的缓出竖线、用于表现color bass的缓入垂线），数量不多，形成精而美的谱面风格。配置方面，采用反手与drag蛇来表现color bass，且通过适当舍音避免了难度曲线的突跃；而尾段配置复制了前段，略显单调乏味；909~982combo处的配置美观性有待提高。该谱中诸如345combo处的随drag移动的hold虽然提高了张力，却同时也大大增加了miss的风险，导致手感变差，一定程度上破坏了游玩体验。总之，该谱可作为特效与契合度方面的正面示例谱面来参考。',
      link: 'https://www.bilibili.com/video/BV1Zw411C76c/',
    },
    {
      title: 'Fracture Ray [IN 16] [-配置 -手感]',
      description:
        '[Naptie] 背景线动效打造了曲目应有的氛围，但仍然建议继续减少特效数量，以避免单线幅度过大导致的“掉价”。选曲具有高密度鼓点，需要大量舍音以保证配置的合理性，而该谱的舍音工作并没有做到位。177combo的vfx音效选择舍掉并不是一个好的选择。此外，一些不必要的双押的加入也导致了配置的无理性。724combo的drag蛇、1182combo的hold应当提早出现以确保游玩体验。总之，该谱可作为高bpm采音与配置方面的反面示例，评分建议不超过ranked标准。',
      link: 'https://www.bilibili.com/video/BV1rM411y7QF?p=1',
    },
    {
      title: '第六感 [IN 14] [+契合度 +手感]',
      description:
        '[谱师自荐] 利用合理的动效实现与曲目的契合，采用合乎手序的排键以达到手感上的舒适，整体谋篇布局体现了强烈的段落感。美中不足的是，因曲目时长过长而出现了三段drop，而配置与特效也仅仅是简单的复制粘贴+镜像，过于单一。同时，特效大部分都是背景的竖线，不具备多样性，易导致观感上的疲劳。总之，尽管缺乏创新，该谱仍可以作为契合度与手感方面的低难度范本来学习。',
      link: 'https://www.bilibili.com/video/BV1pK411z7iH/',
    },
    {
      title: 'Sakura Fubuki [AT 15] [+契合度 +手感 +特效]',
      description:
        '[Naptie] 德芙般丝滑的判定线动效，加上随风飘落的note，无不在与音乐共同表演着樱之舞。不时出现在屏幕中央的tap+flick重合押可以算作谱面中的一大特色亮点。部分采音需要再斟酌一下，要灵活地在多个声部之间进行选择。hold上的drag蛇密度过大，影响观感。783~786combo处疑似缺少判定线特效，思路上应该与702~705combo处保持一致。该谱作为多指谱，手感舒适，特效切题，是不错的相关方面的正面示例谱面。',
      link: 'https://www.bilibili.com/video/BV1mm4y1z7Ju/',
    },
    {
      title: 'Inside [IN 15] [+配置 +契合度]',
      description:
        '[谱师自荐] 个人认为本谱面可谓与歌曲完美契合。两段drop的特色在配置方面都表现得淋漓尽致。排键方面较为准确地跟随了音高的走向，实际打起来演奏感很棒又不失手感。尤其1292+combo的段落完美抓住了旋律3个一组的特色排键。特效方面个人觉得衔接做的很不错，也非常契合歌曲，美中不足的地方是33+combo的段落时背景线选择采了一段并不连续的音轨导致背景时满时空。采音方面个人觉得值得一提的是33+combo的这段混fr，在背景bass，连续的8分底旋律和主旋律之间取得了一个比较平衡的效果，个人觉得效果还是很不错的。总体来说，这张谱面个人认为在配置和契合度上面有比较突出优秀的表现。',
      link: 'https://www.bilibili.com/video/BV17L411e7Hx/',
    },
    {
      title: '驟雨の狭間 [IN 15] [-配置 +特效 -手感]',
      description:
        '[谱师自荐] 个人认为这张谱面的动效契合度较高。整张谱面的氛围感营造的不错，对情感的把握较好；牛肉段的背景方形线用于体现在城市中穿梭的感觉，比较有新意；1175cb后的段落尤其具有冲击力。作为牛肉饭，谱面的对音无误，且在取音上注意到了bass的表达。然而，谱面配置上大量运用移动2k式排键，排列比较无聊，对bass的表达仍不够；萨克斯段的红蓝交互排列契合度低，对萨克斯没有很好的表达。同时，夹叠键的红蓝交互手感也较差。总体的动效适合学习，但配置和手感上仍有提升空间。',
      link: 'https://www.bilibili.com/video/BV1aD4y1M7Bu/',
    },
    {
      title: 'BIKE [IN 14] [+采音 +配置 +契合度 -特效]',
      description:
        '[谱师自荐] 在保证手感的情况下，谱师希望通过在创新和创人之间找到一个平衡的点来增强表现力。但是，这张谱面仍然需要打磨。期待宝贵建议！',
      link: 'https://www.bilibili.com/video/BV1a44y1w7vY/',
    },
    {
      title: 'Latent Kingdom [IN 15] [+契合度 +特效 -手感]',
      description:
        '[谱师自荐] 在传统核曲写法基础上加入了一些flick的特化，手感可能略有欠缺。针对乐曲特征构思了一些特殊配置/特殊下落，在音乐契合度上下了一定的功夫。特效一般通过，水平尚可。',
      link: 'https://www.bilibili.com/video/BV1WN411M7fr/',
    },
    {
      title: 'BLACK or WHITE? [IN 15] [+配置 +手感]',
      description:
        '[_Vexxxx_] 此谱面几乎为全谱正面下落式，牺牲了一定的玩法上限空间来获得更好的配置游玩体验。与一般谱面不同地，此谱面添加了部分空音note，并于部分段落设计了押数自由化（如2nd drop的12分音段落）。整张谱的总体设计比较偏向八股，但在尽可能保全手感的情况下增加了设计感，给出了一定的记忆点。全谱特效较偏简约，没有过多杂乱花的表演，但不失观感上的流畅、与配置的契合。综上，该谱面为一张着重在配置上进行部分设计的中难度双指谱，可作为中等质量的偏八股向谱面进行评价。',
      link: 'https://www.bilibili.com/video/BV1iQ4y187N2/',
    },
  ];
</script>

<svelte:head>
  <title>示例谱面评分征集 | {$t('common.site_name')}</title>
</svelte:head>

<div class="page pb-24">
  <h1 class="text-4xl font-bold mb-6">示例谱面评分征集</h1>
  <div class="result">
    {#each range(0, charts.length) as i}
      <div
        class="card lg:w-[430px] w-full bg-base-100 border-2 normal-border transition hover:shadow-lg"
      >
        <div class="card-body">
          <h2 class="card-title">{charts[i].title}</h2>
          <p>{charts[i].description}</p>
          <div class="card-actions gap-0 justify-end join">
            <a
              href={charts[i].link}
              target="_blank"
              class="btn border-2 normal-border btn-outline join-item"
            >
              查看
            </a>
            <a href="/crs-public/{i}" class="btn border-2 normal-border btn-outline join-item">
              投票
            </a>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .result {
    @media (min-width: 640px) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(415px, 1fr));
      grid-gap: 1.5rem;
      justify-items: center;
    }
  }
</style>
