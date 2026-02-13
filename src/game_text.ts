// ============================================================
// game_text.ts - 所有可客制化的文案模板
// 使用 {placeholder} 占位符，由 formatText() 替换
// ============================================================

export const TEXT = {
  // ======== 领养 ========
  ADOPT_SUCCESS_LIST: [
    '🎉 恭喜！你领养了一只{species}！\n取名为：{name}\n好好照顾它吧~',
    '🐾 一只可爱的{species}加入了你的家庭！\n它的名字是：{name}\n请多多关照~',
    '✨ 命运的邂逅！你和{species}相遇了！\n它叫{name}，今后请多指教~',
    '🎊 欢迎新成员！{species}已经迫不及待想认识你了！\n名字：{name}',
    '🌟 恭喜获得一只{species}！\n{name}正用期待的眼神看着你~',
  ],
  ADOPT_ALREADY_HAVE:
    '你已经有一只宠物了，不能再领养啦~\n发送 .查看宠物 看看它吧！',

  // ======== 查看宠物 ========
  VIEW_AT_HOME_HEADER:
    '🏠 {name}（{species}）正在家里',
  VIEW_AT_HOME_STATUS:
    '═══ 状态 ═══\n' +
    '饱食度：{hunger}/100\n' +
    '清洁度：{hygiene}/100\n' +
    '压力值：{stress}/100\n' +
    '等级：Lv.{level}\n' +
    '体力：{stamina}/{maxStamina}',
  VIEW_AT_HOME_SKILLS:
    '═══ 舞台技能 ═══\n' +
    'Vocal：{vocal}  Dance：{dance}  Rap：{rap}\n' +
    '{stageEval}\n' +
    '═══ 营业技能 ═══\n' +
    '卖腐：{sellRot}  媚粉：{fanService}\n' +
    '═══ 生活技能 ═══\n' +
    '烹饪：{cooking}  文化：{culture}\n' +
    '绘画：{painting}  外语：{language}',
  VIEW_AT_HOME_FANS:
    '═══ 粉丝 ═══\n' +
    'CP粉：{cpFans}  唯粉：{soloFans}\n' +
    '歪屁股cp粉：{toxicFans}\n' +
    '活动加成粉丝：{extraFans}\n' +
    '总粉丝数：{totalFans}',

  VIEW_AT_SCHOOL_HEADER:
    '🏫 {name}（{species}）正在宠物学校\n课程：{course}',
  VIEW_AT_SCHOOL_ACTIVITY_SOLO:
    '💬 {activity}',
  VIEW_AT_SCHOOL_ACTIVITY_PAIR:
    '💬 {petName}{activity}',
  VIEW_AT_SCHOOL_STATUS:
    '当前饱食度：{hunger}/100\n' +
    '当前清洁度：{hygiene}/100\n' +
    '当前压力值：{stress}/100',

  // ======== 学校随机行为描述（单人互动） ========
  SCHOOL_ACTIVITIES_SOLO: [
    '正在独自舔毛',
    '正在对着镜子练习Wink',
    '正在认真听课做笔记',
    '正在角落里打盹',
    '正在跟老师撒娇要加分',
    '正在给自己录练习视频',
    '正在窗边发呆看风景',
    '正在默默温习功课',
  ],
  // ======== 学校随机行为描述（双人互动） ========
  SCHOOL_ACTIVITIES_PAIR: [
    '正在和{partnerName}一起玩耍',
    '正在和{partnerName}偷吃零食',
    '正在和{partnerName}排练舞蹈',
    '正在围观{partnerName}打架',
    '正在和{partnerName}比赛吃饭速度',
    '正在给{partnerName}梳毛',
    '正在和{partnerName}互相挠痒痒',
    '正在和{partnerName}分享小秘密',
    '正在和{partnerName}一起睡午觉',
    '正在教{partnerName}跳舞',
  ],

  // ======== 查看学校 ========
  VISIT_SCHOOL_EMPTY:
    '🏫 学校里空荡荡的，一只宠物都没有~',
  VISIT_SCHOOL_SOLO:
    '🏫 你偷偷溜进学校瞅了一眼……\n👀 只看到{name}一只宠物。\n💬 {activity}',
  VISIT_SCHOOL_SOLO_ACTIVITIES: [
    '它正在独自玩毛线球',
    '它正趴在窗边晒太阳',
    '它正在对着镜子练表情',
    '它正在角落里画圈圈',
    '它正在自言自语背台词',
    '它正无聊地数教室里的瓷砖',
    '它正躺在地上望天花板发呆',
    '它正在独自跳舞，还时不时偷看门口',
  ],
  VISIT_SCHOOL_PAIR:
    '🏫 你偷偷溜进学校瞅了一眼……\n👀 看到了{name1}和{name2}！\n💬 {activity}',
  VISIT_SCHOOL_PAIR_ACTIVITIES: [
    '{name1}正在追着{name2}满教室跑',
    '{name1}和{name2}正在互相梳毛，好甜',
    '{name1}正在教{name2}跳舞，但{name2}一直踩错脚',
    '{name1}偷吃了{name2}的零食，两只正在吵架',
    '{name1}和{name2}正肩并肩睡午觉',
    '{name1}正在给{name2}讲笑话，{name2}笑得打滚',
    '{name1}和{name2}正在练习对口相声',
    '{name1}正在帮{name2}补课，但{name2}一直走神',
    '{name1}和{name2}正在偷偷比谁的主人更好',
    '{name1}和{name2}正在合作堆零食小山',
  ],
  GROUP_ONLY:
    '这个指令只能在群聊中使用哦！',

  // ======== 喂食 ========
  FEED_SUCCESS:
    '你给{name}喂了食物！\n' +
    '🍖 饱食度 +{amount}（当前：{hunger}/100）\n' +
    '💪 体力 -{cost}（剩余：{stamina}）',
  FEED_NO_STAMINA:
    '你今天太累了，没有体力喂食了…\n（剩余体力：{stamina}）',
  FEED_AT_SCHOOL:
    '{name}在学校呢，没法喂食哦！先用 .接宠物 把它接回来吧~',

  // ======== 洗澡 ========
  CLEAN_SUCCESS:
    '你给{name}洗了个澡！洗得干干净净~\n' +
    '🛁 清洁度 +{amount}（当前：{hygiene}/100）\n' +
    '💪 体力 -{cost}（剩余：{stamina}）',
  CLEAN_NO_STAMINA:
    '你今天太累了，没有体力洗澡了…\n（剩余体力：{stamina}）',
  CLEAN_AT_SCHOOL:
    '{name}在学校呢，没法洗澡哦！先用 .接宠物 把它接回来吧~',

  // ======== 送去上学 ========
  SCHOOL_SEND_SUCCESS:
    '{name}背着小书包出门啦！📚\n课程：{course}\n好好学习天天向上~',
  SCHOOL_ALREADY_AT_SCHOOL:
    '{name}已经在学校了！正在学习{course}呢~',
  SCHOOL_INVALID_COURSE:
    '没有这门课程哦！\n' +
    '可选课程：\n' +
    '【爱豆系】卖腐、vocal、dance、rap、媚粉\n' +
    '【生活系】烹饪、文化、绘画、外语',

  // ======== 接宠物 ========
  PICKUP_SUCCESS:
    '你接{name}回家啦！🏠\n' +
    '在校时长：{hours}小时\n' +
    '{course}技能 +{skillGain}\n' +
    '等级 +{levelGain}\n' +
    '清洁度变化：{hygieneDelta}\n' +
    '压力变化：+{stressDelta}',
  PICKUP_NOT_AT_SCHOOL:
    '{name}不在学校哦，没法接~',

  // ======== 群活动 ========
  EVENT_CREATE_SUCCESS:
    '🎉 活动「{eventName}」创建成功！\n' +
    '同群的小伙伴可以使用 .报名活动 {eventName} 送宠物参加~\n' +
    '活动创建者可以使用 .活动结算 {eventName} 结算活动',
  EVENT_CREATE_ALREADY_EXISTS:
    '活动「{eventName}」已经存在了哦！',
  EVENT_CREATE_EMPTY_NAME:
    '请输入活动名称！格式：.创建活动 <活动名>',
  EVENT_JOIN_SUCCESS:
    '{name}已报名参加活动「{eventName}」！🎤',
  EVENT_ALREADY_JOINED:
    '{name}已经报名了活动「{eventName}」哦！',
  EVENT_NOT_HOME:
    '{name}还在学校呢，先接回来再报名吧~',
  EVENT_TOO_STRESSED:
    '{name}压力太大了（{stress}/200），让它休息一下吧！\n💡 试试 .才艺 绘画 或 .才艺 烹饪 来减压~',
  EVENT_NOT_FOUND:
    '活动「{eventName}」不存在哦~\n使用 .查看活动 查看当前群的活动列表',
  EVENT_JOIN_EMPTY_NAME:
    '请输入活动名称！格式：.报名活动 <活动名>',
  EVENT_SETTLE_SUCCESS:
    '🎊 活动「{eventName}」结算完毕！\n' +
    '{eventType}\n' +
    '参与宠物：{count}只\n' +
    '总招揽粉丝：{totalFans}\n' +
    '人均粉丝：{perCapita}\n' +
    '{verdict}\n' +
    '（个人详细结果请用 .查看宠物 查看）',
  EVENT_SETTLE_VERDICT_SUCCESS:
    '✨ 活动大获成功！',
  EVENT_SETTLE_VERDICT_FAIL:
    '💧 活动不太理想…',
  EVENT_SETTLE_NOT_CREATOR:
    '只有活动「{eventName}」的创建者 {creatorName} 才能结算哦！',
  EVENT_SETTLE_EMPTY:
    '📢 活动「{eventName}」因为没有人参加，主办方跑路了…💨',
  EVENT_SETTLE_EMPTY_NAME:
    '请输入活动名称！格式：.活动结算 <活动名>',
  EVENT_TYPE_SOLO:
    '🎙️ 个人演唱会！唯粉加成中~',
  EVENT_TYPE_DUO:
    '🎶 双人演唱会！CP粉加成中~',
  EVENT_TYPE_MULTI:
    '🎪 多人演唱会！',
  EVENT_LIST_EMPTY:
    '📋 当前群还没有进行中的活动~\n使用 .创建活动 <活动名> 创建一个吧！',
  EVENT_LIST_HEADER:
    '📋 当前群进行中的活动：',

  // ======== 才艺 ========
  TALENT_COOKING_SUCCESS:
    '{name}做了一顿美食！一边吃一边直播~🍳\n' +
    '饱食度 +{hungerRestore}\n' +
    '压力 -{stressRelief}\n' +
    '粉丝 +{fanGain}\n' +
    '体力 -{cost}（剩余：{stamina}）',
  TALENT_CULTURE_SUCCESS:
    '{name}写了一篇高情商小作文！📝\n' +
    '成功引导了{converted}位歪屁股cp粉回归正途\n' +
    '体力 -{cost}（剩余：{stamina}）',
  TALENT_PAINTING_SUCCESS:
    '{name}画了一幅超棒的饭绘！🎨\n' +
    '压力 -{stressRelief}\n' +
    '体力 -{cost}（剩余：{stamina}）',
  TALENT_LANGUAGE_SUCCESS:
    '{name}在海外社交媒体上营业啦！🌍\n' +
    '获得了国际Buff，下次Event成功率 +{buff}%\n' +
    '体力 -{cost}（剩余：{stamina}）',
  TALENT_NO_STAMINA:
    '体力不足！需要{cost}点体力，当前只有{stamina}点。',
  TALENT_AT_SCHOOL:
    '{name}在学校呢，先接回来再使用才艺吧~',
  TALENT_INVALID_TYPE:
    '没有这种才艺类型！\n可选类型：烹饪、文化、绘画、外语',

  // ======== 改名 ========
  RENAME_SUCCESS:
    '宠物改名成功！✏️\n{oldName} → {newName}',
  RENAME_EMPTY:
    '请输入新名字！格式：.宠物改名 <新名字>\n（注：改名改的是"xxx的物种"中xxx部分）',

  // ======== 学校巡逻 ========
  PATROL_RESULT:
    '🔍 学校巡逻报告：\n' +
    '在校宠物数量：{total}\n' +
    '被遣返宠物：{expelled}\n' +
    '{details}',
  PATROL_EXPELLED_ITEM:
    '  - {name}（清洁度：{hygiene}）已被遣返',
  PATROL_ALL_CLEAN:
    '  所有宠物都干干净净的！',
  PATROL_NO_PETS:
    '学校里目前没有宠物~',

  // ======== 通用错误 ========
  NO_PET:
    '你还没有宠物哦！发送 .领养宠物 来领养一只吧~',
  PRIVATE_ONLY:
    '这个指令只能在私聊中使用哦！请私聊我~',
  ADMIN_ONLY:
    '这个指令需要管理员权限！',

  // ======== 舞台评价 ========
  EVAL_ACE:
    '🌟 三项均衡发展，是ACE的苗子！',
  EVAL_VOCAL:
    '🎤 Vocal突出，是主唱担当呢！',
  EVAL_DANCE:
    '💃 Dance突出，是舞蹈担当呢！',
  EVAL_RAP:
    '🎵 Rap突出，是说唱担当呢！',
  EVAL_ROOKIE:
    '📝 还是新人，继续加油~',
  EVAL_SHAME:
    '😅 粉丝不少但实力堪忧…是皇族吗？',

  // ======== 学校遣返通知 ========
  SCHOOL_EXPELLED_NOTICE:
    '⚠️ {name}因为太脏被学校遣返回家了！\n' +
    '清洁度已降至{hygiene}，请记得给它洗澡！',

  // ======== 待推送消息前缀 ========
  PENDING_MSG_HEADER:
    '📬 你不在的时候发生了以下事情：\n',

  // ======== 清除数据 ========
  CLEAR_DATA_CONFIRM:
    '⚠️【慎按】危险操作确认 ⚠️\n' +
    '此操作将删除本地所有宠物数据，包括：\n' +
    '· 所有用户的宠物\n' +
    '· 学校注册表\n' +
    '· 所有群活动数据\n' +
    '此操作不可撤销！\n\n' +
    '如确认删除，请在30秒内发送：.确认清除数据',
  CLEAR_DATA_SUCCESS:
    '🗑️ 所有宠物数据已清除。',
  CLEAR_DATA_TIMEOUT:
    '⏰ 确认超时，取消清除操作。',
  CLEAR_DATA_NO_CONFIRM:
    '❌ 请先发送 .清除数据 进行确认操作。',

  // ======== 宠物手册 ========
  HELP_TEXT:
    '═══ 🐾 宠物养成手册 🐾 ═══\n' +
    '\n' +
    '【基础指令】\n' +
    '.领养宠物 - 随机领养一只宠物\n' +
    '.查看宠物 - 查看宠物状态\n' +
    '.宠物改名 <新名字> - 给宠物改名\n' +
    '\n' +
    '【养成指令】(仅限私聊)\n' +
    '.喂食 - 给宠物喂食\n' +
    '.洗澡 - 给宠物洗澡\n' +
    '\n' +
    '【学校指令】(仅限私聊)\n' +
    '.送去上学 <课程名> - 送宠物去学校\n' +
    '.接宠物 - 接宠物回家\n' +
    '课程列表：卖腐/vocal/dance/rap/媚粉/烹饪/文化/绘画/外语\n' +
    '\n' +
    '【群聊指令】(仅限群聊)\n' +
    '.查看学校 - 偷偷看看学校里宠物们在干什么\n' +
    '.创建活动 <活动名> - 创建一个群活动\n' +
    '.报名活动 <活动名> - 送宠物参加活动\n' +
    '.活动结算 <活动名> - (创建者)结算活动\n' +
    '.查看活动 - 查看当前群的活动列表\n' +
    '\n' +
    '【才艺指令】(仅限私聊)\n' +
    '.才艺 <类型> - 使用生活技能\n' +
    '  类型：烹饪 / 文化 / 绘画 / 外语\n' +
    '\n' +
    '【管理指令】\n' +
    '.学校巡逻 - (管理员) 检查学校卫生\n' +
    '.清除数据 - (管理员)【慎按】清除所有宠物数据\n' +
    '\n' +
    '═══ 玩法说明 ═══\n' +
    '· 每日体力有限，合理分配喂食/洗澡/才艺\n' +
    '· 送宠物上学可以学习技能，但清洁度会下降\n' +
    '· 群内任何人都可以创建活动，宠物可同时参加多个活动\n' +
    '· 活动创建者可随时结算，结算后个人结果通过.查看宠物查看\n' +
    '· 舞台技能(vocal/dance/rap)影响表演成功率\n' +
    '· 营业技能(卖腐/媚粉)影响粉丝结构\n' +
    '· 生活技能可通过".才艺"指令使用\n' +
    '· 压力过高会降低表演成功率，注意释放压力',
};
