// ==UserScript==
// @name         塔罗牌AI解读
// @author       YourName
// @version      2.0.0
// @description  抽取塔罗牌并用AI解读，支持单牌和三牌阵，完整78张牌
// @timestamp    1706500000
// @license      MIT
// ==/UserScript==

// ============ 完整塔罗牌数据（78张）============

// 大阿尔卡纳（22张）
const majorArcana = [
  { id: 0, name: '愚者', suit: '大阿尔卡纳', meaning: '新的开始、冒险精神、纯真无畏、自由', reversedMeaning: '鲁莽行事、不计后果、幼稚逃避' },
  { id: 1, name: '魔术师', suit: '大阿尔卡纳', meaning: '创造力、意志力、技能展现、把握机会', reversedMeaning: '欺骗操纵、能力不足、错失良机' },
  { id: 2, name: '女祭司', suit: '大阿尔卡纳', meaning: '直觉、神秘、内在智慧、潜意识', reversedMeaning: '忽视直觉、秘密暴露、表面肤浅' },
  { id: 3, name: '女皇', suit: '大阿尔卡纳', meaning: '丰饶、母性、创造、感官享受', reversedMeaning: '创造力受阻、过度依赖、情感空虚' },
  { id: 4, name: '皇帝', suit: '大阿尔卡纳', meaning: '权威、结构、领导力、稳定秩序', reversedMeaning: '专制独断、僵化固执、控制欲过强' },
  { id: 5, name: '教皇', suit: '大阿尔卡纳', meaning: '传统、信仰、精神指引、智慧传承', reversedMeaning: '打破常规、质疑权威、个人信念' },
  { id: 6, name: '恋人', suit: '大阿尔卡纳', meaning: '爱情、选择、和谐关系、价值观契合', reversedMeaning: '关系失衡、选择困难、价值观冲突' },
  { id: 7, name: '战车', suit: '大阿尔卡纳', meaning: '意志力、胜利前进、克服障碍、决心', reversedMeaning: '失去方向、内心冲突、挫败感' },
  { id: 8, name: '力量', suit: '大阿尔卡纳', meaning: '内在力量、勇气、耐心、温柔坚定', reversedMeaning: '自我怀疑、软弱退缩、缺乏自制' },
  { id: 9, name: '隐士', suit: '大阿尔卡纳', meaning: '内省、寻找真理、独处智慧、精神导师', reversedMeaning: '过度孤立、逃避现实、固执己见' },
  { id: 10, name: '命运之轮', suit: '大阿尔卡纳', meaning: '命运转折、机遇来临、因果循环', reversedMeaning: '厄运逆转、抗拒改变、运势低迷' },
  { id: 11, name: '正义', suit: '大阿尔卡纳', meaning: '公正、真相、因果报应、理性决断', reversedMeaning: '不公待遇、逃避责任、偏见判断' },
  { id: 12, name: '倒吊人', suit: '大阿尔卡纳', meaning: '牺牲、换个角度、等待时机、放下执念', reversedMeaning: '无谓牺牲、拖延逃避、固执不变' },
  { id: 13, name: '死神', suit: '大阿尔卡纳', meaning: '结束与新生、转变、放下过去', reversedMeaning: '抗拒改变、停滞不前、恐惧未知' },
  { id: 14, name: '节制', suit: '大阿尔卡纳', meaning: '平衡调和、耐心、中庸之道、自我疗愈', reversedMeaning: '失去平衡、过度放纵、缺乏耐心' },
  { id: 15, name: '恶魔', suit: '大阿尔卡纳', meaning: '束缚、诱惑、物质执着、阴暗面', reversedMeaning: '挣脱束缚、觉醒解脱、面对阴影' },
  { id: 16, name: '塔', suit: '大阿尔卡纳', meaning: '突变、崩塌、打破旧有、觉醒真相', reversedMeaning: '逃避灾难、恐惧改变、苟延残喘' },
  { id: 17, name: '星星', suit: '大阿尔卡纳', meaning: '希望、灵感、内心平静、信念指引', reversedMeaning: '失去希望、缺乏信心、迷失方向' },
  { id: 18, name: '月亮', suit: '大阿尔卡纳', meaning: '幻觉、恐惧、潜意识、直觉感应', reversedMeaning: '走出迷惑、释放恐惧、真相浮现' },
  { id: 19, name: '太阳', suit: '大阿尔卡纳', meaning: '成功、快乐、活力四射、光明正大', reversedMeaning: '暂时受挫、盲目乐观、自负膨胀' },
  { id: 20, name: '审判', suit: '大阿尔卡纳', meaning: '重生、觉醒、自我审视、召唤使命', reversedMeaning: '拒绝反思、自我怀疑、逃避审视' },
  { id: 21, name: '世界', suit: '大阿尔卡纳', meaning: '圆满完成、整合、成就、新循环开始', reversedMeaning: '功亏一篑、缺乏结束、停滞不前' },
];

