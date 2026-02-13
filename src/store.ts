// ============================================================
// store.ts - 数据类型定义 & 持久化存储层
// ============================================================

import { GAME, SkillKey, SpeciesConfig } from './game_config';

// ---- 宠物数据类型 ----
export interface Pet {
  id: string;              // UserID，作为唯一标识
  name: string;            // 宠物名字
  species: string;         // 物种名
  speciesConversionRate: number; // 腐唯转化率（领养时由物种决定）

  // 状态
  hunger: number;          // 饱食度 (0-100)
  hygiene: number;         // 清洁度 (可以为负数，被学校遣返)
  stress: number;          // 压力值 (0-100)
  level: number;           // 等级
  location: 'home' | 'school';
  lastInteractionTime: number; // 上次交互时间戳

  // 技能点
  skills: {
    vocal: number;
    dance: number;
    rap: number;
    sellRot: number;       // 卖腐
    fanService: number;    // 媚粉
    life: {
      cooking: number;
      culture: number;
      painting: number;
      language: number;
    };
  };

  // 粉丝
  fans: {
    cpFans: number;
    soloFans: number;
    toxicFans: number;
    extraFans: number;     // Event 累计奖惩
  };

  // 学校数据
  schoolData?: {
    course: string;        // 当前课程名
    courseKey: SkillKey;    // 课程对应技能键
    startTime: number;     // 入校时间戳
  };

  // 每日标记
  dailyFlags: {
    giftSent: boolean;
    eventJoined: boolean;
    stamina: number;
    nextEventBuff: number; // 外语海外营业带来的下次Event加成
  };

  // 待推送消息（下次查看时推送）
  pendingMessages: string[];
}

// ---- 全局存储结构 ----
export interface StorageRoot {
  pets: { [userId: string]: Pet };
  schoolRegistry: string[];   // 在校宠物ID列表
  eventRegistry: string[];    // 今日报名Event的宠物ID列表
  lastEventSettlement: number;
  lastSchoolCheck: number;
  lastDailyReset: number;
}

// ---- 存储实现 ----
const STORAGE_KEY = 'petStore';
let _ext: seal.ExtInfo | null = null;
let _cache: StorageRoot | null = null;

function defaultStorage(): StorageRoot {
  return {
    pets: {},
    schoolRegistry: [],
    eventRegistry: [],
    lastEventSettlement: 0,
    lastSchoolCheck: 0,
    lastDailyReset: 0,
  };
}

/** 初始化存储，必须在插件加载后调用 */
export function initStore(ext: seal.ExtInfo): void {
  _ext = ext;
  _cache = null; // 强制重新加载
}

/** 加载数据（优先从内存缓存读取） */
export function loadData(): StorageRoot {
  if (_cache) return _cache;
  if (!_ext) return defaultStorage();

  const raw = _ext.storageGet(STORAGE_KEY);
  if (!raw) {
    _cache = defaultStorage();
    return _cache;
  }
  try {
    _cache = JSON.parse(raw) as StorageRoot;
    return _cache;
  } catch (_e) {
    _cache = defaultStorage();
    return _cache;
  }
}

/** 保存数据到持久化存储 */
export function saveData(data: StorageRoot): void {
  _cache = data;
  if (_ext) {
    _ext.storageSet(STORAGE_KEY, JSON.stringify(data));
  }
}

/** 获取宠物（返回 null 表示未拥有） */
export function getPet(userId: string): Pet | null {
  const data = loadData();
  return data.pets[userId] || null;
}

/** 保存单只宠物数据 */
export function savePet(pet: Pet): void {
  const data = loadData();
  data.pets[pet.id] = pet;
  saveData(data);
}

/** 创建新宠物 */
export function createPet(
  userId: string,
  ownerName: string,
  species: SpeciesConfig,
): Pet {
  return {
    id: userId,
    name: `${ownerName}的${species.name}`,
    species: species.name,
    speciesConversionRate: species.conversionRate,
    hunger: GAME.INITIAL_HUNGER,
    hygiene: GAME.INITIAL_HYGIENE,
    stress: GAME.INITIAL_STRESS,
    level: GAME.INITIAL_LEVEL,
    location: 'home',
    lastInteractionTime: Date.now(),
    skills: {
      vocal: 0, dance: 0, rap: 0,
      sellRot: 0, fanService: 0,
      life: { cooking: 0, culture: 0, painting: 0, language: 0 },
    },
    fans: { cpFans: 0, soloFans: 0, toxicFans: 0, extraFans: 0 },
    dailyFlags: {
      giftSent: false,
      eventJoined: false,
      stamina: GAME.MAX_STAMINA,
      nextEventBuff: 0,
    },
    pendingMessages: [],
  };
}

