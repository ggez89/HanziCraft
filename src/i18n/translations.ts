export type Language = 'en' | 'zh-Hans' | 'zh-Hant';

export interface TranslationDict {
  brandSubtitle: string;
  langName: string;

  // Mobile Tabs
  tabSetup: string;
  tabPreview: string;
  tabJumpToPreview: string;

  // Preview Toolbar
  livePreview: string;
  charsUnit: string;
  charUnitSingular: string;
  pagesUnit: string;
  pageUnitSingular: string;
  pageCounter: string;
  prevPage: string;
  nextPage: string;
  printOrSavePdf: string;

  // Controls - Title
  worksheetTitleLabel: string;
  worksheetTitlePlaceholder: string;
  worksheetTitleHint: string;

  // Controls - Characters
  charactersLabel: string;
  charactersPlaceholder: string;
  charLimitWarning: string;

  // Controls - 100 Topics Button
  browseTopicsBtn: string;
  browseTopicsSub: string;
  exploreBtn: string;
  quickPresetsLabel: string;
  presetGreetings: string;
  presetNature: string;
  presetStudy: string;
  deduplicateLabel: string;

  // Controls - Character Size
  charSizeLabel: string;
  sizeCompact: string;
  sizeSmall: string;
  sizeStandard: string;
  sizeMediumLarge: string;
  sizeLarge: string;
  sizeJumbo: string;
  sizeHelpText: string;
  sizeSpillText: string;

  // Controls - Font Style
  fontStyleLabel: string;
  sansSerifTitle: string;
  sansSerifDesc: string;
  brushTitle: string;
  brushDesc: string;
  fontStyleHint: string;

  // Controls - Layout Options
  layoutOptionsLabel: string;
  faintTraceTitle: string;
  faintTraceDesc: string;
  strokeBreakdownTitle: string;
  strokeBreakdownDesc: string;
  pinyinTitle: string;
  pinyinDesc: string;
  tianzigeTitle: string;
  tianzigeDesc: string;
  studentNameTitle: string;
  studentNameDesc: string;
  outputSettingsTitle: string;
  letterPortrait: string;
  dateFieldTitle: string;
  outputSettingsHint: string;

  // Controls - Action Buttons
  savePdfBtn: string;
  savePdfSub: string;
  printDirectBtn: string;
  printDirectSub: string;
  renderingPageStatus: string;
  savingPdfStatus: string;
  preparingPdfStatus: string;

  // Worksheet Print Page
  studentNameField: string;
  dateField: string;
  footerPageOf: string;

  // Character Modal (Interactive Animator)
  tabAnimation: string;
  tabPractice: string;
  strokesCountLabel: string;
  playBtn: string;
  pauseBtn: string;
  restartBtn: string;
  clearCanvasBtn: string;
  slowSpeed: string;
  mediumSpeed: string;
  fastSpeed: string;
  practiceHint: string;
  closeBtn: string;

  // 100 Character Library Modal
  libraryTitle: string;
  librarySubtitle: string;
  librarySetsCount: string;
  scriptSimplified: string;
  scriptTraditional: string;
  searchPlaceholder: string;
  searchResultsHeader: string;
  searchHint: string;
  noSetsFound: string;
  noSetsFoundHint: string;
  categoriesLabel: string;
  clickSetToLoad: string;
  applySet: string;
  modalDoneBtn: string;
  modeLabel: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brandSubtitle: 'Chinese Worksheet Generator',
    langName: 'English',

    tabSetup: 'Page Setup',
    tabPreview: 'Page View',
    tabJumpToPreview: 'View Worksheet Preview ({count} chars)',

    livePreview: 'Live Preview',
    charsUnit: 'chars',
    charUnitSingular: 'char',
    pagesUnit: 'pages',
    pageUnitSingular: 'page',
    pageCounter: 'Page {current} of {total}',
    prevPage: 'Previous Page',
    nextPage: 'Next Page',
    printOrSavePdf: 'Print / Save PDF',