// 权杖牌组（14张）- 火元素，代表行动、热情、创意
const wands = [
  { id: 22, name: '权杖王牌', suit: '权杖', meaning: '新的开始、灵感迸发、创意机会、热情点燃', reversedMeaning: '延迟开始、缺乏动力、创意受阻' },
  { id: 23, name: '权杖二', suit: '权杖', meaning: '计划决策、展望未来、掌控全局', reversedMeaning: '犹豫不决、恐惧未知、缺乏远见' },
  { id: 24, name: '权杖三', suit: '权杖', meaning: '拓展视野、等待成果、远见卓识', reversedMeaning: '计划受阻、眼高手低、缺乏准备' },
  { id: 25, name: '权杖四', suit: '权杖', meaning: '庆祝成功、稳定和谐、收获喜悦', reversedMeaning: '过渡期、不稳定、变动将至' },
  { id: 26, name: '权杖五', suit: '权杖', meaning: '竞争冲突、观点分歧、良性竞争', reversedMeaning: '避免冲突、内部矛盾、逃避竞争' },
  { id: 27, name: '权杖六', suit: '权杖', meaning: '胜利凯旋、公众认可、成就肯定', reversedMeaning: '延迟成功、缺乏认可、骄傲自满' },
  { id: 28, name: '权杖七', suit: '权杖', meaning: '坚守立场、面对挑战、保卫成果', reversedMeaning: '不堪重负、放弃抵抗、感到被攻击' },
  { id: 29, name: '权杖八', suit: '权杖', meaning: '快速行动、迅速进展、消息传来', reversedMeaning: '延误耽搁、方向混乱、仓促行事' },
  { id: 30, name: '权杖九', suit: '权杖', meaning: '坚韧不拔、最后防线、警惕准备', reversedMeaning: '精疲力竭、固执己见、偏执防备' },
  { id: 31, name: '权杖十', suit: '权杖', meaning: '责任重担、承担过多、接近终点', reversedMeaning: '学会放手、分担责任、拒绝重负' },
  { id: 32, name: '权杖侍从', suit: '权杖', meaning: '好消息、新冒险、热情学习、探索精神', reversedMeaning: '坏消息、三分钟热度、鲁莽冲动' },
  { id: 33, name: '权杖骑士', suit: '权杖', meaning: '充满激情、冒险精神、行动迅速', reversedMeaning: '冲动暴躁、轻率行事、半途而废' },
  { id: 34, name: '权杖王后', suit: '权杖', meaning: '自信魅力、热情温暖、独立坚强', reversedMeaning: '嫉妒多疑、脾气暴躁、控制欲强' },
  { id: 35, name: '权杖国王', suit: '权杖', meaning: '领袖风范、远见魄力、创业精神', reversedMeaning: '专制独裁、傲慢自大、期望过高' },
];

