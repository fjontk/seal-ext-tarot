# SealDice 宠物养成插件设计书

## 1. 概述
本插件旨在为 SealDice 添加一个宠物养成系统。用户可以领养虚拟宠物，送去学校学习技能，在群内创建并参加活动（Event），并与其他玩家的宠物互动。

## 2. 数据结构设计

### 2.1 宠物模型 (Pet)
每个 QQ 号（UserID）绑定一只宠物。
**修改注**: 为了确保"一个QQ号在不同群也只能领养一只宠物"的原则，以及方便管理所有宠物数据进行 Rankings 或 Event 匹配，**不再使用 `$mPetData` 变量存储**。
**新方案**: 使用插件统一的 JSON 文件存储，由插件自身维护读写。

```typescript
// 存储文件结构
interface StorageRoot {
  pets: { [userId: string]: Pet }; // Map: UserID -> Pet
  schoolRegistry: string[]; // 在学校的宠物 UserID 列表
  groupEvents: { [groupId: string]: { [eventName: string]: GroupEvent } }; // 群活动数据
  lastSchoolCheck: number; // 上次学校巡逻时间戳
  lastDailyReset: number; // 上次每日重置时间戳
}

// 群活动数据
interface GroupEvent {
  id: string; // 唯一ID
  name: string; // 活动名称
  groupId: string; // 所在群ID
  creatorId: string; // 创建者userId
  creatorName: string; // 创建者显示名
  participants: string[]; // 参与宠物的userId列表
  createdAt: number; // 创建时间
}

interface Pet {
  id: string; // UserID (直接作为ID)
  name: string; // 主人名（用于组成"xxx的物种"格式的宠物名）
  species: string; // 当前物种名（可能会变化）
  originalSpecies: string; // 领养时的物种名（用于组成宠物名，永不改变）
  speciesConversionRate: number; // 歪屁股cp粉转化率（领养时由物种决定）

  // 状态
  hunger: number; // 饱食度 (0-100)
  hygiene: number; // 清洁度 (可以为负数，被学校遣返)
  stress: number; // 压力值 (0-100, 高压力影响Event成功率)
  level: number; // 等级
  location: 'home' | 'school'; // 当前位置
  lastInteractionTime: number; // 上次交互时间戳 (用于计算衰减)

  // 技能点
  skills: {
    vocal: number;
    dance: number;
    rap: number;
    sellRot: number; // 卖腐
    fanService: number; // 媚粉
    life: { // 生活技能
      cooking: number;
      culture: number;
      painting: number;
      language: number;
    }
  };

  // 粉丝数据
  fans: {
    cpFans: number; // CP粉
    soloFans: number; // 唯粉
    toxicFans: number; // 歪屁股cp粉
    extraFans: number; // 额外粉丝数 (Event奖惩累计，初始0)
  };

  // 学校数据
  schoolData?: {
    course: string; // 当前选修课程
    courseKey: SkillKey; // 课程对应技能键
    startTime: number; // 入校时间戳
  };

  // 每日标记
  dailyFlags: {
    stamina: number; // 今日剩余体力 (喂食/洗澡/才艺消耗)
    nextEventBuff: number; // 外语海外营业带来的下次Event加成
  };

  // 待推送消息（下次查看宠物时推送）
  pendingMessages: string[];
}
```

### 2.2 全局数据 (Global Data)
(已合并至 StorageRoot 结构中)

## 3. 指令系统 (Commands)

指令采用全中文格式，无需 `.pet` 前缀，便于中文用户使用。

**冲突检测与修正**:
*   为了防止群聊刷屏，养成类操作（喂食、洗澡、上学、放学、才艺）**严格限制为私聊使用**。
*   活动相关操作（创建活动、报名活动、活动结算、查看活动）**严格限制为群聊使用**。

