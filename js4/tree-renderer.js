/**
 * 上林神寵運動養成系統 - 健康促進生命樹 SVG 渲染器 (tree-renderer.js)
 * 完全依據 PDF-TREE 規範繪製五大生長階段：
 * 1. 綠色小嫩芽 (Sprout)
 * 2. 成長小樹苗 (Sapling)
 * 3. 挺拔綠葉小樹 (Young Tree)
 * 4. 繁茂大綠樹 (Lush Mature Tree)
 * 5. 歡樂森林樹屋遊樂園 (Playground Treehouse with Slide, Swing & Kids)
 */

class TreeRenderer {
  /**
   * 根據生命樹階段等級 (1~5) 與 MVPA 分鐘數渲染 SVG
   */
  generateTreeSvg(level = 1, currentMvpa = 0, targetMvpa = 150) {
    const stage = Math.min(5, Math.max(1, level));
    let treeGraphic = '';

    if (stage === 1) {
      treeGraphic = this.drawStage1Sprout();
    } else if (stage === 2) {
      treeGraphic = this.drawStage2Sapling();
    } else if (stage === 3) {
      treeGraphic = this.drawStage3YoungTree();
    } else if (stage === 4) {
      treeGraphic = this.drawStage4LushTree();
    } else {
      treeGraphic = this.drawStage5Treehouse();
    }

    return `
      <svg class="tree-svg-element stage-${stage}" viewBox="0 0 500 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sky-soft-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#E0F7FA" stop-opacity="0.8"/>
            <stop offset="60%" stop-color="#FFF" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#E8F5E9" stop-opacity="0.8"/>
          </linearGradient>
          <linearGradient id="ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#52B788"/>
            <stop offset="35%" stop-color="#40916C"/>
            <stop offset="100%" stop-color="#2D6A4F"/>
          </linearGradient>
          <linearGradient id="wood-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#8C5835"/>
            <stop offset="50%" stop-color="#A47148"/>
            <stop offset="100%" stop-color="#6F4426"/>
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#FFF3B0" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#FFE66D" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- 背景天際光與小太陽 -->
        <rect x="0" y="0" width="500" height="420" rx="24" fill="url(#sky-soft-grad)"/>
        <circle cx="420" cy="70" r="45" fill="url(#sun-glow)" class="sun-glow-anim"/>

        <!-- 飄浮白雲 -->
        <g class="floating-clouds">
          <ellipse cx="90" cy="65" rx="35" ry="16" fill="#FFFFFF" opacity="0.85"/>
          <ellipse cx="115" cy="55" rx="22" ry="18" fill="#FFFFFF" opacity="0.85"/>
          <ellipse cx="320" cy="95" rx="28" ry="12" fill="#FFFFFF" opacity="0.75"/>
        </g>

        <!-- 地面草皮斜坡 -->
        <ellipse cx="250" cy="410" rx="290" ry="70" fill="url(#ground-grad)"/>
        <ellipse cx="250" cy="390" rx="240" ry="40" fill="#74C69D" opacity="0.4"/>

        <!-- 地面小花朵 -->
        <circle cx="80" cy="375" r="4" fill="#FF758F"/>
        <circle cx="80" cy="375" r="2" fill="#FFF"/>
        <circle cx="120" cy="385" r="5" fill="#FFCAD4"/>
        <circle cx="390" cy="380" r="5" fill="#FFE66D"/>
        <circle cx="430" cy="375" r="4" fill="#FF758F"/>

        <!-- 生命樹主體 -->
        <g class="tree-main-graphic">
          ${treeGraphic}
        </g>
      </svg>
    `;
  }

  /**
   * 第 1 階：綠色小嫩芽 (Sprout)
   */
  drawStage1Sprout() {
    return `
      <!-- 沃土小土堆 -->
      <path d="M190 375 Q250 330 310 375 Z" fill="#6F4426"/>
      <ellipse cx="250" cy="360" rx="40" ry="15" fill="#58351B"/>

      <!-- 剛萌發的幼嫩莖幹 -->
      <path d="M250 355 Q248 315 250 290" stroke="#74C69D" stroke-width="7" stroke-linecap="round" fill="none"/>

      <!-- 兩片水靈靈的呆萌小嫩葉 -->
      <!-- 左嫩葉 -->
      <path d="M250 315 C215 310 205 285 220 270 C240 275 248 295 250 315 Z" fill="#52B788" class="sway-leaf-left"/>
      <!-- 右嫩葉 -->
      <path d="M250 310 C285 305 295 280 280 265 C260 270 252 290 250 310 Z" fill="#74C69D" class="sway-leaf-right"/>

      <!-- 露珠 -->
      <circle cx="225" cy="275" r="3.5" fill="#FFFFFF" opacity="0.9"/>
    `;
  }