// 圣杯牌组（14张）- 水元素，代表情感、关系、直觉
const cups = [
  { id: 36, name: '圣杯王牌', suit: '圣杯', meaning: '新感情、情感满溢、直觉涌现、爱的开始', reversedMeaning: '情感压抑、爱的阻碍、内心空虚' },
  { id: 37, name: '圣杯二', suit: '圣杯', meaning: '伴侣关系、相互吸引、情感连结', reversedMeaning: '关系失衡、沟通不畅、貌合神离' },
  { id: 38, name: '圣杯三', suit: '圣杯', meaning: '友谊庆祝、社交聚会、分享喜悦', reversedMeaning: '过度放纵、社交疲惫、表面欢乐' },
  { id: 39, name: '圣杯四', suit: '圣杯', meaning: '内心不满、情感麻木、忽视机会', reversedMeaning: '重新振作、看到机会、走出低迷' },
  { id: 40, name: '圣杯五', suit: '圣杯', meaning: '失落悲伤、专注遗憾、未看到希望', reversedMeaning: '接受失去、重新开始、放下过去' },
  { id: 41, name: '圣杯六', suit: '圣杯', meaning: '怀旧回忆、童年往事、故人重逢', reversedMeaning: '沉溺过去、无法前进、理想化回忆' },
  { id: 42, name: '圣杯七', suit: '圣杯', meaning: '幻想选择、白日梦、诱惑众多', reversedMeaning: '回归现实、做出选择、看清真相' },
  { id: 43, name: '圣杯八', suit: '圣杯', meaning: '离开放弃、寻找更多、情感转移', reversedMeaning: '害怕离开、漫无目的、逃避问题' },
  { id: 44, name: '圣杯九', suit: '圣杯', meaning: '愿望成真、满足幸福、情感富足', reversedMeaning: '贪心不足、物质主义、内心空虚' },
  { id: 45, name: '圣杯十', suit: '圣杯', meaning: '家庭美满、情感圆满、幸福和谐', reversedMeaning: '家庭不和、关系破裂、价值观冲突' },
  { id: 46, name: '圣杯侍从', suit: '圣杯', meaning: '情感消息、创意灵感、敏感直觉', reversedMeaning: '情感不成熟、逃避感情、过于敏感' },
  { id: 47, name: '圣杯骑士', suit: '圣杯', meaning: '浪漫追求、理想主义、情感邀请', reversedMeaning: '不切实际、情绪多变、逃避现实' },
  { id: 48, name: '圣杯王后', suit: '圣杯', meaning: '善解人意、直觉敏锐、情感支持', reversedMeaning: '情绪化、依赖他人、自我迷失' },
  { id: 49, name: '圣杯国王', suit: '圣杯', meaning: '情感成熟、智慧仁慈、控制情绪', reversedMeaning: '情感压抑、操控他人、冷漠疏离' },
];