| 指令 | 格式 | 权限 | 描述 |
| :--- | :--- | :--- | :--- |
| **领养** | `.领养宠物` | 公开 | 随机领养一只宠物。默认名 `<玩家>的<物种>`。已有宠物则提示失败。 |
| **查看** | `.查看宠物` | 公开 | 查看宠物状态。同时推送并清空待处理消息。根据位置（在家/在校）显示不同信息。 |
| **改名** | `.宠物改名 <新名字>` | 公开 | 给宠物改名（修改主人名部分）。 |
| **喂食** | `.喂食` | **私聊** | 消耗体力。增加饱食度。效果由骰子决定。 |
| **洗澡** | `.洗澡` | **私聊** | 消耗体力。增加清洁度。效果由骰子决定。 |
| **上学** | `.送去上学 <课程名>` | **私聊** | 送宠物去学校学习指定课程。 |
| **放学** | `.接宠物` | **私聊** | 接宠物回家，结算在校期间的技能增长和属性变化。 |
| **创建活动** | `.创建活动 <活动名>` | **群聊** | 在当前群创建一个活动，同群成员可报名参加。 |
| **报名** | `.报名活动 <活动名>` | **群聊** | 送宠物参加指定的群活动。宠物可同时参加多个活动。 |
| **活动结算** | `.活动结算 <活动名>` | **群聊** | 结算群活动（仅创建者可操作）。回复总粉丝数和活动成败判定。 |
| **查看活动** | `.查看活动` | **群聊** | 查看当前群进行中的活动列表。 |
| **才艺** | `.才艺 <类型>` | **私聊** | 消耗体力使用生活技能。类型：烹饪、文化、绘画、外语。 |
| **查看学校** | `.查看学校` | **群聊** | 偷偷看看学校里宠物们在干什么（仅限群聊使用）。 |
| **巡逻** | `.学校巡逻` | **管理员** | 立即执行一次学校卫生检查，强制遣返清洁度不合格的宠物。 |
| **帮助** | `.宠物手册` | 公开 | 查看宠物插件的使用说明和玩法介绍。 |
| **清除数据** | `.清除数据` | **管理员** | 清除所有宠物数据（需30秒内发送 `.确认清除数据` 二次确认）。 |

### 3.1 详细交互逻辑

#### 查看宠物 (.查看宠物)
*   首先推送并清空 `pendingMessages`（Event结果、巡逻遣返等通知）。
*   **在家**: 显示饱食度、清洁度、压力值、等级、体力、各项技能（含舞台评价）、粉丝数。
*   **在学校**: 显示正在学习的课程。
    *   90%概率展示与其他在校宠物的双人互动描述，10%概率展示独自活动。
    *   显示当前饱食度和清洁度（动态计算衰减后的值）。

#### 送宠物上学 (.送去上学)
*   可选课程:
    *   **爱豆系**: `卖腐`, `vocal`, `dance`, `rap`, `媚粉`.
    *   **生活系**: `烹饪`, `文化`, `绘画`, `外语`.
*   规则: 饱食度锁定（不消耗），但清洁度随时间下降。
*   **自动遣返机制**: 学校巡检时若清洁度 < 阈值，强制遣返回家。

#### 查看学校 (.查看学校)
*   仅限群聊使用。随机展示1-2只在校宠物的互动场景。
*   无宠物在校时提示学校为空。

## 4. 核心系统逻辑

### 4.1 结算与时间系统
使用 `seal.ext.registerTask` API 注册定时任务。

*   **每日重置 (00:00)**: 重置体力值、外语Buff。固定时间，不暴露给管理员。
*   **学校巡检 (默认 17:00)**:
    *   遍历在校宠物列表。
    *   计算当前清洁度 = 原清洁度 - (当前时间 - 入学时间) * 消耗率。
    *   若 < 阈值: 从学校列表移除，状态设为 `home`，添加待推送通知。
    *   管理员可通过 WebUI 修改时间（配置项 key: `petSchoolCheck`）。
*   **Event 结算（用户触发）**:
    *   活动创建者在群聊中使用 `.活动结算 <活动名>` 触发结算。
    *   **表演模拟**: 对每只参与宠物，结合 `vocal/dance/rap` 技能均值 + 压力惩罚 + 外语Buff 计算成功率，骰点判定结果。
    *   **结果**: 大成功 / 成功 / 平平无奇 / 失败 / 大失败。
    *   **奖惩**: 更新 `extraFans`（加分或减分），增加压力值，清除 `nextEventBuff`。
    *   个人结果写入宠物的 `pendingMessages`，玩家下次 `.查看宠物` 时推送。
    *   结算回复包含：总粉丝数（所有宠物粉丝变化之和）、人均粉丝数、活动成败判定。
    *   活动结算后自动删除，不可重复结算。

### 4.2 粉丝数计算公式 (Fan Calculation)

*   **基础转换**:
    *   `CP粉` = `卖腐技能` * (系数A + 随机浮动)
    *   `唯粉` = `媚粉技能` * (系数B) + (`vocal`+`dance`+`rap`)/3 * (系数C)
*   **歪屁股cp粉转化 (Toxic Fan Conversion)**:
    *   当 `卖腐` 和 `媚粉` 等级都较高时，冲突概率增加。
    *   `歪屁股cp粉` = (`CP粉` + `唯粉`) * (转化率 based on `abs(卖腐 - 媚粉)`)
    *   *注*: 品种转换率在领养时写入 `speciesConversionRate`。
