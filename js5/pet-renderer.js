/**
 * 上林神寵運動養成系統 - 呆萌神寵 SVG 渲染器 (pet-renderer.js)
 * 渲染五大蛋系與 35 種神寵外觀，支援：
 * 1. 極致可愛呆萌表情切換 (正常、摸摸笑眼 > ‿ <、咀嚼 ˘ω˘、星星眼 ★ω★)
 * 2. 浪漫專屬飾品掛載 (心動光環、星願音符、飛羽緞帶、小勇士披風)
 * 3. 摸摸愛心粒子迸發與「啾~♥」彈性飄字
 * 4. 柔光光暈與呼吸飄浮微動畫
 */

class PetRenderer {
  constructor() {
    this.expression = 'normal'; // 'normal' | 'happy' | 'chewing' | 'starry'
    this.expressionTimeout = null;
  }

  setExpression(expr, durationMs = 1500) {
    this.expression = expr;
    if (this.expressionTimeout) {
      clearTimeout(this.expressionTimeout);
    }
    if (durationMs > 0) {
      this.expressionTimeout = setTimeout(() => {
        this.expression = 'normal';
        this.refreshCurrentPet();
      }, durationMs);
    }
  }

  refreshCurrentPet() {
    const container = document.getElementById('pet-display-wrapper');
    if (container && window.currentStudent) {
      this.renderPetToElement(window.currentStudent, container);
    }
  }

  /**
   * 根據蛋系、階段、分支與表情渲染完整 SVG
   */
  generatePetSvg(elementId, stage, branch = 'A', expression = 'normal', accessory = null) {
    const series = CONFIG.EGG_SERIES[elementId] || CONFIG.EGG_SERIES.flame;
    const petList = series.pets;
    let petMeta = petList.find(p => p.stage === stage && (!p.branch || p.branch === branch)) || petList[0];

    const primaryColor = series.color;
    const secondaryColor = series.secondaryColor;

    // 依階段繪製
    let bodySvg = '';
    if (stage === 0) {
      bodySvg = this.drawEgg(elementId, primaryColor, secondaryColor);
    } else if (stage === 1) {
      bodySvg = this.drawHatching(elementId, primaryColor, secondaryColor, expression);
    } else if (stage === 2) {
      bodySvg = this.drawJuvenile(elementId, primaryColor, secondaryColor, expression);
    } else if (stage === 3) {
      bodySvg = this.drawGrowth(elementId, primaryColor, secondaryColor, expression);
    } else if (stage === 4) {
      bodySvg = this.drawAdvanced(elementId, primaryColor, secondaryColor, expression);
    } else if (stage === 5) {
      bodySvg = this.drawDeepening(elementId, primaryColor, secondaryColor, expression);
    } else {
      bodySvg = this.drawUltimate(elementId, primaryColor, secondaryColor, expression);
    }

    // 飾品 SVG
    const accessorySvg = this.drawAccessory(accessory);

    return `
      <svg class="pet-svg-element expr-${expression}" viewBox="0 0 320 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="glow-${elementId}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0"/>
          </radialGradient>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#4A3E3D" flood-opacity="0.12"/>
          </filter>
          <linearGradient id="egg-grad-${elementId}" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="40%" stop-color="${primaryColor}"/>
            <stop offset="100%" stop-color="${secondaryColor}"/>
          </linearGradient>
        </defs>

        <!-- 背景柔光微塵光環 -->
        <circle cx="160" cy="160" r="130" fill="url(#glow-${elementId})" class="ambient-glow" />

        <!-- 影子 -->
        <ellipse cx="160" cy="275" rx="70" ry="16" fill="rgba(74, 62, 61, 0.15)" class="pet-ground-shadow" />

        <!-- 飾品底層 (如飛羽緞帶、斗篷) -->
        ${accessory && (accessory.id === 'brave_cloak' || accessory.id === 'feather_ribbon') ? accessorySvg : ''}

        <!-- 神寵本體 -->
        <g class="pet-body-group" filter="url(#soft-shadow)">
          ${bodySvg}
        </g>

        <!-- 飾品上層 (如心動光環、星願音符) -->
        ${accessory && (accessory.id === 'heart_aura' || accessory.id === 'star_note') ? accessorySvg : ''}
      </svg>
    `;
  }