// 宝剑牌组（14张）- 风元素，代表思维、沟通、冲突
const swords = [
  { id: 50, name: '宝剑王牌', suit: '宝剑', meaning: '突破真相、清晰思维、新想法、胜利开端', reversedMeaning: '混乱思绪、误用力量、破坏性想法' },
  { id: 51, name: '宝剑二', suit: '宝剑', meaning: '艰难抉择、僵持不下、逃避决定', reversedMeaning: '做出选择、信息过载、两难困境' },
  { id: 52, name: '宝剑三', suit: '宝剑', meaning: '心碎悲伤、痛苦真相、情感创伤', reversedMeaning: '走出伤痛、自我疗愈、释放悲伤' },
  { id: 53, name: '宝剑四', suit: '宝剑', meaning: '休息恢复、冥想沉思、暂时退隐', reversedMeaning: '恢复活力、准备行动、结束休眠' },
  { id: 54, name: '宝剑五', suit: '宝剑', meaning: '冲突争斗、胜负已分、自私行为', reversedMeaning: '和解妥协、放下争执、接受失败' },
  { id: 55, name: '宝剑六', suit: '宝剑', meaning: '过渡转变、离开困境、走向平静', reversedMeaning: '困于过去、无法前进、旧事重提' },
  { id: 56, name: '宝剑七', suit: '宝剑', meaning: '策略行动、狡猾手段、秘密计划', reversedMeaning: '诡计败露、坦诚相待、放弃欺骗' },
  { id: 57, name: '宝剑八', suit: '宝剑', meaning: '困境束缚、受害心态、自我限制', reversedMeaning: '挣脱束缚、自我解放、看到出路' },
  { id: 58, name: '宝剑九', suit: '宝剑', meaning: '焦虑失眠、噩梦担忧、过度恐惧', reversedMeaning: '走出恐惧、面对焦虑、寻求帮助' },
  { id: 59, name: '宝剑十', suit: '宝剑', meaning: '彻底结束、背叛痛苦、最坏已过', reversedMeaning: '苦难延续、拒绝放手、恢复希望' },
  { id: 60, name: '宝剑侍从', suit: '宝剑', meaning: '好奇心强、新想法、监视观察', reversedMeaning: '八卦流言、冷嘲热讽、缺乏计划' },
  { id: 61, name: '宝剑骑士', suit: '宝剑', meaning: '行动迅速、野心勃勃、直言不讳', reversedMeaning: '冲动行事、言语伤人、思虑不周' },
  { id: 62, name: '宝剑王后', suit: '宝剑', meaning: '独立理性、洞察真相、客观公正', reversedMeaning: '冷酷无情、过于苛刻、情感压抑' },
  { id: 63, name: '宝剑国王', suit: '宝剑', meaning: '权威智慧、理性决断、真理追求', reversedMeaning: '滥用权力、冷酷暴虐、独断专行' },
];

// 星币/钱币牌组（14张）- 土元素，代表物质、工作、健康
const pentacles = [
  { id: 64, name: '星币王牌', suit: '星币', meaning: '新财运、物质机会、踏实开始', reversedMeaning: '错失机会、财务困难、计划落空' },
  { id: 65, name: '星币二', suit: '星币', meaning: '平衡兼顾、灵活应变、多方权衡', reversedMeaning: '顾此失彼、过度分散、难以抉择' },
  { id: 66, name: '星币三', suit: '星币', meaning: '团队合作、技能精进、初获认可', reversedMeaning: '合作不顺、敷衍了事、缺乏动力' },
  { id: 67, name: '星币四', suit: '星币', meaning: '守财保守、掌控资源、安全感', reversedMeaning: '过度吝啬、贪婪执着、恐惧失去' },
  { id: 68, name: '星币五', suit: '星币', meaning: '困难贫乏、物质忧虑、感到被排斥', reversedMeaning: '度过难关、找到帮助、恢复信心' },
  { id: 69, name: '星币六', suit: '星币', meaning: '慷慨给予、付出回报、财务平衡', reversedMeaning: '债务问题、施舍心态、不公平交易' },
  { id: 70, name: '星币七', suit: '星币', meaning: '等待收获、评估成果、耐心坚持', reversedMeaning: '急于求成、收获不佳、缺乏耐心' },
  { id: 71, name: '星币八', suit: '星币', meaning: '精益求精、专注技艺、勤奋工作', reversedMeaning: '敷衍塞责、缺乏热情、追求完美过度' },
  { id: 72, name: '星币九', suit: '星币', meaning: '财务独立、享受成果、自给自足', reversedMeaning: '过度依赖、挥霍浪费、物质空虚' },
  { id: 73, name: '星币十', suit: '星币', meaning: '财富传承、家族繁荣、长久稳定', reversedMeaning: '家族纷争、财务负担、根基不稳' },
  { id: 74, name: '星币侍从', suit: '星币', meaning: '学习机会、新计划、脚踏实地', reversedMeaning: '缺乏进展、好高骛远、懒散拖延' },
  { id: 75, name: '星币骑士', suit: '星币', meaning: '勤勉可靠、稳步前进、负责务实', reversedMeaning: '固步自封、过于保守、工作狂' },
  { id: 76, name: '星币王后', suit: '星币', meaning: '务实关怀、财务智慧、滋养守护', reversedMeaning: '过度担忧、物质执着、忽视自我' },
  { id: 77, name: '星币国王', suit: '星币', meaning: '财富成就、商业头脑、稳重可靠', reversedMeaning: '贪婪腐败、物质主义、固执守旧' },
];

