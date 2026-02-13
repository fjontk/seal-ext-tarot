// ============================================================
// utils.ts - 通用工具函数
// ============================================================

import { SkillKey } from './game_config';
import { TEXT } from './game_text';
import type { Pet } from './store';

/** 将模板字符串中的 {key} 占位符替换为对应值 */
export function formatText(
  template: string,
  vars: Record<string, string | number>,
): string {
  let result = template;
  for (const key of Object.keys(vars)) {
    result = result.split(`{${key}}`).join(String(vars[key]));
  }
  return result;
}

/** 从数组中随机选择一个元素 */
export function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 限制数值在 [min, max] 范围内 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** 投掷骰子：返回 1~sides 的随机整数 */
export function rollDice(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/** 获取宠物指定技能的数值 */
export function getSkill(pet: Pet, key: SkillKey): number {
  switch (key) {
    case 'vocal':      return pet.skills.vocal;
    case 'dance':      return pet.skills.dance;
    case 'rap':        return pet.skills.rap;
    case 'sellRot':    return pet.skills.sellRot;
    case 'fanService': return pet.skills.fanService;
    case 'cooking':    return pet.skills.life.cooking;
    case 'culture':    return pet.skills.life.culture;
    case 'painting':   return pet.skills.life.painting;
    case 'language':   return pet.skills.life.language;
  }
}

/** 给宠物添加技能点数 */
export function addSkill(pet: Pet, key: SkillKey, amount: number): void {
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
}

/** 舞台技能评价 */
export function evaluateStage(pet: Pet): string {
  const v = pet.skills.vocal;
  const d = pet.skills.dance;
  const r = pet.skills.rap;
  const avg = (v + d + r) / 3;

  // 新人阶段
  if (avg < 5) return TEXT.EVAL_ROOKIE;

  // 皇族：粉丝多技能低
  const totalFans =
    pet.fans.cpFans + pet.fans.soloFans + Math.max(0, pet.fans.extraFans);
  if (totalFans > 200 && avg < 10) return TEXT.EVAL_SHAME;

  // 方差判定
  const variance =
    ((v - avg) ** 2 + (d - avg) ** 2 + (r - avg) ** 2) / 3;

  // ACE：低方差 + 均值够高
  if (variance < 4 && avg >= 15) return TEXT.EVAL_ACE;

  // 单项突出
  const max = Math.max(v, d, r);
  if (max > avg * 1.5) {
    if (max === v) return TEXT.EVAL_VOCAL;
    if (max === d) return TEXT.EVAL_DANCE;
    return TEXT.EVAL_RAP;
  }

  // 均衡但还不够 ACE
  if (variance < 4) return TEXT.EVAL_ACE;

  return TEXT.EVAL_ROOKIE;
}
