/**
 * 上林神寵運動養成系統 - 應用程式主控制器 (app.js)
 * 100% 串接演算法、渲染器、音效與儲存引擎
 */

document.addEventListener('DOMContentLoaded', () => {
  // 全域狀態
  window.currentStudent = storageManager.getCurrentUser();
  let currentHealthScope = 'personal'; // 'personal' | 'school'
  let currentCompendiumFilter = 'all';

  // 初始化各模組
  initHeader();
  initTabs();
  initPetHub();
  initWorkoutLogger();
  initHealthDashboard();
  initCompendium();
  initSimulationLab();
  initModals();

  // 初始渲染
  renderAllViews();

  /**
   * 1. 頂部導航列與使用者狀態
   */
  function initHeader() {
    // 新使用者註冊專屬按鈕
    const regHeaderBtn = document.getElementById('header-register-btn');
    if (regHeaderBtn) {
      regHeaderBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        openDedicatedRegisterModal();
      });
    }

    const userPill = document.getElementById('header-user-pill');
    const userModal = document.getElementById('user-switch-modal');

    if (userPill) {
      userPill.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        openUserModal();
      });
    }

    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = window.soundEngine.toggleSound();
        soundBtn.innerHTML = isEnabled ? '🔔 音效開' : '🔕 靜音';
        soundBtn.title = isEnabled ? '點擊靜音' : '點擊開啟音效';
      });
    }

    // 團體照大圖檢視
    const photoBtn = document.getElementById('header-group-photo-btn');
    const photoModal = document.getElementById('group-photo-modal');
    const photoCloseBtn = document.getElementById('group-photo-modal-close');

    if (photoBtn && photoModal) {
      photoBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        photoModal.classList.add('active');
      });
    }

    // 雲端同步狀態膠囊點擊 (跳轉至實驗室設定)
    const cloudBadge = document.getElementById('header-cloud-badge');
    if (cloudBadge) {
      cloudBadge.addEventListener('click', () => {
        const labBtn = document.querySelector('.tab-nav-btn[data-tab="tab-lab"]');
        if (labBtn) {
          labBtn.click();
          const gasInput = document.getElementById('lab-gas-url-input');
          if (gasInput) {
            gasInput.scrollIntoView({ behavior: 'smooth' });
            gasInput.focus();
          }
        }
      });
    }

    // 當雲端資料庫非同步更新時自動重繪
    storageManager.onSync(() => {
      renderAllViews();
    });
  }

  function updateHeader() {
    const student = window.currentStudent;
    if (!student) return;

    const pillEl = document.getElementById('header-user-pill');
    const nameEl = document.getElementById('header-user-name');
    const classEl = document.getElementById('header-user-class');
    const badgeEl = document.getElementById('header-user-egg-badge');
    const avatarEl = document.getElementById('header-user-avatar');

    const isAdmin = storageManager.isCurrentUserAdmin();
    const roleMeta = (CONFIG.ROLES && CONFIG.ROLES[student.role]) || { name: '學童', badge: '🎒 學童' };

    if (pillEl) {
      if (isAdmin) {
        pillEl.classList.add('is-admin');
        pillEl.classList.remove('is-locked-student');
        pillEl.title = '校長、學輔主任、生教組長管理專區 (點擊開啟全校綜整管理中心)';
      } else {
        pillEl.classList.add('is-locked-student');
        pillEl.classList.remove('is-admin');
        pillEl.title = '學生模式保護中 (已鎖定，點擊輸入師長密碼解鎖)';
      }
    }

    if (nameEl) {
      if (isAdmin) {
        nameEl.textContent = student.name;
      } else {
        nameEl.innerHTML = `🔒 ${student.name}`;
      }
    }

    if (classEl) {
      if (isAdmin) {
        classEl.textContent = `${student.gradeClass} (${roleMeta.name})`;
      } else {
        classEl.textContent = `${student.gradeClass} (🎒 學生鎖定)`;
      }
    }

    const series = CONFIG.EGG_SERIES[student.eggSeries] || CONFIG.EGG_SERIES.flame;
    if (badgeEl) badgeEl.textContent = series.badge;
    if (avatarEl) {
      const icons = { flame: '🔥', wave: '🌊', forest: '🌿', sky: '☁️', shadow: '🔮' };
      avatarEl.textContent = icons[student.eggSeries] || '🥚';
    }

    // 更新雲端試算表連線狀態膠囊
    const cloudBadge = document.getElementById('header-cloud-badge');
    const cloudIcon = document.getElementById('cloud-badge-icon');
    const cloudText = document.getElementById('cloud-badge-text');
    if (cloudBadge && cloudText) {
      if (storageManager.gasUrl && storageManager.cloudConnected) {
        cloudBadge.style.background = 'rgba(82, 183, 136, 0.2)';
        cloudBadge.style.color = '#2D6A4F';
        cloudBadge.style.borderColor = '#52B788';
        if (cloudIcon) cloudIcon.textContent = '☁️';
        cloudText.textContent = '試算表已連線 (全校即時)';
        cloudBadge.title = '已成功連線至 Google 試算表，全校 MVPA 即時同步中！點擊切換至實驗室檢視。';
      } else if (storageManager.gasUrl && storageManager.isSyncing) {
        cloudBadge.style.background = 'rgba(255, 158, 0, 0.18)';
        cloudBadge.style.color = '#B25E00';
        if (cloudIcon) cloudIcon.textContent = '🔄';
        cloudText.textContent = '雲端同步中...';
      } else if (storageManager.gasUrl) {
        cloudBadge.style.background = 'rgba(255, 92, 138, 0.15)';
        cloudBadge.style.color = '#D90429';
        if (cloudIcon) cloudIcon.textContent = '⚠️';
        cloudText.textContent = '連線測試中';
      } else {
        cloudBadge.style.background = 'rgba(140, 122, 121, 0.12)';
        cloudBadge.style.color = '#6C584C';
        if (cloudIcon) cloudIcon.textContent = '💾';
        cloudText.textContent = '本機儲存模式';
        cloudBadge.title = '尚未設定 Google 試算表 API，點擊可至教師實驗室貼上網址啟用全校同步！';
      }
    }
  }

  /**
   * 2. 標籤頁切換
   */
  function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-nav-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (window.soundEngine) window.soundEngine.playPop();

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.tab-content-panel').forEach(panel => {
          panel.classList.remove('active');
        });

        const activePanel = document.getElementById(targetTab);
        if (activePanel) {
          activePanel.classList.add('active');
        }

        // 刷新對應頁面視覺
        if (targetTab === 'tab-pet') renderPetHub();
        if (targetTab === 'tab-workout') updateWorkoutPreview();
        if (targetTab === 'tab-health') renderHealthDashboard();
        if (targetTab === 'tab-compendium') renderCompendium();
      });
    });
  }

  /**
   * 3. Tab 1: 我的神寵 (My Divine Pet)
   */
  function initPetHub() {
    const petContainer = document.getElementById('pet-interactive-container');
    if (petContainer) {
      // 摸摸撒嬌互動
      petContainer.addEventListener('click', (e) => {
        petRenderer.triggerPetLoveEffect(petContainer, e.clientX, e.clientY);
      });
    }

    // 自由選擇神寵角色按鈕
    const changePetBtn = document.getElementById('btn-open-pet-picker');
    if (changePetBtn) {
      changePetBtn.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        openPetCharacterModal();
      });
    }

    // 運動能量餵食盤按鈕事件
    const feedButtons = document.querySelectorAll('.energy-ball-item');
    feedButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const abilityKey = btn.dataset.ability;
        handleFeedPet(abilityKey);
      });
    });
  }

  function renderPetHub() {
    const student = window.currentStudent;
    if (!student) return;

    const petWrapper = document.getElementById('pet-display-wrapper');
    if (petWrapper) {
      petRenderer.renderPetToElement(student, petWrapper);
    }

    const series = CONFIG.EGG_SERIES[student.eggSeries] || CONFIG.EGG_SERIES.flame;
    const stageInfo = ShanglinAlgorithm.getEvolutionStage(student.totalExp);
    const petMeta = series.pets.find(p => p.stage === stageInfo.currentStage && (!p.branch || p.branch === student.ultimateBranch)) || series.pets[0];

    // 顯示名稱與蛋系標籤
    const petNameEl = document.getElementById('pet-display-name');
    const petStageBadge = document.getElementById('pet-stage-badge');
    const petElementTag = document.getElementById('pet-element-tag');
    const petDescEl = document.getElementById('pet-display-desc');

    if (petNameEl) petNameEl.textContent = petMeta.name;
    if (petStageBadge) petStageBadge.textContent = `${stageInfo.name} (第 ${stageInfo.currentStage} 階)`;
    if (petElementTag) petElementTag.textContent = series.badge;
    if (petDescEl) petDescEl.textContent = petMeta.desc;

    // 成長 EXP 條
    const expCurEl = document.getElementById('pet-exp-current');
    const expNextEl = document.getElementById('pet-exp-next');
    const expBarFill = document.getElementById('pet-exp-bar-fill');
    const expWeeklyText = document.getElementById('pet-exp-weekly-status');

    if (expCurEl) expCurEl.textContent = `${student.totalExp} EXP`;
    if (expNextEl) {
      expNextEl.textContent = stageInfo.nextStageMinExp !== null 
        ? `距離下階段還差 ${stageInfo.expToNextStage} EXP` 
        : '已達天地榮耀最終極限！';
    }
    if (expBarFill) {
      expBarFill.style.width = `${Math.round(stageInfo.stageProgressRatio * 100)}%`;
    }

    // 每週 12 EXP 保護狀態
    if (expWeeklyText) {
      const remainingQuota = Math.max(0, CONFIG.LIMITS.WEEKLY_EXP_CAP - (student.currentWeeklyExp || 0));
      expWeeklyText.innerHTML = `🛡️ 本週成長保護：已累積 <strong>${student.currentWeeklyExp || 0} / ${CONFIG.LIMITS.WEEKLY_EXP_CAP} EXP</strong>（本週還能成長 ${remainingQuota} EXP）`;
    }

    // 四大能力能量分離進度條與溫馨提示
    const structure = ShanglinAlgorithm.determineAbilityStructure(student.abilities || {});
    const abilities = student.abilities || { endurance: 0, strength: 0, agility: 0, coordination: 0 };
    const totalEnergy = abilities.endurance + abilities.strength + abilities.agility + abilities.coordination;

    ['endurance', 'strength', 'agility', 'coordination'].forEach(key => {
      const val = abilities[key] || 0;
      const pct = structure.percentages[key] || 0;

      const valEl = document.getElementById(`val-${key}`);
      const barEl = document.getElementById(`bar-${key}`);
      const msgEl = document.getElementById(`msg-${key}`);

      if (valEl) {
        valEl.textContent = `${val.toFixed(2)} 點 (${(pct * 100).toFixed(1)}%)`;
      }
      if (barEl) {
        // 設定進度條寬度 (相對於總能力佔比或基準)
        const barWidth = totalEnergy > 0 ? (pct * 100) : 0;
        barEl.style.width = `${Math.min(100, Math.max(4, barWidth))}%`;
      }
      if (msgEl) {
        if (val <= 0.0001) {
          msgEl.textContent = CONFIG.ABILITIES[key].sleepMsg;
          msgEl.style.display = 'block';
        } else {
          msgEl.textContent = '';
          msgEl.style.display = 'none';
        }
      }
    });

    // 能力結構判定與浪漫飾品
    const structTag = document.getElementById('structure-type-tag');
    const structDesc = document.getElementById('structure-desc-text');
    const accessoryBox = document.getElementById('accessory-display-container');

    if (structTag) structTag.textContent = `✨ ${structure.structureName}`;
    if (structDesc) structDesc.textContent = structure.desc;

    if (accessoryBox) {
      if (structure.accessory) {
        accessoryBox.innerHTML = `
          <div class="accessory-display-tag">
            <span class="accessory-icon">${structure.accessory.icon}</span>
            <div>
              <div class="accessory-name">佩戴飾品：${structure.accessory.name}</div>
              <div class="accessory-desc">${structure.accessory.desc} (第三能力 ≥ 15% 觸發)</div>
            </div>
          </div>
        `;
        accessoryBox.style.display = 'block';
      } else {
        accessoryBox.innerHTML = `
          <div style="font-size: 11px; color: var(--text-subtle); padding: 8px 0;">
            💫 提示：當單主型或雙能交織型的第三能力能量達到 15% 時，神寵將自動佩戴專屬浪漫飾品！
          </div>
        `;
        accessoryBox.style.display = 'block';
      }
    }

    // 餵食盤球球數值
    document.getElementById('feed-ball-endurance').textContent = `${abilities.endurance.toFixed(1)}`;
    document.getElementById('feed-ball-strength').textContent = `${abilities.strength.toFixed(1)}`;
    document.getElementById('feed-ball-agility').textContent = `${abilities.agility.toFixed(1)}`;
    document.getElementById('feed-ball-coordination').textContent = `${abilities.coordination.toFixed(1)}`;
  }

  function handleFeedPet(abilityKey) {
    const student = window.currentStudent;
    if (!student) return;

    const abilityMeta = CONFIG.ABILITIES[abilityKey];
    const energyVal = (student.abilities && student.abilities[abilityKey]) || 0;

    if (energyVal <= 0.001) {
      alert(`神寵正在尋找${abilityMeta.name}能量~ 今天還沒有取得這項能量喔！快去運動探索吧✨`);
      return;
    }

    // 播放咀嚼表情與咀嚼音
    petRenderer.setExpression('chewing', 1600);
    petRenderer.refreshCurrentPet();

    if (window.soundEngine) {
      window.soundEngine.playChew();
    }

    // 產生咀嚼愛心氣泡
    const petContainer = document.getElementById('pet-interactive-container');
    if (petContainer) {
      const bubble = document.createElement('div');
      bubble.className = 'love-text-bubble';
      bubble.textContent = `( ˘ω˘ ) 嚼嚼嚼~ 好好吃的${abilityMeta.name}能量！✨`;
      bubble.style.left = '50%';
      bubble.style.top = '40%';
      petContainer.appendChild(bubble);
      setTimeout(() => bubble.remove(), 1600);
    }
  }

  /**
   * 4. Tab 2: 運動打卡 (Daily Exercise Logger)
   */
  function initWorkoutLogger() {
    const sportSelect = document.getElementById('sport-select');
    const durationInput = document.getElementById('duration-input');
    const exertionBtns = document.querySelectorAll('.exertion-choice-btn');
    const bonusBtns = document.querySelectorAll('.bonus-choice-btn');
    const submitBtn = document.getElementById('submit-workout-btn');

    // 填入 13 種運動選項
    if (sportSelect) {
      sportSelect.innerHTML = '';
      CONFIG.SPORTS_RULES.forEach((sport, index) => {
        const opt = document.createElement('option');
        opt.value = sport.id;
        opt.textContent = `${sport.icon} ${sport.name} (${sport.category})`;
        sportSelect.appendChild(opt);
      });

      sportSelect.addEventListener('change', updateWorkoutPreview);
    }

    if (durationInput) {
      durationInput.addEventListener('input', updateWorkoutPreview);
    }

    exertionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        exertionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.soundEngine) window.soundEngine.playPop();
        updateWorkoutPreview();
      });
    });

    bonusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        bonusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (window.soundEngine) window.soundEngine.playPop();
        updateWorkoutPreview();
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener('click', handleSubmitWorkout);
    }
  }

  function getSelectedWorkoutData() {
    const sportSelect = document.getElementById('sport-select');
    const durationInput = document.getElementById('duration-input');
    const activeExertion = document.querySelector('.exertion-choice-btn.active');
    const activeBonus = document.querySelector('.bonus-choice-btn.active');

    const sportId = sportSelect ? sportSelect.value : CONFIG.SPORTS_RULES[0].id;
    const durationMins = Math.max(1, parseInt(durationInput ? durationInput.value : '30', 10) || 30);
    const exertion = activeExertion ? activeExertion.dataset.exertion : 'moderate';
    const bonusExp = activeBonus ? parseInt(activeBonus.dataset.bonus, 10) : 0;

    return { sportId, durationMins, exertion, bonusExp };
  }

  function updateWorkoutPreview() {
    const { sportId, durationMins, exertion, bonusExp } = getSelectedWorkoutData();
    const student = window.currentStudent;
    if (!student) return;

    const singleResult = ShanglinAlgorithm.calculateSingleSportEnergy(sportId, durationMins, exertion);
    const sport = CONFIG.SPORTS_RULES.find(s => s.id === sportId) || CONFIG.SPORTS_RULES[0];

    // 更新即時試算面板
    const prevSportName = document.getElementById('preview-sport-name');
    const prevLevel = document.getElementById('preview-sport-level');
    const prevEnergy = document.getElementById('preview-sport-energy');
    const prevPrimary = document.getElementById('preview-primary-alloc');
    const prevSecondary = document.getElementById('preview-secondary-alloc');
    const prevExp = document.getElementById('preview-exp-gain');
    const prevDailyCapHint = document.getElementById('preview-daily-cap-hint');

    if (prevSportName) prevSportName.textContent = sport.name;
    if (prevLevel) prevLevel.textContent = `Lv${singleResult.level} (${exertion === 'light' ? '輕度' : exertion === 'moderate' ? '中度' : '高強度'})`;
    if (prevEnergy) prevEnergy.textContent = `${singleResult.basicEnergy} 點`;

    const primName = CONFIG.ABILITIES[sport.primary].name;
    const primVal = singleResult.energyDistribution[sport.primary].toFixed(2);
    if (prevPrimary) prevPrimary.textContent = `${CONFIG.ABILITIES[sport.primary].icon} ${primName}: +${primVal}`;

    if (sport.secondary) {
      const secName = CONFIG.ABILITIES[sport.secondary].name;
      const secVal = singleResult.energyDistribution[sport.secondary].toFixed(2);
      if (prevSecondary) prevSecondary.textContent = `${CONFIG.ABILITIES[sport.secondary].icon} ${secName}: +${secVal} (主次 2:1)`;
    } else {
      if (prevSecondary) prevSecondary.textContent = '無次要能力 (主占 100%)';
    }

    // 計算加入此筆後當日的合併狀況與 10 點上限預覽
    const todayLogs = storageManager.getUserLogsForDate(student, student.simulatedDate);
    const mockLogs = [...todayLogs, singleResult];
    const settlement = ShanglinAlgorithm.settleDaily(mockLogs, bonusExp);

    if (prevExp) {
      prevExp.textContent = `+${settlement.dailyFinalExp} EXP (活動 +${settlement.activityExp} / 挑戰 +${settlement.bonusExp})`;
    }

    if (prevDailyCapHint) {
      const maxDailyLogs = (CONFIG.LIMITS && CONFIG.LIMITS.STUDENT_DAILY_MAX_LOGS) || 3;
      const isStudent = student.role === 'student' || !storageManager.isUserAdmin(student);
      if (isStudent && todayLogs.length >= maxDailyLogs) {
        prevDailyCapHint.innerHTML = `⚠️ 今日打卡次數已達上限 (<strong>${todayLogs.length} / ${maxDailyLogs} 次</strong>)，今日無法再打卡囉！明天再來喔！🔒`;
        prevDailyCapHint.style.color = '#E63946';
      } else if (settlement.isScaled) {
        prevDailyCapHint.innerHTML = `⚠️ 今日能量累計達 <strong>${settlement.rawTotalEnergy.toFixed(2)} 點</strong>，啟動防刷比例縮放，四能力鎖定上限 <strong>10.00 點</strong>！`;
        prevDailyCapHint.style.color = '#F77F00';
      } else {
        prevDailyCapHint.innerHTML = `✨ 今日能量累計 <strong>${settlement.rawTotalEnergy.toFixed(2)} / 10.00 點</strong>，維持全額吸收。`;
        prevDailyCapHint.style.color = 'var(--mint-green)';
      }
    }
  }

  function handleSubmitWorkout() {
    const student = window.currentStudent;
    if (!student) return;

    // 檢查每日打卡次數上限 (學生每日最多 3 次)
    const currentDate = student.simulatedDate;
    const todayLogs = storageManager.getUserLogsForDate(student, currentDate);
    const maxDailyLogs = (CONFIG.LIMITS && CONFIG.LIMITS.STUDENT_DAILY_MAX_LOGS) || 3;
    const isStudent = student.role === 'student' || !storageManager.isUserAdmin(student);

    if (isStudent && todayLogs.length >= maxDailyLogs) {
      if (window.soundEngine) window.soundEngine.playPop();
      alert('今日打卡次數已達上限，明天再來喔！');
      return;
    }

    const { sportId, durationMins, exertion, bonusExp } = getSelectedWorkoutData();

    // 計算此單筆
    const single = ShanglinAlgorithm.calculateSingleSportEnergy(sportId, durationMins, exertion);
    const currentWeekKey = student.currentWeekKey;

    // 建立新 log 物件
    const newLog = {
      id: 'log_' + Date.now(),
      date: currentDate,
      weekKey: currentWeekKey,
      sportId: single.sportId,
      sportName: single.sportName,
      durationMins: single.durationMins,
      exertion: single.exertion,
      level: single.level,
      basicEnergy: single.basicEnergy,
      energyDistribution: single.energyDistribution,
      isMvpa: single.isMvpa,
      isMuscleBone: single.isMuscleBone,
      bonusExp: bonusExp,
      dailyFinalExp: 0 // 待結算
    };

    // 舊階段紀錄以備判定是否觸發全螢幕奇蹟進化盛典
    const oldStageInfo = ShanglinAlgorithm.getEvolutionStage(student.totalExp);

    // 執行結算
    storageManager.updateCurrentUser(u => {
      if (!u.logs) u.logs = [];
      u.logs.unshift(newLog);

      // 當日所有紀錄重算合併
      const todayLogs = u.logs.filter(l => l.date === currentDate);
      const settlement = ShanglinAlgorithm.settleDaily(todayLogs, bonusExp);
      newLog.dailyFinalExp = settlement.dailyFinalExp;

      // 四項能力能量更新 (防刷 10 點上限已由演算法等比例縮放)
      // 將今日縮放後的能力累加至長期能量總庫
      u.abilities.endurance += settlement.dailyAbilityEnergy.endurance;
      u.abilities.strength += settlement.dailyAbilityEnergy.strength;
      u.abilities.agility += settlement.dailyAbilityEnergy.agility;
      u.abilities.coordination += settlement.dailyAbilityEnergy.coordination;

      // 每週 12 EXP 成長保護套用
      const expResult = ShanglinAlgorithm.applyWeeklyExpCap(u.currentWeeklyExp, settlement.dailyFinalExp);
      u.currentWeeklyExp = expResult.newWeeklyExp;
      u.totalExp += expResult.actualAdded;

      // 進化方向穩定性判定
      const struct = ShanglinAlgorithm.determineAbilityStructure(u.abilities);
      const stability = ShanglinAlgorithm.evaluateEvolutionStability(
        u.primaryAbility,
        struct.percentages,
        u.consecutiveLeadCount,
        oldStageInfo.currentStage
      );
      u.primaryAbility = stability.confirmedPrimaryId;
      u.consecutiveLeadCount = stability.leadCount;
    });

    window.currentStudent = storageManager.getCurrentUser();
    const newStageInfo = ShanglinAlgorithm.getEvolutionStage(window.currentStudent.totalExp);

    // 檢查是否突破階段進化門檻！
    if (newStageInfo.currentStage > oldStageInfo.currentStage) {
      triggerEvolutionCelebration(oldStageInfo, newStageInfo);
    } else {
      if (window.soundEngine) window.soundEngine.playSparkle();
      alert(`打卡成功！獲得運動能量，神寵活力倍增！🌱\n今日最終 EXP：+${newLog.dailyFinalExp}`);
    }

    renderAllViews();

    // 背景非同步寫入 Google 試算表雲端資料庫
    if (storageManager.syncWorkoutLogToGas) {
      storageManager.syncWorkoutLogToGas(newLog, window.currentStudent);
    }
  }

  function renderWorkoutLogsTable() {
    const student = window.currentStudent;
    const tableBody = document.getElementById('today-logs-tbody');
    if (!student) return;

    const todayLogs = storageManager.getUserLogsForDate(student, student.simulatedDate);
    const maxDailyLogs = (CONFIG.LIMITS && CONFIG.LIMITS.STUDENT_DAILY_MAX_LOGS) || 3;
    const isStudent = student.role === 'student' || !storageManager.isUserAdmin(student);

    // 更新每日打卡配額徽章與按鈕提示
    const quotaBadge = document.getElementById('daily-quota-badge');
    const submitBtn = document.getElementById('submit-workout-btn');

    if (quotaBadge) {
      if (isStudent) {
        if (todayLogs.length >= maxDailyLogs) {
          quotaBadge.textContent = `今日打卡：${todayLogs.length} / ${maxDailyLogs} 次 (已達上限 🔒)`;
          quotaBadge.style.background = 'rgba(230, 57, 70, 0.12)';
          quotaBadge.style.color = '#E63946';
        } else {
          quotaBadge.textContent = `今日打卡：${todayLogs.length} / ${maxDailyLogs} 次 (剩餘 ${maxDailyLogs - todayLogs.length} 次)`;
          quotaBadge.style.background = 'rgba(82, 183, 136, 0.15)';
          quotaBadge.style.color = '#2D6A4F';
        }
      } else {
        quotaBadge.textContent = `今日打卡：${todayLogs.length} 筆 (師長管理模式)`;
        quotaBadge.style.background = 'rgba(157, 78, 221, 0.12)';
        quotaBadge.style.color = '#7B2CBF';
      }
    }

    if (submitBtn) {
      if (isStudent && todayLogs.length >= maxDailyLogs) {
        submitBtn.innerHTML = `<span>🔒</span> 今日打卡已達上限 (${todayLogs.length}/${maxDailyLogs})`;
        submitBtn.style.opacity = '0.9';
      } else {
        submitBtn.innerHTML = `<span>✨</span> 注入運動能量！完成今日打卡`;
        submitBtn.style.opacity = '1';
      }
    }

    if (!tableBody) return;

    if (todayLogs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-subtle); padding: 18px;">今天還沒有運動打卡紀錄喔，來運動喚醒神寵吧！✨</td></tr>`;
      return;
    }

    tableBody.innerHTML = todayLogs.map(log => {
      const sport = CONFIG.SPORTS_RULES.find(s => s.id === log.sportId) || { name: log.sportName, icon: '🏃' };
      const exLabel = log.exertion === 'light' ? '輕鬆' : log.exertion === 'moderate' ? '有點喘' : '很喘';
      const pName = CONFIG.ABILITIES[sport.primary].name;
      const sName = sport.secondary ? ` / ${CONFIG.ABILITIES[sport.secondary].name}` : '';

      return `
        <tr>
          <td><strong>${sport.icon} ${log.sportName}</strong></td>
          <td>${log.durationMins} 分鐘</td>
          <td>${exLabel} (Lv${log.level})</td>
          <td>${pName}${sName}</td>
          <td><strong>${log.basicEnergy} 點</strong></td>
          <td><span style="color: var(--sakura-pink); font-weight: 800;">+${log.dailyFinalExp || 1} EXP</span></td>
        </tr>
      `;
    }).join('');
  }

  /**
   * 5. Tab 3: 健康促進指標看板 & 生命樹
   */
  function initHealthDashboard() {
    const togglePersonal = document.getElementById('btn-health-personal');
    const toggleSchool = document.getElementById('btn-health-school');

    if (togglePersonal) {
      togglePersonal.addEventListener('click', () => {
        currentHealthScope = 'personal';
        togglePersonal.classList.add('active');
        toggleSchool.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playPop();
        renderHealthDashboard();
      });
    }

    if (toggleSchool) {
      toggleSchool.addEventListener('click', () => {
        currentHealthScope = 'school';
        toggleSchool.classList.add('active');
        togglePersonal.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playPop();
        renderHealthDashboard();
      });
    }
  }

  function renderHealthDashboard() {
    const student = window.currentStudent;
    if (!student) return;

    const treeContainer = document.getElementById('life-tree-svg-container');
    const treeStageName = document.getElementById('tree-stage-name');
    const treeStageDesc = document.getElementById('tree-stage-desc');
    const treeMvpaText = document.getElementById('tree-mvpa-indicator');

    if (currentHealthScope === 'personal') {
      // 個人指標
      const indicators = ShanglinAlgorithm.calculateHealthIndicators(student.logs || [], student.currentWeekKey);
      const treeStage = ShanglinAlgorithm.getLifeTreeStage(indicators.totalMvpaMins);

      // KPI 卡片填值
      document.getElementById('kpi-mvpa-mins').textContent = indicators.weeklyMvpaMins;
      document.getElementById('kpi-mvpa-goal-hint').textContent = indicators.weeklyGoalMet ? '🎉 已達每週 150 分鐘標準！' : `還差 ${150 - indicators.weeklyMvpaMins} 分鐘達標`;
      document.getElementById('kpi-days-60min').textContent = indicators.daysReached60Mins;
      document.getElementById('kpi-muscle-days').textContent = indicators.muscleBoneDaysCount;
      document.getElementById('kpi-diversity-count').textContent = indicators.diversityCount;

      // 渲染生命樹
      if (treeContainer) {
        treeRenderer.renderTreeToElement(indicators.totalMvpaMins, treeContainer);
      }
      if (treeStageName) treeStageName.textContent = `第 ${treeStage.level} 階：${treeStage.name} ${treeStage.icon}`;
      if (treeStageDesc) treeStageDesc.textContent = treeStage.desc;
      if (treeMvpaText) treeMvpaText.textContent = `個人累計 MVPA：${indicators.totalMvpaMins} 分鐘`;
      updateTreeMilestones(treeStage.level, false);

    } else {
      // 全校/班級匯總大數據
      const aggregate = storageManager.getSchoolAggregateMetrics();
      const treeStage = aggregate.schoolTreeStage;

      document.getElementById('kpi-mvpa-mins').textContent = aggregate.totalSchoolMvpaMins;
      document.getElementById('kpi-mvpa-goal-hint').textContent = `全校週達標率：${aggregate.weeklyGoalRate}% (${aggregate.studentsMetWeeklyGoal}/${aggregate.studentCount} 人)`;
      document.getElementById('kpi-days-60min').textContent = aggregate.totalDaysActive;
      document.getElementById('kpi-muscle-days').textContent = aggregate.totalExerciseSessions;
      document.getElementById('kpi-diversity-count').textContent = '13 種全部';

      // 渲染全校生命樹 (每階段應達 4,500 分鐘)
      if (treeContainer) {
        treeRenderer.renderTreeToElement(aggregate.totalSchoolMvpaMins, treeContainer, true);
      }
      if (treeStageName) treeStageName.textContent = `全校守護生命樹 - 第 ${treeStage.level} 階：${treeStage.name} ${treeStage.icon}`;
      const nextRemaining = treeStage.nextMvpa ? Math.max(0, treeStage.nextMvpa - aggregate.totalSchoolMvpaMins) : 0;
      const progressHint = treeStage.nextMvpa 
        ? `（距離第 ${treeStage.level + 1} 階還差 ${nextRemaining} 分鐘 · 每階標準 4,500 分鐘）` 
        : `（🎉 全校師生已突破 18,000 分鐘，登頂最高榮耀樹屋遊樂園！）`;
      if (treeStageDesc) treeStageDesc.textContent = `${treeStage.desc} ${progressHint}`;
      const goalStr = treeStage.nextMvpa ? ` / 下一階目標：${treeStage.nextMvpa} 分鐘` : ' (最高階段達成)';
      if (treeMvpaText) treeMvpaText.textContent = `全校總累計 MVPA：${aggregate.totalSchoolMvpaMins} 分鐘${goalStr} · 每階 4,500 分鐘`;
      updateTreeMilestones(treeStage.level, true);
    }
  }

  /**
   * 生命樹 5 階里程碑徽章狀態更新
   */
  function updateTreeMilestones(stageLevel, isSchool = false) {
    const targets = isSchool 
      ? ['0 分鐘', '4,500 分鐘', '9,000 分鐘', '13,500 分鐘', '18,000 分鐘']
      : ['0 分鐘', '60 分鐘', '150 分鐘', '300 分鐘', '600 分鐘'];
    
    for (let i = 1; i <= 5; i++) {
      const chip = document.querySelector(`.tree-milestone-chip[data-milestone="${i}"]`);
      const targetElem = document.getElementById(`milestone-target-${i}`);
      if (targetElem) {
        targetElem.textContent = targets[i - 1];
      }
      if (chip) {
        chip.classList.remove('active', 'completed');
        if (i < stageLevel) {
          chip.classList.add('completed');
        } else if (i === stageLevel) {
          chip.classList.add('active');
        }
      }
    }
  }

  /**
   * 6. Tab 4: 神寵圖鑑 (Pet Illustrated Compendium)
   */
  function initCompendium() {
    const filterBtns = document.querySelectorAll('.filter-egg-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCompendiumFilter = btn.dataset.filter;
        if (window.soundEngine) window.soundEngine.playPop();
        renderCompendium();
      });
    });

    // 批次上傳與拖曳神寵圖檔事件 (僅管理員/師長使用)
    const uploadBtn = document.getElementById('btn-trigger-upload-files');
    const fileInput = document.getElementById('batch-pet-image-input');

    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => handleBatchPetImageFiles(e.target.files));
    }

    // 支援直接將圖檔拖曳進整個瀏覽器視窗 (僅管理員/師長有效，學生端忽略)
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      const student = window.currentStudent;
      const isStudent = student && (student.role === 'student' || !storageManager.isUserAdmin(student));
      if (isStudent) return; // 學生端不開放圖片拖曳上傳
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleBatchPetImageFiles(e.dataTransfer.files);
      }
    });
  }

  function handleBatchPetImageFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    const statusEl = document.getElementById('batch-upload-status');
    let matchedCount = 0;
    const totalFiles = fileList.length;

    // 建立所有寵物名稱與代號的比對清單
    const petMap = {};
    Object.keys(CONFIG.EGG_SERIES).forEach(sKey => {
      const s = CONFIG.EGG_SERIES[sKey];
      s.pets.forEach(p => {
        petMap[p.name] = p.name;
        // 代號別名 (如 flame_0, flame_1, flame_5_A)
        const alias = `${sKey}_${p.stage}${p.branch ? '_' + p.branch : ''}`;
        petMap[alias] = p.name;
      });
    });

    // 支援舊稱相容別名 (炎甲龍 -> 岩甲龍, 烈焰獅獸 -> 烈焰獸, 珊瑚守護獸 -> 珊瑚獸, 洄流海馬 -> 洄流海龍, 滙流海龍 -> 匯流守護龍, 風翼風雀 -> 風翼雲雀, 影刃豹 -> 影刃獸)
    petMap['炎甲龍'] = '岩甲龍';
    petMap['烈焰獅獸'] = '烈焰獸';
    petMap['珊瑚守護獸'] = '珊瑚獸';
    petMap['洄流海馬'] = '洄流海龍';
    petMap['滙流海龍'] = '匯流守護龍';
    petMap['匯流海龍'] = '匯流守護龍';
    petMap['滙流守護龍'] = '匯流守護龍';
    petMap['風翼風雀'] = '風翼雲雀';
    petMap['影刃豹'] = '影刃獸';

    Array.from(fileList).forEach(file => {
      // 取得檔名 (去除副檔名)
      const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const matchedPetName = petMap[fileNameWithoutExt] || petMap[decodeURIComponent(fileNameWithoutExt)];

      if (matchedPetName) {
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const dataUrl = loadEvent.target.result;
          storageManager.saveCustomPetImage(matchedPetName, dataUrl);
          matchedCount++;
          if (statusEl) {
            statusEl.textContent = `🎉 正在匯入：${matchedPetName} (${matchedCount} / ${totalFiles} 張已完成)`;
            statusEl.style.display = 'block';
          }
          renderAllViews();
        };
        reader.readAsDataURL(file);
      }
    });

    setTimeout(() => {
      if (statusEl) {
        statusEl.textContent = `🌟 匯入完成！成功匹配並載入 ${matchedCount} 張神寵圖檔，立繪已即時更新！`;
        statusEl.style.display = 'block';
      }
      renderAllViews();
    }, 600);
  }

  function renderCompendium() {
    const grid = document.getElementById('compendium-pets-grid');
    if (!grid) return;

    const student = window.currentStudent;
    const isStudent = student && (student.role === 'student' || !storageManager.isUserAdmin(student));

    // 學生端畫面隱藏「匯入35隻神寵圖片」功能，師長/管理員端才顯示
    const batchCard = document.getElementById('batch-upload-card');
    if (batchCard) {
      batchCard.style.display = isStudent ? 'none' : 'block';
    }

    const currentSeriesId = student ? student.eggSeries : 'flame';
    const currentStage = student ? ShanglinAlgorithm.getEvolutionStage(student.totalExp).currentStage : 0;

    let seriesKeys = Object.keys(CONFIG.EGG_SERIES);
    if (currentCompendiumFilter !== 'all') {
      seriesKeys = seriesKeys.filter(k => k === currentCompendiumFilter);
    }

    let cardsHtml = '';

    seriesKeys.forEach(sKey => {
      const series = CONFIG.EGG_SERIES[sKey];
      series.pets.forEach(pet => {
        const isCurrentLine = sKey === currentSeriesId;
        const stageMeta = CONFIG.EVOLUTION_STAGES[pet.stage] || { minExp: 0, name: '蛋期' };
        const minExp = stageMeta.minExp;

        // 第一階「蛋」(stage === 0) 永遠保留公開；其餘各階 (stage 1~6) 需達到該階段 EXP 才解鎖，創造新鮮感
        const isEgg = pet.stage === 0;
        const isUnlocked = isEgg || (isCurrentLine && currentStage >= pet.stage);

        const branch = pet.branch || 'A';
        const svgThumb = petRenderer.generatePetHtml(sKey, pet.stage, branch, 'normal', null);

        if (isUnlocked) {
          // 已解鎖取得的神寵角色
          cardsHtml += `
            <div class="pet-book-card unlocked" data-unlocked="1">
              <div style="font-size: 11px; font-weight: 800; color: ${series.color};">${series.badge}</div>
              <div class="compendium-unlocked-tag">✨ ${isEgg ? '第一階守護蛋' : '已解鎖取得'}</div>
              <div class="pet-book-thumb">
                ${svgThumb}
              </div>
              <div class="pet-book-name">${pet.name}</div>
              <div class="pet-book-stage">第 ${pet.stage} 階 · ${stageMeta.name} ${pet.bias ? `(${pet.bias})` : ''}</div>
              <div class="pet-book-desc">${pet.desc}</div>
            </div>
          `;
        } else {
          // 尚未達成經驗值：神秘隱藏剪影封印中
          cardsHtml += `
            <div class="pet-book-card locked mystery-locked" data-unlocked="0" data-minexp="${minExp}" data-stagename="${stageMeta.name}" data-stage="${pet.stage}" style="cursor: pointer;" title="點擊查看解鎖提示">
              <div style="font-size: 11px; font-weight: 800; color: ${series.color}; opacity: 0.7;">${series.badge}</div>
              <div class="compendium-locked-tag">🔒 未知神秘神寵</div>
              <div class="pet-book-thumb pet-silhouette-wrapper">
                <div class="mystery-lock-badge">🔒</div>
                <div class="pet-silhouette-img">
                  ${svgThumb}
                </div>
              </div>
              <div class="pet-book-name locked-name">？？？（神秘神寵）</div>
              <div class="pet-book-stage locked-stage">第 ${pet.stage} 階 · 需累積 ${minExp} EXP 解鎖</div>
              <div class="pet-book-desc locked-desc">神秘神寵正在沉睡封印中～持續運動累積能量與成長 EXP，達成第 ${pet.stage} 階門檻時即可破繭解鎖真面目！🌟</div>
            </div>
          `;
        }
      });
    });

    grid.innerHTML = cardsHtml;

    // 綁定神秘未解鎖卡片點擊提示
    grid.querySelectorAll('.pet-book-card.mystery-locked').forEach(card => {
      card.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playPop();
        const minExp = card.dataset.minexp;
        const stage = card.dataset.stage;
        const stageName = card.dataset.stagename;
        const curExp = window.currentStudent ? window.currentStudent.totalExp : 0;
        const diff = Math.max(0, minExp - curExp);
        alert(`🔒【神秘神寵封印中】\n\n此角色為第 ${stage} 階（${stageName}）神寵！\n解鎖門檻：${minExp} EXP（您目前：${curExp} EXP，還差 ${diff} EXP）\n\n💡 只要每天持續進行運動打卡，神寵便會破繭孵化，為您揭曉神秘驚喜真面目喔！✨`);
      });
    });
  }

  /**
   * 7. Tab 5: 教師模擬實驗室 (Teacher Simulation Lab)
   */
  function initSimulationLab() {
    // 快轉 1 天
    document.getElementById('lab-btn-skip-day')?.addEventListener('click', () => {
      storageManager.updateCurrentUser(u => {
        const d = new Date(u.simulatedDate);
        d.setDate(d.getDate() + 1);
        u.simulatedDate = storageManager.getFormattedDate(d);
        u.currentWeekKey = storageManager.getWeekKey(d);
      });
      appendLabLog(`📅 時間快轉 1 天！當前模擬日期推進至：${window.currentStudent.simulatedDate}`);
      renderAllViews();
    });

    // 快轉 1 週 (重置每週 12 EXP，驗證上限保護機制)
    document.getElementById('lab-btn-skip-week')?.addEventListener('click', () => {
      storageManager.updateCurrentUser(u => {
        const d = new Date(u.simulatedDate);
        d.setDate(d.getDate() + 7);
        u.simulatedDate = storageManager.getFormattedDate(d);
        u.currentWeekKey = storageManager.getWeekKey(d);
        u.currentWeeklyExp = 0; // 新週重置
      });
      appendLabLog(`🗓️ 時間快轉 1 週！跨入新週期 ${window.currentStudent.currentWeekKey}，每週 12 EXP 上限已重置保護計數器。`);
      renderAllViews();
    });

    // 突破門檻直接進化
    const stageExpMap = {
      1: 8,   // 階1 孵化期
      2: 25,  // 階2 幼年期
      3: 60,  // 階3 成長期
      4: 105, // 階4 進階期
      5: 160, // 階5 深化期
      6: 225  // 階6 最終期
    };

    [1, 2, 3, 4, 5, 6].forEach(st => {
      document.getElementById(`lab-btn-stage-${st}`)?.addEventListener('click', () => {
        const oldStageInfo = ShanglinAlgorithm.getEvolutionStage(window.currentStudent.totalExp);
        storageManager.updateCurrentUser(u => {
          u.totalExp = stageExpMap[st];
        });
        window.currentStudent = storageManager.getCurrentUser();
        const newStageInfo = ShanglinAlgorithm.getEvolutionStage(window.currentStudent.totalExp);
        appendLabLog(`🌟 教師實驗室：直接設定 EXP 為 ${stageExpMap[st]}，觸發突破至第 ${st} 階 (${newStageInfo.name})！`);
        triggerEvolutionCelebration(oldStageInfo, newStageInfo);
        renderAllViews();
      });
    });

    // 壓力測試：驗證防刷每日 10 點上限等比例縮放
    document.getElementById('lab-btn-test-antifarm')?.addEventListener('click', () => {
      const testLogs = [
        ShanglinAlgorithm.calculateSingleSportEnergy('ball_running', 45, 'vigorous'), // 8 點
        ShanglinAlgorithm.calculateSingleSportEnergy('run_sprint', 30, 'vigorous')    // 8 點 (合計 16 點)
      ];
      const settlement = ShanglinAlgorithm.settleDaily(testLogs, 2);

      appendLabLog(`🧪 [防刷測試] 注入兩筆共 16 點能量：`);
      appendLabLog(`  - 原始能量合計：${settlement.rawTotalEnergy.toFixed(2)} 點`);
      appendLabLog(`  - 比例縮放因子：${(10 / settlement.rawTotalEnergy).toFixed(4)}`);
      appendLabLog(`  - 結算後四能力總和：${settlement.scaledTotalEnergy.toFixed(2)} 點 (嚴格等於 10.00)`);
      appendLabLog(`  - 個人挑戰 Bonus：+${settlement.bonusExp} (另計，不佔 10 點上限，只加 EXP)`);
      alert(`防刷演算法驗證通過！\n原始合計 16.00 點 ➔ 比例縮放後精確鎖定 10.00 點！\nBonus +2 獨立加至 EXP。詳細見實驗室主控台。`);
    });

    // 飾品測試：驗證第 3 能力 >= 15% 自動佩戴
    document.getElementById('lab-btn-test-accessory')?.addEventListener('click', () => {
      storageManager.updateCurrentUser(u => {
        u.abilities = {
          endurance: 50,    // 50%
          agility: 30,      // 30%
          strength: 16,     // 16% (第 3 名 >= 15%)
          coordination: 4   // 4%
        };
      });
      const struct = ShanglinAlgorithm.determineAbilityStructure(window.currentStudent.abilities);
      appendLabLog(`🎀 [飾品測試] 設定能力比例：耐50% 敏30% 肌16% 協4%`);
      appendLabLog(`  - 結構判定：${struct.structureName}`);
      appendLabLog(`  - 第三能力(肌力)比例：16.0% (≥ 15%)`);
      appendLabLog(`  - 自動佩戴飾品：${struct.accessory ? struct.accessory.name : '無'}`);
      renderAllViews();
      alert(`浪漫飾品判定成功！已自動配戴【${struct.accessory.name}】！✨`);
    });

    // 全校生命樹測試：驗證每階段應達 4,500 分鐘進階
    document.getElementById('lab-btn-test-school-tree')?.addEventListener('click', () => {
      appendLabLog('🌳 [全校生命樹測試] 驗證 5 大階段每階 4,500 分鐘門檻演算法：');
      const testCases = [
        { mins: 0, expLevel: 1 },
        { mins: 2400, expLevel: 1 },
        { mins: 4500, expLevel: 2 },
        { mins: 8999, expLevel: 2 },
        { mins: 9000, expLevel: 3 },
        { mins: 13499, expLevel: 3 },
        { mins: 13500, expLevel: 4 },
        { mins: 17999, expLevel: 4 },
        { mins: 18000, expLevel: 5 },
        { mins: 25000, expLevel: 5 }
      ];
      let allPassed = true;
      testCases.forEach(tc => {
        const stage = ShanglinAlgorithm.getSchoolLifeTreeStage(tc.mins);
        const pass = stage.level === tc.expLevel;
        if (!pass) allPassed = false;
        appendLabLog(`  - 累計 ${tc.mins} 分鐘 ➔ 第 ${stage.level} 階：${stage.name} (${pass ? '✅ 通過' : '❌ 失敗'})`);
      });
      alert(`全校生命樹 4,500 分鐘/階段驗證${allPassed ? '全部通過！' : '失敗！'}\n\n門檻對照：\n第 1 階 (嫩芽)：0~4,499 分鐘\n第 2 階 (幼苗)：4,500~8,999 分鐘\n第 3 階 (小樹)：9,000~13,499 分鐘\n第 4 階 (大樹)：13,500~17,999 分鐘\n第 5 階 (樹屋遊樂園)：18,000+ 分鐘`);
    });

    // 每日打卡上限測試：驗證學生每日打卡上限最多 3 次
    document.getElementById('lab-btn-test-daily-limit')?.addEventListener('click', () => {
      const student = window.currentStudent;
      const curDate = student.simulatedDate;
      const existing = storageManager.getUserLogsForDate(student, curDate);
      appendLabLog(`⚡ [打卡上限測試] 驗證學生每日最多 3 次打卡限制：`);
      appendLabLog(`  - 當前使用者：${student.name} (身分：${student.role})`);
      appendLabLog(`  - 今日已打卡筆數：${existing.length} / 3 筆`);
      if (existing.length < 3) {
        appendLabLog(`  - 狀態：尚未達上限，學生可正常提交打卡（尚餘 ${3 - existing.length} 次額度）。`);
        alert(`目前今日已打卡 ${existing.length} / 3 次。\n您今日還可打卡 ${3 - existing.length} 次！\n若超過 3 次，系統將嚴格阻擋並彈出：\n「今日打卡次數已達上限，明天再來喔！」`);
      } else {
        appendLabLog(`  - 狀態：已達上限 3 次，系統嚴格阻擋並彈出警示：「今日打卡次數已達上限，明天再來喔！」`);
        alert(`今日打卡次數已達上限（${existing.length} / 3 次）！🔒\n若再次點擊打卡將彈出：\n「今日打卡次數已達上限，明天再來喔！」`);
      }
    });

    // Google 試算表 (GAS) 雲端連線設定與即時測試
    const gasInput = document.getElementById('lab-gas-url-input');
    const gasBtn = document.getElementById('lab-btn-save-gas');
    const gasStatus = document.getElementById('lab-gas-status');

    if (gasInput && storageManager.gasUrl) {
      gasInput.value = storageManager.gasUrl;
    }

    if (gasBtn && gasInput) {
      gasBtn.addEventListener('click', async () => {
        const url = gasInput.value.trim();
        if (gasStatus) {
          gasStatus.textContent = '🔄 正在連線至 Google 試算表...';
          gasStatus.style.color = '#B25E00';
        }
        appendLabLog(`☁️ [雲端大數據] 正在連線測試 Google 試算表 Web App API：${url || '(已清空/純本機模式)'}`);
        const res = await storageManager.setGasApiUrl(url);
        if (res && res.success) {
          if (gasStatus) {
            gasStatus.textContent = '✅ 連線成功！已同步全校大數據與生命樹進階狀態。';
            gasStatus.style.color = '#2D6A4F';
          }
          appendLabLog(`✅ [雲端大數據] Google 試算表連線成功！全校累計 MVPA：${storageManager.cloudStats?.totalSchoolMvpaMins || 0} 分鐘。`);
          alert('🎉 Google 試算表雲端資料庫連線成功！\n全校學生打卡、EXP、MVPA 與生命樹即時跨裝置同步已啟動！');
        } else {
          if (gasStatus) {
            gasStatus.textContent = url ? `⚠️ 連線失敗：${res.error || '請確認部署設定權限為「所有人」'}` : '💾 已恢復為純本機儲存模式';
            gasStatus.style.color = url ? '#D90429' : '#6C584C';
          }
          appendLabLog(`⚠️ [雲端大數據] 連線結果：${res.error || res.message}`);
        }
        renderAllViews();
      });
    }

    // 重設為預設展示資料
    document.getElementById('lab-btn-reset-data')?.addEventListener('click', () => {
      if (confirm('確定要重設所有學童與全校紀錄回初始預設值嗎？')) {
        storageManager.resetToDefaults();
        window.currentStudent = storageManager.getCurrentUser();
        appendLabLog('🔄 系統已重設為官方初始資料。');
        renderAllViews();
      }
    });
  }

  function appendLabLog(msg) {
    const box = document.getElementById('lab-console-log');
    if (!box) return;
    const time = new Date().toLocaleTimeString();
    box.innerHTML += `<div>[${time}] ${msg}</div>`;
    box.scrollTop = box.scrollHeight;
  }

  /**
   * 8. 奇蹟蛻變盛典全螢幕彈窗 (Miracle Metamorphosis Celebration)
   */
  function triggerEvolutionCelebration(oldStage, newStage) {
    const overlay = document.getElementById('miracle-celebration-overlay');
    if (!overlay) return;

    const student = window.currentStudent;
    const series = CONFIG.EGG_SERIES[student.eggSeries] || CONFIG.EGG_SERIES.flame;
    const petMeta = series.pets.find(p => p.stage === newStage.currentStage && (!p.branch || p.branch === student.ultimateBranch)) || series.pets[0];

    // 播放全螢幕奇蹟星光和弦與豎琴琶音
    if (window.soundEngine) {
      window.soundEngine.playEvolutionMiracle();
    }

    document.getElementById('celebration-pet-name').textContent = petMeta.name;
    document.getElementById('celebration-stage-desc').textContent = `${oldStage.name} ➔ ${newStage.name} 奇蹟誕生！\n${petMeta.desc}`;

    const thumbContainer = document.getElementById('celebration-pet-thumb');
    if (thumbContainer) {
      thumbContainer.innerHTML = petRenderer.generatePetHtml(student.eggSeries, newStage.currentStage, student.ultimateBranch, 'happy', null);
    }

    overlay.classList.add('active');

    // 綁定關閉按鈕
    document.getElementById('celebration-confirm-btn').onclick = () => {
      overlay.classList.remove('active');
      if (window.soundEngine) window.soundEngine.playSparkle();
    };
  }

  /**
   * 9. 註冊與切換使用者彈窗 & 管理員全校帳號綜整管理
   */
  function initModals() {
    // 彈窗關閉按鈕 (支援多種彈窗)
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modal || 'user-switch-modal';
        const modalEl = document.getElementById(modalId);
        if (modalEl) modalEl.classList.remove('active');
      });
    });

    // 點擊遮罩外部背景關閉
    ['user-switch-modal', 'student-edit-modal', 'user-register-modal', 'pet-character-modal'].forEach(mId => {
      const modalEl = document.getElementById(mId);
      if (modalEl) {
        modalEl.addEventListener('click', (e) => {
          if (e.target === modalEl) modalEl.classList.remove('active');
        });
      }
    });

    // 學生鎖定模式：註冊新帳號通道
    const lockRegBtn = document.getElementById('btn-student-lock-register');
    if (lockRegBtn) {
      lockRegBtn.addEventListener('click', () => {
        document.getElementById('user-switch-modal')?.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playPop();
        openDedicatedRegisterModal();
      });
    }

    // 專屬新使用者註冊表單
    const dedForm = document.getElementById('dedicated-register-form');
    if (dedForm) {
      const petCards = document.querySelectorAll('#ded-reg-pet-grid .pet-select-card');
      petCards.forEach(card => {
        card.addEventListener('click', () => {
          petCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const radio = card.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;
        });
      });

      dedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('ded-reg-name').value.trim();
        const gradeClass = document.getElementById('ded-reg-class').value.trim();
        const role = document.getElementById('ded-reg-role').value;
        const eggSeries = document.querySelector('input[name="ded_egg_series"]:checked')?.value || 'flame';

        if (!name) return;

        const newUser = storageManager.registerUser({ name, gradeClass, role, eggSeries });
        dedForm.reset();
        document.getElementById('user-register-modal')?.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playSparkle();
        alert(`歡迎新${role === 'student' ? '同學' : '師長'}【${name}】加入上林神寵運動養成體系！🐣✨\n已為您配置專屬守護神寵，初始無經驗值，隨時可以自由更換神寵！`);
        renderAllViews();
      });
    }

    // 學生鎖定模式：通關密碼解鎖通道
    const unlockBtn = document.getElementById('btn-submit-unlock');
    const unlockInput = document.getElementById('admin-unlock-passcode');
    const unlockErrorHint = document.getElementById('unlock-error-hint');

    function submitUnlock() {
      const code = (unlockInput?.value || '').trim();
      if (code === CONFIG.ADMIN_PASSCODE) {
        if (unlockErrorHint) unlockErrorHint.style.display = 'none';
        if (window.soundEngine) window.soundEngine.playSparkle();
        // 解鎖成功：切換至校長管理帳號，開啟全校綜整管理中心
        storageManager.setCurrentUser('adm_principal');
        window.currentStudent = storageManager.getCurrentUser();
        renderAllViews();
        openAdminDashboard();
      } else {
        if (unlockErrorHint) {
          unlockErrorHint.textContent = '❌ 通關密碼錯誤！請輸入正確的師長管理密碼 (預設: 888)';
          unlockErrorHint.style.display = 'block';
        }
        if (window.soundEngine) window.soundEngine.playPurr();
      }
    }

    if (unlockBtn) unlockBtn.addEventListener('click', submitUnlock);
    if (unlockInput) {
      unlockInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitUnlock();
        }
      });
    }

    // 管理員快速切換處室按鈕
    document.querySelectorAll('.admin-role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const adminId = btn.dataset.adminId;
        if (storageManager.setCurrentUser(adminId)) {
          window.currentStudent = storageManager.getCurrentUser();
          if (window.soundEngine) window.soundEngine.playPop();
          renderAllViews();
          openAdminDashboard();
        }
      });
    });

    // 班級篩選與關鍵字搜尋
    const classFilter = document.getElementById('admin-class-filter');
    const searchInput = document.getElementById('admin-user-search');
    if (classFilter) classFilter.addEventListener('change', renderAdminUserCards);
    if (searchInput) searchInput.addEventListener('input', renderAdminUserCards);

    // 折疊註冊表單切換
    const toggleRegBtn = document.getElementById('btn-toggle-register-form');
    const regCollapse = document.getElementById('admin-register-collapse');
    const cancelRegBtn = document.getElementById('btn-cancel-register');
    const registerForm = document.getElementById('new-user-register-form');

    if (toggleRegBtn && regCollapse) {
      toggleRegBtn.addEventListener('click', () => {
        const isHidden = regCollapse.style.display === 'none';
        regCollapse.style.display = isHidden ? 'block' : 'none';
        toggleRegBtn.innerHTML = isHidden ? '✕ 收起註冊表單' : '<span>➕</span> 註冊新學童 / 師長';
      });
    }

    if (cancelRegBtn && regCollapse) {
      cancelRegBtn.addEventListener('click', () => {
        regCollapse.style.display = 'none';
        if (toggleRegBtn) toggleRegBtn.innerHTML = '<span>➕</span> 註冊新學童 / 師長';
      });
    }

    // 新增註冊表單提交
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const gradeClass = document.getElementById('reg-grade-class').value.trim();
        const role = document.getElementById('reg-role').value;
        const eggSeries = document.getElementById('reg-egg-series').value;

        if (!name) return;

        const newUser = storageManager.registerUser({ name, gradeClass, role, eggSeries });
        registerForm.reset();
        if (regCollapse) regCollapse.style.display = 'none';
        if (toggleRegBtn) toggleRegBtn.innerHTML = '<span>➕</span> 註冊新學童 / 師長';

        if (window.soundEngine) window.soundEngine.playSparkle();
        alert(`已成功建立新帳號【${name}】(${gradeClass})！🐣`);
        renderAllViews();
        if (storageManager.isCurrentUserAdmin()) {
          openAdminDashboard();
        }
      });
    }

    // 學生數值調整表單提交
    const editForm = document.getElementById('student-edit-form');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const uid = document.getElementById('edit-user-id').value;
        const name = document.getElementById('edit-user-name').value;
        const gradeClass = document.getElementById('edit-user-class').value;
        const eggSeries = document.getElementById('edit-user-egg').value;
        const totalExp = Number(document.getElementById('edit-user-exp').value) || 0;
        const endurance = parseFloat(document.getElementById('edit-user-endurance').value) || 0;
        const strength = parseFloat(document.getElementById('edit-user-strength').value) || 0;
        const agility = parseFloat(document.getElementById('edit-user-agility').value) || 0;
        const coordination = parseFloat(document.getElementById('edit-user-coordination').value) || 0;

        const updated = storageManager.updateUser(uid, {
          name,
          gradeClass,
          eggSeries,
          totalExp,
          abilities: { endurance, strength, agility, coordination }
        });

        if (updated) {
          document.getElementById('student-edit-modal').classList.remove('active');
          if (window.soundEngine) window.soundEngine.playSparkle();
          alert(`學童【${updated.name}】的資料與運動吸收能量已成功儲存！✨`);
          renderAllViews();
          if (storageManager.isCurrentUserAdmin()) {
            openAdminDashboard();
          }
        }
      });
    }
  }

  /**
   * 開啟專屬新使用者註冊彈窗
   */
  function openDedicatedRegisterModal() {
    const modal = document.getElementById('user-register-modal');
    if (!modal) return;
    document.getElementById('dedicated-register-form')?.reset();

    // 預設選中第一個神寵角色
    const petCards = document.querySelectorAll('#ded-reg-pet-grid .pet-select-card');
    petCards.forEach((c, idx) => {
      c.classList.toggle('active', idx === 0);
      const radio = c.querySelector('input[type="radio"]');
      if (radio) radio.checked = (idx === 0);
    });

    modal.classList.add('active');
  }

  /**
   * 開啟自由挑選/更換第一階神寵守護蛋彈窗
   */
  function openPetCharacterModal() {
    const modal = document.getElementById('pet-character-modal');
    const grid = document.getElementById('pet-character-picker-grid');
    if (!modal || !grid) return;

    const curStudent = window.currentStudent;
    const curSeries = curStudent ? curStudent.eggSeries : 'flame';
    const seriesKeys = ['flame', 'wave', 'forest', 'sky', 'shadow'];

    grid.innerHTML = seriesKeys.map(key => {
      const series = CONFIG.EGG_SERIES[key];
      const isCurrent = key === curSeries;
      const icons = { flame: '🔥', wave: '🌊', forest: '🌿', sky: '☁️', shadow: '🔮' };
      const eggPet = series.pets[0] || { name: `${series.name}蛋`, desc: '蘊含無限潛能的神奇寶貝蛋' };

      return `
        <div class="pet-char-choice-card ${isCurrent ? 'is-current' : ''}" data-series="${key}">
          <div class="pet-char-choice-left">
            <div class="pet-char-choice-icon">${icons[key]}🥚</div>
            <div class="pet-char-choice-info">
              <h4>${series.name} · ${eggPet.name} ${isCurrent ? '⭐ 目前守護蛋' : ''}</h4>
              <p>${series.badge} · 第一階初始蛋：<strong>${eggPet.name}</strong><br>
              <span style="color: var(--sakura-pink); font-size: 11px;">${eggPet.desc}</span><br>
              <span style="color: var(--text-subtle); font-size: 11px;">🔒 後續高階進化形態隱藏封印中，運動累積 EXP 破殼揭曉！</span></p>
            </div>
          </div>
          <button class="cute-btn cute-btn-outline" style="padding: 6px 16px; font-size: 12px; white-space: nowrap;">
            ${isCurrent ? '守護中' : '選擇此蛋 🐾'}
          </button>
        </div>
      `;
    }).join('');

    // 綁定點選神寵角色更換事件
    grid.querySelectorAll('.pet-char-choice-card').forEach(card => {
      card.addEventListener('click', () => {
        const newSeries = card.dataset.series;
        storageManager.updateCurrentUserEggSeries(newSeries);
        window.currentStudent = storageManager.getCurrentUser();
        modal.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playSparkle();
        const chosenSeries = CONFIG.EGG_SERIES[newSeries];
        alert(`神寵守護蛋已成功更換為【${chosenSeries.name} · ${chosenSeries.pets[0].name}】！✨\n請透過每日運動打卡累積 EXP，逐步孵化揭曉高階神寵神秘面紗！`);
        renderAllViews();
      });
    });

    modal.classList.add('active');
  }

  function openUserModal() {
    const userModal = document.getElementById('user-switch-modal');
    if (!userModal) return;

    const isAdmin = storageManager.isCurrentUserAdmin();
    const lockCard = document.getElementById('student-lock-card');
    const adminCard = document.getElementById('admin-dashboard-card');

    if (!isAdmin) {
      // 學生模式：已鎖定，顯示防篡改鎖定卡片
      if (lockCard) lockCard.style.display = 'block';
      if (adminCard) adminCard.style.display = 'none';

      const lockNameEl = document.getElementById('lock-student-name');
      if (lockNameEl) lockNameEl.textContent = window.currentStudent ? window.currentStudent.name : '學童';

      const passInput = document.getElementById('admin-unlock-passcode');
      if (passInput) passInput.value = '';
      const errHint = document.getElementById('unlock-error-hint');
      if (errHint) errHint.style.display = 'none';
    } else {
      // 管理員模式：校長、學輔主任、生教組長、體育老師
      if (lockCard) lockCard.style.display = 'none';
      if (adminCard) adminCard.style.display = 'block';

      openAdminDashboard();
    }

    userModal.classList.add('active');
  }

  function openAdminDashboard() {
    const lockCard = document.getElementById('student-lock-card');
    const adminCard = document.getElementById('admin-dashboard-card');
    if (lockCard) lockCard.style.display = 'none';
    if (adminCard) adminCard.style.display = 'block';

    const current = window.currentStudent;
    const roleMeta = (CONFIG.ROLES && CONFIG.ROLES[current.role]) || { name: '管理員', badge: '🛡️ 管理員' };

    // 當前身分指示
    const currentBadgeEl = document.getElementById('admin-current-role-badge');
    if (currentBadgeEl) {
      currentBadgeEl.innerHTML = `${roleMeta.badge} 目前身分：<strong>${current.name}</strong> (${current.gradeClass})`;
    }

    // 快速切換按鈕狀態
    document.querySelectorAll('.admin-role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.adminId === current.id);
    });

    // 統計數據
    const users = storageManager.users || [];
    const totalCount = users.length;
    const studentCount = users.filter(u => u.role === 'student').length;
    const staffCount = users.filter(u => u.role !== 'student').length;

    const statTotal = document.getElementById('stat-total-users');
    const statStd = document.getElementById('stat-student-count');
    const statStaff = document.getElementById('stat-staff-count');
    if (statTotal) statTotal.textContent = totalCount;
    if (statStd) statStd.textContent = studentCount;
    if (statStaff) statStaff.textContent = staffCount;

    // 填充班級篩選選單
    const classFilter = document.getElementById('admin-class-filter');
    if (classFilter) {
      const selectedVal = classFilter.value || 'all';
      const classes = Array.from(new Set(users.map(u => u.gradeClass).filter(Boolean)));
      classFilter.innerHTML = '<option value="all">🏫 全部班級與處室</option>' +
        classes.map(c => `<option value="${c}" ${c === selectedVal ? 'selected' : ''}>${c}</option>`).join('');
    }

    renderAdminUserCards();
  }

  function renderAdminUserCards() {
    const grid = document.getElementById('admin-user-cards-grid');
    if (!grid) return;

    const users = storageManager.users || [];
    const classFilter = document.getElementById('admin-class-filter')?.value || 'all';
    const keyword = (document.getElementById('admin-user-search')?.value || '').trim().toLowerCase();

    const filtered = users.filter(u => {
      if (classFilter !== 'all' && u.gradeClass !== classFilter) return false;
      if (keyword) {
        const matchName = u.name.toLowerCase().includes(keyword);
        const matchClass = (u.gradeClass || '').toLowerCase().includes(keyword);
        if (!matchName && !matchClass) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-subtle);">
          沒有找到符合條件的學童或人員資料 🍃
        </div>
      `;
      return;
    }

    const currentUid = window.currentStudent?.id;

    grid.innerHTML = filtered.map(u => {
      const isCurrent = u.id === currentUid;
      const series = CONFIG.EGG_SERIES[u.eggSeries] || CONFIG.EGG_SERIES.flame;
      const stage = ShanglinAlgorithm.getEvolutionStage(u.totalExp);
      const petMeta = series.pets.find(p => p.stage === stage.currentStage && (!p.branch || p.branch === u.ultimateBranch)) || series.pets[0];
      const roleConfig = (CONFIG.ROLES && CONFIG.ROLES[u.role]) || { name: '學童', badge: '🎒 學童' };

      const abilities = u.abilities || { endurance: 0, strength: 0, agility: 0, coordination: 0 };
      const icons = { flame: '🔥', wave: '🌊', forest: '🌿', sky: '☁️', shadow: '🔮' };

      // 核心保護帳號不可刪除
      const isProtected = ['adm_principal', 'adm_director', 'adm_discipline', 'tch_001', 'tch_general'].includes(u.id) || 
                          ['principal', 'director', 'discipline', 'teacher', 'general_teacher'].includes(u.role);

      return `
        <div class="admin-user-card ${isCurrent ? 'is-current' : ''}">
          <div>
            <div class="admin-user-card-head">
              <div class="admin-user-egg-thumb">${icons[u.eggSeries] || '🥚'}</div>
              <div class="admin-user-title-wrap">
                <div class="admin-user-title-row">
                  <span class="admin-user-name" title="${u.name}">${u.name}</span>
                  <span class="admin-user-role-tag role-${u.role}">${roleConfig.badge}</span>
                </div>
                <div class="admin-user-class-sub">${u.gradeClass}</div>
              </div>
            </div>

            <div class="admin-user-pet-brief">
              <span>${series.badge} · <strong>${petMeta.name}</strong> (${stage.name})</span>
              <span style="font-weight: 800; color: var(--sakura-pink);">${u.totalExp} EXP</span>
            </div>

            <div class="admin-user-abilities-mini">
              <div class="admin-user-ability-mini-cell" title="耐力能量">
                <span style="color: #FF5C8A;">❤️耐</span>
                <strong>${(abilities.endurance || 0).toFixed(1)}</strong>
              </div>
              <div class="admin-user-ability-mini-cell" title="肌力能量">
                <span style="color: #F77F00;">💪肌</span>
                <strong>${(abilities.strength || 0).toFixed(1)}</strong>
              </div>
              <div class="admin-user-ability-mini-cell" title="敏捷能量">
                <span style="color: #48CAE4;">⚡敏</span>
                <strong>${(abilities.agility || 0).toFixed(1)}</strong>
              </div>
              <div class="admin-user-ability-mini-cell" title="協調能量">
                <span style="color: #9D4EDD;">🎯協</span>
                <strong>${(abilities.coordination || 0).toFixed(1)}</strong>
              </div>
            </div>
          </div>

          <div class="admin-user-card-actions">
            <button class="admin-user-action-btn btn-switch-account" data-uid="${u.id}" title="切換為此使用者視角">
              ${isCurrent ? '⭐ 使用中' : '👀 切換'}
            </button>
            <button class="admin-user-action-btn btn-adjust-student" data-uid="${u.id}" title="調整姓名、班級、EXP與四能力">
              ✏️ 調整數值
            </button>
            ${isProtected 
              ? `<button class="admin-user-action-btn btn-delete-disabled" title="核心管理帳號受系統保護不可刪除" disabled>🔒</button>`
              : `<button class="admin-user-action-btn btn-delete-student" data-uid="${u.id}" data-uname="${u.name}" title="刪除此帳號">🗑️</button>`
            }
          </div>
        </div>
      `;
    }).join('');

    // 綁定卡片按鈕事件
    // 1. 切換
    grid.querySelectorAll('.btn-switch-account').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        if (storageManager.setCurrentUser(uid)) {
          window.currentStudent = storageManager.getCurrentUser();
          document.getElementById('user-switch-modal').classList.remove('active');
          if (window.soundEngine) window.soundEngine.playSparkle();
          renderAllViews();
        }
      });
    });

    // 2. 調整數值
    grid.querySelectorAll('.btn-adjust-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        openStudentEditModal(uid);
      });
    });

    // 3. 刪除
    grid.querySelectorAll('.btn-delete-student').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const uname = btn.dataset.uname;
        if (confirm(`⚠️ 確定要刪除學童【${uname}】的帳號與所有運動紀錄嗎？\n此操作無法復原！`)) {
          const res = storageManager.deleteUser(uid);
          alert(res.message);
          if (res.success) {
            if (window.soundEngine) window.soundEngine.playPop();
            openAdminDashboard();
            renderAllViews();
          }
        }
      });
    });
  }

  function openStudentEditModal(userId) {
    const user = storageManager.getUserById(userId);
    if (!user) return;

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-name').value = user.name;
    document.getElementById('edit-user-class').value = user.gradeClass;
    document.getElementById('edit-user-egg').value = user.eggSeries;
    document.getElementById('edit-user-exp').value = user.totalExp;

    const abilities = user.abilities || { endurance: 0, strength: 0, agility: 0, coordination: 0 };
    document.getElementById('edit-user-endurance').value = abilities.endurance || 0;
    document.getElementById('edit-user-strength').value = abilities.strength || 0;
    document.getElementById('edit-user-agility').value = abilities.agility || 0;
    document.getElementById('edit-user-coordination').value = abilities.coordination || 0;

    const editModal = document.getElementById('student-edit-modal');
    if (editModal) {
      if (window.soundEngine) window.soundEngine.playPop();
      editModal.classList.add('active');
    }
  }

  /**
   * 10. 全局視圖重繪
   */
  function renderAllViews() {
    window.currentStudent = storageManager.getCurrentUser();
    updateHeader();
    renderPetHub();
    updateWorkoutPreview();
    renderWorkoutLogsTable();
    renderHealthDashboard();
    renderCompendium();
  }
});
