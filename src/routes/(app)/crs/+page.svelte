<script lang="ts">
  import { range } from '$lib/utils';

  export let data;

  const charts = [
    {
      title: 'Lanterns [SP 2023] [+采音 +特效]',
      description:
        '[谱师自荐] 整体思路利用渐变式的流动背景线组来体现穿梭于繁华街道的感觉，屏幕上端来回摆动的黄键来象征着街道上璀璨的灯笼群，背景线做了一定取舍使其尽量不晓得多余和晃眼。缓动多用24缓振动来表现具有国风特色的琵音和拨奏。特效思路简单，实现起来也没那么难，个人觉得可以作为纯良谱面的背景线范例。采音方面核心思路使用tap，短ln和extap表现lead和鼓，flick表现快板，drag表现拨奏。出于歌曲节奏型比较单一的原因采音思路并没有很多创新，但个人认为思路足够清晰合理，可以作为一般通过的低难范例来学习。',
      link: 'https://b23.tv/Jm0o7ef',
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
      title: 'ヒアソビ [IN 15] [+采音 +契合度 +手感]',
      description:
        '[谱师自荐] 选曲作为一首electroswing，节奏多变，需要花费功夫仔细对音。该谱采用drag蛇制造了契合度与表现力，在需要强调手序的时候也给予了必要的引导。处理跳拍时着重注意了特效的加强，同时又不失手感。不过，从整张谱面来看，特效的数量并不足以支撑起曲目强大的气场，需要在drop等段落添加一些必要的特效。此外，谱面的段落感也不是很强，可以参阅官谱 Compute It With Some Devilish Alcoholic Steampunk Engines [IN 15] 中的处理，尤其是二曲共有的留声机式的段落。',
      link: 'https://www.bilibili.com/video/BV1te411L79C/',
    },
    {
      title: 'Fracture Ray [IN 16] [-采音 -配置]',
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
  ];
</script>

{#if data.official !== null}
  <div class="page pb-24">
    <h1 class="text-4xl font-bold mb-6">示例谱面评分征集</h1>
    <div class="result">
      {#each range(0, charts.length) as i}
        <div class="card lg:w-[430px] w-full bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title">{charts[i].title}</h2>
            <p>{charts[i].description}</p>
            <div class="card-actions gap-0 justify-end join">
              <a
                href={charts[i].link}
                target="_blank"
                class="btn btn-primary btn-outline join-item"
              >
                查看
              </a>
              <a href="/crs/{i}" class="btn btn-primary btn-outline join-item">投票</a>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="page" />
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .result {
    @media (min-width: 640px) {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(415px, 1fr));
      grid-gap: 1.5rem;
      justify-items: center;
    }
  }
</style>