  /**
   * 蛋期 (Stage 0)
   */
  drawEgg(elementId, c1, c2) {
    let pattern = '';
    if (elementId === 'flame') {
      pattern = `
        <path d="M140 180 Q160 140 180 180 Q160 210 140 180" fill="#FFD166" opacity="0.8"/>
        <path d="M150 170 Q160 150 170 170 Q160 190 150 170" fill="#FFF" opacity="0.9"/>
      `;
    } else if (elementId === 'wave') {
      pattern = `
        <path d="M125 180 Q160 160 195 180 Q160 200 125 180" fill="#E0F7FA" opacity="0.7"/>
        <circle cx="160" cy="140" r="10" fill="#FFFFFF" opacity="0.8"/>
      `;
    } else if (elementId === 'forest') {
      pattern = `
        <path d="M130 190 Q160 170 180 200" stroke="#2D6A4F" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="140" cy="180" r="6" fill="#A7C957"/>
        <circle cx="170" cy="185" r="7" fill="#A7C957"/>
      `;
    } else if (elementId === 'sky') {
      pattern = `
        <path d="M135 170 Q145 155 160 160 Q175 155 185 170 Q175 185 160 180 Q145 185 135 170" fill="#FFFFFF" opacity="0.85"/>
      `;
    } else { // shadow
      pattern = `
        <polygon points="160,135 175,160 160,185 145,160" fill="#E0AAFF" opacity="0.8"/>
        <circle cx="160" cy="160" r="4" fill="#FFFFFF"/>
      `;
    }

    return `
      <!-- 蛋殼 -->
      <path d="M160 70 C220 70 235 170 230 230 C225 270 95 270 90 230 C85 170 100 70 160 70 Z" 
            fill="url(#egg-grad-${elementId})" />
      <!-- 蛋紋 -->
      ${pattern}
      <!-- 蛋殼高光反光 -->
      <path d="M125 100 C140 85 165 85 175 90 C155 100 135 125 130 145 C125 130 120 110 125 100 Z" 
            fill="#FFFFFF" opacity="0.45" />
      <!-- 微微晃動問號氣泡 -->
      <circle cx="215" cy="100" r="14" fill="#FFE5EC" stroke="${c1}" stroke-width="2"/>
      <text x="215" y="105" text-anchor="middle" font-size="14" font-weight="bold" fill="${c1}">?</text>
    `;
  }

