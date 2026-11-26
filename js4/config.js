/**
 * 上林神寵運動養成系統 - 核心配置與資料庫 (config.js)
 * 100% 嚴格對照官方 PDF 核心遊戲規則、神寵分支進化圖鑑與生命樹規範
 */

const CONFIG = {
  // 色彩體系 (浪漫粉彩與極致可愛)
  COLORS: {
    sakuraPink: '#FF758F',     // 櫻花粉
    lavenderViolet: '#9D4EDD', // 薰衣草紫
    dawnGlassBlue: '#48CAE4',  // 晨曦琉璃藍
    mintGreen: '#52B788',      // 薄荷綠
    softPeachPink: '#FFCAD4',  // 柔光蜜桃粉
    peachLight: '#FFE5EC',     // 蜜桃淡粉
    warmCream: '#FFF8F0',      // 溫暖乳白
    textDark: '#4A3E3D',       // 柔和深咖字體
    textMuted: '#8C7A79'       // 柔灰文字
  },

  // 角色權限體系 (學生帳號保護鎖定，校長/主任/組長/體育老師/教師具綜整瀏覽、調整與刪除權限)
  ROLES: {
    student:         { id: 'student',         name: '學童',         badge: '🎒 學童',       isAdmin: false },
    principal:       { id: 'principal',       name: '校長',         badge: '🏛️ 校長',       isAdmin: true },
    director:        { id: 'director',        name: '學輔主任',     badge: '🛡️ 學輔主任',   isAdmin: true },
    discipline:      { id: 'discipline',      name: '生教組長',     badge: '⚖️ 生教組長',   isAdmin: true },
    teacher:         { id: 'teacher',         name: '體育老師',     badge: '🏅 體育老師',   isAdmin: true },
    general_teacher: { id: 'general_teacher', name: '教師',         badge: '🧑‍🏫 教師',       isAdmin: true }
  },
  ADMIN_PASSCODE: '888', // 教師與處室管理員解鎖密碼

  // Google 試算表 (Google Sheets) + Google Apps Script (GAS) 雲端 API 設定
  // 部署完成後，將 Web 應用程式網址填入此處 (或於教師模擬實驗室中貼上)，全校即自動啟用雲端同步！
  GAS_API_URL: 'https://script.google.com/macros/s/AKfycbw0psOY0F5N64MHRnByccqbWqIxvnZsbP5ThYjaRU0Yo5bEekumbZUjjTQa0dT39W6E/exec',

  // 四大能力能量定義
  ABILITIES: {
    endurance: {
      id: 'endurance',
      name: '耐力',
      icon: '❤️',
      color: '#FF5C8A',
      desc: '持續活動、心肺與長時間移動的活動能量',
      sleepMsg: '耐力能量尚在沉睡中，等候探索✨'
    },
    strength: {
      id: 'strength',
      name: '肌力',
      icon: '💪',
      color: '#F77F00',
      desc: '出力、阻力、爆發與支撐型活動能量',
      sleepMsg: '肌力能量尚在沉睡中，等候探索✨'
    },
    agility: {
      id: 'agility',
      name: '敏捷',
      icon: '⚡',
      color: '#48CAE4',
      desc: '快速移動、加減速、變向與反應的活動能量',
      sleepMsg: '敏捷能量尚在沉睡中，等候探索✨'
    },
    coordination: {
      id: 'coordination',
      name: '協調',
      icon: '🎯',
      color: '#9D4EDD',
      desc: '動作控制、節奏、傳接、精準與身體協調的活動能量',
      sleepMsg: '協調能量尚在沉睡中，等候探索✨'
    }
  },

  // 官方 13 種運動玩法對應表 (PDF 第一頁與第二頁)
  // 主次比例精確 2:1 (即主占 2/3，次占 1/3；若無次要則主占 100%)
  SPORTS_RULES: [
    {
      id: 'ball_shoot',
      category: '球類',
      name: '球類－如: 投籃、拋接為主',
      icon: '🏀',
      primary: 'coordination',
      secondary: null,
      isMuscleBone: false,
      desc: '投籃、定點拋接，專注手眼協調與節奏控制'
    },
    {
      id: 'ball_game',
      category: '球類',
      name: '球類－比賽為主',
      icon: '⚽',
      primary: 'agility',
      secondary: 'coordination',
      isMuscleBone: false,
      desc: '籃球賽、足球對抗賽，快速反應與傳接敏捷'
    },
    {
      id: 'ball_running',
      category: '球類',
      name: '球類－大量跑動',
      icon: '🎾',
      primary: 'endurance',
      secondary: 'agility',
      isMuscleBone: false,
      desc: '網球、羽球全場跑動或持續接發球'
    },
    {
      id: 'run_jog',
      category: '跑步',
      name: '跑步－慢跑／持續跑',
      icon: '🏃',
      primary: 'endurance',
      secondary: null,
      isMuscleBone: false,
      desc: '操場慢跑、晨跑，心肺耐力長時間鍛鍊'
    },
    {
      id: 'run_sprint',
      category: '跑步',
      name: '跑步－衝刺／短跑',
      icon: '⚡',
      primary: 'agility',
      secondary: 'strength',
      isMuscleBone: true,
      desc: '短跑衝刺、接力衝刺，瞬間爆發與肌力'
    },
    {
      id: 'frisbee_catch',
      category: '飛盤',
      name: '飛盤－傳接',
      icon: '🥏',
      primary: 'coordination',
      secondary: 'agility',
      isMuscleBone: false,
      desc: '雙人飛盤定點傳接、手眼精準控制'
    },
    {
      id: 'frisbee_game',
      category: '飛盤',
      name: '飛盤－跑動遊戲',
      icon: '🎯',
      primary: 'agility',
      secondary: 'coordination',
      isMuscleBone: false,
      desc: '爭奪飛盤躲避賽、跑位變向接盤'
    },
    {
      id: 'bike_normal',
      category: '腳踏車',
      name: '腳踏車－一般',
      icon: '🚲',
      primary: 'endurance',
      secondary: 'coordination',
      isMuscleBone: false,
      desc: '平路騎車、自行車道平穩踩踏'
    },
    {
      id: 'bike_uphill',
      category: '腳踏車',
      name: '腳踏車－上坡／高阻力',
      icon: '🚵',
      primary: 'endurance',
      secondary: 'strength',
      isMuscleBone: true,
      desc: '山坡爬坡或高阻力訓練，深層耐力與肌力考驗'
    },
    {
      id: 'diabolo_skill',
      category: '扯鈴',
      name: '扯鈴－技巧操作',
      icon: '🪀',
      primary: 'coordination',
      secondary: null,
      isMuscleBone: false,
      desc: '扯鈴定點招式、金雞上架、手部細膩協調'
    },
    {
      id: 'diabolo_move',
      category: '扯鈴',
      name: '扯鈴－持續移動玩法',
      icon: '✨',
      primary: 'coordination',
      secondary: 'agility',
      isMuscleBone: false,
      desc: '邊跑邊拋鈴、多人交叉換鈴移動表演'
    },
    {
      id: 'jump_rope',
      category: '跳繩',
      name: '跳繩',
      icon: '🪢',
      primary: 'coordination',
      secondary: 'endurance',
      isMuscleBone: true,
      desc: '連續雙腳跳、開合跳、花式搖繩'
    },
    {
      id: 'ball_bounce',
      category: '拍球',
      name: '拍球',
      icon: '🏐',
      primary: 'coordination',
      secondary: null,
      isMuscleBone: false,
      desc: '原地連續運球拍球、手部節奏掌握'
    }
  ],

  // 時間與主觀喘度矩陣 (PDF 第二頁)
  // 時間區間：<10, 10-19, 20-29, 30-44, 45-59, >=60
  // 喘度對應：輕鬆(輕度), 有點喘(中度), 很喘(高強度)
  EXERTION_MATRIX: [
    { minTime: 0,  maxTime: 9.99,  light: 1, moderate: 1, vigorous: 1 },
    { minTime: 10, maxTime: 19.99, light: 1, moderate: 2, vigorous: 2 },
    { minTime: 20, maxTime: 29.99, light: 2, moderate: 2, vigorous: 3 },
    { minTime: 30, maxTime: 44.99, light: 2, moderate: 3, vigorous: 4 },
    { minTime: 45, maxTime: 59.99, light: 3, moderate: 4, vigorous: 5 },
    { minTime: 60, maxTime: Infinity, light: 4, moderate: 5, vigorous: 5 }
  ],

  // 活動等級對應之基本能量 (PDF 第二頁)
  LEVEL_TO_ENERGY: {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10
  },

  // 個人挑戰 Bonus 對應 (PDF 第二頁)
  CHALLENGE_BONUS: [
    { value: 0, label: '低於平常 (+0)', desc: '今天稍微休息放鬆' },
    { value: 0, label: '一般／平常 (+0)', desc: '維持穩健常態運動' },
    { value: 1, label: '有意義的進步 (+1 EXP)', desc: '比平常更有耐力或堅持更久' },
    { value: 2, label: '個人挑戰 (+2 EXP)', desc: '突破自我極限、超越目標！' }
  ],

  // 成長 EXP 階段與門檻 (PDF 第三頁延伸)
  EVOLUTION_STAGES: [
    { stage: 0, key: 'egg',      name: '蛋期',   minExp: 0,   maxExp: 7,   label: '神秘寶貝蛋' },
    { stage: 1, key: 'hatching', name: '孵化期', minExp: 8,   maxExp: 24,  label: '萌萌破殼幼雛' },
    { stage: 2, key: 'juvenile', name: '幼年期', minExp: 25,  maxExp: 59,  label: '好奇活潑小萌寵' },
    { stage: 3, key: 'growth',   name: '成長期', minExp: 60,  maxExp: 104, label: '活力英勇少年' },
    { stage: 4, key: 'advanced', name: '進階期', minExp: 105, maxExp: 159, label: '威風凜凜守護神' },
    { stage: 5, key: 'deepening', name: '深化期', minExp: 160, maxExp: 224, label: '超凡靈動深化神尊' },
    { stage: 6, key: 'ultimate', name: '最終期', minExp: 225, maxExp: Infinity, label: '天地至尊榮耀神獸' }
  ],

  // 演算法核心邊界數值
  LIMITS: {
    DAILY_ABILITY_ENERGY_CAP: 10.00, // 每日四項能力能量合計上限 (PDF 第三頁)
    DAILY_BONUS_EXP_CAP: 2,          // 成長 Bonus 每日上限 (PDF 第三頁)
    WEEKLY_EXP_CAP: 12,              // 每週最終成長 EXP 上限 (PDF 第三頁)
    WEEKLY_MVPA_GOAL_MINS: 150,      // 每週中高強度運動目標分鐘 (PDF 第四頁)
    DAILY_ACTIVE_MINS_GOAL: 60,      // 每日達標活動分鐘 (WHO / 教育部指引)
    SCHOOL_STAGE_MVPA_INTERVAL: 4500, // 全校累積 MVPA 每階段門檻間隔 (每階段應達 4500 分鐘到下一階段)
    STUDENT_DAILY_MAX_LOGS: 3        // 學生每日最多打卡次數上限 (超過時提示「今日打卡次數已達上限，明天再來喔！」)
  },

  // 五大蛋系與 35 隻神寵圖鑑 (完全依據 PDF-2 神寵進化分支圖鑑)
  EGG_SERIES: {
    flame: {
      id: 'flame',
      name: '美德-烈焰',
      eggName: '美德-烈焰蛋',
      element: '火',
      color: '#FF5C8A',
      secondaryColor: '#FF9E00',
      badge: '🔥 美德之火',
      motto: '熱情奔放、正直勇敢，燃點純粹心火',
      bgGradient: 'linear-gradient(135deg, #FFE5EC 0%, #FFD166 100%)',
      pets: [
        { stage: 0, name: '美德-烈焰蛋', type: 'egg', desc: '散發溫暖微光的紅寶石花紋彩蛋，內心跳動著正義火苗。' },
        { stage: 1, name: '小烈焰', type: 'hatching', desc: '頭頂頂著一撮呆萌小火苗，眨著圓滾滾的大眼睛，喜歡暖呼呼的抱抱。' },
        { stage: 2, name: '熔岩獸', type: 'juvenile', desc: '腳踩軟綿綿的熔岩棉花掌，跑動時會撲哧撲哧冒出橘紅色愛心小煙圈。' },
        { stage: 3, name: '烈焰獸', type: 'growth', desc: '擁有飄逸溫暖的火焰小鬃毛，活力滿滿的小獅獸，陪伴好朋友一起快樂運動！' },
        { stage: 4, name: '岩甲龍', type: 'advanced', desc: '身披閃耀金紅光澤的堅韌厚實岩甲，威武守護身邊每一位同學！' },
        { stage: 5, name: '焰角戰獸', type: 'deepening', bias: '耐力/肌力/專精', desc: '頭戴無畏剛毅的烈焰王冠戰角，堅若磐石、勇往直前的小勇者化身！' },
        { stage: 6, name: '熾羽鳳凰', type: 'ultimate', bias: '敏捷/協調/均衡', desc: '沐浴在七彩晨曦中的九天熾羽鳳凰，雙翼揮灑燦爛星火，庇佑校園和平與至尊榮耀！' }
      ]
    },
    wave: {
      id: 'wave',
      name: '健康-碧浪',
      eggName: '健康-碧浪蛋',
      element: '水',
      color: '#48CAE4',
      secondaryColor: '#0077B6',
      badge: '🌊 健康碧海',
      motto: '浩瀚澄澈、生生不息，流淌清涼活力',
      bgGradient: 'linear-gradient(135deg, #E0F7FA 0%, #BEE3F8 100%)',
      pets: [
        { stage: 0, name: '健康-碧浪蛋', type: 'egg', desc: '宛如蔚藍海洋般清涼剔透，表面泛著琉璃波光與水珠。' },
        { stage: 1, name: '小碧龍', type: 'hatching', desc: '長著一對小水滴角，吐出的泡泡會在陽光下折射出彩虹光暈。' },
        { stage: 2, name: '珊瑚獸', type: 'juvenile', desc: '頭頂長著粉嫩晶瑩的珊瑚小角，在淺灘珊瑚礁間歡快嬉戲的小精靈。' },
        { stage: 3, name: '海浪鯨龍', type: 'growth', desc: '體態矯健流暢，能乘風破浪巡遊蔚藍海洋，帶來滿滿的身心活力。' },
        { stage: 4, name: '洄流海龍', type: 'advanced', desc: '身披七彩珍珠琉璃龍鱗，尾鰭捲起清涼甘霖，守護水域生生不息。' },
        { stage: 5, name: '匯流守護龍', type: 'deepening', bias: '耐力/協調/均衡', desc: '匯聚江河海洋生靈之力的深海巨龍神尊，庇佑學童健康茁壯！' },
        { stage: 6, name: '滄浪獸', type: 'ultimate', bias: '肌力/敏捷/專精', desc: '掌控浩瀚滔天碧浪的至尊海神獸，威震四海、深邃澄澈的小勇者化身！' }
      ]
    },
    forest: {
      id: 'forest',
      name: '生態-森靈',
      eggName: '生態-森靈蛋',
      element: '木',
      color: '#52B788',
      secondaryColor: '#2D6A4F',
      badge: '🌿 生態森靈',
      motto: '綠意萌發、守護自然，共創盎然生機',
      bgGradient: 'linear-gradient(135deg, #E8F5E9 0%, #D8F3DC 100%)',
      pets: [
        { stage: 0, name: '生態-森靈蛋', type: 'egg', desc: '外殼纏繞著嫩綠細藤與小苔蘚，散發青草與泥土的清新芬芳。' },
        { stage: 1, name: '森角小鹿', type: 'hatching', desc: '小鹿角上開著兩朵鵝黃色小雛菊，蹦蹦跳跳，最喜歡吃清晨甘露。' },
        { stage: 2, name: '葉語鹿', type: 'juvenile', desc: '能聽懂林間落葉低語的靈巧神鹿，走過之處百花齊放。' },
        { stage: 3, name: '翠羽靈鹿', type: 'growth', desc: '身姿挺拔如林海，鹿角綻放翡翠神光，步履無聲、輕盈如風。' },
        { stage: 4, name: '枯地龍獸', type: 'advanced', desc: '掌控大地靈脈與厚土防禦的威武神龍，身披磐石之甲守護同伴！' },
        { stage: 5, name: '藤蔓守護獸', type: 'deepening', bias: '耐力/肌力/均衡', desc: '手足纏繞著萬千柔韌青藤，庇護上林森林萬物生靈的深林守護神尊！' },
        { stage: 6, name: '巨木守護者', type: 'ultimate', bias: '敏捷/協調/專精', desc: '頂天立地的千年神木至尊，生機浩瀚蓬勃，庇護整個上林生態綠意永駐！' }
      ]
    },
    sky: {
      id: 'sky',
      name: '樂學-雲翼',
      eggName: '樂學-雲翼蛋',
      element: '風',
      color: '#90E0EF',
      secondaryColor: '#0077B6',
      badge: '☁️ 樂學雲翼',
      motto: '自由翱翔、探求真理，啟發智慧靈光',
      bgGradient: 'linear-gradient(135deg, #F0F4FF 0%, #D0E8FF 100%)',
      pets: [
        { stage: 0, name: '樂學-雲翼蛋', type: 'egg', desc: '輕飄飄像棉花糖一樣能浮在半空中，伴隨微風發出清脆風鈴聲。' },
        { stage: 1, name: '雲朵雀兒', type: 'hatching', desc: '像一顆毛茸茸的小白球，撲棱著短短的嫩翅膀，呆萌可愛極了。' },
        { stage: 2, name: '風羽獸', type: 'juvenile', desc: '乘著上升氣流嬉戲的藍羽小精靈，歌聲清澈悅耳。' },
        { stage: 3, name: '鋼雲羽', type: 'growth', desc: '羽翼泛起銀白金屬光澤，既擁有雲朵的輕盈，又兼具鋼鐵般毅力。' },
        { stage: 4, name: '風翼雲雀', type: 'advanced', desc: '超音速穿梭的風神靈鳥，華麗翎羽在天際奏響歡樂運動進行曲！' },
        { stage: 5, name: '天際飛龍', type: 'deepening', bias: '協調/敏捷/專精', desc: '穿越雷雲與長空的青空飛龍神尊，引領學子在運動與知識的天際翱翔！' },
        { stage: 6, name: '銀翼羽龍', type: 'ultimate', bias: '敏捷/耐力/均衡', desc: '身披純淨銀輝羽翼的蒼穹至尊神龍，雙翼揮灑燦爛星光，庇佑學子展翅高飛！' }
      ]
    },
    shadow: {
      id: 'shadow',
      name: '韌性-暗影',
      eggName: '韌性-暗影蛋',
      element: '暗',
      color: '#9D4EDD',
      secondaryColor: '#5A189A',
      badge: '🔮 韌性暗影',
      motto: '堅忍不拔、淬鍊自我，綻放深邃幽光',
      bgGradient: 'linear-gradient(135deg, #F3E8FF 0%, #D8B4FE 100%)',
      pets: [
        { stage: 0, name: '韌性-暗影蛋', type: 'egg', desc: '深紫色晶石外殼流轉著星空微塵，散發沉著堅定的神秘能量。' },
        { stage: 1, name: '影影獸', type: 'hatching', desc: '長著一雙紫葡萄般發亮的大眼睛，害羞時會躲進自己的影子裡。' },
        { stage: 2, name: '暗影狼', type: 'juvenile', desc: '月光下悄然奔馳的靈巧幼狼，眼神堅毅、意志如鐵。' },
        { stage: 3, name: '影刃獸', type: 'growth', desc: '身手敏捷如黑曜石疾風的小靈獸，利爪泛著幽紫微芒，活力十足！' },
        { stage: 4, name: '幽炎狼', type: 'advanced', desc: '身披深邃幽藍星焰的守護神狼，眼神如炬，在困難面前堅毅守護同伴！' },
        { stage: 5, name: '虛空守護者', type: 'deepening', bias: '耐力/協調/均衡', desc: '掌握次元空間與守護之力的至高神尊，萬物莫摧、沉穩浩瀚。' },
        { stage: 6, name: '夜幕幽龍', type: 'ultimate', bias: '敏捷/肌力/專精', desc: '身披無垠暗夜星幕的至尊暗影神龍，雙翼遮蔽星月，蘊含深不可測的守護神威！' }
      ]
    }
  },

  // 浪漫專屬飾品定義 (PDF 第四頁: 當第 3 能力 >= 15% 時自動佩戴)
  ROMANTIC_ACCESSORIES: {
    endurance: {
      id: 'heart_aura',
      name: '心動光環',
      ability: 'endurance',
      icon: '💖',
      desc: '粉彩愛心在頭頂溫柔旋轉，散發暖洋洋的安心微光'
    },
    coordination: {
      id: 'star_note',
      name: '星願音符',
      ability: 'coordination',
      icon: '🎵',
      desc: '琉璃色高音符在身旁輕巧躍動，每走一步都響起銀鈴音律'
    },
    agility: {
      id: 'feather_ribbon',
      name: '飛羽緞帶',
      ability: 'agility',
      icon: '🎀',
      desc: '輕盈透亮的櫻粉緞帶隨風飄逸，身形更加敏捷如燕'
    },
    strength: {
      id: 'brave_cloak',
      name: '小勇士披風',
      ability: 'strength',
      icon: '🦸‍♂️',
      desc: '繡著金色小星星的可愛小斗篷，充滿了滿滿的勇氣與力量'
    }
  },

  // 健康促進生命樹 5 階段 (個人每週目標基準)
  TREE_STAGES: [
    {
      level: 1,
      name: '綠色嫩芽',
      minMvpa: 0,
      desc: '在深褐色肥沃泥土中，剛剛萌發出兩片嫩綠可愛小嫩葉，水靈又富有生機🌱',
      icon: '🌱'
    },
    {
      level: 2,
      name: '成長幼苗',
      minMvpa: 60,
      desc: '幼苗向上拔高，舒展出更多翠綠青葉，在微風中輕輕搖曳，渴望更多運動陽光🌿',
      icon: '🌿'
    },
    {
      level: 3,
      name: '挺拔綠葉小樹',
      minMvpa: 150,
      desc: '樹幹挺拔筆直，枝椏間生長出豐厚綠葉，象徵學童每週運動達到 150 分鐘良好標準！🌳',
      icon: '🌳'
    },
    {
      level: 4,
      name: '繁茂大綠樹',
      minMvpa: 300,
      desc: '綠蔭如蓋、鬱鬱蔥蔥的巨木冠頂，為大家帶來清涼與滿滿的健康活力！🌲',
      icon: '🌲'
    },
    {
      level: 5,
      name: '歡樂森林樹屋遊樂園',
      minMvpa: 600,
      desc: '繁茂巨樹上建成了紅色尖頂童話樹屋！有蔚藍溜滑梯、綠葉鞦韆與攀爬梯，小朋友們在樹屋上開心地盪鞦韆、溜滑梯，歡笑聲響徹整個校園！🏡✨',
      icon: '🏰'
    }
  ],

  // 全校累積 MVPA 總時數生命樹 5 階段 (每階段應達 4,500 分鐘才晉級至下一階段)
  SCHOOL_TREE_STAGES: [
    {
      level: 1,
      name: '綠色嫩芽',
      minMvpa: 0,
      nextMvpa: 4500,
      desc: '全校運動啟程萌芽！肥沃泥土中剛萌發出兩片翠綠可愛小嫩葉，生機無限🌱',
      icon: '🌱'
    },
    {
      level: 2,
      name: '成長幼苗',
      minMvpa: 4500,
      nextMvpa: 9000,
      desc: '凝聚全校師生累計達 4,500 分鐘 MVPA 運動能量！幼苗向上拔高舒展翠綠枝葉🌿',
      icon: '🌿'
    },
    {
      level: 3,
      name: '挺拔綠葉小樹',
      minMvpa: 9000,
      nextMvpa: 13500,
      desc: '全校累積突破 9,000 分鐘！樹幹挺拔筆直，枝椏間生長出豐厚綠葉，生氣蓬勃🌳',
      icon: '🌳'
    },
    {
      level: 4,
      name: '繁茂大綠樹',
      minMvpa: 13500,
      nextMvpa: 18000,
      desc: '全校累積突破 13,500 分鐘！綠蔭如蓋的巨木樹冠，展現全校充沛健康活力🌲',
      icon: '🌲'
    },
    {
      level: 5,
      name: '歡樂森林樹屋遊樂園',
      minMvpa: 18000,
      nextMvpa: null,
      desc: '全校榮耀突破 18,000 分鐘！巨樹上落成童話樹屋、蔚藍溜滑梯與鞦韆，師生歡聚同樂🏡✨',
      icon: '🏰'
    }
  ]
};

// 匯出至全域環境
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
