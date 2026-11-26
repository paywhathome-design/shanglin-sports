/**
 * 上林神寵運動養成系統 - 核心演算法 (algorithm.js)
 * 100% 嚴格落實 PDF 官方遊戲規則：
 * 1. 四大能力能量分離與浮點原始精度
 * 2. 13 種運動玩法對應與 2:1 主次能量精確分配
 * 3. 時間與主觀喘度查表 (Lv1~Lv5 -> 2/4/6/8/10 能量)
 * 4. 個人挑戰 Bonus 獨立計算 (+0/+1/+2，只加 EXP、不入四能力)
 * 5. 防刷每日 10 點上限（同日合併等比例縮放）與 Bonus 每日 +2 另計
 * 6. 每週 12 EXP 成長保護與六大階段進化門檻
 * 7. 能力結構四分類判定與第三能力 >=15% 浪漫飾品自動配戴
 * 8. 進化方向穩定機制 (領先 >=8% 或連續 2 次領先)
 * 9. 健康促進指標計算 (MVPA, 60min天數, 肌力天數, 多樣性)
 */

const ShanglinAlgorithm = {

  /**
   * 1. 依據時間與喘度查表計算活動等級 (Lv1 ~ Lv5)
   * @param {number} durationMins - 運動分鐘數
   * @param {string} exertion - 'light' (輕鬆) | 'moderate' (有點喘) | 'vigorous' (很喘)
   * @returns {number} activityLevel (1~5)
   */
  getActivityLevel(durationMins, exertion) {
    const mins = Math.max(0, Number(durationMins) || 0);
    const exKey = ['light', 'moderate', 'vigorous'].includes(exertion) ? exertion : 'moderate';

    for (const row of CONFIG.EXERTION_MATRIX) {
      if (mins >= row.minTime && mins <= row.maxTime) {
        return row[exKey] || 1;
      }
    }
    return 1;
  },

  /**
   * 2. 單筆運動紀錄能量計算
   * @param {string} sportId - 運動項目 ID
   * @param {number} durationMins - 時間(分鐘)
   * @param {string} exertion - 喘度 ('light' | 'moderate' | 'vigorous')
   * @returns {Object} 包含基本等級、總能量與四項能力分配
   */
  calculateSingleSportEnergy(sportId, durationMins, exertion) {
    const sport = CONFIG.SPORTS_RULES.find(s => s.id === sportId) || CONFIG.SPORTS_RULES[0];
    const level = this.getActivityLevel(durationMins, exertion);
    const basicEnergy = CONFIG.LEVEL_TO_ENERGY[level] || 2;

    const energyDistribution = {
      endurance: 0,
      strength: 0,
      agility: 0,
      coordination: 0
    };

    // 主次能力約 2:1 精確小數分配 (主占 2/3，次占 1/3；無次要則主占 100%)
    if (sport.secondary && sport.secondary !== sport.primary) {
      const primaryEnergy = (basicEnergy * 2) / 3;
      const secondaryEnergy = basicEnergy / 3;
      energyDistribution[sport.primary] = primaryEnergy;
      energyDistribution[sport.secondary] = secondaryEnergy;
    } else {
      energyDistribution[sport.primary] = basicEnergy;
    }

    return {
      sportId: sport.id,
      sportName: sport.name,
      durationMins: Number(durationMins) || 0,
      exertion,
      isMvpa: exertion === 'moderate' || exertion === 'vigorous',
      isMuscleBone: sport.isMuscleBone || false,
      level,
      basicEnergy,
      energyDistribution
    };
  },

  /**
   * 3. 同日多筆紀錄防刷合併與 10 點上限等比例縮放 (PDF 第三頁)
   * @param {Array} dailyLogs - 當天所有運動紀錄
   * @returns {Object} 合併後且上限鎖定 10.00 點之能力能量
   */
  mergeDailyAbilityEnergy(dailyLogs = []) {
    const merged = {
      endurance: 0,
      strength: 0,
      agility: 0,
      coordination: 0
    };

    if (!dailyLogs || dailyLogs.length === 0) {
      return {
        merged,
        rawTotal: 0,
        scaledTotal: 0,
        isScaled: false,
        scaleFactor: 1
      };
    }

    // 累積原始能量
    for (const log of dailyLogs) {
      if (log.energyDistribution) {
        merged.endurance += log.energyDistribution.endurance || 0;
        merged.strength += log.energyDistribution.strength || 0;
        merged.agility += log.energyDistribution.agility || 0;
        merged.coordination += log.energyDistribution.coordination || 0;
      }
    }

    const rawTotal = merged.endurance + merged.strength + merged.agility + merged.coordination;
    const maxCap = CONFIG.LIMITS.DAILY_ABILITY_ENERGY_CAP; // 10.00

    let scaledTotal = rawTotal;
    let isScaled = false;
    let scaleFactor = 1;

    // 若超出 10 點，依原比例縮放，四能力合計嚴格鎖定 10.00 點
    if (rawTotal > maxCap) {
      isScaled = true;
      scaleFactor = maxCap / rawTotal;
      merged.endurance = merged.endurance * scaleFactor;
      merged.strength = merged.strength * scaleFactor;
      merged.agility = merged.agility * scaleFactor;
      merged.coordination = merged.coordination * scaleFactor;
      scaledTotal = maxCap;
    }

    return {
      merged,
      rawTotal,
      scaledTotal,
      isScaled,
      scaleFactor
    };
  },

  /**
   * 4. 計算每日有效活動成長 EXP (PDF 第三頁)
   * 規則：
   * - 無有效活動 (<10 分鐘)：0
   * - >=10 分鐘有效身體活動：+1
   * - >=30 分鐘中高強度活動 (有點喘/很喘)：+2
   * - >=60 分鐘中高強度活動 (有點喘/很喘)：+3
   * @param {Array} dailyLogs - 當天運動紀錄
   * @returns {number} activityExp
   */
  calculateDailyActivityExp(dailyLogs = []) {
    if (!dailyLogs || dailyLogs.length === 0) return 0;

    let totalMins = 0;
    let mvpaMins = 0;

    for (const log of dailyLogs) {
      const mins = Number(log.durationMins) || 0;
      totalMins += mins;
      if (log.exertion === 'moderate' || log.exertion === 'vigorous') {
        mvpaMins += mins;
      }
    }

    if (mvpaMins >= 60) return 3;
    if (mvpaMins >= 30) return 2;
    if (totalMins >= 10) return 1;
    return 0;
  },

  /**
   * 5. 單日完整結算 (包含防刷、Bonus分離與EXP計算)
   * @param {Array} dailyLogs - 當日運動紀錄
   * @param {number} challengeBonus - 個人挑戰 Bonus (+0, +1, +2)
   * @returns {Object} 結算結果
   */
  settleDaily(dailyLogs = [], challengeBonus = 0) {
    const energyResult = this.mergeDailyAbilityEnergy(dailyLogs);
    const activityExp = this.calculateDailyActivityExp(dailyLogs);

    // 個人挑戰 Bonus 每日上限 +2，且只加入成長 EXP
    const safeBonus = Math.min(CONFIG.LIMITS.DAILY_BONUS_EXP_CAP, Math.max(0, Number(challengeBonus) || 0));
    const dailyFinalExp = activityExp + safeBonus;

    return {
      dailyAbilityEnergy: energyResult.merged,
      rawTotalEnergy: energyResult.rawTotal,
      scaledTotalEnergy: energyResult.scaledTotal,
      isScaled: energyResult.isScaled,
      activityExp,
      bonusExp: safeBonus,
      dailyFinalExp
    };
  },

  /**
   * 6. 每週 12 EXP 成長保護限制套用 (PDF 第三頁)
   * @param {number} currentWeeklyExp - 本週已獲取的 EXP
   * @param {number} expToAdd - 本日欲加入的 EXP
   * @returns {Object} 實際增加 EXP 與本週新累計值
   */
  applyWeeklyExpCap(currentWeeklyExp, expToAdd) {
    const weeklyCap = CONFIG.LIMITS.WEEKLY_EXP_CAP; // 12
    const current = Math.max(0, Number(currentWeeklyExp) || 0);
    const needed = Math.max(0, Number(expToAdd) || 0);

    const available = Math.max(0, weeklyCap - current);
    const actualAdded = Math.min(needed, available);
    const newWeeklyExp = current + actualAdded;
    const isCapped = current + needed > weeklyCap;

    return {
      actualAdded,
      newWeeklyExp,
      isCapped,
      remainingWeeklyQuota: Math.max(0, weeklyCap - newWeeklyExp)
    };
  },

  /**
   * 7. 取得進化階段 (PDF 第三頁)
   * @param {number} totalExp - 總累積成長 EXP
   * @returns {Object} 階段資訊
   */
  getEvolutionStage(totalExp) {
    const exp = Math.max(0, Number(totalExp) || 0);
    const stages = CONFIG.EVOLUTION_STAGES;

    for (let i = stages.length - 1; i >= 0; i--) {
      if (exp >= stages[i].minExp) {
        const nextStage = stages[i + 1] || null;
        const progressInStage = nextStage 
          ? (exp - stages[i].minExp) / (nextStage.minExp - stages[i].minExp)
          : 1;

        return {
          currentStage: stages[i].stage,
          key: stages[i].key,
          name: stages[i].name,
          label: stages[i].label,
          minExp: stages[i].minExp,
          maxExp: stages[i].maxExp,
          nextStageMinExp: nextStage ? nextStage.minExp : null,
          expToNextStage: nextStage ? Math.max(0, nextStage.minExp - exp) : 0,
          stageProgressRatio: Math.min(1, Math.max(0, progressInStage))
        };
      }
    }
    return {
      currentStage: 0,
      key: 'egg',
      name: '蛋期',
      label: '神秘寶貝蛋',
      minExp: 0,
      maxExp: 7,
      nextStageMinExp: 8,
      expToNextStage: 8 - exp,
      stageProgressRatio: exp / 8
    };
  },

  /**
   * 8. 計算能力百分比與結構判定 (PDF 第四頁)
   * 判定順序：
   * 1. 四項均衡：最高能力 - 最低能力 <= 15 個百分點 (0.15)
   * 2. 三能力型：第一名 - 第三名 <= 12 個百分點 (0.12)
   * 3. 單主型：第一名 >= 50% (0.50)，或 第一名 - 第二名 >= 20 個百分點 (0.20)
   * 4. 雙能力型：以上皆不符合時
   * 飾品判定：單主/雙能力型若第三能力 >= 15%，增加專屬浪漫飾品！
   * @param {Object} abilities - { endurance, strength, agility, coordination }
   * @returns {Object} 結構判定結果與飾品
   */
  determineAbilityStructure(abilities = {}) {
    const end = Math.max(0, abilities.endurance || 0);
    const str = Math.max(0, abilities.strength || 0);
    const agi = Math.max(0, abilities.agility || 0);
    const coo = Math.max(0, abilities.coordination || 0);

    const total = end + str + agi + coo;

    // 若尚未獲得任何能量
    if (total <= 0.0001) {
      return {
        percentages: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        sorted: [
          { id: 'endurance', name: '耐力', val: 0, p: 0 },
          { id: 'strength', name: '肌力', val: 0, p: 0 },
          { id: 'agility', name: '敏捷', val: 0, p: 0 },
          { id: 'coordination', name: '協調', val: 0, p: 0 }
        ],
        structureType: 'dormant',
        structureName: '沉睡萌芽型',
        desc: '能量仍在沉睡孕育中，等待運動喚醒✨',
        accessory: null
      };
    }

    // 計算未經四捨五入的原始百分比 p (0 ~ 1)
    const list = [
      { id: 'endurance', name: '耐力', icon: '❤️', val: end, p: end / total },
      { id: 'strength', name: '肌力', icon: '💪', val: str, p: str / total },
      { id: 'agility', name: '敏捷', icon: '⚡', val: agi, p: agi / total },
      { id: 'coordination', name: '協調', icon: '🎯', val: coo, p: coo / total }
    ];

    // 由大到小排序
    list.sort((a, b) => b.p - a.p);

    const pMax = list[0].p;
    const p2nd = list[1].p;
    const p3rd = list[2].p;
    const pMin = list[3].p;

    let structureType = 'dual';
    let structureName = '雙能交織型';
    let desc = '雙項能力互輝互映，呈現平衡協同的美麗姿態！';

    // 1. 四項均衡：最高能力 - 最低能力 <= 15 個百分點 (0.15)
    if (pMax - pMin <= 0.150001) {
      structureType = 'balanced';
      structureName = '四項均衡型';
      desc = '四項運動能量均勻分佈，身心全方位和諧發展！';
    }
    // 2. 三能力型：第一名 - 第三名 <= 12 個百分點 (0.12)
    else if (pMax - p3rd <= 0.120001) {
      structureType = 'tri_resonance';
      structureName = '三能共振型';
      desc = '三大核心能力相互呼應，展現多元活力光彩！';
    }
    // 3. 單主型：第一名 >= 50%，或 第一名 - 第二名 >= 20 個百分點
    else if (pMax >= 0.500000 || (pMax - p2nd >= 0.200000)) {
      structureType = 'specialist';
      structureName = '單主專精型';
      desc = `以「${list[0].name}」為領航核心，特質鮮明耀眼！`;
    }
    // 4. 雙能力型：以上皆不符合
    else {
      structureType = 'dual';
      structureName = '雙能交織型';
      desc = `「${list[0].name}」與「${list[1].name}」雙峰並峙，相輔相成！`;
    }

    // 飾品判定：單主/雙能力型若第三能力 >= 15%，增加專屬浪漫飾品
    let accessory = null;
    if ((structureType === 'specialist' || structureType === 'dual') && p3rd >= 0.150000) {
      const thirdAbilityId = list[2].id;
      accessory = CONFIG.ROMANTIC_ACCESSORIES[thirdAbilityId] || null;
    }

    return {
      percentages: {
        endurance: end / total,
        strength: str / total,
        agility: agi / total,
        coordination: coo / total
      },
      sorted: list,
      primaryAbility: list[0],
      secondaryAbility: list[1],
      thirdAbility: list[2],
      structureType,
      structureName,
      desc,
      accessory
    };
  },

  /**
   * 9. 進化方向穩定機制 (PDF 第四頁)
   * 新主要能力需比舊主要能力領先至少 8 個百分點 (0.08)，或連續兩次進化檢查點保持領先，才改變主方向
   * 物種模板於幼年期確立，成長期正式鎖定
   * @param {string} oldPrimaryId - 原主能力 ID
   * @param {Object} currentPercentages - 當前四項能力原始百分比
   * @param {number} consecutiveLeadCount - 新主能力已連續領先次數
   * @param {number} stage - 當前進化階段 (0~5)
   * @returns {Object} 穩定性判定結果
   */
  evaluateEvolutionStability(oldPrimaryId, currentPercentages, consecutiveLeadCount = 0, stage = 0) {
    if (!oldPrimaryId) {
      // 首次確立
      const entries = Object.entries(currentPercentages).sort((a, b) => b[1] - a[1]);
      return {
        confirmedPrimaryId: entries[0] ? entries[0][0] : 'endurance',
        changed: false,
        leadCount: 1,
        isLocked: stage >= 3 // 成長期 (stage 3) 正式鎖定
      };
    }

    // 若已進入成長期(stage 3)或更高，物種與主方向正式鎖定
    if (stage >= 3) {
      return {
        confirmedPrimaryId: oldPrimaryId,
        changed: false,
        leadCount: consecutiveLeadCount,
        isLocked: true,
        reason: '物種於成長期已正式鎖定'
      };
    }

    const entries = Object.entries(currentPercentages).sort((a, b) => b[1] - a[1]);
    const topCandidate = entries[0][0];
    const topP = entries[0][1];
    const oldP = currentPercentages[oldPrimaryId] || 0;

    if (topCandidate === oldPrimaryId) {
      return {
        confirmedPrimaryId: oldPrimaryId,
        changed: false,
        leadCount: 0,
        isLocked: false
      };
    }

    const leadMargin = topP - oldP;
    const newLeadCount = consecutiveLeadCount + 1;

    // 領先 >= 8 個百分點 (0.08) 或 連續兩次保持領先
    if (leadMargin >= 0.08 || newLeadCount >= 2) {
      return {
        confirmedPrimaryId: topCandidate,
        changed: true,
        leadCount: newLeadCount,
        leadMargin,
        isLocked: false,
        reason: leadMargin >= 0.08 ? '新主能力領先已達 8 個百分點' : '新主能力連續兩次進化檢查點保持領先'
      };
    }

    // 未達門檻，維持舊主能力
    return {
      confirmedPrimaryId: oldPrimaryId,
      changed: false,
      leadCount: newLeadCount,
      leadMargin,
      isLocked: false,
      reason: '新主能力領先未滿 8 個百分點且未達連續兩次，啟動平穩保護機制'
    };
  },

  /**
   * 10. 健康促進指標計算 (PDF 第四頁，與遊戲能量完全分離)
   * @param {Array} allLogs - 學生全部運動歷史紀錄
   * @param {string} currentWeekKey - 當前週次識別標記 (e.g. '2026-W44')
   * @returns {Object} 國小健康促進成果指標
   */
  calculateHealthIndicators(allLogs = [], currentWeekKey = '') {
    let weeklyMvpaMins = 0;
    let totalMvpaMins = 0;
    const dailyMinutesMap = {};
    const muscleBoneDaysSet = new Set();
    const sportsUsedSet = new Set();
    const activeDatesSet = new Set();

    for (const log of allLogs) {
      const date = log.date; // YYYY-MM-DD
      const mins = Number(log.durationMins) || 0;
      const isMvpa = log.exertion === 'moderate' || log.exertion === 'vigorous';

      activeDatesSet.add(date);
      sportsUsedSet.add(log.sportId);

      if (!dailyMinutesMap[date]) {
        dailyMinutesMap[date] = { total: 0, mvpa: 0 };
      }
      dailyMinutesMap[date].total += mins;

      if (isMvpa) {
        dailyMinutesMap[date].mvpa += mins;
        totalMvpaMins += mins;
        if (log.weekKey === currentWeekKey) {
          weeklyMvpaMins += mins;
        }
      }

      if (log.isMuscleBone) {
        muscleBoneDaysSet.add(date);
      }
    }

    // 計算達成 60 分鐘活動目標的天數
    let daysReached60Mins = 0;
    for (const date in dailyMinutesMap) {
      if (dailyMinutesMap[date].total >= CONFIG.LIMITS.DAILY_ACTIVE_MINS_GOAL) {
        daysReached60Mins++;
      }
    }

    return {
      weeklyMvpaMins,
      weeklyGoalMet: weeklyMvpaMins >= CONFIG.LIMITS.WEEKLY_MVPA_GOAL_MINS,
      totalMvpaMins,
      daysReached60Mins,
      muscleBoneDaysCount: muscleBoneDaysSet.size,
      diversityCount: sportsUsedSet.size,
      totalActiveDays: activeDatesSet.size,
      totalSessions: allLogs.length
    };
  },

  /**
   * 11. 生命樹生長階段判斷 (支援個人每週目標與全校累積 4,500 分鐘/階)
   * @param {number} totalMvpaMins - 累計中高強度運動分鐘
   * @param {boolean} isSchool - 是否為全校累積大數據模式 (每階段應達 4,500 分鐘)
   * @returns {Object} 生命樹階段資訊
   */
  getLifeTreeStage(totalMvpaMins = 0, isSchool = false) {
    const mins = Math.max(0, Number(totalMvpaMins) || 0);
    const stages = (isSchool && CONFIG.SCHOOL_TREE_STAGES) ? CONFIG.SCHOOL_TREE_STAGES : CONFIG.TREE_STAGES;

    for (let i = stages.length - 1; i >= 0; i--) {
      if (mins >= stages[i].minMvpa) {
        const next = stages[i + 1] || null;
        const progress = next 
          ? (mins - stages[i].minMvpa) / (next.minMvpa - stages[i].minMvpa)
          : 1;

        return {
          level: stages[i].level,
          name: stages[i].name,
          desc: stages[i].desc,
          icon: stages[i].icon,
          minMvpa: stages[i].minMvpa,
          nextMvpa: next ? next.minMvpa : null,
          progress: Math.min(1, Math.max(0, progress)),
          isSchool
        };
      }
    }
    const defaultNext = isSchool ? 4500 : 60;
    return {
      level: 1,
      name: stages[0].name,
      desc: stages[0].desc,
      icon: stages[0].icon,
      minMvpa: 0,
      nextMvpa: defaultNext,
      progress: Math.min(1, Math.max(0, mins / defaultNext)),
      isSchool
    };
  },

  /**
   * 全校生命樹階段判斷 (每階段應達 4,500 分鐘)
   */
  getSchoolLifeTreeStage(totalSchoolMvpaMins = 0) {
    return this.getLifeTreeStage(totalSchoolMvpaMins, true);
  }
};

// 匯出至全域環境
if (typeof window !== 'undefined') {
  window.ShanglinAlgorithm = ShanglinAlgorithm;
}
