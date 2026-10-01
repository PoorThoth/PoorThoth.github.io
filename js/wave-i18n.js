<link rel="stylesheet" class="aplayer-secondary-style-marker" href="\assets\css\APlayer.min.css"><script src="\assets\js\APlayer.min.js" class="aplayer-secondary-script-marker"></script>/* ============================================================
   wave-i18n.js —— 中英文界面切换（文章正文不翻译）
   · 主题界面词条：从 themes/butterfly/languages/{zh-CN,en}.yml 自动配对（74 条）
   · 自定义词条 + 我的模块文案：见下方 EXTRA / STRINGS
   · 用法：WaveI18N.t("key")、WaveI18N.lang()、WaveI18N.set("en")
   · 切换后触发 window 事件 "wave:lang"，wave.js 监听并重建自定义模块
   ============================================================ */
(function () {
  "use strict";
  var THEME = { "框架": "Framework", "主题": "Theme", "复制成功": "Copy Successful", "复制失败": "Copy Failed", "浏览器不支持": "Browser Not Supported", "全部文章": "All Articles", "标签": "Tags", "分类": "Categories", "归档": "Archives", "条评论": "comments", "无标题": "Untitled", "发表于": "Created", "更新于": "Updated", "总字数": "Word Count", "阅读时长": "Reading Time", "分钟": "mins", "浏览量": "Post Views", "评论数": "Comments", "文章作者": "Author", "文章链接": "Link", "版权声明": "Copyright Notice", "相关推荐": "Related Articles", "编辑": "Edit", "返回首页": "Back to Home", "搜索": "Search", "数据加载中": "Loading Database", "搜索文章": "Search for Posts", "上一篇": "Previous", "下一篇": "Next", "评论": "Comments", "文章": "Articles", "公告": "Announcement", "最新文章": "Recent Posts", "网站信息": "Website Info", "文章数目": "Article Count", "运行时间": "Runtime", "天": "days", "最后更新时间": "Last Update", "本站总字数": "Total Word Count", "本站访客数": "Unique Visitors", "本站总浏览量": "Page Views", "查看更多": "View More", "最新评论": "Latest Comments", "加载中...": "Loading...", "无法获取评论，请确认相关配置是否正确": "Unable to retrieve comments, please check the configuration", "暂无评论": "No comments", "图片": "Image", "链接": "Link", "代码": "Code", "目录": "Table of Contents", "系列文章": "Post Series", "刚刚": "Just now", "分钟前": "minutes ago", "小时前": "hours ago", "天前": "days ago", "个月前": "months ago", "赞助": "Sponsor", "分享": "Share", "阅读模式": "Reading Mode", "简繁转换": "Toggle Between Traditional and Simplified Chinese", "日间和夜间模式切换": "Toggle Between Light and Dark Mode", "回到顶部": "Back to Top", "前往评论": "Scroll to Comments", "设置": "Settings", "单栏和双栏切换": "Toggle Between Single-column and Double-column", "聊天": "Chat", "作者": "Author", "来源": "Source", "已切换为繁体中文": "You have switched to Traditional Chinese", "已切换为简体中文": "You have switched to Simplified Chinese", "已切换为深色模式": "You have switched to Dark Mode", "已切换为浅色模式": "You have switched to Light Mode", "加载更多": "Load More", "页面未找到": "Page Not Found" };
  var EXTRA = { "首页": "Home", "归档": "Archives", "标签": "Tags", "分类": "Categories", "接单": "Hire Me", "关于": "About", "须臾的博客": "Xuyu's Blog", "须臾": "Xuyu", "接单 · 作品集": "Hire · Portfolio", "作品集": "Portfolio", "欢迎来到": "Welcome to", "加载中...": "Loading…", "站点信息": "Site Info", "网站信息": "Site Info", "我在做什么": "What I Do", "最近的写作": "Recent Writing", "更多文章": "More Posts", "合作 / 接单": "Work With Me", "技术栈": "Tech Stack", "阅读全文": "Read More", "查看全部": "View All", "全部文章": "All Posts", "文章数目 :": "Posts:", "本站总浏览量 :": "Total Views:", "本站访客数 :": "Visitors:", "最后更新时间 :": "Last Updated:", "目录": "Contents", "字体大小": "Text Size", "夜间模式": "Dark Mode", "回到顶部": "Back to Top", "搜索": "Search", "2023 年": "2023", "开始于": "Started", "Go / 量化交易系统 / AI Agent 工程": "Go / Quant Systems / AI Agent Engineering", "这是一个": "Notes on ", "贵州 · 兴义": "Guizhou · Xingyi", "贵州·兴义": "Guizhou · Xingyi", "微信号": "WeChat", "QQ号": "QQ", "微信号:PoorThoth": "WeChat: PoorThoth", "Go · 量化交易系统 · AI Agent 工程": "Go · Quant Systems · AI Agent Engineering", "接单合作：菜单「接单」": "Open for work: “Hire Me” in the menu", "清风已随万物去，徒留人间一片云。": "The wind departs with all things; a single cloud remains.", "邮箱": "Email", "博客": "Blog", "本站": "Site", "欢迎来我的博客": "Welcome to my blog", "这里记录我在后端 / 量化 / AI 工程上的实践与踩坑。": "Notes on backend, quant and AI engineering.", "需要 Go / 量化 / AI 集成方面的人手，看菜单里的「接单」。": "Need Go / quant / AI integration work? See “Hire Me”." };
  var MONTHS = { "一月": "January", "二月": "February", "三月": "March", "四月": "April", "五月": "May", "六月": "June", "七月": "July", "八月": "August", "九月": "September", "十月": "October", "十一月": "November", "十二月": "December" };
  var STRINGS = { "hero.kicker": { "zh": "Ling Guiqian · Backend · Quant Systems · AI Agent", "en": "Ling Guiqian · Backend · Quant Systems · AI Agent" }, "hero.c1": { "zh": "接单合作 · 作品集", "en": "Hire Me · Portfolio" }, "hero.c2": { "zh": "看全部文章", "en": "All Posts" }, "hero.c3": { "zh": "关于我", "en": "About Me" }, "hero.credits": { "zh": "Go|Quant|AI Agent|Tauri|UTC+8|Open for work", "en": "Go|Quant|AI Agent|Desktop|UTC+8|Open for work" }, "do.title": { "zh": "我在做什么", "en": "What I Do" }, "do.sub": { "zh": "Go 后端 · 量化系统 · AI Agent · 桌面端交付 — 都是自己动手做过的东西", "en": "Go backends · quant systems · AI agents · desktop apps — things I built with my own hands" }, "do.c1.t": { "zh": "量化交易系统（Go）", "en": "Quant Trading System (Go)" }, "do.c1.d": { "zh": "策略引擎与行情管线：K 线采集与校验、价格行为结构识别、回测、风控闸门（人工确认 / 额度 / 审计）。", "en": "Strategy engine and market-data pipeline: candle ingestion and validation, price-action structure detection, backtesting, risk gates (human confirmation / limits / audit)." }, "do.c2.t": { "zh": "AI Agent 工程", "en": "AI Agent Engineering" }, "do.c2.d": { "zh": "多智能体编排、工具调用的权限 scope 与人工确认、本地大模型推理服务——重点让它出错时不造成破坏。", "en": "Multi-agent orchestration, permission-scoped tool calls with human confirmation, local LLM inference — designed so failures cannot cause damage." }, "do.c3.t": { "zh": "业务系统与桌面端", "en": "Business Systems & Desktop" }, "do.c3.d": { "zh": "SpringBoot + Vue + MySQL 业务系统；Tauri 2 桌面客户端交付（7.9 MB 绿色包，冷启动 608 ms）。", "en": "SpringBoot + Vue + MySQL business systems; a Tauri 2 desktop client delivered (7.9 MB portable build, 608 ms cold start)." }, "idx.title": { "zh": "最近的写作", "en": "Recent Writing" }, "idx.sub": { "zh": "踩过的坑、实测算出来的数字、能复用的方法", "en": "Pitfalls, measured numbers, reusable methods" }, "idx.more": { "zh": "更早的文章", "en": "Earlier posts" }, "idx.all": { "zh": "去归档页看全部", "en": "Browse the full archive" }, "cta.h": { "zh": "合作 / 接单", "en": "Work With Me" }, "cta.p": { "zh": "正在接<b>远程兼职</b>（UTC+8，可异步交付）：Go 后端 · 数据管道 · AI 集成（本地大模型部署 / RAG / MCP 工具服务）· 全栈业务系统 · 桌面端交付。前两单可半价，换一条真实评价与案例署名授权。", "en": "Open for <b>remote part-time work</b> (UTC+8, async): Go backends · data pipelines · AI integration (local LLM deployment / RAG / MCP tool servers) · full-stack business systems · desktop apps. The first two jobs can be half price in exchange for a real review and permission to use the work as a case study." }, "cta.b1": { "zh": "看作品集与服务说明", "en": "Portfolio & services" }, "tech.title": { "zh": "技术栈", "en": "Tech Stack" }, "handoff": { "zh": "文章正文为中文；界面可按右上角切换语言。", "en": "Articles are written in Chinese. Use the button in the top-right corner to switch the interface language." } };
  var KEY = "wave-lang";
  var ZH2EN = {};
  var i;
  for (i in THEME) ZH2EN[i] = THEME[i];
  for (i in EXTRA) ZH2EN[i] = EXTRA[i];

  var CUR = null;
  try { CUR = localStorage.getItem(KEY); } catch (e) {}
  if (CUR !== "zh" && CUR !== "en") {
    CUR = "zh";
    try {
      var nl = (navigator.language || navigator.userLanguage || "").toLowerCase();
      if (nl && nl.indexOf("zh") !== 0) CUR = "en";     // 非中文浏览器默认英文（面向海外客户）
    } catch (e) {}
  }

  function t(key, fallback) {
    var s = STRINGS[key];
    if (!s) return fallback || key;
    return s[CUR] || s.zh;
  }
  function lang() { return CUR; }

  /* ---------- 文本节点翻译（保留原文以便切回）---------- */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, CODE: 1, PRE: 1, KBD: 1, TEXTAREA: 1, SVG: 1 };
  function skipEl(el) {
    if (!el || el.nodeType !== 1) return false;
    if (SKIP_TAGS[el.tagName]) return true;
    var id = el.id || "", cl = el.className || "";
    if (id === "article-container") return true;                       // 文章正文不翻译
    if (typeof cl === "string" && cl.indexOf("post-content") >= 0) return true;
    if (cl.indexOf && cl.indexOf("highlight") >= 0) return true;
    if (el.hasAttribute && el.hasAttribute("data-no-i18n")) return true;
    return false;
  }
  function trText(s) {
    var raw = s;
    var core = raw.trim();
    if (!core) return null;
    if (ZH2EN[core]) return raw.replace(core, ZH2EN[core]);
    // 去掉尾部冒号/顿号等再查一次（主题会渲染成"浏览量:"而没有词条）
    var bare = core.replace(/[：:、·。，,\s]+$/, "");
    if (bare && bare !== core && ZH2EN[bare]) return raw.replace(core, ZH2EN[bare] + core.slice(bare.length));
    // 动态：月份 / 相对时间 / 页码
    var m = core.match(/^([一二三四五六七八九十]+月)\s+(\d{4})$/);
    if (m && MONTHS[m[1]]) return raw.replace(core, MONTHS[m[1]] + " " + m[2]);
    m = core.match(/^(\d+)\s*(分钟|小时|天|周|个月|年)前$/);
    if (m) {
      var u = { "分钟": "minute", "小时": "hour", "天": "day", "周": "week", "个月": "month", "年": "year" }[m[2]];
      var n = parseInt(m[1], 10);
      return raw.replace(core, m[1] + " " + u + (n === 1 ? "" : "s") + " ago");
    }
    if (core === "刚刚") return raw.replace(core, "just now");
    m = core.match(/^第\s*(\d+)\s*页\s*\/\s*共\s*(\d+)\s*页$/);
    if (m) return raw.replace(core, "Page " + m[1] + " of " + m[2]);
    m = core.match(/^共\s*(\d+)\s*篇$/);
    if (m) return raw.replace(core, m[1] + " posts");
    return null;
  }
  function walk(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/[\u4e00-\u9fff]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== root) { if (skipEl(p)) return NodeFilter.FILTER_REJECT; p = p.parentNode; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (var k = 0; k < nodes.length; k++) {
      var node = nodes[k];
      if (CUR === "en") {
        if (node.__waveZh === undefined) {
          var out = trText(node.nodeValue);
          if (out !== null && out !== node.nodeValue) {
            node.__waveZh = node.nodeValue;
            node.nodeValue = out;
          }
        } else if (trText(node.__waveZh) === null) { /* 已翻译且不可再翻 */ }
      }
    }
    // 属性（placeholder / title / aria-label）
    var els = root.querySelectorAll ? root.querySelectorAll("[placeholder],[title],[aria-label]") : [];
    for (var e = 0; e < els.length; e++) {
      var el = els[e];
      for (var a = 0; a < 3; a++) {
        var attr = ["placeholder", "title", "aria-label"][a];
        var v = el.getAttribute && el.getAttribute(attr);
        if (!v) continue;
        var key2 = "__waveAttr_" + attr;
        if (CUR === "en") {
          if (el[key2] === undefined) {
            var o2 = trText(v);
            if (o2 !== null && o2 !== v) { el[key2] = v; el.setAttribute(attr, o2); }
          }
        }
      }
    }
  }
  function restore(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (var k = 0; k < nodes.length; k++) {
      if (nodes[k].__waveZh !== undefined) { nodes[k].nodeValue = nodes[k].__waveZh; delete nodes[k].__waveZh; }
    }
    var els = root.querySelectorAll ? root.querySelectorAll("[placeholder],[title],[aria-label]") : [];
    for (var e = 0; e < els.length; e++) {
      for (var a = 0; a < 3; a++) {
        var attr = ["placeholder", "title", "aria-label"][a], key2 = "__waveAttr_" + attr;
        if (els[e][key2] !== undefined) { els[e].setAttribute(attr, els[e][key2]); delete els[e][key2]; }
      }
    }
  }

  /* ---------- 标题（<title> / 分享卡）---------- */
  var TITLE_ZH = document.title;
  function applyTitle() {
    try {
      if (CUR === "en") {
        if (!window.__waveTitleZh) window.__waveTitleZh = document.title;
        document.title = window.__waveTitleZh
          .replace(/须臾的博客/g, "Xuyu's Blog").replace(/首页/g, "Home");
        if (document.documentElement) document.documentElement.setAttribute("lang", "en");
      } else if (window.__waveTitleZh) {
        document.title = window.__waveTitleZh;
        document.documentElement.setAttribute("lang", "zh-CN");
      }
    } catch (e) {}
  }

  /* 公告卡：原文是逐字 <font> 彩色字，按词翻译不可能 —— 英文模式下整块替换 */
  var ANNOUNCE_EN =
    '<p class="wave-ann-h">Welcome to my blog</p>' +
    '<p align="center">Go · Quant Systems · AI Agent Engineering</p>' +
    '<p align="center">Open for work → <a href="/portfolio/">Portfolio</a> &nbsp;|&nbsp; WeChat: PoorThoth<br>' +
    'Email: yil72866@gmail.com</p>';

  function applyBlocks() {
    // 1) 公告卡整块替换
    try {
      var a = document.querySelector(".card-announcement .announcement_content");
      if (a) {
        if (CUR === "en") {
          if (a.__waveHtml === undefined) { a.__waveHtml = a.innerHTML; a.innerHTML = ANNOUNCE_EN; a.setAttribute("data-no-i18n", "1"); }
        } else if (a.__waveHtml !== undefined) { a.innerHTML = a.__waveHtml; delete a.__waveHtml; a.removeAttribute("data-no-i18n"); }
      }
    } catch (e) {}
    // 2) 打字机副标题：英文模式隐藏打字机，插一行静态英文（避免与 typed.js 抢 DOM）
    try {
      var sub = document.getElementById("site-subtitle");
      if (sub) {
        if (CUR === "en") {
          sub.classList.add("wave-hide-typed");
          if (!sub.querySelector(".wave-sub-en")) {
            var sp = document.createElement("span");
            sp.className = "wave-sub-en";
            sp.setAttribute("data-wi", "1");
            sp.textContent = "Ling Guiqian — Go · Quant Systems · AI Agent Engineering";
            sub.appendChild(sp);
          }
        } else {
          sub.classList.remove("wave-hide-typed");
          var old2 = sub.querySelector(".wave-sub-en");
          if (old2 && old2.parentNode) old2.parentNode.removeChild(old2);
        }
      }
    } catch (e) {}
  }

  function apply() {
    try {
      applyBlocks();
      if (CUR === "en") walk(document.body); else restore(document.body);
      applyTitle();
      var b = document.getElementById("wave-lang-btn");
      if (b) {
        b.setAttribute("data-lang", CUR);
        b.innerHTML = '<span class="zh"' + (CUR === "zh" ? ' aria-current="true"' : "") + '>中</span><i></i><span class="en"' + (CUR === "en" ? ' aria-current="true"' : "") + '>EN</span>';
        b.title = CUR === "zh" ? "Switch to English" : "切换为中文";
      }
    } catch (e) {}
  }

  function set(next) {
    if (next !== "en" && next !== "zh") return;
    CUR = next;
    try { localStorage.setItem(KEY, CUR); } catch (e) {}
    window.dispatchEvent(new CustomEvent("wave:lang", { detail: { lang: CUR } }));
    apply();
  }

  /* ---------- 切换按钮 ---------- */
  function mountButton() {
    try {
      // 放左上角：优先挂在站点名旁边（#blog-info），避免右上角遮挡菜单/其他按钮
      var host = document.querySelector("#nav #blog-info") || document.querySelector("#nav");
      if (!host || document.getElementById("wave-lang-btn")) return;
      var b = document.createElement("button");
      b.id = "wave-lang-btn";
      b.type = "button";
      b.setAttribute("aria-label", "Language");
      b.addEventListener("click", function (ev) {
        ev.preventDefault(); ev.stopPropagation();
        set(CUR === "zh" ? "en" : "zh");
      });
      host.appendChild(b);
    } catch (e) {}
  }

  var _t = null;
  function scheduleApply() { if (_t) clearTimeout(_t); _t = setTimeout(function () { _t = null; apply(); }, 160); }
  function observe() {
    try {
      if (!window.MutationObserver || window.__waveMO) return;
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          // 忽略我们自己的改写（已记录原文的文本节点）
          if (m.type === "characterData" && m.target && m.target.__waveZh !== undefined) continue;
          scheduleApply();
          return;
        }
      });
      window.__waveMO = mo;
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
  }
  function boot() {
    mountButton();
    try {
      var m = /[?&]lang=(zh|en)/.exec(location.search);
      if (m && m[1] !== CUR) { set(m[1]); return; }     // 便于分享"英文版"链接与本地预览
    } catch (e) {}
    apply();
    observe();
    // 主题的 typed.js / 侧栏抽屉 / 懒加载会在首屏之后重写 DOM，补扫几轮
    [400, 1200, 2600, 5000].forEach(function (ms) { setTimeout(apply, ms); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 0); });
  else setTimeout(boot, 0);
  document.addEventListener("pjax:complete", function () { setTimeout(boot, 30); });

  window.WaveI18N = { t: t, lang: lang, set: set, apply: apply, dict: ZH2EN, strings: STRINGS };
})();