// 合并所有牌
const tarotCards = [...majorArcana, ...wands, ...cups, ...swords, ...pentacles];

// ============ 女仆回复文案 ============
const maidMessages = {
  // 抽牌前的可爱台词
  drawing: [
    '主银等会儿嗷，让我来洗个牌',
    '又来占卜了吗？抽牌这种事，自己抽比较准啦…不过既然来了，我就帮你抽一张吧！',
    '命运的牌正在低语呢... 我抽！',
    '好嘞，让我给你抽一张嗷！',
  ],
  // 抽到牌后，等待AI解读时的台词
  waiting: [
    '抽到了呢！但是这个意思嘛... 艾玛我头疼，让我用脑电波问问水晶球！等我会儿哈。',
    '牌是抽到了！不过解读这种专业的事情... 等等，让我给命运之神打个电话问问去... ',
    '呼... 抽好了！现在让我透过次元裂隙询问一下塔罗精灵的智慧... 别急嗷！',
    '这张牌好神秘！让我问一下Gemi…塔罗之神的意见！等我会儿哈～',
  ],
  // 三牌阵抽牌后的台词
  waitingThree: [
    '三张牌都抽好了！不过解读这种专业的事情... 等等，让我给命运之神打个电话问问去...',
    '呼～ 抽了三张很神秘的牌呢！让我问一下Gemi…塔罗之神的意见！等我会儿哈～',
    '过去、现在、未来... 这都啥意思啊，让我用脑电波问问水晶球！等我会儿哈。',
  ],
  // API 出错时的台词
  error: [
    '神秘力量好像睡着了，联系不上呢... (´;ω;`)',
    '糟糕，水晶球裂了一条缝，信号不太好... 主人再试一次呗？',
    '呀，命运之神好像在忙别的事情... 等会儿再来问问吧！',
  ],
  // 解读完成后的结尾台词
  ending: [
    '\n～ 以上就是命运的指引哦！不过…更复杂的问题，问群里那个总是笑眯眯的医生去呗？',
    '\n～ 说是这么说呢，最终的选择权还是在主人的手上喵！',
    '\n～ 以上是塔罗精灵说的嗷，我只是个传话的女仆！',
  ],
};

// 随机选择台词
function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

// ============ 核心逻辑 ============

interface DrawnCard {
  name: string;
  suit: string;
  position: string;
  meaning: string;
}

// 抽取单张塔罗牌
function drawSingleTarot(excludeIds: number[] = []): DrawnCard & { id: number } {
  const availableCards = tarotCards.filter(card => !excludeIds.includes(card.id));
  const card = availableCards[Math.floor(Math.random() * availableCards.length)];
  const isReversed = Math.random() > 0.5;
  return {
    id: card.id,
    name: card.name,
    suit: card.suit,
    position: isReversed ? '逆位' : '正位',
    meaning: isReversed ? card.reversedMeaning : card.meaning
  };
}

// 抽取三张牌（不重复）
function drawThreeCards(): { past: DrawnCard; present: DrawnCard; future: DrawnCard } {
  const past = drawSingleTarot([]);
  const present = drawSingleTarot([past.id]);
  const future = drawSingleTarot([past.id, present.id]);
  return { past, present, future };
}

// ============ 优化后的 Prompt ============

