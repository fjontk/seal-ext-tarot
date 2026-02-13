// ============================================================
// index.ts - 宠物养成插件主入口
// ============================================================

import { SPECIES_LIST, GAME, findCourse } from './game_config';
import { TEXT } from './game_text';
import {
  initStore, loadData, saveData,
  getPet, savePet, createPet, getFullPetName,
  updatePetStatus, getSchoolStatus, settleSchool,
  onSkillGain, resetDaily, runSchoolPatrol, settleEvents,
  getRandomSchoolPet, getRandomTwoSchoolPets, clearAllData,
} from './store';
import {
  formatText, randomItem, clamp, rollDice,
  addSkill, evaluateStage,
} from './utils';

// ---- 插件常量 ----
const EXT_NAME = '宠物养成';
const EXT_AUTHOR = '无爱纪';
const EXT_VERSION = '1.0.0';

// ============================================================
// 主函数
// ============================================================
function main() {
  let ext = seal.ext.find(EXT_NAME);
  if (!ext) {
    ext = seal.ext.new(EXT_NAME, EXT_AUTHOR, EXT_VERSION);
    seal.ext.register(ext);
  }

  // 注册插件配置
  registerConfigs(ext);

  // 初始化存储
  initStore(ext);

  // 注册指令
  registerCommands(ext);

  // 注册定时任务
  registerTasks(ext);
}

// ============================================================
// 插件配置注册
// ============================================================
function registerConfigs(ext: seal.ExtInfo) {
  seal.ext.registerStringConfig(ext, 'EventTime', '21:00', '每日Event结算时间（HH:MM）');
  seal.ext.registerStringConfig(ext, 'SchoolCheckTime', '17:00', '每日学校巡检时间（HH:MM）');
  seal.ext.registerIntConfig(ext, 'HygieneLimit', 0, '学校强制劝退的清洁度阈值');
}

// ============================================================
// 私聊检查辅助
// ============================================================
function requirePrivate(ctx: seal.MsgContext, msg: seal.Message): boolean {
  if (!ctx.isPrivate) {
    seal.replyToSender(ctx, msg, TEXT.PRIVATE_ONLY);
    return false;
  }
  return true;
}

function requirePet(ctx: seal.MsgContext, msg: seal.Message): ReturnType<typeof getPet> {
  const pet = getPet(ctx.player.userId);
  if (!pet) {
    seal.replyToSender(ctx, msg, TEXT.NO_PET);
    return null;
  }
  return pet;
}

/** 推送并清空待处理消息 */
function deliverPending(ctx: seal.MsgContext, msg: seal.Message, pet: ReturnType<typeof getPet>): void {
  if (!pet || pet.pendingMessages.length === 0) return;
  const text = TEXT.PENDING_MSG_HEADER + pet.pendingMessages.join('\n───\n');
  seal.replyToSender(ctx, msg, text);
  pet.pendingMessages = [];
  savePet(pet);
}