    worksheetTitleLabel: 'Worksheet Title',
    worksheetTitlePlaceholder: 'Chinese Character Practice',
    worksheetTitleHint: 'Centered at the top of each printed page',

    charactersLabel: 'Characters to Practice',
    charactersPlaceholder: '一二三四五六七八九十',
    charLimitWarning: 'Maximum limit of 100 characters reached. Extra characters were omitted.',

    browseTopicsBtn: 'Browse 100 Themed Character Sets',
    browseTopicsSub: '10 topics · Numbers, Animals, Nature, Food...',
    exploreBtn: 'Explore',
    quickPresetsLabel: 'Quick:',
    presetGreetings: 'Greetings',
    presetNature: 'Nature',
    presetStudy: 'Study',
    deduplicateLabel: 'Remove duplicate characters',

    charSizeLabel: 'Character Size',
    sizeCompact: 'Compact',
    sizeSmall: 'Small',
    sizeStandard: 'Standard',
    sizeMediumLarge: 'Medium-Large',
    sizeLarge: 'Large',
    sizeJumbo: 'Jumbo',
    sizeHelpText: 'Fits 1 reference + {practice} practice squares per row ({trace} faint trace + {blank} blank) · {rows} rows per page.',
    sizeSpillText: ' Characters spill cleanly across {pages} pages with blank practice grids completing each page.',

    fontStyleLabel: 'Font & Stroke Style',
    sansSerifTitle: '永 · 黑体',
    sansSerifDesc: 'Sans-Serif (Modern)',
    brushTitle: '永 · 楷体',
    brushDesc: 'Brush / Calligraphy',
    fontStyleHint: 'Switches character font and stroke order between clean sans-serif and traditional brushwork for the entire page and PDF.',

    layoutOptionsLabel: 'Worksheet Layout Options',
    faintTraceTitle: 'Faint Trace Outlines',
    faintTraceDesc: 'Faint character guides for guided muscle memory',
    strokeBreakdownTitle: 'Stroke Order Breakdown',
    strokeBreakdownDesc: 'Visual progressive stroke steps above row',
    pinyinTitle: 'Pīnyīn Pronunciation',
    pinyinDesc: 'Tone-marked pinyin for each character',
    tianzigeTitle: 'Tianzige Practice Gridlines',
    tianzigeDesc: 'Cross and diagonal balance guidelines',
    studentNameTitle: 'Header Student Name Field',
    studentNameDesc: 'Prints "姓名：______" at the top',
    outputSettingsTitle: 'Output Settings',
    letterPortrait: 'US Letter (8.5 × 11") · Portrait',
    dateFieldTitle: 'Include date field ("日期：______")',
    outputSettingsHint: 'All pages are formatted for standard US Letter (8.5 × 11") paper, centered with balanced margins.',

    savePdfBtn: 'Save as PDF',
    savePdfSub: 'Direct, vector-crisp PDF document',
    printDirectBtn: 'Print Directly',
    printDirectSub: "Uses your browser's native print dialogue",
    renderingPageStatus: 'Rendering page {current} of {total}...',
    savingPdfStatus: 'Saving PDF file...',
    preparingPdfStatus: 'Preparing pages for PDF...',

    studentNameField: '姓名：',
    dateField: '日期：',
    footerPageOf: 'PAGE {current} OF {total}',

    tabAnimation: 'Stroke Order Animation',
    tabPractice: 'Freehand Canvas Practice',
    strokesCountLabel: 'Strokes:',
    playBtn: 'Play',
    pauseBtn: 'Pause',
    restartBtn: 'Restart',
    clearCanvasBtn: 'Clear Canvas',
    slowSpeed: 'Slow',
    mediumSpeed: 'Normal',
    fastSpeed: 'Fast',
    practiceHint: 'Use your mouse or finger to trace and write inside the balance grid above.',
    closeBtn: 'Close',