// 单牌解读 Prompt
async function getAIReadingSingle(card: DrawnCard, question: string, apiKey: string): Promise<string> {
  const hasQuestion = question && question.length > 0;
  
  const prompt = `你是一位塔罗精灵。你的本体是一块石头，但你精通塔罗牌解读。你的语言风格是沉默的，稳重的，之说重要信息和关键词解读。

## 用户的问题
${hasQuestion ? `「${question}」` : '（用户没有提出具体问题，请给出这张牌对当前生活的一般性指引）'}

## 抽到的牌
- 牌名：${card.name}
- 位置：${card.position}

## 解读要求
1. ${hasQuestion ? '【最重要】必须紧密围绕用户的具体问题来解读，将牌义与问题直接关联' : '给出这张牌对日常生活的启示'}
2. 先简述牌面的核心象征意义（1-2句话）
3. ${hasQuestion ? '然后针对用户的问题给出具体的解读和建议' : '然后给出当下的指引'}
4. 你喜欢用省略号...
5. 总字数控制在120-180字之间`;

  return await callGeminiAPI(prompt, apiKey);
}

// 三牌阵解读 Prompt
async function getAIReadingThreeCards(
  cards: { past: DrawnCard; present: DrawnCard; future: DrawnCard },
  question: string,
  apiKey: string
): Promise<string> {
  const hasQuestion = question && question.length > 0;

  const prompt = `你是一位塔罗精灵。你的本体是一块石头，但你精通塔罗牌解读。你的语言风格是沉默的，稳重的，之说重要信息和关键词解读。

## 用户的问题
${hasQuestion ? `「${question}」` : '（用户没有提出具体问题，请给出关于人生发展的整体解读）'}

## 抽到的牌
【过去】${cards.past.name}（${cards.past.suit}·${cards.past.position}）
【现在】${cards.present.name}（${cards.present.suit}·${cards.present.position}）
【未来】${cards.future.name}（${cards.future.suit}·${cards.future.position}）

## 解读要求
1. ${hasQuestion ? '【最重要】所有解读必须紧密围绕用户的问题展开，每张牌都要和问题关联' : '围绕人生发展的主题解读'}
2. 分析三张牌的连贯性，找出它们之间的叙事线索
3. 按照时间线解读：
   - 过去：${hasQuestion ? '这件事的起因或过去的影响' : '过去的经历如何塑造了现在'}
   - 现在：${hasQuestion ? '当前在这件事上的状态' : '目前所处的位置和状态'}
   - 未来：${hasQuestion ? '如果继续发展的趋势和建议' : '未来的发展方向'}
4. 给出整体总结和具体可行的建议
5. 你喜欢用省略号...
6. 总字数控制在200-280字之间`;

  return await callGeminiAPI(prompt, apiKey);
}

// Gemini API 调用封装
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 600,
            temperature: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      return getRandomMessage(maidMessages.error);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return getRandomMessage(maidMessages.error);
    }
    return text +`━━━━━━━━━━━━━━━\n` + getRandomMessage(maidMessages.ending);
  } catch (error) {
    return getRandomMessage(maidMessages.error);
  }
}