*   **额外粉丝 (Event Bonus)**:
    *   初始为 0。
    *   独立于基础计算，每次参加 Event 后根据结果进行加减。

### 4.3 技能评价体系
在查看属性时通过 `evaluateStage()` 显示评价：
*   **ACE**: `vocal`, `dance`, `rap` 方差极小且均值 > 阈值。
*   **舞担/Vocal担/Rap担**: 对应数值显著高于其他两项。
*   **皇族/强推之耻**: (可选彩蛋) 粉丝多但技能低。

### 4.4 生活技能用途 (Life Skills)
通过指令 `.才艺 <类型>` 触发，消耗体力。

| 技能 | 对应行动 | 游戏内收益 |
| :--- | :--- | :--- |
| **烹饪** (Cooking) | 美食直播/做饭 | **回复饱食度**，**减少压力**，+ 少量唯粉。 |
| **文化** (Culture) | 写小作文/公关 | **净化粉丝结构**：将 `toxicFans` 转化为 `cpFans` 和 `soloFans`。 |
| **绘画** (Painting) | 产出饭绘 | **大幅减少压力**。 |
| **外语** (Language) | 海外营业 | **Event 加成**：设置 `nextEventBuff`，下次 Event 基础成功率提升。 |

## 5. 待补充/建议功能
1.  **打工系统**: 赚取货币（购买食物/洗澡用品）。
2.  **道具系统**: 更好的食物/洗澡用品，附加效果。
3.  **心情值**: 长期不理宠物降低好感度，影响训练效率。
4.  **随机事件**: 上学期间触发随机事件（被老师表扬、同学打架）。

## 6. 技术实现

### 6.1 文件结构
| 文件 | 职责 |
| :--- | :--- |
| `src/index.ts` | 插件主入口：注册配置、初始化存储、注册指令、注册定时任务。 |
| `src/store.ts` | 数据类型定义 & 持久化存储层：Pet/StorageRoot 接口、CRUD、结算、巡逻、重置等核心逻辑。 |
| `src/game_config.ts` | 游戏常量（`GAME`）、物种列表（`SPECIES_LIST`）、课程配置（`findCourse()`）。 |
| `src/game_text.ts` | 所有可客制化的文案模板（`TEXT`），使用 `{placeholder}` 占位符，由 `formatText()` 替换。 |
| `src/utils.ts` | 工具函数：文本格式化、随机数、骰子、技能操作、舞台评价等。 |
| `types/seal.d.ts` | SealDice JS 扩展 API 的类型定义。 |
| `tools/build.js` | 构建脚本（esbuild）。 |

### 6.2 构建与运行
```bash
npm run build        # 生产构建
npm run build-dev    # 开发构建
```

## 7. 代码规范与配置化

### 7.1 游戏常量
独立配置模块 `src/game_config.ts`，包含：
*   `SPECIES_LIST`: 可领养的物种列表及各自的基础转化率修正。
*   `COURSES` (via `findCourse()`): 课程列表及其对应的技能键。
*   `GAME` 常量对象: 粉丝系数、Event 奖惩值、学校消耗率、体力消耗、骰子参数等。

### 7.2 文案配置
`src/game_text.ts` 中定义所有文案：
*   `SCHOOL_ACTIVITIES_SOLO / SCHOOL_ACTIVITIES_PAIR`: 学校行为描述列表。
*   `VISIT_SCHOOL_*`: 查看学校时的描述模板。
*   各指令的回复文本、帮助文本（`HELP_TEXT`）。

原则：核心逻辑代码中不出现魔法数值（Magic Numbers），全部引用 `GAME` 常量。

## 8. 插件配置项 (Plugin Configuration)

### 8.1 定时任务（通过 `registerTask` 的 `key` 暴露给 WebUI）
管理员可在 WebUI 的插件配置中直接修改任务执行时间：

| 配置 key | 默认值 | 描述 |
| :--- | :--- | :--- |
| `petSchoolCheck` | `17:00` | 每日学校卫生巡检时间 |

每日重置任务固定在 `0:00` 执行，不暴露给管理员。
Event 结算不再是定时任务，改为由活动创建者手动触发。

### 8.2 游戏数值设置（通过 `registerIntConfig` 暴露）

| 配置项 | 类型 | 默认值 | 描述 |
| :--- | :--- | :--- | :--- |
| `HygieneLimit` | int | `0` | 学校强制劝退的清洁度阈值 |

---
*设计书结束。*