// ---- 状态更新（懒计算） ----

/** 更新宠物的时间衰减状态（在家时饱食度下降） */
export function updatePetStatus(pet: Pet): void {
  const now = Date.now();
  const hours = (now - pet.lastInteractionTime) / (1000 * 60 * 60);
  if (hours <= 0) return;

  if (pet.location === 'home') {
    pet.hunger = Math.max(0, pet.hunger - Math.floor(hours * GAME.HUNGER_DECAY_PER_HOUR));
  }
  // 学校的清洁度衰减在 getSchoolStatus 中计算，而非此处

  pet.lastInteractionTime = now;
}

/** 获取在校宠物的实时状态（不修改宠物数据） */
export function getSchoolStatus(pet: Pet): {
  hygiene: number;
  stress: number;
  skillGain: number;
  levelGain: number;
  hoursAtSchool: number;
} {
  if (!pet.schoolData) {
    return { hygiene: pet.hygiene, stress: pet.stress, skillGain: 0, levelGain: 0, hoursAtSchool: 0 };
  }
  const hours = (Date.now() - pet.schoolData.startTime) / (1000 * 60 * 60);
  return {
    hygiene: Math.floor(pet.hygiene - hours * GAME.HYGIENE_DECAY_PER_HOUR_SCHOOL),
    stress: Math.min(100, Math.floor(pet.stress + hours * GAME.STRESS_GAIN_PER_HOUR_SCHOOL)),
    skillGain: parseFloat((hours * GAME.SKILL_GAIN_PER_HOUR).toFixed(1)),
    levelGain: parseFloat((hours * GAME.LEVEL_GAIN_PER_HOUR).toFixed(2)),
    hoursAtSchool: parseFloat(hours.toFixed(1)),
  };
}

/** 结算学校并接回宠物，返回增长详情 */
export function settleSchool(pet: Pet): {
  skillGain: number;
  levelGain: number;
  hygieneDelta: number;
  stressDelta: number;
  hoursAtSchool: number;
} {
  const status = getSchoolStatus(pet);
  const hygieneDelta = status.hygiene - pet.hygiene;
  const stressDelta = status.stress - pet.stress;

  // 应用数值
  pet.hygiene = status.hygiene;
  pet.stress = status.stress;
  pet.level = parseFloat((pet.level + status.levelGain).toFixed(2));
  pet.location = 'home';
  pet.lastInteractionTime = Date.now();

  // 从学校注册表移除
  const data = loadData();
  data.schoolRegistry = data.schoolRegistry.filter(id => id !== pet.id);
  data.pets[pet.id] = pet;
  saveData(data);

  return {
    skillGain: status.skillGain,
    levelGain: status.levelGain,
    hygieneDelta,
    stressDelta,
    hoursAtSchool: status.hoursAtSchool,
  };
}

/** 技能增长时更新粉丝 */
export function onSkillGain(pet: Pet, key: SkillKey, delta: number): void {
  if (delta <= 0) return;
  switch (key) {
    case 'sellRot': {
      const gain = Math.floor(delta * GAME.FAN_COEFF_A);
      pet.fans.cpFans += gain;
      pet.fans.toxicFans += Math.max(0, Math.floor(gain * pet.speciesConversionRate));
      break;
    }
    case 'fanService': {
      const gain = Math.floor(delta * GAME.FAN_COEFF_B);
      pet.fans.soloFans += gain;
      pet.fans.toxicFans += Math.max(0, Math.floor(gain * pet.speciesConversionRate));
      break;
    }
    case 'vocal':
    case 'dance':
    case 'rap': {
      const gain = Math.floor(delta * GAME.FAN_COEFF_C);
      pet.fans.soloFans += gain;
      break;
    }
    default:
      // 生活技能不直接增加粉丝
      break;
  }
}

