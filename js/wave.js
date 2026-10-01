<link rel="stylesheet" class="aplayer-secondary-style-marker" href="\assets\css\APlayer.min.css"><script src="\assets\js\APlayer.min.js" class="aplayer-secondary-script-marker"></script>/* ============================================================
   波浪主题前端层（wave.js）
   1) 首页 Hero：WebGL 波浪动画（与背景画叠加）
   2) 首页重构：三件事卡片 + 精选文章横向卡流 + 折叠更多文章
   3) 文章页：阅读进度浪线
   4) 全局：点击涟漪、View Transitions 兜底
   设计原则：任何一步失败都静默降级，不阻塞页面；移动端/省电模式自动关闭重效果
   ============================================================ */
(function () {
  "use strict";

  var QS = location.search || "";
  var FORCE = /[?&]wave=1/.test(QS);          // 开发用：强制开启动画
  var SHORT_HERO = /[?&]hero=short/.test(QS);  // 开发用：压缩首屏，便于整页预览

  /* 文案：优先取语言层词条（wave-i18n.js），缺失则用中文兜底 */
  function W(k, d) { try { return (window.WaveI18N && window.WaveI18N.t) ? window.WaveI18N.t(k, d) : d; } catch (e) { return d; } }
  function isEN() { try { return !!(window.WaveI18N && window.WaveI18N.lang && window.WaveI18N.lang() === "en"); } catch (e) { return false; } }
  var reduceMotion = !FORCE && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;
  var state = { hero: false, home: false, prog: false, fx: false };

  /* ---------------- 1. Hero 波浪画布 ---------------- */
  var VS = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
  var FS = [
    "precision mediump float;",
    "uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_scroll;",
    "vec3 DEEP=vec3(0.133,0.235,0.400), MAIN=vec3(0.169,0.298,0.467), MID=vec3(0.286,0.424,0.553);",
    "vec3 TEAL=vec3(0.486,0.616,0.612), CREAM=vec3(0.875,0.863,0.729), OCHRE=vec3(0.788,0.627,0.388);",
    "float wv(vec2 p, float t){",
    "  float y = 0.0;",
    "  y += sin(p.x*2.7 + t*0.55)*0.085;",
    "  y += sin(p.x*5.9 - t*0.85)*0.045;",
    "  y += sin(p.x*11.3 + t*1.25)*0.020;",
    "  y += sin(p.x*19.0 - t*1.70)*0.009;",
    "  float d = distance(p, u_mouse);",
    "  y += sin(16.0*d - t*3.2)*0.035*exp(-5.5*d);",
    "  return y;",
    "}",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res;",
    "  vec2 p = vec2(uv.x*2.0-1.0, uv.y*2.0-1.0); p.y += (uv.x-0.5)*0.14;",
    "  float t = u_time*0.5;",
    "  float k = wv(p, t);",
    "  float dist = abs(p.y - k + 0.16);",
    "  vec3 col = mix(DEEP, MAIN, smoothstep(0.0,1.0,uv.y));",
    "  col = mix(col, MID,  smoothstep(0.62,0.10,dist));",
    "  col = mix(col, TEAL, smoothstep(0.34,0.00,dist));",
    "  col = mix(col, CREAM, smoothstep(0.085,0.0,dist)*0.92);",
    "  col += OCHRE*0.14*smoothstep(0.10,0.0,abs(dist-0.02));",
    "  float v = smoothstep(1.25,0.15,length(p*vec2(0.85,1.0)));",
    "  col *= mix(0.72,1.06,v);",
    "  col *= (1.0 - 0.22*clamp(u_scroll,0.0,1.5));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function initHero() {
    if (state.hero) return;
    var header = document.querySelector("#page-header.full_page");
    if (!header) { diag("noHeader"); return; }
    if (SHORT_HERO) header.style.height = "460px";   // 开发用：先压高度，任何模式都生效
    if (isMobile) { diag("isMobile"); return; }
    if (reduceMotion) { diag("reducedMotion"); return; }
    var canvas = document.createElement("canvas");
    canvas.id = "wave-hero-canvas";
    header.appendChild(canvas);

    var gl = canvas.getContext("webgl", { antialias: false, alpha: true, powerPreference: "low-power" });
    if (!gl) { canvas.remove(); diag("noWebGL"); return; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { canvas.remove(); diag("shaderFail"); return; }
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); diag("linkFail"); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "u_res");
    var uTime = gl.getUniformLocation(prog, "u_time");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");
    var uScroll = gl.getUniformLocation(prog, "u_scroll");

    var mouse = { x: 0.5, y: 0.35 }, targetMouse = { x: 0.5, y: 0.35 };
    var visible = true, raf = null, t0 = performance.now();

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = Math.max(1, Math.floor(header.clientWidth * dpr * 0.75));
      var h = Math.max(1, Math.floor(header.clientHeight * dpr * 0.75));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    function draw(now) {
      if (!visible) { raf = null; return; }
      resize();
      mouse.x += (targetMouse.x - mouse.x) * 0.06;
      mouse.y += (targetMouse.y - mouse.y) * 0.06;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - t0) / 1000);
      gl.uniform2f(uMouse, mouse.x * 2 - 1, mouse.y * 2 - 1);
      gl.uniform1f(uScroll, window.scrollY / Math.max(1, header.clientHeight));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(draw);
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(draw); }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

    header.addEventListener("pointermove", function (e) {
      var r = header.getBoundingClientRect();
      targetMouse.x = (e.clientX - r.left) / r.width;
      targetMouse.y = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () { visible = !document.hidden; visible ? start() : stop(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0.01 })
        .observe(header);
    }
    resize(); start();
    state.hero = true;
    diag("heroOK");
  }

  /* ---------------- 2. Hero 文案与按钮 ---------------- */
  function initHeroText() {
    var header = document.querySelector("#page-header.full_page");
    var info = document.querySelector("#site-info");
    if (!header || !info || header.querySelector(".wave-cta")) return;
    var cta = document.createElement("div");
    cta.className = "wave-cta";
    cta.setAttribute("data-wi", "1");
    cta.innerHTML = '<a class="primary" href="/portfolio/"><i class="fas fa-briefcase"></i>' + W("hero.c1", "接单合作 · 作品集") + '</a>' +
                    '<a href="/archives/"><i class="fas fa-water"></i>' + W("hero.c2", "看全部文章") + '</a>' +
                    '<a href="/about/"><i class="fas fa-user"></i>' + W("hero.c3", "关于我") + '</a>';
    info.appendChild(cta);
    var cue = document.createElement("div");
    cue.className = "wave-scroll-cue";
    cue.setAttribute("data-wi", "1");
    header.appendChild(cue);
  }

  /* ---------------- 3. 首页重构 ---------------- */
  var FEATURES = [
    { icon: "fa-wave-square", k: "do.c1", t: "量化交易系统（Go）",
      d: "策略引擎与行情管线：K 线采集与校验、价格行为结构识别、回测、风控闸门（人工确认 / 额度 / 审计）。" },
    { icon: "fa-shield-halved", k: "do.c2", t: "AI Agent 工程",
      d: "多智能体编排、工具调用的权限 scope 与人工确认、本地大模型推理服务——重点让它出错时不造成破坏。" },
    { icon: "fa-cube", k: "do.c3", t: "业务系统与桌面端",
      d: "SpringBoot + Vue + MySQL 业务系统；Tauri 2 桌面客户端交付（7.9 MB 绿色包，冷启动 608 ms）。" }
  ];
  /* 技术栈：中英双写（左中文右英文） */
  var STACK = [
    ["Go", "Go"], ["Rust", "Rust"], ["Java · SpringBoot", "Java · SpringBoot"], ["Python", "Python"],
    ["Vue 3 + TypeScript", "Vue 3 + TypeScript"], ["MySQL", "MySQL"], ["Redis", "Redis"],
    ["Linux 运维", "Linux ops"], ["Tauri 2 桌面端", "Tauri 2 desktop"], ["vLLM / 本地推理", "vLLM / local inference"],
    ["RAG 检索与评测", "RAG retrieval & evals"], ["MCP 工具服务", "MCP tool servers"], ["回测 / 风控闸门", "Backtesting / risk gates"]
  ];

  function pick(list, n) {
    var out = [];
    for (var i = 0; i < list.length && out.length < n; i++) {
      var el = list[i];
      var a = el.querySelector("a.article-title") || el.querySelector(".article-title");
      if (!a) continue;
      var img = el.querySelector("img");
      var cover = img ? (img.getAttribute("data-lazy-src") || img.getAttribute("src") || "") : "";
      if (!cover) {
        var bgEl = el.querySelector("[style*='background-image']");
        if (bgEl) {
          var m = /url\(["']?([^"')]+)["']?\)/.exec(bgEl.getAttribute("style") || "");
          if (m) cover = m[1];
        }
      }
      var timeEl = el.querySelector("time");
      var contentEl = el.querySelector(".content") || el.querySelector(".recent-post-info .content");
      out.push({
        href: a.getAttribute("href"),
        title: (a.textContent || "").trim(),
        cover: cover,
        date: timeEl ? (timeEl.getAttribute("datetime") || timeEl.textContent || "").slice(0, 10) : "",
        desc: contentEl ? (contentEl.textContent || "").trim() : ""
      });
    }
    return out;
  }

  function initHome() {
    if (state.home) return;
    var col = document.querySelector("#recent-posts");
    if (!col) return;
    document.body.classList.add("wave-home");
    var listWrap = col.querySelector(".recent-post-items") || col;
    var items = listWrap.querySelectorAll(".recent-post-item");
    if (!items.length) return;

    var data = pick(items, 8);
    var host = col;                 // 关键：插进「文章列」内部，保持两栏 grid 结构
    var anchor = listWrap;          // 插在原始列表之前
    var frag = document.createDocumentFragment();

    // 3.1 三件事
    var sec = document.createElement("section");
    sec.className = "wave-section wave-reveal";
    sec.innerHTML = '<div class="wave-sec-title"><i class="fas fa-water"></i>' + W("do.title", "我在做什么") + '</div>' +
      '<div class="wave-sec-sub">' + W("do.sub", "Go 后端 · 量化系统 · AI Agent · 桌面端交付 — 都是自己动手做过的东西") + '</div>' +
      '<div class="wave-cards">' +
      FEATURES.map(function (f) {
        return '<div class="wave-card"><h3><i class="fas ' + f.icon + '"></i>' + W(f.k + ".t", f.t) + '</h3><p>' + W(f.k + ".d", f.d) + '</p></div>';
      }).join("") +
      '</div>';
    frag.appendChild(sec);

    var div = document.createElement("div");
    div.className = "wave-divider";
    frag.appendChild(div);

    // 3.2 精选文章横向卡流
    if (data.length) {
      var sec2 = document.createElement("section");
      sec2.className = "wave-section wave-reveal";
      sec2.innerHTML = '<div class="wave-sec-title"><i class="fas fa-fire"></i>' + W("idx.title", "最近的写作") + '</div>' +
        '<div class="wave-sec-sub">' + W("idx.sub", "踩过的坑、实测算出来的数字、能复用的方法") + '</div>' +
        (isEN() ? '<div class="wave-note"><i class="fas fa-circle-info"></i>' + W("handoff", "") + '</div>' : '') +
        '<div class="wave-index"></div>';
      var idx = sec2.querySelector(".wave-index");
      data.forEach(function (p, i) {
        var a = document.createElement("a");
        a.className = "wave-index-row";
        a.href = p.href;
        a.innerHTML =
          '<span class="num">' + ("0" + (i + 1)).slice(-2) + '</span>' +
          '<span class="ti">' + p.title + '</span>' +
          (p.desc ? '<span class="de">' + p.desc + '</span>' : '') +
          '<span class="dt">' + p.date + '</span>';
        idx.appendChild(a);
      });
      frag.appendChild(sec2);
    }

    // 3.3 折叠：更多文章（原列表的其余条目 + 归档入口）
    var rest = Array.prototype.slice.call(items, data.length);
    if (rest.length) {
      var more = document.createElement("details");
      more.className = "wave-more wave-section";
      var rows = rest.map(function (el) {
        var a = el.querySelector("a.article-title") || el.querySelector(".article-title");
        if (!a) return "";
        var t = el.querySelector("time");
        return '<a href="' + a.getAttribute("href") + '"><time>' +
          (t ? (t.getAttribute("datetime") || "").slice(0, 10) : "") + '</time><span>' +
          (a.textContent || "").trim() + '</span></a>';
      }).join("");
      more.innerHTML = '<summary><i class="fas fa-archive"></i> ' + W("idx.more", "更早的文章") +
        (isEN() ? ' (' + rest.length + ')' : '（' + rest.length + ' 篇）') + '</summary>' +
        '<div class="wave-more-grid">' + rows + '</div>' +
        '<div class="wave-more-grid" style="margin-top:.6rem"><a href="/archives/"><time>→</time><span>' +
        W("idx.all", "去归档页看全部") + '</span></a></div>';
      frag.appendChild(more);
    }

    // 3.4 收尾：合作 / 接单卡
    var ctaCard = document.createElement("section");
    ctaCard.className = "wave-cta-card wave-reveal";
    ctaCard.innerHTML =
      '<h3><i class="fas fa-handshake"></i>' + W("cta.h", "合作 / 接单") + '</h3>' +
      '<p>' + W("cta.p", "正在接<b>远程兼职</b>（UTC+8，可异步交付）：Go 后端 · 数据管道 · AI 集成（本地大模型部署 / RAG / MCP 工具服务）· 全栈业务系统 · 桌面端交付。前两单可半价，换一条真实评价与案例署名授权。") + '</p>' +
      '<div class="row">' +
      '<a class="primary" href="/portfolio/"><i class="fas fa-briefcase"></i>' + W("cta.b1", "看作品集与服务说明") + '</a>' +
      '<a href="mailto:yil72866@gmail.com"><i class="fas fa-envelope"></i>yil72866@gmail.com</a>' +
      '<a href="https://github.com/PoorThoth"><i class="fab fa-github"></i>GitHub</a>' +
      '</div>';
    frag.appendChild(ctaCard);

    // 3.5 技术栈标签
    var stack = document.createElement("section");
    stack.className = "wave-section wave-reveal";
    stack.innerHTML = '<div class="wave-sec-title"><i class="fas fa-layer-group"></i>' + W("tech.title", "技术栈") + '</div>' +
      '<div class="wave-tags">' +
      STACK.map(function (pair) { return "<span>" + (isEN() ? pair[1] : pair[0]) + "</span>"; }).join("") +
      '</div>';
    frag.appendChild(stack);

    // 8.5 章节编号（01 / 02 …）
    var titles = frag.querySelectorAll(".wave-sec-title");
    for (var ti = 0; ti < titles.length; ti++) {
      var num = document.createElement("span");
      num.className = "chap";
      num.textContent = ("0" + (ti + 1)).slice(-2) + " /";
      titles[ti].insertBefore(num, titles[ti].firstChild);
    }

    for (var wi = 0; wi < frag.children.length; wi++) frag.children[wi].setAttribute("data-wi", "1");
    host.insertBefore(frag, anchor);
    listWrap.classList.add("wave-hidden-list");
    var pag = col.querySelector(".pagination");
    if (pag) pag.classList.add("wave-hidden-list");
    state.home = true;
  }

  /* ---------------- 4. 阅读进度浪线 ---------------- */
  function initProgress() {
    var bar = document.getElementById("wave-progress");
    if (!document.querySelector("#post") && !document.querySelector(".post-block")) {
      if (bar) bar.remove();
      state.prog = false;
      return;
    }
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "wave-progress";
      document.body.appendChild(bar);
    }
    if (state.prog) return;
    state.prog = true;
    var ticking = false;
    function upd() {
      ticking = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  }

  /* ---------------- 5. 点击涟漪 ---------------- */
  function initFx() {
    if (state.fx || reduceMotion || (isMobile && !FORCE)) return;
    state.fx = true;
    document.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      var r = document.createElement("span");
      r.className = "wave-ripple";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      document.body.appendChild(r);
      setTimeout(function () { r.remove(); }, 700);
    }, { passive: true });
  }

  /* ---------------- 6. 滚动揭示 ---------------- */
  function initReveal() {
    var els = document.querySelectorAll(".wave-reveal:not(.is-in)");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add("is-in");
      return;
    }
    // 兜底：1.2 秒后无论有没有触发 IO，全部视为已揭示
    setTimeout(function () {
      var all = document.querySelectorAll(".wave-reveal");
      for (var k = 0; k < all.length; k++) all[k].classList.add("is-in");
    }, 1200);

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    for (var j = 0; j < els.length; j++) io.observe(els[j]);
  }

  /* ---------------- 7. 自定义光标（浪沫圈） ---------------- */
  function initCursor() {
    if (reduceMotion || isMobile) return;
    if (!(window.matchMedia && window.matchMedia("(pointer: fine)").matches)) return;
    if (document.getElementById("wave-cursor")) return;
    var c = document.createElement("div");
    c.id = "wave-cursor";
    document.body.appendChild(c);
    var x = 0, y = 0, tx = 0, ty = 0, raf = null;
    function step() {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      c.style.transform = "translate(" + x + "px," + y + "px)";
      raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.4) ? requestAnimationFrame(step) : null;
    }
    document.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      c.classList.add("on");
      if (!raf) raf = requestAnimationFrame(step);
      var interactive = e.target && e.target.closest && e.target.closest("a, button, summary, .wave-pick, .wave-card");
      c.classList.toggle("hovering", !!interactive);
    }, { passive: true });
    document.addEventListener("pointerleave", function () { c.classList.remove("on"); });
  }


  /* ---------------- 8. 电影感层：视差 / 黑边 / 片头片尾字幕 / 章节号 ---------------- */
  function initCine() {
    var header = document.querySelector("#page-header.full_page");
    if (!header) return;
    if (header.querySelector(".cine-bar")) return;

    // 8.1 把背景画单独抽成一层，便于视差
    //     注意：首次会把 header 的 inline background 置为 none，所以必须把原图记在元素上，
    //     否则语言切换重建（resetInjected → boot）时拿不到图，背景会永久消失。
    if (!header.__waveBg) {
      var b0 = header.style.backgroundImage;
      if (!b0 || b0 === "none") { try { b0 = getComputedStyle(header).backgroundImage; } catch (e) { } }
      if (b0 && b0 !== "none") header.__waveBg = b0;
    }
    var bg = header.__waveBg;
    if (bg) {
      var art = document.createElement("div");
      art.className = "wave-art";
      art.setAttribute("data-wi", "1");
      art.style.backgroundImage = bg;
      header.insertBefore(art, header.firstChild);
      header.style.backgroundImage = "none";
    }

    // 8.2 上下黑边（宽银幕）
    ["top", "bottom"].forEach(function (pos) {
      var b = document.createElement("div");
      b.className = "cine-bar " + pos;
      b.setAttribute("data-wi", "1");
      header.appendChild(b);
    });

    // 8.3 英文副题 + 片尾式信息行
    var info = document.querySelector("#site-info");
    if (info) {
      if (!info.querySelector(".cine-en")) {
        var en = document.createElement("span");
        en.className = "cine-en";
        en.setAttribute("data-wi", "1");
        en.textContent = W("hero.kicker", "Ling Guiqian · Backend · Quant Systems · AI Agent");
        var title = document.querySelector("#site-title");
        (title || info).appendChild(en);

        var cr = document.createElement("div");
        cr.className = "cine-credits";
        cr.setAttribute("data-wi", "1");
        cr.innerHTML = W("hero.credits", "Go|Quant|AI Agent|Tauri|UTC+8|Open for work").split("|")
          .map(function (x) { return "<span>" + x + "</span>"; }).join("");
        info.appendChild(cr);
      }
    }

    // 8.4 滚动视差（画、画布、文字、黑边）
    var raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var h = header.clientHeight || 1;
        var pr = Math.min(1.25, window.scrollY / h);
        var art = header.querySelector(".wave-art");
        if (art) art.style.transform = "translate3d(0," + (pr * 20) + "px,0) scale(" + (1 + pr * 0.04) + ")";
        var c = document.getElementById("wave-hero-canvas");
        if (c) c.style.transform = "translate3d(0," + (pr * 26) + "px,0) scale(" + (1 + pr * 0.05) + ")";
        var si = document.querySelector("#site-info");
        if (si) {
          si.style.opacity = String(Math.max(0, 1 - pr * 0.85));
          si.style.transform = "translate3d(0," + (-pr * 26) + "px,0)";
        }
        var bars = header.querySelectorAll(".cine-bar");
        for (var i = 0; i < bars.length; i++) bars[i].style.height = (6.5 + pr * 0.8) + "vh";
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- 启动 + pjax 兼容 ---------------- */
  function diag(extra) {
    try {
      document.documentElement.setAttribute("data-wave",
        "qs=" + QS + "|rm=" + reduceMotion + "|force=" + FORCE + "|mob=" + isMobile + "|" + (extra || ""));
    } catch (e) { }
  }


  /* ---------- 手机端首屏布局（行内样式，避免被父级布局吃掉）---------- */
  function applyMobileHero() {
    try {
      if (window.innerWidth > 768) return;
      var cta = document.querySelector("#site-info .wave-cta");
      if (cta) {
        cta.style.cssText = "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;" +
          "width:86vw;max-width:86vw;margin:1.2rem auto 0;box-sizing:border-box;justify-content:center;";
        for (var i = 0; i < cta.children.length; i++) {
          var a = cta.children[i];
          a.style.justifyContent = "center";
          a.style.fontSize = ".78rem";
          a.style.padding = ".5rem .55rem";
          a.style.whiteSpace = "nowrap";
          a.style.overflow = "hidden";
          a.style.textOverflow = "ellipsis";
        }
      }
      var cr = document.querySelector("#site-info .cine-credits");
      if (cr) {
        cr.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;" +
          "gap:.35rem .85rem;width:86vw;max-width:86vw;margin:.9rem auto 0;" +
          "font-size:.56rem;letter-spacing:.05em;line-height:1.8;box-sizing:border-box;";
      }
      var en = document.querySelector("#site-info .cine-en");
      if (en) {
        en.style.cssText = "display:block;width:86vw;max-width:86vw;margin:.45rem auto 0;" +
          "font-size:.55rem;letter-spacing:.08em;line-height:1.7;white-space:normal;" +
          "overflow-wrap:anywhere;box-sizing:border-box;";
      }
      var ti = document.querySelector("#site-info #site-title");
      if (ti) { ti.style.fontSize = "clamp(1.7rem, 8.2vw, 2.3rem)"; ti.style.letterSpacing = ".03em"; }
      // 诊断：把实测几何写进 <html data-mhero>，便于无控制台排查
      try {
        var _cta = document.querySelector("#site-info .wave-cta");
        var _cr = document.querySelector("#site-info .cine-credits");
        var _si = document.querySelector("#site-info");
        var _info = { iw: window.innerWidth };
        if (_si) { var r = _si.getBoundingClientRect(); _info.si = [Math.round(r.left), Math.round(r.width)]; }
        if (_cta) { var r2 = _cta.getBoundingClientRect(); _info.cta = [Math.round(r2.left), Math.round(r2.width), _cta.children.length]; }
        if (_cr) { var r3 = _cr.getBoundingClientRect(); _info.cr = [Math.round(r3.left), Math.round(r3.width)]; }
        document.documentElement.setAttribute("data-mhero", JSON.stringify(_info));
      } catch (e) {}
    } catch (e) { /* 静默：手机布局失败不影响桌面 */ }
  }

  /* 语言切换：清掉本脚本注入的节点后重建（文章正文不动） */
  function resetInjected() {
    try {
      var nodes = document.querySelectorAll("[data-wi]");
      for (var i = nodes.length - 1; i >= 0; i--) {
        if (nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
      }
      var hid = document.querySelectorAll(".wave-hidden-list");
      for (var j = 0; j < hid.length; j++) hid[j].classList.remove("wave-hidden-list");
      state.home = false; state.hero = false;
    } catch (e) { }
  }
  window.addEventListener("wave:lang", function () {
    try { resetInjected(); boot(); } catch (e) { }
  });

  function boot() {
    diag("boot");
    try { initHero(); } catch (e) { diag("heroErr:" + e.message); }
    try { initHeroText(); } catch (e) { }
    try {
      if (!document.querySelector("#recent-posts")) document.body.classList.remove("wave-home");
      initHome();
    } catch (e) { }
    try { initProgress(); } catch (e) { }
    try { initFx(); } catch (e) { }
    try { initReveal(); } catch (e) { }
    try { initCursor(); } catch (e) { }
    try { initCine(); } catch (e) { }
    try { applyMobileHero(); } catch (e) { }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("pjax:complete", function () { state.home = false; boot(); });
  window.addEventListener("load", boot);
})();