  /**
   * 第 2 階：成長小樹苗 (Sapling)
   */
  drawStage2Sapling() {
    return `
      <!-- 泥土丘 -->
      <path d="M180 375 Q250 335 320 375 Z" fill="#6F4426"/>

      <!-- 挺立細樹幹 -->
      <path d="M245 365 Q252 300 248 230" stroke="#8C5835" stroke-width="12" stroke-linecap="round" fill="none"/>
      <!-- 分枝 -->
      <path d="M249 285 Q220 265 210 250" stroke="#8C5835" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M249 265 Q280 245 290 230" stroke="#8C5835" stroke-width="7" stroke-linecap="round" fill="none"/>

      <!-- 綠葉叢葉片 -->
      <ellipse cx="205" cy="245" rx="22" ry="15" fill="#52B788" transform="rotate(-30 205 245)"/>
      <ellipse cx="295" cy="225" rx="22" ry="15" fill="#52B788" transform="rotate(30 295 225)"/>
      <ellipse cx="248" cy="215" rx="25" ry="18" fill="#74C69D"/>
      <ellipse cx="248" cy="195" rx="20" ry="14" fill="#95D5B2"/>
    `;
  }

  /**
   * 第 3 階：挺拔綠葉小樹 (Young Tree)
   */
  drawStage3YoungTree() {
    return `
      <!-- 樹幹與樹根 -->
      <path d="M225 375 L240 240 L260 240 L275 375 Z" fill="url(#wood-grad)"/>
      <path d="M240 280 Q205 230 185 200" stroke="#8C5835" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M260 270 Q295 220 315 190" stroke="#8C5835" stroke-width="12" stroke-linecap="round" fill="none"/>

      <!-- 枝頭綠葉叢 (多個圓形綠蔭堆疊) -->
      <circle cx="180" cy="195" r="45" fill="#40916C"/>
      <circle cx="175" cy="185" r="40" fill="#52B788"/>
      <circle cx="320" cy="185" r="45" fill="#40916C"/>
      <circle cx="325" cy="175" r="40" fill="#52B788"/>
      
      <!-- 主頂冠樹葉 -->
      <circle cx="250" cy="170" r="60" fill="#2D6A4F"/>
      <circle cx="250" cy="155" r="55" fill="#52B788"/>
      <circle cx="245" cy="140" r="45" fill="#74C69D"/>
    `;
  }

  /**
   * 第 4 階：繁茂大綠樹 (Lush Mature Tree)
   */
  drawStage4LushTree() {
    return `
      <!-- 粗壯老樹幹 -->
      <path d="M210 380 Q225 250 235 190 L265 190 Q275 250 290 380 Z" fill="url(#wood-grad)"/>
      <path d="M235 230 Q170 180 145 150" stroke="#8C5835" stroke-width="18" stroke-linecap="round" fill="none"/>
      <path d="M265 220 Q330 170 355 140" stroke="#8C5835" stroke-width="18" stroke-linecap="round" fill="none"/>

      <!-- 雲朵般層疊繁茂大樹冠 -->
      <circle cx="140" cy="140" r="65" fill="#2D6A4F"/>
      <circle cx="140" cy="130" r="60" fill="#40916C"/>
      <circle cx="360" cy="130" r="65" fill="#2D6A4F"/>
      <circle cx="360" cy="120" r="60" fill="#40916C"/>

      <circle cx="250" cy="110" r="95" fill="#1B4332"/>
      <circle cx="210" cy="100" r="85" fill="#2D6A4F"/>
      <circle cx="290" cy="100" r="85" fill="#40916C"/>
      <circle cx="250" cy="90" r="80" fill="#52B788"/>
      <circle cx="250" cy="75" r="65" fill="#74C69D"/>

      <!-- 樹冠果實/花朵點綴 -->
      <circle cx="190" cy="85" r="6" fill="#FF758F"/>
      <circle cx="295" cy="80" r="6" fill="#FFD166"/>
      <circle cx="230" cy="130" r="6" fill="#FFCAD4"/>
      <circle cx="320" cy="120" r="6" fill="#FF758F"/>
    `;
  }