    libraryTitle: 'Character Library',
    librarySubtitle: 'Choose from 100 curated 10-character sets across 10 categories',
    librarySetsCount: '100 Sets',
    scriptSimplified: '简体 Simplified',
    scriptTraditional: '繁體 Traditional',
    searchPlaceholder: 'Search by topic, English name, or character (e.g. Weather, 雨)...',
    searchResultsHeader: 'Search Results ({count})',
    searchHint: 'Click any set to load 10 characters into worksheet',
    noSetsFound: 'No character sets found matching "{query}"',
    noSetsFoundHint: 'Try searching by English name, Chinese title, or an individual character',
    categoriesLabel: 'Categories ({count})',
    clickSetToLoad: 'Click a set to load',
    applySet: 'Apply',
    modalDoneBtn: 'Done',
    modeLabel: 'Mode:',
  },

  'zh-Hans': {
    brandSubtitle: '汉字字帖生成器',
    langName: '简体中文',

    tabSetup: '字帖设置',
    tabPreview: '预览页面',
    tabJumpToPreview: '查看字帖预览 ({count} 字)',

    livePreview: '实时预览',
    charsUnit: '字',
    charUnitSingular: '字',
    pagesUnit: '页',
    pageUnitSingular: '页',
    pageCounter: '第 {current} / {total} 页',
    prevPage: '上一页',
    nextPage: '下一页',
    printOrSavePdf: '打印 / 保存 PDF',

    worksheetTitleLabel: '字帖标题',
    worksheetTitlePlaceholder: '基础汉字书写练习',
    worksheetTitleHint: '居中显示在每张打印纸顶部',

    charactersLabel: '练习汉字',
    charactersPlaceholder: '一二三四五六七八九十',
    charLimitWarning: '已达到 100 字上限，多余字符已自动忽略。',

    browseTopicsBtn: '浏览 100 组精选汉字题库',
    browseTopicsSub: '10 大主题 · 数字、动物、自然、美食等',
    exploreBtn: '浏览',
    quickPresetsLabel: '快捷:',
    presetGreetings: '问候',
    presetNature: '自然',
    presetStudy: '学习',
    deduplicateLabel: '去除重复汉字',

    charSizeLabel: '汉字格大小',
    sizeCompact: '紧凑',
    sizeSmall: '偏小',
    sizeStandard: '标准',
    sizeMediumLarge: '中大',
    sizeLarge: '较大',
    sizeJumbo: '超大',
    sizeHelpText: '每行 1 个范字 + {practice} 个练习格（{trace} 个描红 + {blank} 个空白）· 每页 {rows} 行。',
    sizeSpillText: ' 超出一页的内容自动排入后续页面，多余行将自动填满空白练习格。',

    fontStyleLabel: '字体与笔顺风格',
    sansSerifTitle: '永 · 黑体',
    sansSerifDesc: '黑体（现代规范印刷）',
    brushTitle: '永 · 楷体',
    brushDesc: '楷体（传统毛笔书道）',
    fontStyleHint: '切换整页字帖及 PDF 导出的汉字字体与笔画笔顺样式。',

    layoutOptionsLabel: '排版与练习选项',
    faintTraceTitle: '浅色描红底字',
    faintTraceDesc: '提供浅色笔画描红指引，辅助形成肌肉记忆',
    strokeBreakdownTitle: '上方逐步笔顺图解',
    strokeBreakdownDesc: '在练习格上方分步拆解笔画，清晰标红新笔画',
    pinyinTitle: '拼音读音与声调',
    pinyinDesc: '在首个字上方自动标注带声调的标准汉语拼音',
    tianzigeTitle: '田字格辅助线',
    tianzigeDesc: '标准十字线与米字辅助虚线，辅助定位中心重心',
    studentNameTitle: '学生姓名横线',
    studentNameDesc: '在页眉显示 "姓名：______" 填空线',
    outputSettingsTitle: '页面输出设置',
    letterPortrait: '美式 Letter (8.5 × 11") · 纵向',
    dateFieldTitle: '包含日期横线 ("日期：______")',
    outputSettingsHint: '所有页面均针对标准 US Letter (8.5 × 11") 打印纸设计，居中排版且边距均匀。',

    savePdfBtn: '保存为 PDF',
    savePdfSub: '直接导出清晰矢量 PDF 文档',
    printDirectBtn: '直接打印',
    printDirectSub: '调用浏览器原生打印窗口，随时预览与打印',
    renderingPageStatus: '正在渲染第 {current} / {total} 页...',
    savingPdfStatus: '正在保存 PDF 文件...',
    preparingPdfStatus: '正在准备页面...',

    studentNameField: '姓名：',
    dateField: '日期：',
    footerPageOf: '第 {current} / {total} 页',

    tabAnimation: '笔顺动画演示',
    tabPractice: '手写描摹练习',
    strokesCountLabel: '笔画数:',
    playBtn: '播放',
    pauseBtn: '暂停',
    restartBtn: '重新开始',
    clearCanvasBtn: '清空画布',
    slowSpeed: '慢速',
    mediumSpeed: '正常',
    fastSpeed: '快速',
    practiceHint: '使用鼠标或手指在上方米字格内描摹练习书写。',
    closeBtn: '关闭',

    libraryTitle: '汉字主题库',
    librarySubtitle: '涵盖 10 大分类、100 组精选 10 字练习集',
    librarySetsCount: '100 组',
    scriptSimplified: '简体中文',
    scriptTraditional: '繁体中文',
    searchPlaceholder: '搜索主题、英语名称或汉字（例如：天气、Weather、雨）...',
    searchResultsHeader: '搜索结果 ({count})',
    searchHint: '点击任意主题即可将 10 个汉字载入字帖',
    noSetsFound: '未找到与 "{query}" 匹配的汉字组',
    noSetsFoundHint: '尝试输入英语名称、中文主题或单个汉字',
    categoriesLabel: '主题分类 ({count})',
    clickSetToLoad: '点击载入字帖',
    applySet: '应用',
    modalDoneBtn: '完成',
    modeLabel: '字形模式:',
  },

  'zh-Hant': {
    brandSubtitle: '漢字字帖生成器',
    langName: '繁體中文',

    tabSetup: '字帖設定',
    tabPreview: '預覽頁面',
    tabJumpToPreview: '查看字帖預覽 ({count} 字)',

    livePreview: '即時預覽',
    charsUnit: '字',
    charUnitSingular: '字',
    pagesUnit: '頁',
    pageUnitSingular: '頁',
    pageCounter: '第 {current} / {total} 頁',
    prevPage: '上一頁',
    nextPage: '下一頁',
    printOrSavePdf: '列印 / 儲存 PDF',

    worksheetTitleLabel: '字帖標題',
    worksheetTitlePlaceholder: '基礎漢字書寫練習',
    worksheetTitleHint: '置中顯示在每張列印紙頂部',

    charactersLabel: '練習漢字',
    charactersPlaceholder: '一二三四五六七八九十',
    charLimitWarning: '已達到 100 字上限，多餘字符已自動忽略。',

    browseTopicsBtn: '瀏覽 100 組精選漢字題庫',
    browseTopicsSub: '10 大主題 · 數字、動物、自然、美食等',
    exploreBtn: '瀏覽',
    quickPresetsLabel: '快捷:',
    presetGreetings: '問候',
    presetNature: '自然',
    presetStudy: '學習',
    deduplicateLabel: '去除重複漢字',

    charSizeLabel: '漢字格大小',
    sizeCompact: '緊湊',
    sizeSmall: '偏小',
    sizeStandard: '標準',
    sizeMediumLarge: '中大',
    sizeLarge: '較大',
    sizeJumbo: '超大',
    sizeHelpText: '每行 1 個範字 + {practice} 個練習格（{trace} 個描紅 + {blank} 個空白）· 每頁 {rows} 行。',
    sizeSpillText: ' 超出一頁的內容自動排入後續頁面，多餘行將自動填滿空白練習格。',

    fontStyleLabel: '字體與筆順風格',
    sansSerifTitle: '永 · 黑體',
    sansSerifDesc: '黑體（現代規範印刷）',
    brushTitle: '永 · 楷體',
    brushDesc: '楷體（傳統毛筆書道）',
    fontStyleHint: '切換整頁字帖及 PDF 導出的漢字字體與筆畫筆順樣式。',

    layoutOptionsLabel: '排版與練習選項',
    faintTraceTitle: '淺色描紅底字',
    faintTraceDesc: '提供淺色筆畫描紅指引，輔助形成肌肉記憶',
    strokeBreakdownTitle: '上方逐步筆順圖解',
    strokeBreakdownDesc: '在練習格上方分步拆解筆畫，清晰標紅新筆畫',
    pinyinTitle: '拼音讀音與聲調',
    pinyinDesc: '在首個字上方自動標註帶聲調的標準漢語拼音',
    tianzigeTitle: '田字格輔助線',
    tianzigeDesc: '標準十字線與米字輔助虛線，輔助定位中心重心',
    studentNameTitle: '學生姓名橫線',
    studentNameDesc: '在頁首顯示 "姓名：______" 填空線',
    outputSettingsTitle: '頁面輸出設定',
    letterPortrait: '美式 Letter (8.5 × 11") · 縱向',
    dateFieldTitle: '包含日期橫線 ("日期：______")',
    outputSettingsHint: '所有頁面均針對標準 US Letter (8.5 × 11") 列印紙設計，置中排版且邊距均勻。',

    savePdfBtn: '儲存為 PDF',
    savePdfSub: '直接導出清晰向量 PDF 文件',
    printDirectBtn: '直接列印',
    printDirectSub: '調用瀏覽器原生列印視窗，隨時預覽與列印',
    renderingPageStatus: '正在渲染第 {current} / {total} 頁...',
    savingPdfStatus: '正在儲存 PDF 檔案...',
    preparingPdfStatus: '正在準備頁面...',

    studentNameField: '姓名：',
    dateField: '日期：',
    footerPageOf: '第 {current} / {total} 頁',

    tabAnimation: '筆順動畫演示',
    tabPractice: '手寫描摹練習',
    strokesCountLabel: '筆畫數:',
    playBtn: '播放',
    pauseBtn: '暫停',
    restartBtn: '重新開始',
    clearCanvasBtn: '清空畫布',
    slowSpeed: '慢速',
    mediumSpeed: '正常',
    fastSpeed: '快速',
    practiceHint: '使用滑鼠或手指在上方米字格內描摹練習書寫。',
    closeBtn: '關閉',

    libraryTitle: '漢字主題庫',
    librarySubtitle: '涵蓋 10 大分類、100 組精選 10 字練習集',
    librarySetsCount: '100 組',
    scriptSimplified: '簡體中文',
    scriptTraditional: '繁體中文',
    searchPlaceholder: '搜尋主題、英語名稱或漢字（例如：天氣、Weather、雨）...',
    searchResultsHeader: '搜尋結果 ({count})',
    searchHint: '點擊任意主題即可將 10 個漢字載入字帖',
    noSetsFound: '未找到與 "{query}" 符合的漢字組',
    noSetsFoundHint: '嘗試輸入英語名稱、中文主題或單個漢字',
    categoriesLabel: '主題分類 ({count})',
    clickSetToLoad: '點擊載入字帖',
    applySet: '應用',
    modalDoneBtn: '完成',
    modeLabel: '字形模式:',
  },
};
