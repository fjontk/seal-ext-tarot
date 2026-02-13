// ============================================================
// game_config.ts - 游戏数值配置
// 所有可调节的游戏常量集中在此，便于维护和平衡性调整
// ============================================================

// ---- 物种配置 ----
export interface SpeciesConfig {
  /** 物种名称 */
  name: string;
  /** 腐唯转化率基础值 (0~1) */
  conversionRate: number;
}

export const SPECIES_LIST: SpeciesConfig[] = [
  { name: '小猫',   conversionRate: 0.05 },
  { name: '小狗',   conversionRate: 0.08 },
  { name: '小兔',   conversionRate: 0.03 },
  { name: '小鸟',   conversionRate: 0.06 },
  { name: '小仓鼠', conversionRate: 0.04 },
  { name: '小狐狸', conversionRate: 0.10 },
  { name: '小熊猫', conversionRate: 0.07 },
  { name: '小龙猫', conversionRate: 0.06 },
];

// ---- 技能键 ----
export type SkillKey =
  | 'vocal' | 'dance' | 'rap'
  | 'sellRot' | 'fanService'
  | 'cooking' | 'culture' | 'painting' | 'language';

// ---- 课程配置 ----
export interface CourseConfig {
  /** 课程名（用户输入匹配用） */
  name: string;
  /** 对应技能键 */
  skillKey: SkillKey;
  /** 分类 */
  category: 'idol' | 'life';
}

export const COURSES: CourseConfig[] = [
  { name: '卖腐',   skillKey: 'sellRot',    category: 'idol' },
  { name: 'vocal',  skillKey: 'vocal',      category: 'idol' },
  { name: 'dance',  skillKey: 'dance',      category: 'idol' },
  { name: 'rap',    skillKey: 'rap',        category: 'idol' },
  { name: '媚粉',   skillKey: 'fanService', category: 'idol' },
  { name: '烹饪',   skillKey: 'cooking',    category: 'life' },
  { name: '文化',   skillKey: 'culture',    category: 'life' },
  { name: '绘画',   skillKey: 'painting',   category: 'life' },
  { name: '外语',   skillKey: 'language',   category: 'life' },
];

/** 通过名称查找课程，忽略大小写 */
export function findCourse(name: string): CourseConfig | undefined {
  const lower = name.toLowerCase().trim();
  return COURSES.find(c => c.name.toLowerCase() === lower);
}

// ---- 游戏数值常量 ----
export const GAME = {
  // -- 体力 --
  MAX_STAMINA: 100,
  FEED_STAMINA_COST: 15,
  CLEAN_STAMINA_COST: 20,
  TALENT_STAMINA_COST: 40,

  // -- 饱食度 / 清洁度 --
  /** 在家时，每小时饱食度衰减 */
  HUNGER_DECAY_PER_HOUR: 2,
  /** 在校时，每小时清洁度衰减 */
  HYGIENE_DECAY_PER_HOUR_SCHOOL: 3,

  // -- 学校 --
  /** 每小时技能点增长 */
  SKILL_GAIN_PER_HOUR: 0.5,
  /** 每小时等级增长 */
  LEVEL_GAIN_PER_HOUR: 0.1,
  /** 在校每小时压力增长 */
  STRESS_GAIN_PER_HOUR_SCHOOL: 1,

  // -- 初始属性 --
  INITIAL_HUNGER: 80,
  INITIAL_HYGIENE: 80,
  INITIAL_STRESS: 0,
  INITIAL_LEVEL: 1,

  // -- 粉丝系数 --
  /** CP粉 = sellRot增量 * A */
  FAN_COEFF_A: 2.0,
  /** 唯粉 = fanService增量 * B */
  FAN_COEFF_B: 2.0,
  /** 唯粉 += 舞台技能增量 * C */
  FAN_COEFF_C: 0.5,

  // -- Event 粉丝奖惩 --
  EVENT_FANS_GREAT_SUCCESS: 50,
  EVENT_FANS_SUCCESS: 20,
  EVENT_FANS_NORMAL: 5,
  EVENT_FANS_FAIL: -10,
  EVENT_FANS_GREAT_FAIL: -30,
  /** 每次参加Event增加的压力 */
  EVENT_STRESS_GAIN: 15,

  // -- 才艺 (生活技能) --
  COOKING_HUNGER_RESTORE: 25,
  COOKING_STRESS_RELIEF: 10,
  COOKING_FAN_GAIN: 5,
  PAINTING_STRESS_RELIEF: 35,
  /** 文化消解腐唯数量 */
  CULTURE_TOXIC_CONVERT: 10,
  /** 外语带来的Event成功率加成 (0.15 = 15%) */
  LANGUAGE_EVENT_BUFF: 0.15,

  // -- 喂食骰子 --
  FEED_DICE_SIDES: 10,
  FEED_DICE_BASE: 5,
  // -- 洗澡骰子 --
  CLEAN_DICE_SIDES: 20,
  CLEAN_DICE_BASE: 5,
};