// ============================================================
// 指令注册
// ============================================================
function registerCommands(ext: seal.ExtInfo) {
  // ---- 1. 领养宠物 ----
  const cmdAdopt = seal.ext.newCmdItemInfo();
  cmdAdopt.name = '领养宠物';
  cmdAdopt.help = '随机领养一只宠物';
  cmdAdopt.solve = (ctx, msg, _cmdArgs) => {
    const existing = getPet(ctx.player.userId);
    if (existing) {
      seal.replyToSender(ctx, msg, TEXT.ADOPT_ALREADY_HAVE);
      return seal.ext.newCmdExecuteResult(true);
    }

    const species = randomItem(SPECIES_LIST);
    const pet = createPet(ctx.player.userId, ctx.player.name, species);
    savePet(pet);

    const adoptText = randomItem(TEXT.ADOPT_SUCCESS_LIST);
    seal.replyToSender(ctx, msg, formatText(adoptText, {
      species: pet.species,
      name: getFullPetName(pet),
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['领养宠物'] = cmdAdopt;

  // ---- 2. 查看宠物 ----
  const cmdView = seal.ext.newCmdItemInfo();
  cmdView.name = '查看宠物';
  cmdView.help = '查看宠物当前状态';
  cmdView.solve = (ctx, msg, _cmdArgs) => {
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    // 推送待处理消息
    deliverPending(ctx, msg, pet);

    // 更新时间衰减
    updatePetStatus(pet);

    const totalFans = pet.fans.cpFans + pet.fans.soloFans +
      pet.fans.toxicFans + Math.max(0, pet.fans.extraFans);

    if (pet.location === 'home') {
      const parts = [
        formatText(TEXT.VIEW_AT_HOME_HEADER, { name: getFullPetName(pet), species: pet.species }),
        formatText(TEXT.VIEW_AT_HOME_STATUS, {
          hunger: pet.hunger, hygiene: pet.hygiene, stress: pet.stress,
          level: pet.level, stamina: pet.dailyFlags.stamina, maxStamina: GAME.MAX_STAMINA,
        }),
        formatText(TEXT.VIEW_AT_HOME_SKILLS, {
          vocal: pet.skills.vocal, dance: pet.skills.dance, rap: pet.skills.rap,
          stageEval: evaluateStage(pet),
          sellRot: pet.skills.sellRot, fanService: pet.skills.fanService,
          cooking: pet.skills.life.cooking, culture: pet.skills.life.culture,
          painting: pet.skills.life.painting, language: pet.skills.life.language,
        }),
        formatText(TEXT.VIEW_AT_HOME_FANS, {
          cpFans: pet.fans.cpFans, soloFans: pet.fans.soloFans,
          toxicFans: pet.fans.toxicFans, extraFans: pet.fans.extraFans,
          totalFans,
        }),
      ];
      seal.replyToSender(ctx, msg, parts.join('\n'));
    } else {
      const status = getSchoolStatus(pet);
      // 获取其他在校宠物进行双人互动
      const partner = getRandomSchoolPet(pet.id);
      let activityText: string;
      
      if (partner && Math.random() > 0.4) {
        // 60%概率双人互动
        const pairActivity = randomItem(TEXT.SCHOOL_ACTIVITIES_PAIR);
        // 从宠物名字中提取主人名（直接使用 partner.name 即为主人名）
        const partnerOwner = partner.name;
        const partnerSpecies = partner.originalSpecies;
        
        activityText = formatText(TEXT.VIEW_AT_SCHOOL_ACTIVITY_PAIR, {
          ownerName: ctx.player.name,
          petName: getFullPetName(pet),
          activity: formatText(pairActivity, {
            partnerOwner,
            partnerName: partnerSpecies,
          }),
        });
      } else {
        // 单人互动
        const soloActivity = randomItem(TEXT.SCHOOL_ACTIVITIES_SOLO);
        activityText = formatText(TEXT.VIEW_AT_SCHOOL_ACTIVITY_SOLO, { activity: soloActivity });
      }
      
      const parts = [
        formatText(TEXT.VIEW_AT_SCHOOL_HEADER, {
          name: getFullPetName(pet), species: pet.species,
          course: pet.schoolData ? pet.schoolData.course : '未知',
        }),
        activityText,
        formatText(TEXT.VIEW_AT_SCHOOL_STATUS, {
          hunger: pet.hunger, hygiene: status.hygiene, stress: status.stress,
        }),
      ];
      seal.replyToSender(ctx, msg, parts.join('\n'));
    }

    savePet(pet);
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['查看宠物'] = cmdView;

  // ---- 3. 宠物改名 ----
  const cmdRename = seal.ext.newCmdItemInfo();
  cmdRename.name = '宠物改名';
  cmdRename.help = '给宠物改名（修改主人名部分）。格式：.宠物改名 <新名字>';
  cmdRename.solve = (ctx, msg, cmdArgs) => {
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    const newName = cmdArgs.getRestArgsFrom(1);
    if (!newName || newName.trim() === '') {
      seal.replyToSender(ctx, msg, TEXT.RENAME_EMPTY);
      return seal.ext.newCmdExecuteResult(true);
    }

    const oldFullName = getFullPetName(pet);
    pet.name = newName.trim();
    savePet(pet);

    seal.replyToSender(ctx, msg, formatText(TEXT.RENAME_SUCCESS, { oldName: oldFullName, newName: getFullPetName(pet) }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['宠物改名'] = cmdRename;

  // ---- 4. 喂食 ----
  const cmdFeed = seal.ext.newCmdItemInfo();
  cmdFeed.name = '喂食';
  cmdFeed.help = '给宠物喂食（私聊）';
  cmdFeed.solve = (ctx, msg, _cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location === 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.FEED_AT_SCHOOL, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    updatePetStatus(pet);

    if (pet.dailyFlags.stamina < GAME.FEED_STAMINA_COST) {
      seal.replyToSender(ctx, msg, formatText(TEXT.FEED_NO_STAMINA, {
        stamina: pet.dailyFlags.stamina,
      }));
      return seal.ext.newCmdExecuteResult(true);
    }

    const amount = rollDice(GAME.FEED_DICE_SIDES) + GAME.FEED_DICE_BASE;
    pet.hunger = clamp(pet.hunger + amount, 0, 100);
    pet.dailyFlags.stamina -= GAME.FEED_STAMINA_COST;
    savePet(pet);

    seal.replyToSender(ctx, msg, formatText(TEXT.FEED_SUCCESS, {
      name: getFullPetName(pet), food: '食物', amount,
      hunger: pet.hunger, cost: GAME.FEED_STAMINA_COST,
      stamina: pet.dailyFlags.stamina,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['喂食'] = cmdFeed;

  // ---- 5. 洗澡 ----
  const cmdClean = seal.ext.newCmdItemInfo();
  cmdClean.name = '洗澡';
  cmdClean.help = '给宠物洗澡（私聊）';
  cmdClean.solve = (ctx, msg, _cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location === 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.CLEAN_AT_SCHOOL, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    updatePetStatus(pet);

    if (pet.dailyFlags.stamina < GAME.CLEAN_STAMINA_COST) {
      seal.replyToSender(ctx, msg, formatText(TEXT.CLEAN_NO_STAMINA, {
        stamina: pet.dailyFlags.stamina,
      }));
      return seal.ext.newCmdExecuteResult(true);
    }

    const amount = rollDice(GAME.CLEAN_DICE_SIDES) + GAME.CLEAN_DICE_BASE;
    pet.hygiene = clamp(pet.hygiene + amount, 0, 100);
    pet.dailyFlags.stamina -= GAME.CLEAN_STAMINA_COST;
    savePet(pet);

    seal.replyToSender(ctx, msg, formatText(TEXT.CLEAN_SUCCESS, {
      name: getFullPetName(pet), amount,
      hygiene: pet.hygiene, cost: GAME.CLEAN_STAMINA_COST,
      stamina: pet.dailyFlags.stamina,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['洗澡'] = cmdClean;

  // ---- 6. 送去上学 ----
  const cmdSchool = seal.ext.newCmdItemInfo();
  cmdSchool.name = '送去上学';
  cmdSchool.help = '送宠物去学校学习课程（私聊）。格式：.送去上学 <课程名>';
  cmdSchool.solve = (ctx, msg, cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location === 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.SCHOOL_ALREADY_AT_SCHOOL, {
        name: getFullPetName(pet), course: pet.schoolData ? pet.schoolData.course : '未知',
      }));
      return seal.ext.newCmdExecuteResult(true);
    }

    const courseName = cmdArgs.getArgN(1);
    const course = findCourse(courseName);
    if (!course) {
      seal.replyToSender(ctx, msg, TEXT.SCHOOL_INVALID_COURSE);
      return seal.ext.newCmdExecuteResult(true);
    }

    updatePetStatus(pet);
    pet.location = 'school';
    pet.schoolData = {
      course: course.name,
      courseKey: course.skillKey,
      startTime: Date.now(),
    };

    // 加入学校注册表
    const data = loadData();
    if (!data.schoolRegistry.includes(pet.id)) {
      data.schoolRegistry.push(pet.id);
    }
    data.pets[pet.id] = pet;
    saveData(data);

    seal.replyToSender(ctx, msg, formatText(TEXT.SCHOOL_SEND_SUCCESS, {
      name: getFullPetName(pet), course: course.name,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['送去上学'] = cmdSchool;

  // ---- 7. 接宠物 ----
  const cmdPickup = seal.ext.newCmdItemInfo();
  cmdPickup.name = '接宠物';
  cmdPickup.help = '接宠物回家，结算在校技能增长（私聊）';
  cmdPickup.solve = (ctx, msg, _cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location !== 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.PICKUP_NOT_AT_SCHOOL, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    const courseName = pet.schoolData ? pet.schoolData.course : '未知';
    const courseKey = pet.schoolData ? pet.schoolData.courseKey : undefined;
    const result = settleSchool(pet);

    // 应用技能增长
    if (courseKey && result.skillGain > 0) {
      addSkill(pet, courseKey, result.skillGain);
      onSkillGain(pet, courseKey, result.skillGain);
    }
    pet.schoolData = undefined;
    savePet(pet);

    seal.replyToSender(ctx, msg, formatText(TEXT.PICKUP_SUCCESS, {
      name: getFullPetName(pet),
      hours: result.hoursAtSchool,
      course: courseName,
      skillGain: result.skillGain,
      levelGain: result.levelGain,
      hygieneDelta: result.hygieneDelta,
      stressDelta: result.stressDelta,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['接宠物'] = cmdPickup;

  // ---- 8. 报名活动 ----
  const cmdEventJoin = seal.ext.newCmdItemInfo();
  cmdEventJoin.name = '报名活动';
  cmdEventJoin.help = '报名参加今晚的Event活动（私聊）';
  cmdEventJoin.solve = (ctx, msg, _cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location === 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.EVENT_NOT_HOME, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    if (pet.dailyFlags.eventJoined) {
      seal.replyToSender(ctx, msg, formatText(TEXT.EVENT_ALREADY_JOINED, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    pet.dailyFlags.eventJoined = true;

    const data = loadData();
    if (!data.eventRegistry.includes(pet.id)) {
      data.eventRegistry.push(pet.id);
    }
    data.pets[pet.id] = pet;
    saveData(data);

    seal.replyToSender(ctx, msg, formatText(TEXT.EVENT_JOIN_SUCCESS, { name: getFullPetName(pet) }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['报名活动'] = cmdEventJoin;

  // ---- 9. 才艺 ----
  const cmdTalent = seal.ext.newCmdItemInfo();
  cmdTalent.name = '才艺';
  cmdTalent.help = '使用生活技能（私聊）。格式：.才艺 <烹饪|文化|绘画|外语>';
  cmdTalent.solve = (ctx, msg, cmdArgs) => {
    if (!requirePrivate(ctx, msg)) return seal.ext.newCmdExecuteResult(true);
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.location === 'school') {
      seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_AT_SCHOOL, { name: getFullPetName(pet) }));
      return seal.ext.newCmdExecuteResult(true);
    }

    updatePetStatus(pet);

    if (pet.dailyFlags.stamina < GAME.TALENT_STAMINA_COST) {
      seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_NO_STAMINA, {
        cost: GAME.TALENT_STAMINA_COST, stamina: pet.dailyFlags.stamina,
      }));
      return seal.ext.newCmdExecuteResult(true);
    }

    const talentType = cmdArgs.getArgN(1).trim();
    pet.dailyFlags.stamina -= GAME.TALENT_STAMINA_COST;

    switch (talentType) {
      case '烹饪': {
        const restore = Math.floor(GAME.COOKING_HUNGER_RESTORE * (1 + pet.skills.life.cooking * 0.02));
        pet.hunger = clamp(pet.hunger + restore, 0, 100);
        pet.stress = clamp(pet.stress - GAME.COOKING_STRESS_RELIEF, 0, 100);
        pet.fans.soloFans += GAME.COOKING_FAN_GAIN;
        savePet(pet);
        seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_COOKING_SUCCESS, {
          name: getFullPetName(pet), hungerRestore: restore,
          stressRelief: GAME.COOKING_STRESS_RELIEF, fanGain: GAME.COOKING_FAN_GAIN,
          cost: GAME.TALENT_STAMINA_COST, stamina: pet.dailyFlags.stamina,
        }));
        break;
      }
      case '文化': {
        const convertAmount = Math.min(pet.fans.toxicFans,
          Math.floor(GAME.CULTURE_TOXIC_CONVERT * (1 + pet.skills.life.culture * 0.03)));
        pet.fans.toxicFans -= convertAmount;
        // 一半回流CP粉，一半回流唯粉
        pet.fans.cpFans += Math.floor(convertAmount / 2);
        pet.fans.soloFans += Math.ceil(convertAmount / 2);
        savePet(pet);
        seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_CULTURE_SUCCESS, {
          name: getFullPetName(pet), converted: convertAmount,
          cost: GAME.TALENT_STAMINA_COST, stamina: pet.dailyFlags.stamina,
        }));
        break;
      }
      case '绘画': {
        const stressRelief = Math.floor(GAME.PAINTING_STRESS_RELIEF * (1 + pet.skills.life.painting * 0.02));
        pet.stress = clamp(pet.stress - stressRelief, 0, 100);
        savePet(pet);
        seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_PAINTING_SUCCESS, {
          name: getFullPetName(pet), stressRelief,
          cost: GAME.TALENT_STAMINA_COST, stamina: pet.dailyFlags.stamina,
        }));
        break;
      }
      case '外语': {
        const buffPercent = Math.floor(GAME.LANGUAGE_EVENT_BUFF * 100 * (1 + pet.skills.life.language * 0.02));
        pet.dailyFlags.nextEventBuff = GAME.LANGUAGE_EVENT_BUFF * (1 + pet.skills.life.language * 0.02);
        savePet(pet);
        seal.replyToSender(ctx, msg, formatText(TEXT.TALENT_LANGUAGE_SUCCESS, {
          name: getFullPetName(pet), buff: buffPercent,
          cost: GAME.TALENT_STAMINA_COST, stamina: pet.dailyFlags.stamina,
        }));
        break;
      }
      default: {
        // 还原体力（无效输入不扣体力）
        pet.dailyFlags.stamina += GAME.TALENT_STAMINA_COST;
        savePet(pet);
        seal.replyToSender(ctx, msg, TEXT.TALENT_INVALID_TYPE);
        break;
      }
    }
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['才艺'] = cmdTalent;

  // ---- 10. 赠送礼物 ----
  const cmdGift = seal.ext.newCmdItemInfo();
  cmdGift.name = '赠送礼物';
  cmdGift.help = '给别人的宠物送礼物。格式：.赠送礼物 <@某人或QQ号> <礼物描述>';
  cmdGift.solve = (ctx, msg, cmdArgs) => {
    const pet = requirePet(ctx, msg);
    if (!pet) return seal.ext.newCmdExecuteResult(true);

    if (pet.dailyFlags.giftSent) {
      seal.replyToSender(ctx, msg, TEXT.GIFT_ALREADY_SENT);
      return seal.ext.newCmdExecuteResult(true);
    }

    // 尝试获取目标：优先通过 @ 获取
    let targetId = '';
    let targetName = '';

    if (cmdArgs.at && cmdArgs.at.length > 0) {
      targetId = cmdArgs.at[0].userId;
      // 尝试通过代骰上下文获取名称
      try {
        const targetCtx = seal.getCtxProxyFirst(ctx, cmdArgs);
        targetName = targetCtx.player.name;
      } catch (_e) {
        targetName = targetId;
      }
    } else {
      targetId = cmdArgs.getArgN(1);
      targetName = targetId;
    }

    if (!targetId) {
      seal.replyToSender(ctx, msg, '请指定赠送对象！格式：.赠送礼物 <@某人> <礼物描述>');
      return seal.ext.newCmdExecuteResult(true);
    }

    if (targetId === ctx.player.userId) {
      seal.replyToSender(ctx, msg, TEXT.GIFT_SELF);
      return seal.ext.newCmdExecuteResult(true);
    }

    const targetPet = getPet(targetId);
    if (!targetPet) {
      seal.replyToSender(ctx, msg, TEXT.GIFT_TARGET_NO_PET);
      return seal.ext.newCmdExecuteResult(true);
    }

    const giftDesc = cmdArgs.getRestArgsFrom(2) || '一份神秘礼物';

    pet.dailyFlags.giftSent = true;
    savePet(pet);

    // 给目标宠物添加待推送消息
    targetPet.pendingMessages.push(
      `🎁 ${ctx.player.name}给你的${getFullPetName(targetPet)}送了礼物：${giftDesc}`
    );
    savePet(targetPet);

    seal.replyToSender(ctx, msg, formatText(TEXT.GIFT_SUCCESS, {
      targetName, giftDesc,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['赠送礼物'] = cmdGift;

  // ---- 11. 学校巡逻（管理员） ----
  const cmdPatrol = seal.ext.newCmdItemInfo();
  cmdPatrol.name = '学校巡逻';
  cmdPatrol.help = '（管理员）立即执行一次学校卫生检查';
  cmdPatrol.solve = (ctx, msg, _cmdArgs) => {
    // 权限检查：管理员 50+
    if (ctx.privilegeLevel < 50) {
      seal.replyToSender(ctx, msg, TEXT.ADMIN_ONLY);
      return seal.ext.newCmdExecuteResult(true);
    }

    const hygieneLimit = seal.ext.getIntConfig(ext, 'HygieneLimit');
    const result = runSchoolPatrol(hygieneLimit);

    if (result.total === 0) {
      seal.replyToSender(ctx, msg, TEXT.PATROL_NO_PETS);
      return seal.ext.newCmdExecuteResult(true);
    }

    let details = '';
    if (result.expelled.length === 0) {
      details = TEXT.PATROL_ALL_CLEAN;
    } else {
      details = result.expelled.map(e =>
        formatText(TEXT.PATROL_EXPELLED_ITEM, { name: e.name, hygiene: e.hygiene })
      ).join('\n');
    }

    seal.replyToSender(ctx, msg, formatText(TEXT.PATROL_RESULT, {
      total: result.total,
      expelled: result.expelled.length,
      details,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['学校巡逻'] = cmdPatrol;

  // ---- 12. 宠物手册 ----
  const cmdHelp = seal.ext.newCmdItemInfo();
  cmdHelp.name = '宠物手册';
  cmdHelp.help = '查看宠物养成插件使用手册';
  cmdHelp.solve = (ctx, msg, _cmdArgs) => {
    seal.replyToSender(ctx, msg, TEXT.HELP_TEXT);
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['宠物手册'] = cmdHelp;

  // ---- 13. 查看学校（群聊限定） ----
  const cmdVisitSchool = seal.ext.newCmdItemInfo();
  cmdVisitSchool.name = '查看学校';
  cmdVisitSchool.help = '偷偷看看学校里宠物们在干什么（群聊限定）';
  cmdVisitSchool.solve = (ctx, msg, _cmdArgs) => {
    if (ctx.isPrivate) {
      seal.replyToSender(ctx, msg, TEXT.GROUP_ONLY);
      return seal.ext.newCmdExecuteResult(true);
    }

    const { pets, count } = getRandomTwoSchoolPets();

    if (count === 0) {
      seal.replyToSender(ctx, msg, TEXT.VISIT_SCHOOL_EMPTY);
      return seal.ext.newCmdExecuteResult(true);
    }

    if (count === 1 || pets.length === 1) {
      // 只有一只宠物，独自玩耍
      const pet = pets[0];
      const activity = randomItem(TEXT.VISIT_SCHOOL_SOLO_ACTIVITIES);
      seal.replyToSender(ctx, msg, formatText(TEXT.VISIT_SCHOOL_SOLO, {
        name: getFullPetName(pet),
        activity,
      }));
      return seal.ext.newCmdExecuteResult(true);
    }

    // 两只宠物互动
    const [pet1, pet2] = pets;
    const activityTemplate = randomItem(TEXT.VISIT_SCHOOL_PAIR_ACTIVITIES);
    const activity = formatText(activityTemplate, {
      name1: getFullPetName(pet1),
      name2: getFullPetName(pet2),
    });
    seal.replyToSender(ctx, msg, formatText(TEXT.VISIT_SCHOOL_PAIR, {
      name1: getFullPetName(pet1),
      name2: getFullPetName(pet2),
      activity,
    }));
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['查看学校'] = cmdVisitSchool;

  // ---- 14. 清除数据（管理员） ----
  // 用于存储确认状态（userId -> 确认时间戳）
  const clearConfirmMap: { [userId: string]: number } = {};

  const cmdClearData = seal.ext.newCmdItemInfo();
  cmdClearData.name = '清除数据';
  cmdClearData.help = '（管理员）【慎按】清除本地所有宠物数据';
  cmdClearData.solve = (ctx, msg, _cmdArgs) => {
    // 权限检查：管理员 50+
    if (ctx.privilegeLevel < 50) {
      seal.replyToSender(ctx, msg, TEXT.ADMIN_ONLY);
      return seal.ext.newCmdExecuteResult(true);
    }

    // 记录确认请求时间
    clearConfirmMap[ctx.player.userId] = Date.now();

    seal.replyToSender(ctx, msg, TEXT.CLEAR_DATA_CONFIRM);
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['清除数据'] = cmdClearData;

  // ---- 15. 确认清除数据（管理员） ----
  const cmdConfirmClearData = seal.ext.newCmdItemInfo();
  cmdConfirmClearData.name = '确认清除数据';
  cmdConfirmClearData.help = '（管理员）确认清除本地所有宠物数据';
  cmdConfirmClearData.solve = (ctx, msg, _cmdArgs) => {
    // 权限检查：管理员 50+
    if (ctx.privilegeLevel < 50) {
      seal.replyToSender(ctx, msg, TEXT.ADMIN_ONLY);
      return seal.ext.newCmdExecuteResult(true);
    }

    const confirmTime = clearConfirmMap[ctx.player.userId];
    if (!confirmTime) {
      seal.replyToSender(ctx, msg, TEXT.CLEAR_DATA_NO_CONFIRM);
      return seal.ext.newCmdExecuteResult(true);
    }

    // 检查是否在30秒内
    const elapsed = Date.now() - confirmTime;
    if (elapsed > 30 * 1000) {
      delete clearConfirmMap[ctx.player.userId];
      seal.replyToSender(ctx, msg, TEXT.CLEAR_DATA_TIMEOUT);
      return seal.ext.newCmdExecuteResult(true);
    }

    // 执行清除
    clearAllData();
    delete clearConfirmMap[ctx.player.userId];

    seal.replyToSender(ctx, msg, TEXT.CLEAR_DATA_SUCCESS);
    return seal.ext.newCmdExecuteResult(true);
  };
  ext.cmdMap['确认清除数据'] = cmdConfirmClearData;
}

// ============================================================
// 定时任务注册
// ============================================================
function registerTasks(ext: seal.ExtInfo) {
  const eventTime = seal.ext.getStringConfig(ext, 'EventTime') || '21:00';
  const schoolCheckTime = seal.ext.getStringConfig(ext, 'SchoolCheckTime') || '17:00';

  // 每日 00:00 重置
  seal.ext.registerTask(ext, 'daily', '0:00', () => {
    resetDaily();
  }, 'petDailyReset', '宠物系统每日重置');

  // 学校巡检
  seal.ext.registerTask(ext, 'daily', schoolCheckTime, () => {
    const hygieneLimit = seal.ext.getIntConfig(ext, 'HygieneLimit');
    runSchoolPatrol(hygieneLimit);
  }, 'petSchoolCheck', '宠物学校卫生巡检');

  // Event 结算
  seal.ext.registerTask(ext, 'daily', eventTime, () => {
    settleEvents();
  }, 'petEventSettle', '宠物Event活动结算');
}

// ============================================================
// 启动
// ============================================================
main();
