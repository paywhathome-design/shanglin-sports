/**
 * 上林神寵運動養成系統 - 資料儲存與多使用者管理 (storage.js)
 * 支援：
 * 1. 學生與教師自由註冊、獨立資料保存與隨時切換
 * 2. 歷史運動紀錄、四項能力浮點數原始精度、每週 12 EXP 週期紀錄
 * 3. 全校健康促進大數據匯總 (全校 MVPA、達標率、全校生命樹)
 * 4. 支援教師實驗室日期模擬快轉、資料匯入與匯出
 */

const STORAGE_KEY_USERS = 'shanglin_pet_users_v4';
const STORAGE_KEY_CURRENT_USER_ID = 'shanglin_pet_current_uid_v4';
const STORAGE_KEY_GAS_URL = 'shanglin_pet_gas_url_v4';
const STORAGE_KEY_CLOUD_STATS = 'shanglin_pet_cloud_stats_v4';

class StorageManager {
  constructor() {
    this.users = [];
    this.currentUserId = null;
    this.gasUrl = (typeof CONFIG !== 'undefined' && CONFIG.GAS_API_URL) || localStorage.getItem(STORAGE_KEY_GAS_URL) || '';
    this.cloudStats = JSON.parse(localStorage.getItem(STORAGE_KEY_CLOUD_STATS) || 'null');
    this.cloudConnected = false;
    this.isSyncing = false;
    this.onSyncCallbacks = [];
    this.init();
  }