/** 获取随机一个在校宠物（排除指定ID） */
export function getRandomSchoolPet(excludeId: string): Pet | null {
  const data = loadData();
  const candidates = data.schoolRegistry.filter(id => id !== excludeId);
  if (candidates.length === 0) return null;
  const randomId = candidates[Math.floor(Math.random() * candidates.length)];
  return data.pets[randomId] || null;
}

/** 获取随机两个在校宠物（用于查看学校指令） */
export function getRandomTwoSchoolPets(): { pets: Pet[]; count: number } {
  const data = loadData();
  const ids = data.schoolRegistry;
  const count = ids.length;
  
  if (count === 0) return { pets: [], count: 0 };
  if (count === 1) {
    const pet = data.pets[ids[0]];
    return pet ? { pets: [pet], count: 1 } : { pets: [], count: 0 };
  }
  
  // 随机选两个不同的宠物
  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const selected: Pet[] = [];
  for (let i = 0; i < Math.min(2, shuffled.length); i++) {
    const pet = data.pets[shuffled[i]];
    if (pet) selected.push(pet);
  }
  return { pets: selected, count };
}

// ---- 每日重置 ----

/** 重置所有宠物的每日标记 */
export function resetDaily(): void {
  const data = loadData();
  for (const userId of Object.keys(data.pets)) {
    data.pets[userId].dailyFlags = {
      giftSent: false,
      eventJoined: false,
      stamina: GAME.MAX_STAMINA,
      nextEventBuff: 0,
    };
  }
  data.eventRegistry = [];
  data.lastDailyReset = Date.now();
  saveData(data);
}

// ---- 学校巡逻 ----

export interface PatrolResult {
  total: number;
  expelled: { name: string; hygiene: number }[];
}

/** 执行学校巡逻，遣返清洁度不合格的宠物 */
export function runSchoolPatrol(hygieneLimit: number): PatrolResult {
  const data = loadData();
  const result: PatrolResult = { total: data.schoolRegistry.length, expelled: [] };
  const remaining: string[] = [];

  for (const petId of data.schoolRegistry) {
    const pet = data.pets[petId];
    if (!pet) continue;

    const status = getSchoolStatus(pet);
    if (status.hygiene < hygieneLimit) {
      // 结算并遣返
      const schoolResult = getSchoolStatus(pet);
      pet.hygiene = schoolResult.hygiene;
      pet.stress = schoolResult.stress;
      pet.level = parseFloat((pet.level + schoolResult.levelGain).toFixed(2));

      // 应用技能增长
      if (pet.schoolData) {
        const skillDelta = schoolResult.skillGain;
        // addSkill 和 onSkillGain 在 utils 中，这里直接操作避免循环引用
        applySkillGainDirect(pet, pet.schoolData.courseKey, skillDelta);
      }

      pet.location = 'home';
      pet.schoolData = undefined;
      pet.lastInteractionTime = Date.now();
      pet.pendingMessages.push(
        `⚠️ ${pet.name}因为太脏被学校遣返回家了！清洁度：${status.hygiene}`
      );
      result.expelled.push({ name: pet.name, hygiene: status.hygiene });
    } else {
      remaining.push(petId);
    }
  }

  data.schoolRegistry = remaining;
  data.lastSchoolCheck = Date.now();
  saveData(data);
  return result;
}

// ---- Event 结算 ----

export interface EventResult {
  petId: string;
  petName: string;
  result: 'great_success' | 'success' | 'normal' | 'fail' | 'great_fail';
  fansDelta: number;
  groupMembers: string[]; // 同组宠物名称
}

/** 将宠物分组 */
function groupPets(ids: string[]): string[][] {
  if (ids.length === 0) return [];
  if (ids.length === 1) return [ids];

  const shuffled = [...ids].sort(() => Math.random() - 0.5);
  const groups: string[][] = [];
  let i = 0;

  while (i < shuffled.length) {
    const remaining = shuffled.length - i;
    if (remaining <= 3) {
      groups.push(shuffled.slice(i));
      break;
    }
    const size = Math.min(Math.floor(Math.random() * 3) + 1, remaining);
    groups.push(shuffled.slice(i, i + size));
    i += size;
  }
  return groups;
}