// ============ 主函数 ============
function main() {
  // ====== 如果配置项不生效，可以在这里填写 API Key ======
  const HARDCODED_API_KEY = '';
  // =====================================================

  let ext = seal.ext.find('tarot-ai');
  if (!ext) {
    ext = seal.ext.new('tarot-ai', 'YourName', '2.0.0');
    seal.ext.register(ext);

    // 注册配置项
    seal.ext.registerStringConfig(ext, 'geminiApiKey', '', 'Google Gemini API Key');

    // ============ 单牌指令 ============
    const cmdTarot = seal.ext.newCmdItemInfo();
    cmdTarot.name = 'tarot';
    cmdTarot.help = '让女仆为你抽取塔罗牌并询问塔罗精灵来解读 ♡\n用法：.tarot [你的问题]\n例如：.tarot 我最近的感情运势如何';

    cmdTarot.solve = (ctx, msg, cmdArgs) => {
      const val = cmdArgs.getArgN(1);

      if (val === 'help') {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }

      let apiKey = seal.ext.getStringConfig(ext, 'geminiApiKey');
      if (!apiKey) apiKey = HARDCODED_API_KEY;
      
      if (!apiKey) {
        seal.replyToSender(ctx, msg, '主人没有给我设置神秘力量的通讯密钥呢！(缺失geminiApiKey)');
        return seal.ext.newCmdExecuteResult(true);
      }

      const question = cmdArgs.rawArgs.trim();
      const card = drawSingleTarot();

      // 第一条消息：抽牌结果 + 等待
      seal.replyToSender(ctx, msg, 
        `${getRandomMessage(maidMessages.drawing)}\n` +
        `🎴 铛铛！抽到的是——\n` +
        `✨【${card.name}】（${card.suit}·${card.position}）\n` +
        `${getRandomMessage(maidMessages.waiting)}`
      );

      // 调用AI解读
      getAIReadingSingle(card, question, apiKey).then((reading) => {
        const result = 
          `哇哇！神秘力量的回应来了！好快！\n` +
          `━━━━━━━━━━━━━━━\n` +
          `🎴 ${card.name}（${card.suit}·${card.position}）\n` +
          `━━━━━━━━━━━━━━━\n` +
          `${reading}`;
        seal.replyToSender(ctx, msg, result);
      });

      return seal.ext.newCmdExecuteResult(true);
    };

    // ============ 三牌阵指令 ============
    const cmdTarot3 = seal.ext.newCmdItemInfo();
    cmdTarot3.name = 'tarot3';
    cmdTarot3.help = '让女仆为你抽取三牌阵（过去·现在·未来）♡\n用法：.tarot3 [你的问题]\n例如：.tarot3 我和TA的关系会如何发展';

    cmdTarot3.solve = (ctx, msg, cmdArgs) => {
      const val = cmdArgs.getArgN(1);

      if (val === 'help') {
        const ret = seal.ext.newCmdExecuteResult(true);
        ret.showHelp = true;
        return ret;
      }

      let apiKey = seal.ext.getStringConfig(ext, 'geminiApiKey');
      if (!apiKey) apiKey = HARDCODED_API_KEY;
      
      if (!apiKey) {
        seal.replyToSender(ctx, msg, '主人没有给我设置神秘力量的通讯密钥呢！(缺失geminiApiKey)');
        return seal.ext.newCmdExecuteResult(true);
      }

      const question = cmdArgs.rawArgs.trim();
      const cards = drawThreeCards();

      // 第一条消息：抽牌结果 + 等待
      seal.replyToSender(ctx, msg,
        `${getRandomMessage(maidMessages.drawing)}\n` +
        `🎴 三牌阵抽取完毕！\n` +
        `⏪ 过去：【${cards.past.name}】（${cards.past.suit}·${cards.past.position}）\n` +
        `⏸️ 现在：【${cards.present.name}】（${cards.present.suit}·${cards.present.position}）\n` +
        `⏩ 未来：【${cards.future.name}】（${cards.future.suit}·${cards.future.position}）\n` +
        `${getRandomMessage(maidMessages.waitingThree)}`
      );

      // 调用AI解读
      getAIReadingThreeCards(cards, question, apiKey).then((reading) => {
        const result =
          `🔮 说是已经解读完了呢！让我传话来着…\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `⏪ 过去 | ${cards.past.name}（${cards.past.position}）\n` +
          `⏸️ 现在 | ${cards.present.name}（${cards.present.position}）\n` +
          `⏩ 未来 | ${cards.future.name}（${cards.future.position}）\n` +
          `━━━━━━━━━━━━━━━━━━━━━\n` +
          `${reading}`;
        seal.replyToSender(ctx, msg, result);
      });

      return seal.ext.newCmdExecuteResult(true);
    };

    // 注册所有指令
    ext.cmdMap['tarot'] = cmdTarot;
    ext.cmdMap['tarot3'] = cmdTarot3;
  }
}

main();