  /**
   * 第 5 階：歡樂森林樹屋遊樂園 (Playground Treehouse with Slide, Swing & Kids)
   * 依據 PDF-TREE 第五張插圖精心精準還原！
   */
  drawStage5Treehouse() {
    return `
      <!-- 粗壯巨木樹幹 -->
      <path d="M195 385 Q215 250 230 190 L280 190 Q295 250 315 385 Z" fill="url(#wood-grad)"/>

      <!-- 巨型樹冠 (頂部繁茂綠蔭) -->
      <circle cx="150" cy="100" r="70" fill="#40916C"/>
      <circle cx="150" cy="90" r="65" fill="#52B788"/>
      <circle cx="350" cy="90" r="75" fill="#40916C"/>
      <circle cx="350" cy="80" r="70" fill="#52B788"/>
      <circle cx="250" cy="70" r="85" fill="#2D6A4F"/>
      <circle cx="250" cy="60" r="80" fill="#52B788"/>
      <circle cx="250" cy="45" r="65" fill="#74C69D"/>

      <!-- 左側大樹枝 (掛鞦韆) -->
      <path d="M210 190 Q150 160 110 160" stroke="#8C5835" stroke-width="16" stroke-linecap="round" fill="none"/>
      <!-- 左側鞦韆枝頭綠葉 -->
      <circle cx="110" cy="150" r="35" fill="#52B788"/>

      <!-- 鞦韆繩與輪胎鞦韆 -->
      <line x1="120" y1="165" x2="110" y2="280" stroke="#4A3E3D" stroke-width="2.5"/>
      <line x1="135" y1="165" x2="125" y2="280" stroke="#4A3E3D" stroke-width="2.5"/>
      <!-- 盪鞦韆的小朋友 (黑髮粉衣小女孩) -->
      <g class="swinging-kid">
        <!-- 輪胎坐墊 -->
        <ellipse cx="118" cy="285" rx="16" ry="8" fill="#333"/>
        <ellipse cx="118" cy="285" rx="10" ry="4" fill="#222"/>
        <!-- 小女孩身體 -->
        <rect x="110" y="250" width="16" height="25" rx="6" fill="#FF758F"/>
        <!-- 小女孩頭部 -->
        <circle cx="118" cy="235" r="11" fill="#FFE5D9"/>
        <!-- 雙馬尾黑髮 -->
        <ellipse cx="108" cy="235" rx="5" ry="10" fill="#222"/>
        <ellipse cx="128" cy="235" rx="5" ry="10" fill="#222"/>
        <!-- 開心笑臉 -->
        <circle cx="115" cy="235" r="1.5" fill="#222"/>
        <circle cx="121" cy="235" r="1.5" fill="#222"/>
        <path d="M116 238 Q118 241 120 238" stroke="#222" stroke-width="1.2" fill="none"/>
      </g>

      <!-- 樹屋木造本體 (座落在樹幹中央) -->
      <!-- 樹屋底座木平台 -->
      <rect x="200" y="180" width="130" height="15" rx="4" fill="#A47148" stroke="#6F4426" stroke-width="2"/>
      <!-- 木圍欄 -->
      <path d="M205 155 L205 180 M220 155 L220 180 M235 155 L235 180 M250 155 L250 180 M315 155 L315 180 M330 155 L330 180" stroke="#6F4426" stroke-width="3"/>
      <line x1="200" y1="155" x2="330" y2="155" stroke="#6F4426" stroke-width="4"/>

      <!-- 樹屋小木屋主屋 -->
      <rect x="235" y="110" width="85" height="70" fill="#FFE8D6" stroke="#B08968" stroke-width="2.5"/>
      <!-- 拱形小木門 -->
      <path d="M255 180 L255 140 Q270 125 285 140 L285 180 Z" fill="#6F4426"/>

      <!-- 紅色童話斜屋頂 -->
      <polygon points="220,115 277,65 335,115" fill="#D90429" stroke="#9B2226" stroke-width="3"/>
      <!-- 屋頂圓形星光窗戶 -->
      <circle cx="277" cy="95" r="10" fill="#FFE5EC" stroke="#FFF" stroke-width="2"/>
      <text x="277" y="100" text-anchor="middle" font-size="12" fill="#D90429">✚</text>

      <!-- 樹屋陽台上的快樂學童們 -->
      <!-- 金髮小男孩與小女孩揮手 -->
      <circle cx="225" cy="142" r="9" fill="#FFE5D9"/>
      <path d="M216 138 Q225 130 234 138 Z" fill="#FFD166"/> <!-- 金髮 -->
      <circle cx="242" cy="142" r="9" fill="#FFE5D9"/>
      <path d="M233 138 Q242 130 251 138 Z" fill="#4A3E3D"/> <!-- 黑髮 -->

      <!-- 右側樹幹上的蔚藍溜滑梯 (Playground Slide) -->
      <path d="M305 175 Q360 210 370 290 Q380 340 435 365" stroke="#0077B6" stroke-width="24" fill="none" stroke-linecap="round"/>
      <path d="M305 175 Q360 210 370 290 Q380 340 435 365" stroke="#48CAE4" stroke-width="18" fill="none" stroke-linecap="round"/>
      <!-- 溜滑梯金屬扶手 -->
      <path d="M305 162 Q365 200 375 285 Q385 330 440 355" stroke="#CAF0F8" stroke-width="3.5" fill="none"/>

      <!-- 正從溜滑梯溜下來的小朋友 -->
      <g class="sliding-kid">
        <!-- 金髮小男孩坐著溜滑梯 -->
        <circle cx="375" cy="270" r="10" fill="#FFE5D9"/>
        <path d="M366 266 Q375 258 384 266 Z" fill="#FFD166"/>
        <rect x="365" y="278" width="16" height="18" rx="4" fill="#FF758F" transform="rotate(35 375 285)"/>
        <!-- 興奮舉高雙手 -->
        <line x1="365" y1="275" x2="355" y2="260" stroke="#FFE5D9" stroke-width="4" stroke-linecap="round"/>
      </g>

      <!-- 溜滑梯底端歡呼的小朋友 -->
      <g class="slide-bottom-kid">
        <circle cx="435" cy="325" r="10" fill="#FFE5D9"/>
        <path d="M426 322 Q435 315 444 322 Z" fill="#222"/>
        <rect x="428" y="333" width="15" height="22" rx="4" fill="#D90429"/>
      </g>

      <!-- 樹幹攀爬繩梯 (Wooden Ladder) -->
      <line x1="210" y1="195" x2="215" y2="360" stroke="#6F4426" stroke-width="3"/>
      <line x1="228" y1="195" x2="233" y2="360" stroke="#6F4426" stroke-width="3"/>
      <!-- 梯階橫木 -->
      <line x1="210" y1="215" x2="228" y2="215" stroke="#8C5835" stroke-width="3.5"/>
      <line x1="211" y1="240" x2="229" y2="240" stroke="#8C5835" stroke-width="3.5"/>
      <line x1="212" y1="265" x2="230" y2="265" stroke="#8C5835" stroke-width="3.5"/>
      <line x1="213" y1="290" x2="231" y2="290" stroke="#8C5835" stroke-width="3.5"/>
      <line x1="214" y1="315" x2="232" y2="315" stroke="#8C5835" stroke-width="3.5"/>
      <line x1="215" y1="340" x2="233" y2="340" stroke="#8C5835" stroke-width="3.5"/>

      <!-- 正在抱樹爬梯的小朋友 -->
      <circle cx="245" cy="315" r="9" fill="#FFE5D9"/>
      <path d="M237 312 Q245 306 253 312 Z" fill="#6F4426"/>
      <rect x="238" y="323" width="14" height="18" rx="4" fill="#FFB703"/>
    `;
  }

  /**
   * 渲染至指定容器 (支援個人與全校 4,500 分鐘/階模式)
   */
  renderTreeToElement(mvpaMins, container, isSchool = false) {
    if (!container) return;
    const stageInfo = ShanglinAlgorithm.getLifeTreeStage(mvpaMins, isSchool);
    const targetMvpa = stageInfo.nextMvpa || stageInfo.minMvpa || (isSchool ? 18000 : CONFIG.LIMITS.WEEKLY_MVPA_GOAL_MINS);
    const svg = this.generateTreeSvg(stageInfo.level, mvpaMins, targetMvpa);
    container.innerHTML = svg;
  }
}

// 實例化全域生命樹渲染器
var treeRenderer = null;
if (typeof window !== 'undefined') {
  window.treeRenderer = new TreeRenderer();
  treeRenderer = window.treeRenderer;
}