  /**
   * 孵化期 (Stage 1) - 萌萌破殼幼雛
   */
  drawHatching(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 165, expr);
    return `
      <!-- 破殼蛋巢底座 -->
      <path d="M100 230 L115 210 L135 230 L160 205 L185 230 L205 210 L220 230 C210 265 110 265 100 230 Z" 
            fill="#FFF" stroke="#E2E8F0" stroke-width="3" />
      
      <!-- 圓滾滾呆萌身體 -->
      <circle cx="160" cy="165" r="58" fill="${c1}" />
      
      <!-- 耳朵 / 觸角 / 羽冠 -->
      ${elementId === 'flame' ? `
        <path d="M160 105 Q170 80 160 65 Q150 80 160 105" fill="#FFD166" class="sway-flame"/>
      ` : elementId === 'wave' ? `
        <ellipse cx="130" cy="120" rx="8" ry="16" transform="rotate(-25 130 120)" fill="#E0F7FA"/>
        <ellipse cx="190" cy="120" rx="8" ry="16" transform="rotate(25 190 120)" fill="#E0F7FA"/>
      ` : elementId === 'forest' ? `
        <!-- 小小鹿角開雛菊 -->
        <path d="M135 120 L125 95 M125 105 L115 100" stroke="#8C5835" stroke-width="4" stroke-linecap="round"/>
        <path d="M185 120 L195 95 M195 105 L205 100" stroke="#8C5835" stroke-width="4" stroke-linecap="round"/>
        <circle cx="120" cy="95" r="5" fill="#FFE066"/>
      ` : elementId === 'sky' ? `
        <!-- 雲朵小翅膀 -->
        <ellipse cx="102" cy="170" rx="14" ry="22" transform="rotate(20 102 170)" fill="#FFF" opacity="0.9"/>
        <ellipse cx="218" cy="170" rx="14" ry="22" transform="rotate(-20 218 170)" fill="#FFF" opacity="0.9"/>
      ` : `
        <!-- 暗影小耳朵 -->
        <polygon points="120,130 135,100 145,130" fill="${c2}"/>
        <polygon points="200,130 185,100 175,130" fill="${c2}"/>
      `}

      <!-- 呆萌五官 -->
      ${face}
      
      <!-- 小胖手 -->
      <circle cx="125" cy="205" r="10" fill="${c1}"/>
      <circle cx="195" cy="205" r="10" fill="${c1}"/>
    `;
  }

  /**
   * 幼年期 (Stage 2) - 活潑靈巧小獸
   */
  drawJuvenile(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 150, expr);
    return `
      <!-- 四肢小胖腿 -->
      <ellipse cx="125" cy="240" rx="16" ry="18" fill="${c2}"/>
      <ellipse cx="195" cy="240" rx="16" ry="18" fill="${c2}"/>

      <!-- 搖搖小尾巴 -->
      <path d="M215 200 Q250 190 240 170 Q225 185 210 195" fill="${c1}" class="wag-tail"/>

      <!-- 圓潤身體 -->
      <ellipse cx="160" cy="180" rx="65" ry="60" fill="${c1}"/>
      <!-- 肚肚白色柔光 -->
      <ellipse cx="160" cy="195" rx="42" ry="36" fill="#FFF" opacity="0.65"/>

      <!-- 頭部 -->
      <circle cx="160" cy="140" r="52" fill="${c1}"/>

      <!-- 特徵特化 (角、耳、鬃毛) -->
      ${elementId === 'flame' ? `
        <!-- 熔岩獸小角 -->
        <polygon points="135,100 145,75 155,100" fill="#FF9E00"/>
        <polygon points="185,100 175,75 165,100" fill="#FF9E00"/>
      ` : elementId === 'wave' ? `
        <!-- 珊瑚獸粉晶珊瑚萌角與水珠 -->
        <path d="M125 105 C115 80 130 70 125 60 M127 75 C118 70 110 75 105 85" stroke="#FF758F" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M195 105 C205 80 190 70 195 60 M193 75 C202 70 210 75 215 85" stroke="#FF758F" stroke-width="4" stroke-linecap="round" fill="none"/>
        <circle cx="125" cy="58" r="3.5" fill="#FFCAD4"/>
        <circle cx="195" cy="58" r="3.5" fill="#FFCAD4"/>
      ` : elementId === 'forest' ? `
        <!-- 葉語鹿萌角 -->
        <path d="M130 100 L115 70 M118 85 L105 80" stroke="#6F4E37" stroke-width="4" stroke-linecap="round"/>
        <path d="M190 100 L205 70 M202 85 L215 80" stroke="#6F4E37" stroke-width="4" stroke-linecap="round"/>
      ` : elementId === 'sky' ? `
        <!-- 風羽獸羽翼 -->
        <path d="M90 150 Q70 120 105 130" fill="#ADE8F4"/>
        <path d="M230 150 Q250 120 215 130" fill="#ADE8F4"/>
      ` : `
        <!-- 暗影狼挺拔三角耳 -->
        <polygon points="120,115 135,70 150,115" fill="${c2}"/>
        <polygon points="200,115 185,70 170,115" fill="${c2}"/>
      `}

      <!-- 五官 -->
      ${face}
    `;
  }

  /**
   * 成長期 (Stage 3) - 少年守護者
   */
  drawGrowth(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 135, expr);
    return `
      <!-- 威武後足 -->
      <rect x="110" y="215" width="28" height="45" rx="14" fill="${c2}"/>
      <rect x="182" y="215" width="28" height="45" rx="14" fill="${c2}"/>

      <!-- 飄逸披甲身軀 -->
      <path d="M115 150 C110 230 210 230 205 150 C200 130 120 130 115 150 Z" fill="${c1}"/>
      <path d="M130 160 C130 215 190 215 190 160 Z" fill="#FFFFFF" opacity="0.4"/>

      <!-- 胸前能量徽甲 -->
      <circle cx="160" cy="185" r="14" fill="${c2}" stroke="#FFF" stroke-width="3"/>
      <text x="160" y="190" text-anchor="middle" font-size="12" fill="#FFF">✦</text>

      <!-- 頭部 -->
      <circle cx="160" cy="125" r="48" fill="${c1}"/>

      <!-- 元素特色披肩/神龍鱗角 -->
      ${elementId === 'flame' ? `
        <!-- 烈焰獸火焰小鬃毛與毛茸茸萌耳 -->
        <circle cx="125" cy="95" r="14" fill="#FF9E00"/>
        <circle cx="195" cy="95" r="14" fill="#FF9E00"/>
        <circle cx="125" cy="95" r="8" fill="#FFE5EC"/>
        <circle cx="195" cy="95" r="8" fill="#FFE5EC"/>
        <path d="M140 85 Q160 55 180 85 Q160 70 140 85 Z" fill="#FFD166"/>
      ` : elementId === 'wave' ? `
        <!-- 海浪鯨龍蔚藍鯨背水鰭與浪花神紋 -->
        <path d="M115 125 Q75 135 65 160 Q85 155 110 145" fill="#0077B6" stroke="#48CAE4" stroke-width="2"/>
        <path d="M205 125 Q245 135 255 160 Q235 155 210 145" fill="#0077B6" stroke="#48CAE4" stroke-width="2"/>
        <circle cx="160" cy="80" r="10" fill="#48CAE4" opacity="0.8"/>
      ` : elementId === 'forest' ? `
        <!-- 翠羽靈鹿翡翠萌角與清晨露珠 -->
        <path d="M130 95 L115 65 M118 80 L105 75" stroke="#2D6A4F" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M190 95 L205 65 M202 80 L215 75" stroke="#2D6A4F" stroke-width="4.5" stroke-linecap="round"/>
        <circle cx="115" cy="65" r="4" fill="#52B788"/>
        <circle cx="205" cy="65" r="4" fill="#52B788"/>
      ` : elementId === 'sky' ? `
        <!-- 鋼雲羽金屬翅膀 -->
        <path d="M80 135 L40 110 L75 160 Z" fill="#CAF0F8" stroke="#90E0EF" stroke-width="2"/>
        <path d="M240 135 L280 110 L245 160 Z" fill="#CAF0F8" stroke="#90E0EF" stroke-width="2"/>
      ` : `
        <!-- 影刃獸疾風利爪與幽紫星芒 -->
        <path d="M125 105 Q110 75 130 65 Q145 85 140 105" fill="#7209B7"/>
        <path d="M195 105 Q210 75 190 65 Q175 85 180 105" fill="#7209B7"/>
        <circle cx="160" cy="85" r="8" fill="#9D4EDD" opacity="0.8"/>
      `}

      <!-- 五官 -->
      ${face}
    `;
  }

  /**
   * 進階期 (Stage 4) - 威風凜凜守護神獸
   */
  drawAdvanced(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 130, expr);
    return `
      <!-- 宏大羽翼或光輪背景 -->
      <circle cx="160" cy="150" r="105" fill="none" stroke="${c1}" stroke-width="3" stroke-dasharray="10 8" opacity="0.6" class="spin-slow"/>

      <!-- 強健四肢 -->
      <path d="M95 210 L105 260 L135 260 L130 205 Z" fill="${c2}"/>
      <path d="M225 210 L215 260 L185 260 L190 205 Z" fill="${c2}"/>

      <!-- 雄偉身軀 -->
      <path d="M105 140 C100 235 220 235 215 140 C200 115 120 115 105 140 Z" fill="${c1}"/>
      
      <!-- 頭部 -->
      <circle cx="160" cy="120" r="50" fill="${c1}"/>

      <!-- 神級鬃毛/光冕/鹿角/神龍岩甲 -->
      ${elementId === 'flame' ? `
        <!-- 岩甲龍神龍巨角與重裝金紅岩甲 -->
        <polygon points="160,40 175,85 145,85" fill="#FFD166" stroke="#E63946" stroke-width="2"/>
        <polygon points="125,55 145,95 120,95" fill="#FF9E00" stroke="#D90429" stroke-width="1.5"/>
        <polygon points="195,55 175,95 200,95" fill="#FF9E00" stroke="#D90429" stroke-width="1.5"/>
        <!-- 兩側岩甲肩刺 -->
        <polygon points="90,140 70,115 105,130" fill="#E63946"/>
        <polygon points="230,140 250,115 215,130" fill="#E63946"/>
      ` : elementId === 'wave' ? `
        <!-- 洄流海龍琉璃水龍神冠與海龍之鬚 -->
        <path d="M160 55 C175 35 190 55 180 70 C195 65 200 85 185 95" stroke="#0077B6" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M115 120 Q80 125 70 150 M205 120 Q240 125 250 150" stroke="#48CAE4" stroke-width="4" fill="none" stroke-linecap="round"/>
      ` : elementId === 'forest' ? `
        <!-- 枯地龍獸大地龍角與磐石厚甲 -->
        <polygon points="120,60 140,95 115,95" fill="#2D6A4F" stroke="#1B4332" stroke-width="2"/>
        <polygon points="200,60 180,95 205,95" fill="#2D6A4F" stroke="#1B4332" stroke-width="2"/>
        <path d="M90 140 Q65 170 100 170" fill="#40916C" stroke="#1B4332" stroke-width="2"/>
        <path d="M230 140 Q255 170 220 170" fill="#40916C" stroke="#1B4332" stroke-width="2"/>
      ` : elementId === 'sky' ? `
        <!-- 風翼雲雀靈動雲羽與風神靈翼 -->
        <path d="M75 135 C30 110 50 70 95 95 Z" fill="#90E0EF" stroke="#0077B6" stroke-width="2"/>
        <path d="M245 135 C290 110 270 70 225 95 Z" fill="#90E0EF" stroke="#0077B6" stroke-width="2"/>
        <path d="M160 85 Q165 55 175 60 Q165 75 160 85" fill="#0077B6"/>
      ` : `
        <!-- 幽炎狼幽藍火焰鬃毛與暗影狼爪 -->
        <path d="M110 95 Q85 65 115 50 Q135 75 125 100" fill="#7209B7" stroke="#9D4EDD" stroke-width="1.5"/>
        <path d="M210 95 Q235 65 205 50 Q185 75 195 100" fill="#7209B7" stroke="#9D4EDD" stroke-width="1.5"/>
        <circle cx="160" cy="120" r="65" stroke="#7209B7" stroke-width="5" fill="none" opacity="0.8"/>
      `}

      <!-- 五官 -->
      ${face}
    `;
  }

  /**
   * 深化期 (Stage 5) - 超凡靈動深化神尊 (熾羽鳳凰, 海浪鯨龍, 巨木守護者, 天際飛龍, 虛空守護者)
   */
  drawDeepening(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 130, expr);

    return `
      <!-- 神聖九彩神光背景 -->
      <circle cx="160" cy="150" r="120" fill="none" stroke="url(#egg-grad-${elementId})" stroke-width="6" opacity="0.75" class="spin-slow"/>
      <circle cx="160" cy="150" r="90" fill="none" stroke="#FFF" stroke-width="2" stroke-dasharray="6 6" opacity="0.8"/>

      <!-- 神尊身軀 -->
      <path d="M90 140 C85 250 235 250 230 140 C210 100 110 100 90 140 Z" fill="${c1}"/>
      
      <!-- 華麗流光背翼 / 翱翔型神聖羽翼 (鳳凰、鯨龍、巨木、飛龍、虛空) -->
      <path d="M60 120 C-10 60 40 10 100 70 Z" fill="${c2}" opacity="0.9"/>
      <path d="M260 120 C330 60 280 10 220 70 Z" fill="${c2}" opacity="0.9"/>
      <!-- 神聖皇冠 / 戰神雙角 / 守護龍冠 / 世界樹藤冠 / 銀翼天冠 -->
      ${elementId === 'flame' ? `
        <!-- 焰角戰獸戰神之角 -->
        <polygon points="125,75 100,25 140,55" fill="#F77F00" stroke="#FFD166" stroke-width="2"/>
        <polygon points="195,75 220,25 180,55" fill="#F77F00" stroke="#FFD166" stroke-width="2"/>
        <polygon points="145,60 160,30 175,60" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
      ` : elementId === 'wave' ? `
        <!-- 匯流守護龍深海守護龍冠與碧水靈珠 -->
        <path d="M120 70 Q160 30 200 70" stroke="#0077B6" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="160" cy="50" r="10" fill="#48CAE4" stroke="#FFF" stroke-width="2.5"/>
        <polygon points="145,75 150,55 160,70 170,55 175,75" fill="#FFD166" stroke="#FFF" stroke-width="1.5"/>
      ` : elementId === 'forest' ? `
        <!-- 藤蔓守護獸萬千柔韌神藤花冠與翡翠靈印 -->
        <path d="M110 70 Q130 35 160 50 Q190 35 210 70" stroke="#2D6A4F" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="160" cy="48" r="9" fill="#52B788" stroke="#D8F3DC" stroke-width="2"/>
        <circle cx="130" cy="52" r="5" fill="#74C69D"/>
        <circle cx="190" cy="52" r="5" fill="#74C69D"/>
        <polygon points="150,68 160,48 170,68" fill="#FFD166" stroke="#FFF" stroke-width="1.5"/>
      ` : elementId === 'sky' ? `
        <!-- 天際飛龍蒼穹神龍青翼與青空靈珠 -->
        <path d="M55 115 C-10 55 35 5 95 65 Z" fill="#90E0EF" stroke="#0077B6" stroke-width="2.5" opacity="0.95"/>
        <path d="M265 115 C330 55 285 5 225 65 Z" fill="#90E0EF" stroke="#0077B6" stroke-width="2.5" opacity="0.95"/>
        <polygon points="135,75 115,30 145,55" fill="#0077B6" stroke="#90E0EF" stroke-width="1.5"/>
        <polygon points="185,75 205,30 175,55" fill="#0077B6" stroke="#90E0EF" stroke-width="1.5"/>
        <polygon points="148,65 160,42 172,65" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
        <circle cx="160" cy="38" r="5" fill="#0077B6"/>
      ` : elementId === 'shadow' ? `
        <!-- 虛空守護者次元空間神環與虛空紫晶冕 -->
        <circle cx="160" cy="65" r="16" fill="none" stroke="#9D4EDD" stroke-width="4" stroke-dasharray="4 3"/>
        <polygon points="140,80 150,55 160,75 170,55 180,80" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
        <circle cx="160" cy="45" r="7" fill="#5A189A" stroke="#9D4EDD" stroke-width="2"/>
      ` : `
        <polygon points="140,80 150,55 160,75 170,55 180,80" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
      `}

      <!-- 頭部 -->
      <circle cx="160" cy="125" r="54" fill="${c1}"/>
      
      <!-- 五官 -->
      ${face}

      <!-- 額頭神印 -->
      <circle cx="160" cy="98" r="7" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
    `;
  }

  /**
   * 最終期 (Stage 6) - 天地至尊榮耀神獸 (熾羽鳳凰, 滄浪獸, 巨木守護者, 銀翼羽龍, 夜幕幽龍)
   */
  drawUltimate(elementId, c1, c2, expr) {
    const face = this.getFaceSvg(160, 130, expr);

    return `
      <!-- 至尊星河光輪背景 -->
      <circle cx="160" cy="150" r="125" fill="none" stroke="url(#egg-grad-${elementId})" stroke-width="7" opacity="0.85" class="spin-slow"/>
      <circle cx="160" cy="150" r="95" fill="none" stroke="#FFD166" stroke-width="3" stroke-dasharray="8 6" opacity="0.9"/>

      <!-- 神尊身軀 -->
      <path d="M85 140 C80 255 240 255 235 140 C215 95 105 95 85 140 Z" fill="${c1}"/>
      
      <!-- 霸氣戰甲與戰神戰刃 / 至尊鳳凰天羽 / 滄浪神威 / 巨木神枝 / 銀翼神羽 / 夜幕龍翼 -->
      ${elementId === 'flame' ? `
        <!-- 熾羽鳳凰九天神火流光天羽 -->
        <path d="M70 140 C-20 70 30 0 110 50 Z" fill="#FF5C8A" stroke="#FFD166" stroke-width="2"/>
        <path d="M250 140 C340 70 290 0 210 50 Z" fill="#FF5C8A" stroke="#FFD166" stroke-width="2"/>
        <path d="M65 170 C0 130 40 80 100 110 Z" fill="#FF9E00" opacity="0.85"/>
        <path d="M255 170 C320 130 280 80 220 110 Z" fill="#FF9E00" opacity="0.85"/>
        <!-- 鳳凰神冕三叉翎羽 -->
        <polygon points="140,75 130,20 150,50" fill="#FFD166" stroke="#FFF" stroke-width="1.5"/>
        <polygon points="160,70 160,10 160,50" fill="#FFE66D" stroke="#FFF" stroke-width="2"/>
        <polygon points="180,75 190,20 170,50" fill="#FFD166" stroke="#FFF" stroke-width="1.5"/>
      ` : elementId === 'wave' ? `
        <!-- 滄浪獸至尊滔天碧浪戰刃與滄海神環 -->
        <path d="M70 155 Q20 185 60 215 Z" fill="#0077B6" stroke="#48CAE4" stroke-width="2"/>
        <path d="M250 155 Q300 185 260 215 Z" fill="#0077B6" stroke="#48CAE4" stroke-width="2"/>
        <!-- 滄海至尊浪華神冕 -->
        <path d="M120 65 Q135 25 145 55 Q160 15 175 55 Q185 25 200 65" stroke="#48CAE4" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="160" cy="40" r="9" fill="#03045E" stroke="#FFD166" stroke-width="2.5"/>
      ` : elementId === 'forest' ? `
        <!-- 巨木守護者千年神木古藤戰甲與萬木之源神枝 -->
        <path d="M65 150 Q15 175 55 210 Z" fill="#1B4332" stroke="#52B788" stroke-width="2"/>
        <path d="M255 150 Q305 175 265 210 Z" fill="#1B4332" stroke="#52B788" stroke-width="2"/>
        <!-- 世界樹神木神冠 -->
        <path d="M110 70 Q130 20 160 45 Q190 20 210 70" stroke="#2D6A4F" stroke-width="6" fill="none" stroke-linecap="round"/>
        <circle cx="160" cy="35" r="10" fill="#52B788" stroke="#FFD166" stroke-width="2.5"/>
        <circle cx="135" cy="40" r="7" fill="#74C69D"/>
        <circle cx="185" cy="40" r="7" fill="#74C69D"/>
        <polygon points="148,60 160,35 172,60" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
      ` : elementId === 'sky' ? `
        <!-- 銀翼羽龍至尊純白神龍羽翼與銀輝星冕 -->
        <path d="M60 130 C-30 60 20 -10 100 45 Z" fill="#E0F2FE" stroke="#0077B6" stroke-width="3"/>
        <path d="M260 130 C350 60 300 -10 220 45 Z" fill="#E0F2FE" stroke="#0077B6" stroke-width="3"/>
        <path d="M55 165 C-5 125 35 75 95 105 Z" fill="#CAF0F8" opacity="0.85"/>
        <path d="M265 165 C325 125 285 75 225 105 Z" fill="#CAF0F8" opacity="0.85"/>
        <!-- 銀輝星冕與至尊龍角 -->
        <polygon points="125,80 100,20 140,55" fill="#0077B6" stroke="#E0F2FE" stroke-width="2"/>
        <polygon points="195,80 220,20 180,55" fill="#0077B6" stroke="#E0F2FE" stroke-width="2"/>
        <polygon points="145,60 160,25 175,60" fill="#FFD166" stroke="#FFF" stroke-width="2.5"/>
        <circle cx="160" cy="20" r="6" fill="#48CAE4" stroke="#FFF" stroke-width="2"/>
      ` : elementId === 'shadow' ? `
        <!-- 夜幕幽龍至尊暗夜星幕黑晶龍翼與暗影神冕 -->
        <path d="M65 140 C-25 70 25 -5 105 45 Z" fill="#3C096C" stroke="#7209B7" stroke-width="3"/>
        <path d="M255 140 C345 70 295 -5 215 45 Z" fill="#3C096C" stroke="#7209B7" stroke-width="3"/>
        <path d="M60 170 C0 130 40 80 100 110 Z" fill="#5A189A" opacity="0.85"/>
        <path d="M260 170 C320 130 280 80 220 110 Z" fill="#5A189A" opacity="0.85"/>
        <!-- 暗夜黑晶龍角與至尊星印 -->
        <polygon points="125,80 105,25 140,55" fill="#240046" stroke="#9D4EDD" stroke-width="2"/>
        <polygon points="195,80 215,25 180,55" fill="#240046" stroke="#9D4EDD" stroke-width="2"/>
        <polygon points="145,60 160,30 175,60" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
        <circle cx="160" cy="25" r="6" fill="#9D4EDD" stroke="#FFF" stroke-width="2"/>
      ` : `
        <path d="M70 160 L35 195 L80 205 Z" fill="${c2}"/>
        <path d="M250 160 L285 195 L240 205 Z" fill="${c2}"/>
        <!-- 戰神之角與星皇金冠 -->
        <polygon points="130,85 110,35 145,65" fill="#F77F00"/>
        <polygon points="190,85 210,35 175,65" fill="#F77F00"/>
        <polygon points="150,60 160,35 170,60" fill="#FFD166" stroke="#FFF" stroke-width="2"/>
      `}

      <!-- 頭部 -->
      <circle cx="160" cy="125" r="56" fill="${c1}"/>
      
      <!-- 五官 -->
      ${face}

      <!-- 額頭神印 -->
      <circle cx="160" cy="96" r="8" fill="#FFD166" stroke="#FFF" stroke-width="2.5"/>
    `;
  }

  /**
   * 呆萌五官表情生成器
   */
  getFaceSvg(cx, cy, expr) {
    const eyeDist = 26;
    const eyeY = cy - 4;
    const blushY = cy + 12;

    let eyes = '';
    let mouth = '';

    if (expr === 'happy') {
      // 摸摸撒嬌瞇眼笑 (> ‿ <)
      eyes = `
        <!-- 左笑眼 > -->
        <path d="${cx - eyeDist - 12} ${eyeY - 7} L${cx - eyeDist + 4} ${eyeY} L${cx - eyeDist - 12} ${eyeY + 7}" 
              stroke="#4A3E3D" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- 右笑眼 < -->
        <path d="${cx + eyeDist + 12} ${eyeY - 7} L${cx + eyeDist - 4} ${eyeY} L${cx + eyeDist + 12} ${eyeY + 7}" 
              stroke="#4A3E3D" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      `;
      mouth = `
        <!-- 甜甜開懷大笑口 -->
        <path d="${cx - 10} ${cy + 10} Q${cx} ${cy + 22} ${cx + 10} ${cy + 10} Z" fill="#FF758F" stroke="#4A3E3D" stroke-width="2.5"/>
      `;
    } else if (expr === 'chewing') {
      // 咀嚼嚼表情 ( ˘ω˘ )
      eyes = `
        <!-- 享受瞇眼 ˘ ˘ -->
        <path d="${cx - eyeDist - 10} ${eyeY} Q${cx - eyeDist} ${eyeY + 8} ${cx - eyeDist + 10} ${eyeY}" 
              stroke="#4A3E3D" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="${cx + eyeDist - 10} ${eyeY} Q${cx + eyeDist} ${eyeY + 8} ${cx + eyeDist + 10} ${eyeY}" 
              stroke="#4A3E3D" stroke-width="4" stroke-linecap="round" fill="none"/>
      `;
      mouth = `
        <!-- 鼓起腮幫子咀嚼口 ω -->
        <path d="${cx - 10} ${cy + 12} Q${cx - 5} ${cy + 18} ${cx} ${cy + 14} Q${cx + 5} ${cy + 18} ${cx + 10} ${cy + 12}" 
              stroke="#4A3E3D" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    } else if (expr === 'starry') {
      // 星星眼 (★ω★)
      eyes = `
        <text x="${cx - eyeDist}" y="${eyeY + 8}" text-anchor="middle" font-size="22" fill="#FFD166" font-weight="bold">★</text>
        <text x="${cx + eyeDist}" y="${eyeY + 8}" text-anchor="middle" font-size="22" fill="#FFD166" font-weight="bold">★</text>
      `;
      mouth = `
        <circle cx="${cx}" cy="${cy + 14}" r="6" fill="#FF758F"/>
      `;
    } else {
      // 正常呆萌大圓眼 (・ω・)
      eyes = `
        <!-- 左眼 -->
        <circle cx="${cx - eyeDist}" cy="${eyeY}" r="9" fill="#4A3E3D"/>
        <circle cx="${cx - eyeDist + 3}" cy="${eyeY - 3}" r="3.5" fill="#FFFFFF"/>
        <!-- 右眼 -->
        <circle cx="${cx + eyeDist}" cy="${eyeY}" r="9" fill="#4A3E3D"/>
        <circle cx="${cx + eyeDist + 3}" cy="${eyeY - 3}" r="3.5" fill="#FFFFFF"/>
      `;
      mouth = `
        <!-- 呆萌貓咪嘴 ω -->
        <path d="${cx - 8} ${cy + 11} Q${cx - 4} ${cy + 16} ${cx} ${cy + 12} Q${cx + 4} ${cy + 16} ${cx + 8} ${cy + 11}" 
              stroke="#4A3E3D" stroke-width="3" stroke-linecap="round" fill="none"/>
      `;
    }

    return `
      <!-- 害羞粉嫩腮紅 -->
      <ellipse cx="${cx - eyeDist - 12}" cy="${blushY}" rx="9" ry="6" fill="#FF758F" opacity="0.6"/>
      <ellipse cx="${cx + eyeDist + 12}" cy="${blushY}" rx="9" ry="6" fill="#FF758F" opacity="0.6"/>
      <!-- 眼睛 -->
      ${eyes}
      <!-- 嘴巴 -->
      ${mouth}
    `;
  }

  /**
   * 浪漫飾品繪製
   */
  drawAccessory(accessory) {
    if (!accessory) return '';

    if (accessory.id === 'heart_aura') {
      // 心動光環：頭頂旋轉的櫻粉愛心
      return `
        <g class="accessory-heart-aura" transform="translate(160, 40)">
          <path d="M0 -15 C-12 -30 -30 -10 0 15 C30 -10 12 -30 0 -15 Z" fill="#FF758F" opacity="0.85" />
          <path d="M-40 -5 C-50 -15 -60 0 -40 15 C-20 0 -30 -15 -40 -5 Z" fill="#FFCAD4" opacity="0.7" transform="scale(0.6)"/>
          <path d="M40 -5 C30 -15 20 0 40 15 C60 0 50 -15 40 -5 Z" fill="#FFCAD4" opacity="0.7" transform="scale(0.6)"/>
        </g>
      `;
    } else if (accessory.id === 'star_note') {
      // 星願音符：身旁躍動的琉璃音符
      return `
        <g class="accessory-star-note">
          <text x="60" y="110" font-size="28" fill="#48CAE4" class="float-note-1">🎵</text>
          <text x="240" y="90" font-size="24" fill="#9D4EDD" class="float-note-2">🎶</text>
          <text x="250" y="170" font-size="20" fill="#FFD166" class="float-note-3">✨</text>
        </g>
      `;
    } else if (accessory.id === 'feather_ribbon') {
      // 飛羽緞帶：身後飄動的輕盈流光緞帶
      return `
        <g class="accessory-feather-ribbon">
          <path d="M120 180 C60 190 30 250 40 280 C60 250 80 210 120 195 Z" fill="#FF758F" opacity="0.75"/>
          <path d="M200 180 C260 190 290 250 280 280 C260 250 240 210 200 195 Z" fill="#52B788" opacity="0.75"/>
        </g>
      `;
    } else if (accessory.id === 'brave_cloak') {
      // 小勇士披風：繡著小星星的可愛小斗篷
      return `
        <g class="accessory-brave-cloak">
          <path d="M110 160 C70 210 80 270 95 275 C125 240 120 190 135 170 Z" fill="#F77F00" opacity="0.9"/>
          <path d="M210 160 C250 210 240 270 225 275 C195 240 200 190 185 170 Z" fill="#F77F00" opacity="0.9"/>
        </g>
      `;
    }
    return '';
  }

  /**
   * 整合真實圖片與 SVG 回退的通用渲染方法 (支援自訂圖片上傳與 assets/pets/ 本地圖檔)
   */
  generatePetHtml(elementId, stage, branch = 'A', expression = 'normal', accessory = null) {
    const series = CONFIG.EGG_SERIES[elementId] || CONFIG.EGG_SERIES.flame;
    const petList = series.pets;
    const petMeta = petList.find(p => p.stage === stage && (!p.branch || p.branch === branch)) || petList[0];
    const petName = petMeta.name;

    // 檢查是否有上傳或儲存之自訂 Base64 圖片
    const customImg = window.storageManager ? window.storageManager.getCustomPetImage(petName) : null;
    const defaultImagePath = `assets/pets/${encodeURIComponent(petName)}.png`;
    const aliasImagePath = `assets/pets/${elementId}_${stage}.png`;
    const imgSrc = customImg || defaultImagePath;

    // SVG 備份繪製
    const svgFallback = this.generatePetSvg(elementId, stage, branch, expression, accessory);
    const accessorySvg = this.drawAccessory(accessory);

    return `
      <div class="pet-figure-wrapper expr-${expression}" style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <!-- 真實圖片載入層 (若圖片存在則優先顯示) -->
        <img src="${imgSrc}" 
             alt="${petName}"
             class="pet-raster-display-img"
             data-alias="${aliasImagePath}"
             style="max-width: 88%; max-height: 88%; object-fit: contain; filter: drop-shadow(0 14px 28px rgba(74, 62, 61, 0.22)); ${customImg ? 'display: block;' : 'display: none;'}"
             onload="this.style.display='block'; const fb = this.parentElement.querySelector('.pet-svg-fallback-box'); if (fb) fb.style.display='none';"
             onerror="if(!this.dataset.triedAlias) { this.dataset.triedAlias = '1'; this.src = this.dataset.alias; } else { this.style.display='none'; const fb = this.parentElement.querySelector('.pet-svg-fallback-box'); if (fb) fb.style.display='block'; }" />

        <!-- 向量 SVG 備援繪製層 -->
        <div class="pet-svg-fallback-box" style="${customImg ? 'display: none;' : 'display: block;'} width: 100%; height: 100%;">
          ${svgFallback}
        </div>

        <!-- 飾品疊加層 (若有圖片且配戴飾品時浮現) -->
        ${accessory ? `
          <div class="pet-accessory-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
            <svg viewBox="0 0 320 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              ${accessorySvg}
            </svg>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染至指定 DOM 元素
   */
  renderPetToElement(student, element) {
    if (!element || !student) return;

    const eggId = student.eggSeries || 'flame';
    const totalExp = student.totalExp || 0;
    const stageInfo = ShanglinAlgorithm.getEvolutionStage(totalExp);
    const structure = ShanglinAlgorithm.determineAbilityStructure(student.abilities || {});
    const branch = student.ultimateBranch || 'A';

    element.innerHTML = this.generatePetHtml(eggId, stageInfo.currentStage, branch, this.expression, structure.accessory);
  }

  /**
   * 觸發摸摸撒嬌愛心粒子與文字冒泡特效
   */
  triggerPetLoveEffect(containerElement, clientX, clientY) {
    if (!containerElement) return;

    // 設定呆萌笑眼表情
    this.setExpression('happy', 1400);
    this.refreshCurrentPet();

    // 隨機抽選可愛撒嬌飄字反應
    const cuteReactions = [
      '啾~♥',
      '呼嚕嚕~✨',
      '好開心~ ( > ‿ < )',
      '摸摸好舒服喔~🌸',
      '最喜歡你了！💖',
      '謝謝主人~🌟',
      '滿滿活力！🍀',
      '蹭蹭~嘻嘻！🌈'
    ];
    const chosenText = cuteReactions[Math.floor(Math.random() * cuteReactions.length)];

    // 播放清脆純淨的多樣化萌寵音效 (貓咪水滴、八音盒鐘琴、彈簧啾啾、浪漫豎琴、歡樂氣泡)
    if (window.soundEngine) {
      window.soundEngine.playPetCuddleSound();
    }

    const rect = containerElement.getBoundingClientRect();
    const x = clientX ? clientX - rect.left : rect.width / 2;
    const y = clientY ? clientY - rect.top : rect.height / 2;

    // 建立文字氣泡
    const textPop = document.createElement('div');
    textPop.className = 'love-text-bubble';
    textPop.textContent = chosenText;
    textPop.style.left = `${x}px`;
    textPop.style.top = `${y - 20}px`;
    containerElement.appendChild(textPop);

    // 建立 5~7 顆愛心微粒
    for (let i = 0; i < 6; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart-particle';
      heart.innerHTML = '💖';
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 40;
      heart.style.left = `${x + offsetX}px`;
      heart.style.top = `${y + offsetY}px`;
      heart.style.animationDelay = `${i * 0.08}s`;
      containerElement.appendChild(heart);

      setTimeout(() => heart.remove(), 1600);
    }

    setTimeout(() => textPop.remove(), 1600);
  }
}

// 實例化全域神寵渲染器
var petRenderer = null;
if (typeof window !== 'undefined') {
  window.petRenderer = new PetRenderer();
  petRenderer = window.petRenderer;
}