  init() {
    try {
      const storedUsers = localStorage.getItem(STORAGE_KEY_USERS);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
        this.ensureAdminAccounts();
      } else {
        this.seedDefaultUsers();
      }

      const currentUid = localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
      if (currentUid && this.users.find(u => u.id === currentUid)) {
        this.currentUserId = currentUid;
      } else if (this.users.length > 0) {
        this.currentUserId = this.users[0].id;
      }
      this.save();

      // 若有設定 GAS 雲端 API，背景自動非同步抓取最新全校數據與名冊
      if (this.gasUrl) {
        setTimeout(() => this.fetchFromGas(), 300);
      }
    } catch (e) {
      console.error('Storage initialization failed, reseeding defaults', e);
      this.seedDefaultUsers();
    }
  }

  seedDefaultUsers() {
    const todayStr = this.getFormattedDate(new Date());
    const weekKey = this.getWeekKey(new Date());

    // 依使用者需求：全員初始皆為 0 EXP 無經驗值，去除姓氏，體育組長改為體育老師，自由選擇神寵角色
    this.users = [
      {
        id: 'std_001',
        name: '晴晴',
        role: 'student',
        gradeClass: '六年一班',
        eggSeries: 'flame',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      },
      {
        id: 'std_002',
        name: '睿睿',
        role: 'student',
        gradeClass: '五年二班',
        eggSeries: 'wave',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      },
      {
        id: 'std_003',
        name: '涵涵',
        role: 'student',
        gradeClass: '四年三班',
        eggSeries: 'forest',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'B',
        logs: []
      },
      {
        id: 'adm_principal',
        name: '校長', // 去除姓氏
        role: 'principal',
        gradeClass: '校長室',
        eggSeries: 'flame',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'B',
        logs: []
      },
      {
        id: 'adm_director',
        name: '學輔主任', // 去除姓氏
        role: 'director',
        gradeClass: '學輔處',
        eggSeries: 'forest',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      },
      {
        id: 'adm_discipline',
        name: '生教組長', // 去除姓氏
        role: 'discipline',
        gradeClass: '生教組',
        eggSeries: 'shadow',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      },
      {
        id: 'tch_001',
        name: '體育老師', // 體育組長改為體育老師，去除姓氏
        role: 'teacher',
        gradeClass: '體育組',
        eggSeries: 'sky',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      },
      {
        id: 'tch_general',
        name: '教師', // 專任/導師教師身分，具全校管理與觀測權限
        role: 'general_teacher',
        gradeClass: '專任教師',
        eggSeries: 'forest',
        totalExp: 0, // 初始 0 EXP
        currentWeeklyExp: 0,
        currentWeekKey: weekKey,
        simulatedDate: todayStr,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null,
        consecutiveLeadCount: 0,
        ultimateBranch: 'A',
        logs: []
      }
    ];

    this.currentUserId = this.users[0].id;
    this.save();
  }

  /**
   * 確保管理帳號 (校長、學輔主任、生教組長、體育老師、教師) 完整就緒，無姓氏、無初始經驗值
   */
  ensureAdminAccounts() {
    const todayStr = this.getFormattedDate(new Date());
    const weekKey = this.getWeekKey(new Date());

    const adminPresets = [
      {
        id: 'adm_principal',
        name: '校長',
        role: 'principal',
        gradeClass: '校長室',
        eggSeries: 'flame',
        totalExp: 0,
        currentWeeklyExp: 0,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null
      },
      {
        id: 'adm_director',
        name: '學輔主任',
        role: 'director',
        gradeClass: '學輔處',
        eggSeries: 'forest',
        totalExp: 0,
        currentWeeklyExp: 0,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null
      },
      {
        id: 'adm_discipline',
        name: '生教組長',
        role: 'discipline',
        gradeClass: '生教組',
        eggSeries: 'shadow',
        totalExp: 0,
        currentWeeklyExp: 0,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null
      },
      {
        id: 'tch_001',
        name: '體育老師',
        role: 'teacher',
        gradeClass: '體育組',
        eggSeries: 'sky',
        totalExp: 0,
        currentWeeklyExp: 0,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null
      },
      {
        id: 'tch_general',
        name: '教師',
        role: 'general_teacher',
        gradeClass: '專任教師',
        eggSeries: 'forest',
        totalExp: 0,
        currentWeeklyExp: 0,
        abilities: { endurance: 0, strength: 0, agility: 0, coordination: 0 },
        primaryAbility: null
      }
    ];

    let changed = false;

    // 清理歷史存檔中可能殘留的姓氏或稱謂
    this.users.forEach(u => {
      if (u.role === 'principal' && u.name !== '校長') {
        u.name = '校長';
        changed = true;
      }
      if (u.role === 'director' && u.name !== '學輔主任') {
        u.name = '學輔主任';
        changed = true;
      }
      if (u.role === 'discipline' && u.name !== '生教組長') {
        u.name = '生教組長';
        changed = true;
      }
      if (u.role === 'teacher' && u.name !== '體育老師') {
        u.name = '體育老師';
        changed = true;
      }
      if (u.role === 'general_teacher' && u.name !== '教師') {
        u.name = '教師';
        changed = true;
      }
    });

    adminPresets.forEach(preset => {
      const exists = this.users.find(u => u.id === preset.id || (u.role === preset.role && u.role !== 'student'));
      if (!exists) {
        this.users.push({
          id: preset.id,
          name: preset.name,
          role: preset.role,
          gradeClass: preset.gradeClass,
          eggSeries: preset.eggSeries,
          totalExp: preset.totalExp,
          currentWeeklyExp: preset.currentWeeklyExp,
          currentWeekKey: weekKey,
          simulatedDate: todayStr,
          abilities: preset.abilities,
          primaryAbility: preset.primaryAbility,
          consecutiveLeadCount: 0,
          ultimateBranch: 'A',
          logs: []
        });
        changed = true;
      }
    });

    if (changed) {
      this.save();
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(this.users));
      if (this.currentUserId) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, this.currentUserId);
      }
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  getCurrentUser() {
    const user = this.users.find(u => u.id === this.currentUserId);
    return user || this.users[0] || null;
  }

  setCurrentUser(userId) {
    if (this.users.find(u => u.id === userId)) {
      this.currentUserId = userId;
      this.save();
      return true;
    }
    return false;
  }

  registerUser(userData) {
    const todayStr = this.getFormattedDate(new Date());
    const weekKey = this.getWeekKey(new Date());

    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      name: userData.name || '新同學',
      role: userData.role || 'student',
      gradeClass: userData.gradeClass || '三年甲班',
      eggSeries: userData.eggSeries || 'flame',
      totalExp: 0, // 初始蛋期
      currentWeeklyExp: 0,
      currentWeekKey: weekKey,
      simulatedDate: todayStr,
      abilities: {
        endurance: 0,
        strength: 0,
        agility: 0,
        coordination: 0
      },
      primaryAbility: null,
      consecutiveLeadCount: 0,
      ultimateBranch: Math.random() > 0.5 ? 'A' : 'B',
      logs: []
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;
    this.save();
    return newUser;
  }

  updateCurrentUser(updaterFn) {
    const user = this.getCurrentUser();
    if (!user) return null;

    updaterFn(user);
    this.save();
    return user;
  }

  /**
   * 角色權限判斷：是否具備校長、主任、組長或教師之管理權限
   */
  isUserAdmin(user) {
    if (!user) return false;
    if (CONFIG && CONFIG.ROLES && CONFIG.ROLES[user.role]) {
      return !!CONFIG.ROLES[user.role].isAdmin;
    }
    return ['principal', 'director', 'discipline', 'teacher', 'general_teacher'].includes(user.role);
  }

  isCurrentUserAdmin() {
    return this.isUserAdmin(this.getCurrentUser());
  }

  getUserById(userId) {
    return this.users.find(u => u.id === userId) || null;
  }

  /**
   * 管理員更新指定學生/使用者之資料與能力點數
   */
  updateUser(userId, updatedData) {
    const user = this.getUserById(userId);
    if (!user) return null;

    if (updatedData.name !== undefined) user.name = updatedData.name.trim();
    if (updatedData.gradeClass !== undefined) user.gradeClass = updatedData.gradeClass.trim();
    if (updatedData.role !== undefined) user.role = updatedData.role;
    if (updatedData.eggSeries !== undefined) user.eggSeries = updatedData.eggSeries;
    if (updatedData.totalExp !== undefined) user.totalExp = Math.max(0, Math.floor(Number(updatedData.totalExp) || 0));

    if (updatedData.abilities) {
      user.abilities = {
        endurance: Math.max(0, parseFloat(updatedData.abilities.endurance) || 0),
        strength: Math.max(0, parseFloat(updatedData.abilities.strength) || 0),
        agility: Math.max(0, parseFloat(updatedData.abilities.agility) || 0),
        coordination: Math.max(0, parseFloat(updatedData.abilities.coordination) || 0)
      };

      // 重新推算主能力
      if (typeof ShanglinAlgorithm !== 'undefined') {
        const struct = ShanglinAlgorithm.determineAbilityStructure(user.abilities);
        user.primaryAbility = struct.primaryAbility;
      }
    }

    this.save();
    return user;
  }

  /**
   * 管理員刪除指定學生帳號 (保護校長、主任、生教組長及自身)
   */
  deleteUser(userId) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: '找不到該帳號' };
    }

    const targetUser = this.users[userIndex];

    // 保護核心管理職帳號
    const protectedRoles = ['principal', 'director', 'discipline', 'teacher', 'general_teacher'];
    const protectedIds = ['adm_principal', 'adm_director', 'adm_discipline', 'tch_001', 'tch_general'];
    if (protectedRoles.includes(targetUser.role) || protectedIds.includes(targetUser.id)) {
      return { 
        success: false, 
        message: `【${targetUser.name}】為學校師長管理帳號，系統已啟用核心保護，不可刪除！` 
      };
    }

    // 不得刪除當前登入者自己
    if (targetUser.id === this.currentUserId) {
      return { 
        success: false, 
        message: '無法刪除目前正在登入中的帳號！若需刪除請先切換至其他管理師長身分。' 
      };
    }

    const deletedName = targetUser.name;
    this.users.splice(userIndex, 1);
    this.save();
    return { success: true, message: `已成功刪除學童【${deletedName}】的帳號與所有運動紀錄。` };
  }

  /**
   * 使用者自由更換神寵角色 (命定寶貝蛋系)
   */
  updateCurrentUserEggSeries(eggSeries) {
    const user = this.getCurrentUser();
    if (!user) return null;
    user.eggSeries = eggSeries;
    this.save();
    return user;
  }

  /**
   * 取得指定日期的所有紀錄
   */
  getUserLogsForDate(user, dateStr) {
    if (!user || !user.logs) return [];
    return user.logs.filter(log => log.date === dateStr);
  }

  /**
   * 全校/全班匯總指標計算 (供健康促進儀表板使用，優先融合 Google 試算表雲端即時大數據)
   */
  getSchoolAggregateMetrics() {
    const students = this.users.filter(u => u.role === 'student');
    let localSchoolMvpaMins = 0;
    let studentsMetWeeklyGoal = 0;
    let totalExerciseSessions = 0;
    let totalDaysActive = 0;

    const currentWeekKey = this.getWeekKey(new Date());

    students.forEach(student => {
      const indicators = ShanglinAlgorithm.calculateHealthIndicators(student.logs || [], currentWeekKey);
      localSchoolMvpaMins += indicators.totalMvpaMins;
      totalExerciseSessions += indicators.totalSessions;
      totalDaysActive += indicators.totalActiveDays;
      if (indicators.weeklyGoalMet) {
        studentsMetWeeklyGoal++;
      }
    });

    // 若已連線 Google 試算表雲端大數據，以雲端即時匯總之全校總量為準
    let totalSchoolMvpaMins = localSchoolMvpaMins;
    if (this.cloudStats && typeof this.cloudStats.totalSchoolMvpaMins === 'number') {
      totalSchoolMvpaMins = Math.max(localSchoolMvpaMins, this.cloudStats.totalSchoolMvpaMins);
    }

    const studentCount = students.length || 1;
    const weeklyGoalRate = Math.round((studentsMetWeeklyGoal / studentCount) * 100);

    return {
      studentCount,
      totalSchoolMvpaMins,
      studentsMetWeeklyGoal,
      weeklyGoalRate,
      totalExerciseSessions,
      totalDaysActive,
      isCloudSynced: this.cloudConnected,
      cloudStats: this.cloudStats,
      schoolTreeStage: ShanglinAlgorithm.getSchoolLifeTreeStage(totalSchoolMvpaMins)
    };
  }

  /**
   * =========================================================================
   * Google 試算表 (GAS) 雲端非同步同步引擎
   * =========================================================================
   */

  /**
   * 設定或更新 Google Apps Script Web App API 網址
   */
  setGasApiUrl(url) {
    this.gasUrl = (url || '').trim();
    localStorage.setItem(STORAGE_KEY_GAS_URL, this.gasUrl);
    if (typeof CONFIG !== 'undefined') {
      CONFIG.GAS_API_URL = this.gasUrl;
    }
    if (this.gasUrl) {
      return this.fetchFromGas();
    }
    this.cloudConnected = false;
    return Promise.resolve({ success: false, message: '已切換為純本機模式' });
  }

  /**
   * 註冊同步完成監聽回調
   */
  onSync(callback) {
    if (typeof callback === 'function') {
      this.onSyncCallbacks.push(callback);
    }
  }

  triggerSyncCallbacks(data) {
    this.onSyncCallbacks.forEach(cb => {
      try { cb(data); } catch (e) { console.error('Sync callback error', e); }
    });
  }

  /**
   * 自 Google 試算表抓取全校最新大數據與名冊 (背景同步)
   */
  async fetchFromGas() {
    if (!this.gasUrl) return { success: false, message: '未設定 GAS 網址' };
    this.isSyncing = true;
    try {
      const response = await fetch(`${this.gasUrl}?action=getAllData`, {
        method: 'GET',
        cache: 'no-store'
      });
      const res = await response.json();
      if (res && res.success) {
        this.cloudConnected = true;
        this.isSyncing = false;

        // 1. 同步全校大數據
        if (res.schoolStats) {
          this.cloudStats = res.schoolStats;
          localStorage.setItem(STORAGE_KEY_CLOUD_STATS, JSON.stringify(this.cloudStats));
        }

        // 2. 合併雲端使用者名冊
        if (Array.isArray(res.users) && res.users.length > 0) {
          res.users.forEach(remoteUser => {
            const localIdx = this.users.findIndex(u => u.id === remoteUser.id);
            if (localIdx >= 0) {
              // 比較經驗值與日期，保留最新進度
              const localUser = this.users[localIdx];
              if ((remoteUser.totalExp || 0) >= (localUser.totalExp || 0)) {
                this.users[localIdx] = { ...localUser, ...remoteUser };
              }
            } else {
              this.users.push(remoteUser);
            }
          });
          this.save();
        }

        this.triggerSyncCallbacks({ type: 'fetched', data: res });
        return { success: true, message: 'Google 試算表連線成功！已同步全校大數據。', data: res };
      } else {
        throw new Error(res.error || '回傳格式不符');
      }
    } catch (err) {
      console.warn('GAS fetch failed, fallback to local storage:', err);
      this.isSyncing = false;
      this.cloudConnected = false;
      return { success: false, error: err.toString() };
    }
  }

  /**
   * 提交打卡日誌至 Google 試算表
   */
  async syncWorkoutLogToGas(newLog, currentUser) {
    if (!this.gasUrl || !currentUser) return;

    const payload = {
      action: 'addLog',
      userId: currentUser.id,
      userName: currentUser.name,
      gradeClass: currentUser.gradeClass || '',
      log: {
        id: newLog.id,
        userId: currentUser.id,
        userName: currentUser.name,
        gradeClass: currentUser.gradeClass || '',
        activityId: newLog.sportId,
        activityName: newLog.sportName,
        activityCategory: newLog.sportName,
        durationMinutes: newLog.durationMins,
        exertion: newLog.exertion,
        isMuscleBone: !!newLog.isMuscleBone,
        primaryEnergy: newLog.basicEnergy ? (newLog.basicEnergy * 2 / 3) : 0,
        secondaryEnergy: newLog.basicEnergy ? (newLog.basicEnergy * 1 / 3) : 0,
        bonusExp: newLog.bonusExp || 0,
        dailyFinalExp: newLog.dailyFinalExp || 0,
        weeklyMvpa: newLog.durationMins || 0
      },
      userUpdate: {
        totalExp: currentUser.totalExp,
        currentWeeklyExp: currentUser.currentWeeklyExp,
        currentWeekKey: currentUser.currentWeekKey,
        primaryAbility: currentUser.primaryAbility,
        consecutiveLeadCount: currentUser.consecutiveLeadCount,
        ultimateBranch: currentUser.ultimateBranch,
        abilities: currentUser.abilities,
        simulatedDate: currentUser.simulatedDate
      }
    };

    try {
      const response = await fetch(this.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const res = await response.json();
      if (res && res.success) {
        this.cloudConnected = true;
        if (res.schoolStats) {
          this.cloudStats = res.schoolStats;
          localStorage.setItem(STORAGE_KEY_CLOUD_STATS, JSON.stringify(this.cloudStats));
        }
        this.triggerSyncCallbacks({ type: 'logAdded', data: res });
      }
    } catch (e) {
      console.warn('Background sync to GAS failed (will retry or use local):', e);
    }
  }

  /**
   * 提交新註冊使用者至 Google 試算表
   */
  async syncUserToGas(newUser) {
    if (!this.gasUrl || !newUser) return;
    try {
      const payload = { action: 'registerUser', user: newUser };
      await fetch(this.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Sync user to GAS failed:', e);
    }
  }

  /**
   * 同步更新現有使用者至 Google 試算表 (例如管理員調整數值)
   */
  async syncUpdateUserToGas(user) {
    if (!this.gasUrl || !user) return;
    try {
      const payload = { action: 'updateUser', user: user };
      await fetch(this.gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Sync update user to GAS failed:', e);
    }
  }

  /**
   * 日期輔助工具
   */
  getFormattedDate(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // 週一為一週開始
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  /**
   * 匯出所有資料為 JSON
   */
  exportDataJson() {
    return JSON.stringify({
      version: '3.3',
      exportTime: new Date().toISOString(),
      currentUserId: this.currentUserId,
      users: this.users
    }, null, 2);
  }

  /**
   * 匯入 JSON 資料
   */
  importDataJson(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.users)) {
        this.users = data.users;
        this.currentUserId = data.currentUserId || this.users[0]?.id;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }

  /**
   * 自訂神寵圖檔儲存 (支援拖曳上傳與 Base64 永久儲存)
   */
  getCustomPetImage(petName) {
    try {
      const images = JSON.parse(localStorage.getItem('shanglin_pet_custom_images_v1') || '{}');
      return images[petName] || null;
    } catch (e) {
      return null;
    }
  }

  saveCustomPetImage(petName, dataUrl) {
    try {
      const images = JSON.parse(localStorage.getItem('shanglin_pet_custom_images_v1') || '{}');
      images[petName] = dataUrl;
      localStorage.setItem('shanglin_pet_custom_images_v1', JSON.stringify(images));
      return true;
    } catch (e) {
      console.warn('Failed to save image in localStorage (might be full)', e);
      return false;
    }
  }

  getAllCustomPetImages() {
    try {
      return JSON.parse(localStorage.getItem('shanglin_pet_custom_images_v1') || '{}');
    } catch (e) {
      return {};
    }
  }

  clearCustomPetImages() {
    localStorage.removeItem('shanglin_pet_custom_images_v1');
  }

  /**
   * 重設為預設展示資料
   */
  resetToDefaults() {
    this.seedDefaultUsers();
    return true;
  }
}

// 實例化全域儲存管理員
var storageManager = null;
if (typeof window !== 'undefined') {
  window.storageManager = new StorageManager();
  storageManager = window.storageManager;
}