/** 执行 Event 结算 */
export function settleEvents(): EventResult[] {
  const data = loadData();
  if (data.eventRegistry.length === 0) return [];

  const groups = groupPets(data.eventRegistry);
  const results: EventResult[] = [];

  for (const group of groups) {
    const groupNames: string[] = [];
    for (const petId of group) {
      const pet = data.pets[petId];
      if (pet) groupNames.push(pet.name);
    }

    for (const petId of group) {
      const pet = data.pets[petId];
      if (!pet) continue;

      // 计算成功率
      const stageAvg = (pet.skills.vocal + pet.skills.dance + pet.skills.rap) / 3;
      let successChance = Math.min(95, stageAvg * 2 + 10); // 基础10%，技能加成
      successChance += pet.dailyFlags.nextEventBuff * 100;
      if (pet.stress > 50) {
        successChance *= 0.8; // 高压力惩罚
      }

      const roll = Math.floor(Math.random() * 100) + 1;
      let result: EventResult['result'];
      let fansDelta: number;

      if (roll <= successChance * 0.3) {
        result = 'great_success';
        fansDelta = GAME.EVENT_FANS_GREAT_SUCCESS;
      } else if (roll <= successChance) {
        result = 'success';
        fansDelta = GAME.EVENT_FANS_SUCCESS;
      } else if (roll <= successChance * 1.3) {
        result = 'normal';
        fansDelta = GAME.EVENT_FANS_NORMAL;
      } else if (roll <= successChance * 1.8) {
        result = 'fail';
        fansDelta = GAME.EVENT_FANS_FAIL;
      } else {
        result = 'great_fail';
        fansDelta = GAME.EVENT_FANS_GREAT_FAIL;
      }

      // 应用结果
      pet.fans.extraFans += fansDelta;
      pet.stress = Math.min(100, pet.stress + GAME.EVENT_STRESS_GAIN);
      pet.dailyFlags.nextEventBuff = 0; // 用完后清除

      // 生成通知
      const groupInfo = group.length === 1
        ? `🎙️ ${pet.name}进行了Solo表演！`
        : `🎶 ${groupNames.join('、')}组成了临时团体一起表演！`;
      const resultText = formatEventResult(pet.name, result, fansDelta);
      pet.pendingMessages.push(`${groupInfo}\n${resultText}`);

      results.push({ petId, petName: pet.name, result, fansDelta, groupMembers: groupNames });
    }
  }

  data.eventRegistry = [];
  data.lastEventSettlement = Date.now();
  saveData(data);
  return results;
}

function formatEventResult(name: string, result: EventResult['result'], fans: number): string {
  switch (result) {
    case 'great_success':
      return `🌟【大成功】🌟 ${name}的表演惊艳全场！额外粉丝 +${fans}`;
    case 'success':
      return `✨【成功】✨ ${name}的表演很棒！额外粉丝 +${fans}`;
    case 'normal':
      return `📝【平平无奇】 ${name}的表演中规中矩。额外粉丝 +${fans}`;
    case 'fail':
      return `💧【失败】 ${name}出了点小差错…额外粉丝 ${fans}`;
    case 'great_fail':
      return `💥【大失败】 ${name}在舞台上摔了个大跟头！额外粉丝 ${fans}`;
  }
}

// ---- 内部辅助 ----

/** 直接应用技能增长（避免循环引用 utils） */
function applySkillGainDirect(pet: Pet, key: SkillKey, amount: number): void {
  switch (key) {
    case 'vocal':      pet.skills.vocal += amount; break;
    case 'dance':      pet.skills.dance += amount; break;
    case 'rap':        pet.skills.rap += amount; break;
    case 'sellRot':    pet.skills.sellRot += amount; break;
    case 'fanService': pet.skills.fanService += amount; break;
    case 'cooking':    pet.skills.life.cooking += amount; break;
    case 'culture':    pet.skills.life.culture += amount; break;
    case 'painting':   pet.skills.life.painting += amount; break;
    case 'language':   pet.skills.life.language += amount; break;
  }
  onSkillGain(pet, key, amount);
}
