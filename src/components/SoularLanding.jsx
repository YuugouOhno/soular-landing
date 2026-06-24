import { useEffect, useRef, useState } from 'react'

const css = `
  :root{
    --paper:#eef3ff; --card:#ffffff; --ink:#0a1330; --ink-soft:#4e5a7e; --line:#d4ddf2;
    --blue:#1f6dff; --blue-deep:#0a2a7a; --blue-tint:#4d86ff; --accent:#4d86ff;
    --offwhite:#f4f7ff; --maxw:1240px; --ease:cubic-bezier(.19,1,.22,1);
  }
  .soular-new *{box-sizing:border-box;margin:0;padding:0}
  body:has(.soular-new){background:var(--paper);color:var(--ink);overflow-x:hidden}
  .soular-new{background:var(--paper);color:var(--ink);font-family:"Murecho","Schibsted Grotesk",system-ui,sans-serif;font-weight:400;line-height:1.8;-webkit-font-smoothing:antialiased}
  .soular-new :where(h1,h2,h3,h4){word-break:keep-all;overflow-wrap:anywhere}
  .soular-new ::selection{background:var(--blue);color:#fff}
  .soular-new a{color:inherit;text-decoration:none}
  .soular-new .mono{font-family:"DM Mono",monospace}
  .soular-new .wrap{max-width:var(--maxw);margin:0 auto;padding:0 36px;width:100%}
  .soular-new .tag{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;display:inline-flex;align-items:center;gap:9px}
  .soular-new .tag::before{content:"";width:8px;height:8px;background:var(--accent);border-radius:50%;display:inline-block}

  .soular-new .nav{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;align-items:center;justify-content:space-between;padding:20px 36px;color:var(--offwhite);transition:background .45s var(--ease),color .45s var(--ease),box-shadow .45s var(--ease),padding .45s var(--ease)}
  .soular-new .nav.is-stuck{background:var(--paper);color:var(--ink);box-shadow:0 1px 0 var(--line);padding-top:14px;padding-bottom:14px}
  .soular-new .brand{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:22px;letter-spacing:-.02em;display:flex;align-items:center;gap:10px}
  .soular-new .nav-links{display:flex;align-items:center;gap:30px}
  .soular-new .nav-links a{font-family:"DM Mono",monospace;font-size:13px;letter-spacing:.04em;opacity:.86;transition:opacity .2s}
  .soular-new .nav-links a:hover{opacity:1}
  .soular-new .nav-cta{border:1.5px solid currentColor;padding:9px 18px;border-radius:100px;font-family:"DM Mono",monospace;font-size:13px;opacity:1!important;transition:background .25s var(--ease),color .25s var(--ease)}
  .soular-new .nav.is-stuck .nav-cta:hover{background:var(--ink);color:var(--paper)}
  .soular-new .nav:not(.is-stuck) .nav-cta:hover{background:var(--offwhite);color:var(--blue)}
  @media(max-width:980px){.soular-new .nav-links a:not(.nav-cta){display:none}}
  @media(max-width:900px){.soular-new .nav{display:none}.soular-new .hero{padding-top:64px}}

  .soular-new .hero{background:var(--blue);color:var(--offwhite);position:relative;overflow:hidden;min-height:100vh;min-height:100svh;display:flex;align-items:center;padding:118px 0 80px}
  .soular-new .shards{position:absolute;inset:0;z-index:0;pointer-events:none}
  .soular-new .shard{position:absolute;opacity:.5;will-change:transform}
  .soular-new .shard.s1{width:300px;height:300px;top:-60px;right:6%;background:var(--blue-tint);border-radius:42% 58% 60% 40%/45% 45% 55% 55%;filter:blur(2px);animation:sn-float1 16s var(--ease) infinite alternate}
  .soular-new .shard.s2{width:160px;height:160px;bottom:14%;left:4%;background:var(--blue-deep);transform:rotate(20deg);border-radius:30px;animation:sn-float2 13s var(--ease) infinite alternate}
  .soular-new .shard.s3{width:90px;height:90px;top:30%;right:30%;background:var(--offwhite);border-radius:24px;transform:rotate(15deg);opacity:.85;animation:sn-float3 10s var(--ease) infinite alternate}
  @keyframes sn-float1{to{transform:translate(-40px,50px) rotate(40deg)}}
  @keyframes sn-float2{to{transform:translate(30px,-40px) rotate(-12deg)}}
  @keyframes sn-float3{to{transform:translate(-26px,34px) rotate(-20deg)}}
  .soular-new .hero-grid{position:absolute;inset:0;z-index:0;opacity:.1;background-image:linear-gradient(var(--offwhite) 1px,transparent 1px),linear-gradient(90deg,var(--offwhite) 1px,transparent 1px);background-size:74px 74px;mask-image:radial-gradient(120% 90% at 30% 40%,#000 30%,transparent 80%)}
  .soular-new .hero-inner{position:relative;z-index:2}
  .soular-new .hero .tag{color:var(--offwhite);margin-bottom:30px;opacity:0;transform:translateY(16px);transition:all .8s var(--ease) .15s}
  .soular-new .hero h1{font-family:"Murecho",sans-serif;font-weight:900;font-size:clamp(38px,6.4vw,92px);line-height:1.04;letter-spacing:-.025em;margin-bottom:30px}
  .soular-new .hero h1 .ln{display:block;overflow:hidden}
  .soular-new .hero h1 .ln > span{display:block;transform:translateY(105%);transition:transform 1.05s var(--ease)}
  .soular-new .hero h1 .ln:nth-child(2) > span{transition-delay:.1s}
  .soular-new .hero h1 .ln:nth-child(3) > span{transition-delay:.2s}
  .soular-new.reveal .hero h1 .ln > span{transform:translateY(0)}
  .soular-new .hero h1 .dot{color:#fff}
  .soular-new .kw-line{display:inline-flex;align-items:baseline;flex-wrap:wrap;font-family:"DM Mono",monospace;font-size:clamp(15px,2.1vw,24px);color:var(--offwhite);margin-bottom:36px;background:rgba(0,0,0,.18);padding:12px 18px;border-radius:10px;opacity:0;transform:translateY(16px);transition:all .8s var(--ease) .55s}
  .soular-new .kw-line .pr{opacity:.6;margin-right:6px}
  .soular-new .kw-wrap{display:inline-block;min-width:1ch}
  .soular-new .kw{display:inline-block;color:#fff;font-weight:500;transition:opacity .22s var(--ease),transform .22s var(--ease)}
  .soular-new .kw.swap{opacity:0;transform:translateY(-8px)}
  .soular-new .caret{color:#fff;font-weight:700;animation:sn-blink 1s step-end infinite}
  @keyframes sn-blink{50%{opacity:0}}
  .soular-new .hero-sub{max-width:820px;font-size:clamp(15px,1.5vw,18px);line-height:1.9;color:#dbe6ff;word-break:keep-all;overflow-wrap:anywhere;opacity:0;transform:translateY(16px);transition:all .8s var(--ease) .65s}
  .soular-new .hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:36px;opacity:0;transform:translateY(16px);transition:all .8s var(--ease) .75s}
  .soular-new.reveal .hero .tag,.soular-new.reveal .kw-line,.soular-new.reveal .hero-sub,.soular-new.reveal .hero-actions{opacity:1;transform:none}
  .soular-new .btn{font-family:"DM Mono",monospace;font-size:14px;padding:15px 26px;border-radius:100px;cursor:pointer;border:1.5px solid transparent;transition:all .3s var(--ease);display:inline-flex;align-items:center;gap:9px;font-weight:500}
  .soular-new .btn .arr{transition:transform .3s var(--ease)}.soular-new .btn:hover .arr{transform:translateX(4px)}
  .soular-new .btn-fill{background:var(--offwhite);color:var(--blue)}
  .soular-new .btn-fill:hover{background:#fff;color:var(--blue-deep);transform:translateY(-2px)}
  .soular-new .btn-line{border-color:rgba(244,247,255,.4);color:var(--offwhite)}
  .soular-new .btn-line:hover{border-color:var(--offwhite);background:rgba(255,255,255,.06)}

  .soular-new .ticker{background:var(--ink);color:var(--offwhite);overflow:hidden;white-space:nowrap;border-bottom:2px solid var(--blue)}
  .soular-new .ticker-track{display:inline-flex;padding:15px 0;animation:sn-scroll-x 38s linear infinite;will-change:transform}
  .soular-new .ticker:hover .ticker-track{animation-play-state:paused}
  .soular-new .ticker-item{font-family:"DM Mono",monospace;font-size:13px;letter-spacing:.08em;padding:0 26px;display:inline-flex;align-items:center;gap:26px;opacity:.8}
  .soular-new .ticker-item::after{content:"◆";color:var(--blue-tint);font-size:9px}
  .soular-new .ticker-item b{color:#fff;opacity:1;font-weight:500}
  @keyframes sn-scroll-x{from{transform:translateX(0)}to{transform:translateX(-50%)}}

  .soular-new .zone{padding:120px 0;position:relative}
  .soular-new .zone--ink{background:var(--ink);color:var(--offwhite)}
  .soular-new .zone--blue{background:var(--blue);color:var(--offwhite)}
  .soular-new .z-head{margin-bottom:56px;max-width:820px}
  .soular-new .z-head .tag{margin-bottom:20px}
  .soular-new .z-head h2{font-family:"Murecho",sans-serif;font-weight:900;font-size:clamp(30px,4.4vw,56px);line-height:1.2;letter-spacing:-.02em}
  .soular-new .z-head h2 .hl{color:var(--blue)}
  .soular-new .zone--ink .z-head h2 .hl,.soular-new .zone--blue .z-head h2 .hl{color:#fff}
  .soular-new .z-head p{margin-top:18px;color:var(--ink-soft);font-size:16px;line-height:1.95;max-width:600px;word-break:keep-all;overflow-wrap:anywhere}
  .soular-new .zone--ink .z-head p,.soular-new .zone--blue .z-head p{color:rgba(255,255,255,.82)}
  .soular-new .ru{opacity:0;transform:translateY(34px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
  .soular-new .ru.in{opacity:1;transform:none}

  .soular-new .phil-lead{max-width:920px;font-size:clamp(16px,1.7vw,21px);line-height:2;color:var(--ink-soft);margin-top:8px;word-break:keep-all;overflow-wrap:anywhere}
  .soular-new .phil-lead b{color:var(--blue);font-weight:700}

  .soular-new .story{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  @media(max-width:900px){.soular-new .story{grid-template-columns:1fr}}
  .soular-new .story .s{background:#10182f;border:1px solid #20294a;border-radius:16px;padding:34px}
  .soular-new .story .s .n{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.08em;color:var(--blue-tint)}
  .soular-new .story .s h4{font-family:"Murecho";font-weight:900;font-size:20px;margin:12px 0 12px;line-height:1.5}
  .soular-new .story .s p{color:#aeb8d8;font-size:13.5px;line-height:1.9}
  .soular-new .venn-wrap{display:flex;justify-content:center;margin:4px 0 64px}
  .soular-new .venn{width:min(100%,520px);height:auto;overflow:visible}
  .soular-new .venn .vc{fill:#2f6bff;fill-opacity:.32;stroke:#7aa8ff;stroke-opacity:.55;stroke-width:1.4;mix-blend-mode:screen}
  .soular-new .venn .lab{fill:#fff;font-family:"Murecho",sans-serif;font-weight:900;font-size:23px}
  .soular-new .venn .en{fill:#bcd2ff;font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.1em}
  .soular-new .venn .ctr{fill:#eaf3ff;font-family:"DM Mono",monospace;font-size:12.5px;letter-spacing:.16em}
  .soular-new .story-top{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center;margin-bottom:60px}
  @media(max-width:900px){.soular-new .story-top{grid-template-columns:1fr;gap:28px}}
  .soular-new .story-top .z-head{margin-bottom:0;max-width:560px}
  .soular-new .story-top .venn-wrap{margin:0}

  .soular-new .domain{margin-bottom:18px}
  .soular-new .dhead{display:flex;align-items:flex-start;gap:22px;margin:36px 0 22px}
  .soular-new .dhead .no{font-family:"Bricolage Grotesque";font-weight:800;font-size:clamp(34px,4vw,52px);line-height:.9;color:var(--blue);letter-spacing:-.02em}
  .soular-new .dhead .en{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--blue)}
  .soular-new .dhead h3{font-family:"Murecho";font-weight:900;font-size:clamp(24px,3vw,34px);line-height:1.2}
  .soular-new .dhead .soon{font-size:14px;font-weight:400;color:var(--ink-soft);margin-left:12px}
  .soular-new .dhead .dd{margin-top:8px;color:var(--ink-soft);font-size:14.5px;max-width:760px}
  .soular-new .dhead .dd b{color:var(--ink);font-weight:500}
  .soular-new .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
  @media(max-width:980px){.soular-new .svc-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:640px){.soular-new .svc-grid{grid-template-columns:1fr}}
  .soular-new .svc-grid.cols4{grid-template-columns:repeat(4,1fr)}
  @media(max-width:980px){.soular-new .svc-grid.cols4{grid-template-columns:1fr 1fr}}
  @media(max-width:560px){.soular-new .svc-grid.cols4{grid-template-columns:1fr}}
  .soular-new .tile{background:var(--card);border-radius:16px;padding:30px 28px;position:relative;overflow:hidden;isolation:isolate;border:1px solid var(--line);transition:transform .4s var(--ease),box-shadow .4s var(--ease);display:flex;flex-direction:column;min-height:200px}
  .soular-new .tile::before{content:"";position:absolute;inset:0;z-index:-1;background:var(--blue);transform:translateY(101%);transition:transform .5s var(--ease)}
  .soular-new .tile:hover{transform:translateY(-4px);box-shadow:0 30px 60px -34px rgba(31,109,255,.5)}
  .soular-new .tile:hover::before{transform:translateY(0)}
  .soular-new .tile,.soular-new .tile *{transition-property:color,background,transform,box-shadow,border-color}
  .soular-new .tile:hover,.soular-new .tile:hover .t-no,.soular-new .tile:hover h4,.soular-new .tile:hover p,.soular-new .tile:hover .cc,.soular-new .tile:hover .feat span{color:var(--offwhite)}
  .soular-new .tile:hover .feat span{border-color:rgba(255,255,255,.4)}
  .soular-new .t-no{font-family:"DM Mono",monospace;font-size:12px;color:var(--blue);letter-spacing:.06em}
  .soular-new .tile h4{font-family:"Murecho";font-weight:900;font-size:18px;margin:8px 0 4px;line-height:1.45}
  .soular-new .tile .cc{font-size:12.5px;color:var(--blue-tint);margin-bottom:10px}
  .soular-new .tile p{color:var(--ink-soft);font-size:13px;line-height:1.8}
  .soular-new .feat{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}
  .soular-new .feat span{font-size:11px;color:var(--ink-soft);border:1px solid var(--line);border-radius:100px;padding:4px 10px}
  .soular-new .tile .more{margin-top:14px;font-family:"DM Mono",monospace;font-size:12px;color:var(--blue);display:inline-flex;gap:6px}
  .soular-new .tile:hover .more{color:#fff}
  .soular-new .tile-thumb{margin:-30px -28px 20px;aspect-ratio:1/1;overflow:hidden;background:#eef3ff;border-bottom:1px solid var(--line)}
  .soular-new .tile-thumb img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ease)}
  .soular-new .tile:hover .tile-thumb img{transform:scale(1.05)}

  .soular-new .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
  @media(max-width:880px){.soular-new .stats{grid-template-columns:1fr 1fr;gap:32px 24px}}
  @media(max-width:560px){.soular-new .stats{grid-template-columns:1fr}}
  .soular-new .stat{border-top:2px solid var(--ink);padding-top:22px}
  .soular-new .stat .s-num{font-family:"Bricolage Grotesque";font-weight:800;font-size:clamp(38px,5vw,64px);line-height:1;letter-spacing:-.03em}
  .soular-new .stat .s-num .u{color:var(--blue);font-size:.38em;margin-left:3px}
  .soular-new .stat .s-lab{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.08em;color:var(--ink-soft);margin-top:14px;text-transform:uppercase}
  .soular-new .stats-note{margin-top:28px;font-family:"DM Mono",monospace;font-size:11px;color:#8a96b4;letter-spacing:.03em;line-height:1.7}
  .soular-new .zone--ink .stat,.soular-new .zone--blue .stat{border-top-color:rgba(255,255,255,.45)}
  .soular-new .zone--ink .stat .s-num .u,.soular-new .zone--blue .stat .s-num .u{color:#5aa7ff}
  .soular-new .zone--ink .stat .s-lab,.soular-new .zone--blue .stat .s-lab{color:rgba(255,255,255,.78)}
  .soular-new .zone--ink .stats-note,.soular-new .zone--blue .stats-note{color:rgba(255,255,255,.62)}

  .soular-new .z-head.center{margin-left:auto;margin-right:auto;text-align:center;max-width:none}
  .soular-new .z-head.center .tag{justify-content:center}
  .soular-new .z-head.center h2::after{content:"";display:block;width:54px;height:4px;background:var(--blue);border-radius:2px;margin:22px auto 0}
  .soular-new .topic-show{position:relative}
  .soular-new .topic-viewport{overflow:hidden;transition:height .55s var(--ease)}
  .soular-new .topic-strip{display:flex;align-items:flex-start;transition:transform .75s var(--ease)}
  .soular-new .topic-slide{flex:0 0 100%;display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center}
  @media(max-width:900px){.soular-new .topic-slide{grid-template-columns:1fr;gap:24px;align-items:start}}
  .soular-new .topic-media{border-radius:20px;overflow:hidden;box-shadow:0 40px 80px -40px rgba(31,109,255,.45);background:#fff;border:1px solid var(--line);aspect-ratio:1/1}
  .soular-new .topic-media img{display:block;width:100%;height:100%;object-fit:cover}
  .soular-new .topic-kicker{font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--blue);font-weight:500;margin-bottom:18px}
  .soular-new .topic-body h3{font-family:"Murecho";font-weight:900;font-size:clamp(24px,3vw,38px);line-height:1.35;letter-spacing:-.02em;margin-bottom:20px}
  .soular-new .topic-body > p{color:var(--ink-soft);font-size:15.5px;line-height:1.95;margin-bottom:26px;word-break:keep-all;overflow-wrap:anywhere}
  .soular-new .topic-feats{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:14px 24px;margin-bottom:32px}
  @media(max-width:520px){.soular-new .topic-feats{grid-template-columns:1fr}}
  .soular-new .topic-feats li{display:flex;align-items:center;gap:11px;font-size:15px;color:var(--ink)}
  .soular-new .topic-feats li svg{flex:0 0 auto;width:22px;height:22px}
  .soular-new .btn-blue{background:var(--blue);color:#fff}
  .soular-new .btn-blue:hover{background:var(--blue-deep);transform:translateY(-2px);color:#fff}
  .soular-new .topic-dots{display:flex;justify-content:center;gap:10px;margin-top:44px}
  .soular-new .topic-dots button{width:10px;height:10px;padding:0;border:none;border-radius:50%;background:#bccaf0;cursor:pointer;transition:width .3s var(--ease),background .3s var(--ease)}
  .soular-new .topic-dots button:hover{background:var(--blue-tint)}
  .soular-new .topic-dots button.on{width:30px;border-radius:5px;background:var(--blue)}

  .soular-new .policy{border-top:1px solid rgba(255,255,255,.18)}
  .soular-new .p-item{display:grid;grid-template-columns:96px 1fr;gap:28px;align-items:center;padding:32px 4px;border-bottom:1px solid rgba(255,255,255,.18);transition:background .3s var(--ease)}
  .soular-new .p-item:hover{background:rgba(255,255,255,.03)}
  @media(max-width:560px){.soular-new .p-item{grid-template-columns:54px 1fr;gap:16px;padding:24px 0}}
  .soular-new .p-no{font-family:"Bricolage Grotesque";font-weight:800;font-size:clamp(28px,3.2vw,46px);color:var(--blue-tint);line-height:1;letter-spacing:-.02em}
  .soular-new .p-txt{font-family:"Murecho";font-weight:900;font-size:clamp(20px,2.8vw,36px);line-height:1.3}
  .soular-new .p-txt .p-pre{display:inline-block;font-family:"DM Mono",monospace;font-weight:500;font-size:clamp(12px,1vw,15px);letter-spacing:.08em;color:var(--blue-tint);margin-right:12px;vertical-align:middle}

  .soular-new .ctable{border:1px solid var(--line);border-radius:16px;overflow:hidden;background:var(--card)}
  .soular-new .crow{display:grid;grid-template-columns:200px 1fr;border-bottom:1px solid var(--line)}
  .soular-new .crow:last-child{border-bottom:none}
  @media(max-width:640px){.soular-new .crow{grid-template-columns:1fr}}
  .soular-new .crow .k{padding:20px 28px;font-family:"DM Mono",monospace;font-size:12px;letter-spacing:.06em;color:var(--ink-soft);background:#f6f9ff}
  .soular-new .crow .v{padding:20px 28px;font-size:15px}

  .soular-new .cta{background:var(--blue);color:var(--offwhite);padding:140px 0;text-align:center;position:relative;overflow:hidden}
  .soular-new .cta .shard{opacity:.4}
  .soular-new .cta-in{position:relative;z-index:2}
  .soular-new .cta .tag{color:var(--offwhite);margin-bottom:26px}
  .soular-new .cta h2{font-family:"Murecho";font-weight:900;font-size:clamp(34px,6vw,80px);line-height:1.1;letter-spacing:-.025em;margin-bottom:22px}
  .soular-new .cta h2 .dot{color:#fff}
  .soular-new .cta p{color:#dbe6ff;max-width:480px;margin:0 auto 38px;font-size:16px}
  .soular-new .cta .hero-actions{justify-content:center;opacity:1;transform:none}

  .soular-new .footer{background:var(--ink);color:var(--offwhite);padding:72px 0 44px}
  .soular-new .f-top{display:flex;justify-content:space-between;gap:48px;flex-wrap:wrap;margin-bottom:56px}
  .soular-new .footer .brand{font-size:24px;margin-bottom:14px}
  .soular-new .f-tag{color:#9aa6c2;font-size:14px;max-width:300px;line-height:1.8}
  .soular-new .f-cols{display:flex;gap:56px;flex-wrap:wrap}
  .soular-new .f-col h5{font-family:"DM Mono",monospace;font-size:11px;letter-spacing:.16em;color:#7682a0;text-transform:uppercase;margin-bottom:16px}
  .soular-new .f-col a{display:block;font-size:14px;color:#c2cce6;margin-bottom:10px;transition:color .2s}
  .soular-new .f-col a:hover{color:var(--blue-tint)}
  .soular-new .f-bot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #232a44;padding-top:26px;flex-wrap:wrap;gap:14px}
  .soular-new .f-bot span{font-family:"DM Mono",monospace;font-size:11.5px;color:#6a7390}

  @media(max-width:560px){.soular-new .wrap{padding:0 22px}.soular-new .nav{padding:16px 22px}.soular-new .zone{padding:84px 0}.soular-new .kw-line{font-size:14px}.soular-new .dhead{flex-direction:column;gap:8px}}
  @media (prefers-reduced-motion:reduce){.soular-new *{animation:none!important;transition-duration:.001ms!important}.soular-new .hero h1 .ln > span{transform:none}.soular-new .hero .tag,.soular-new .kw-line,.soular-new .hero-sub,.soular-new .hero-actions{opacity:1;transform:none}.soular-new .ru{opacity:1;transform:none}.soular-new .tile::before{display:none}}
  .soular-new :focus-visible{outline:3px solid var(--blue);outline-offset:3px}
`

const TOPIC_SLIDES = [
  {
    kicker: 'Medical HRMS',
    title: '医療特化型HRMS<br />メディマネージャー / デンタルマネージャー',
    desc: '「ケースクエスチョン」でスタッフの深層心理を可視化し、「明日Aさんにこう声をかけて」という具体的な行動指示を自動生成。院長とスタッフの相性診断に基づく適材適所で、離職を防ぎます。',
    feats: ['深層心理の可視化', '行動指示の自動生成', '院長×スタッフの相性診断', '離職防止・定着支援'],
    img: '/hrms.png',
    alt: '医療特化型HRMS メディマネージャーのイメージ',
    link: '#domains',
  },
  {
    kicker: 'AI Concierge',
    title: 'まごころAIチャット',
    desc: 'HPに常駐して定型質問へ即答し、現場の電話対応を軽減。夜間や休診日の問い合わせの取りこぼしを防ぎ、機会損失を抑制。患者の「本当のニーズ」を可視化し、広告費の無駄を抑えます。',
    feats: ['24時間自動対応', '電話対応の軽減', '本当のニーズを可視化', '広告費の最適化'],
    img: '/magokoro-ai.png',
    alt: 'まごころAIチャットのイメージ',
    link: '#domains',
  },
  {
    kicker: 'Official LINE Management',
    title: '公式ライン管理サービス<br />「ラインメイドリピちゃん」',
    desc: '顧客管理、自動応答、物販、スタッフの勤怠管理などさまざまな機能をこれひとつで。一度来院した患者様がまた来たくなる仕組みを、LINE公式アカウントで実現します。',
    feats: ['リッチメニュー管理', '予約リマインド配信', '24時間365日の自動対応', '物販管理'],
    img: '/linemade-square.png',
    alt: '公式ライン管理サービス「ラインメイドリピちゃん」のイメージ',
    link: 'https://linemade.link/lp',
  },
]

export default function SoularLanding() {
  const rootRef = useRef(null)
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [stripH, setStripH] = useState()

  useEffect(() => {
    if (paused) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setSlide((s) => (s + 1) % TOPIC_SLIDES.length), 5500)
    return () => clearInterval(id)
  }, [paused, slide])

  // 表示中スライドの高さにビューポートを合わせ、はみ出し・余白をなくす
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const el = root.querySelectorAll('.topic-slide')[slide]
      if (el) setStripH(el.offsetHeight)
    }
    measure()
    const r = requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(r)
      window.removeEventListener('resize', measure)
    }
  }, [slide])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

    const raf = requestAnimationFrame(() => root.classList.add('reveal'))

    const nav = root.querySelector('#nav')
    const onScroll = () => nav && nav.classList.toggle('is-stuck', window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })

    const track = root.querySelector('#ticker')
    if (track && !track.dataset.dup) {
      track.innerHTML += track.innerHTML
      track.dataset.dup = '1'
    }

    const kw = root.querySelector('#kw')
    const words = ['医療現場', 'クリニック経営', '採用', '組織づくり', '農業', '地域']
    let wi = 0
    let interval
    if (kw && !reduce) {
      interval = setInterval(() => {
        kw.classList.add('swap')
        setTimeout(() => {
          wi = (wi + 1) % words.length
          kw.textContent = words[wi]
          kw.classList.remove('swap')
        }, 230)
      }, 2200)
    }

    const countUp = (el) => {
      if (!el) return
      const target = parseFloat(el.getAttribute('data-count')) || 0
      const unitEl = el.querySelector('.u')
      const unit = unitEl ? unitEl.outerHTML : ''
      if (reduce) {
        el.innerHTML = target + unit
        return
      }
      const s = performance.now()
      const dur = 1200
      const f = (now) => {
        const p = Math.min((now - s) / dur, 1)
        const e = 1 - Math.pow(1 - p, 3)
        el.innerHTML = Math.floor(e * target) + unit
        if (p < 1) requestAnimationFrame(f)
      }
      requestAnimationFrame(f)
    }

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('in')
          if (entry.target.classList.contains('stat')) {
            countUp(entry.target.querySelector('.s-num'))
          }
          io.unobserve(entry.target)
        }),
      { threshold: 0.16 },
    )
    root.querySelectorAll('.ru').forEach((el) => io.observe(el))

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      if (interval) clearInterval(interval)
      io.disconnect()
      root.classList.remove('reveal')
    }
  }, [])

  return (
    <div ref={rootRef} className="soular-new">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=DM+Mono:wght@400;500&family=Murecho:wght@400;700;900&family=Schibsted+Grotesk:wght@400;500;700&display=swap"
      />

      <nav className="nav" id="nav">
        <a href="#" className="brand">soular</a>
        <div className="nav-links">
          <a href="#philosophy">理念</a>
          <a href="#story">創業</a>
          <a href="#domains">事業領域</a>
          <a href="#topics">実績</a>
          <a href="#company">会社情報</a>
          <a href="#start" className="nav-cta">お問い合わせ</a>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-grid" />
        <div className="shards"><span className="shard s1" /><span className="shard s2" /><span className="shard s3" /></div>
        <div className="hero-inner wrap">
          <h1>
            <span className="ln"><span>魂を込め、</span></span>
            <span className="ln"><span>尽くし、</span></span>
            <span className="ln"><span>熱く挑む<span className="dot">。</span></span></span>
          </h1>
          <div className="kw-line">
            <span className="pr">{'>'}</span>
            <span>[{' '}</span>
            <span className="kw-wrap"><span className="kw" id="kw">医療現場</span></span>
            <span>{' '}]</span>
            <span>{' '}に、魂を。</span>
            <span className="caret">_</span>
          </div>
          <p className="hero-sub">株式会社soularは、医療・人事・農業の現場に魂を込めて伴走する事業会社です。<br />不可能を可能にする挑戦を通じて、人々の明るい未来を設計します。</p>
          <div className="hero-actions">
            <a href="#domains" className="btn btn-fill">事業領域を見る <span className="arr">→</span></a>
            <a href="#philosophy" className="btn btn-line">理念を読む</a>
          </div>
        </div>
      </header>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track" id="ticker">
          <span className="ticker-item"><b>医療特化型HRMS</b> メディマネージャー / デンタルマネージャー</span>
          <span className="ticker-item"><b>まごころAIチャット</b> 24時間働くデジタル受付</span>
          <span className="ticker-item"><b>LINEメイド</b> 月給1.5万円の電子お手伝いさん</span>
          <span className="ticker-item"><b>超・伴走型 外部人事</b> 採用から定着まで</span>
          <span className="ticker-item"><b>次世代農業</b> よもぎと米の新しい循環</span>
        </div>
      </div>

      {/* PHILOSOPHY */}
      <section className="zone" id="philosophy">
        <div className="wrap">
          <div className="z-head ru"><span className="tag">Corporate Identity</span><h2>すべての事業に魂を宿し、<br /><span className="hl">社会を照らす太陽となる。</span></h2><p>私たちは、不可能を可能にする挑戦を通じて、人々の明るい未来を設計します。</p></div>
          <p className="phil-lead ru">誠意や想い、開発しているITサービス、人事としての人との向き合い、農業など、すべての事業領域において一切の妥協なく<b>「魂」</b>を込めて取り組むこと。そして、私たちが関わる医療現場・企業・農家の方々にとって、未来を明るく照らす<b>「太陽」</b>のような存在であり続けるという、2つの約束が込められています。</p>
        </div>
      </section>

      {/* TOPICS / RECENT WORK */}
      <section className="zone" id="topics" style={{ background: '#e7eeff' }}>
        <div className="wrap">
          <div className="z-head center ru"><span className="tag">Topics</span><h2>Recent <span className="hl">Work.</span></h2></div>
          <div className="topic-show ru" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="topic-viewport" style={{ height: stripH ? `${stripH}px` : undefined }}>
              <div className="topic-strip" style={{ transform: `translateX(-${slide * 100}%)` }}>
                {TOPIC_SLIDES.map((s, i) => (
                  <div className="topic-slide" key={s.kicker} aria-hidden={i !== slide ? 'true' : undefined}>
                    <div className="topic-media">
                      <img src={s.img} alt={s.alt} loading="lazy" onLoad={(e) => { if (i === slide) setStripH(e.currentTarget.closest('.topic-slide').offsetHeight) }} />
                    </div>
                    <div className="topic-body">
                      <div className="topic-kicker">{s.kicker}</div>
                      <h3 dangerouslySetInnerHTML={{ __html: s.title }} />
                      <p>{s.desc}</p>
                      <ul className="topic-feats">
                        {s.feats.map((f) => (
                          <li key={f}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="11" stroke="#22b34c" strokeWidth="1.6" /><path d="M7 12.4l3.2 3.1L17 8.5" stroke="#22b34c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <a className="btn btn-blue" href={s.link} target={s.link.startsWith('http') ? '_blank' : undefined} rel={s.link.startsWith('http') ? 'noreferrer' : undefined}>詳細を見る <span className="arr">→</span></a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="topic-dots">
              {TOPIC_SLIDES.map((s, i) => (
                <button key={s.kicker} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} aria-label={`スライド${i + 1}を表示`} aria-current={i === slide ? 'true' : undefined} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="zone zone--ink" id="story">
        <div className="wrap">
          <div className="story-top">
            <div className="z-head ru"><span className="tag">Our Story</span><h2>原体験から生まれた、<span className="hl">3つの挑戦。</span></h2><p>これら3つの領域は、代表自身が培ってきた「属人的な強み」を「再現性のある仕組み」へと昇華・言語化できる確固たるジャンルです。</p></div>
            <div className="venn-wrap ru">
              <svg className="venn" viewBox="0 0 600 470" role="img" aria-label="医療×IT・人事・農業の3領域とその重なり">
                <circle className="vc" cx="225" cy="195" r="150" />
                <circle className="vc" cx="375" cy="195" r="150" />
                <circle className="vc" cx="300" cy="305" r="150" />
                <text className="lab" x="160" y="178" textAnchor="middle">医療 × IT</text>
                <text className="en" x="160" y="200" textAnchor="middle">HEALTHCARE IT</text>
                <text className="lab" x="442" y="178" textAnchor="middle">人事</text>
                <text className="en" x="442" y="200" textAnchor="middle">HUMAN RESOURCES</text>
                <text className="lab" x="300" y="400" textAnchor="middle">農業・食</text>
                <text className="en" x="300" y="422" textAnchor="middle">AGRICULTURE</text>
                <text className="ctr" x="300" y="236" textAnchor="middle">SOUL × SOLAR</text>
              </svg>
            </div>
          </div>
          <div className="story">
            <div className="s ru"><div className="n">Healthcare × IT</div><h4>適正な価値と、それ以上の伴走を。</h4><p>医療業界はクローズドな側面が強く、ITやAI導入が進む一方で「適正価格を大幅に超える販売」や「導入後の雑なフォロー」が横行しています。新卒から医療業界に身を置き、人事や集患などあらゆる切り口から現場を見てきたからこそ、「適正な金額での提供」と「適正価格を遥かに超える手厚い伴走」をお約束します。</p></div>
            <div className="s ru"><div className="n">Human Resources</div><h4>企業の課題に寄り添う「外部人事」として。</h4><p>人材紹介と人事、双方の現場を経験してきたからこそできる支援の形があります。「求職者の意向度や企業理解度の向上」「入社後のオンボーディング・研修」「採用戦略の構築」を活かし、外注人事として企業ごとの課題感に深くコミットします。</p></div>
            <div className="s ru"><div className="n">Agriculture</div><h4>法人と農業の架け橋に。18歳からの情熱。</h4><p>18歳で経営学部に入学した時から「30歳までに農業に携わる事業を創る」と決意し、「よもぎ」と「米」に強い関心を抱き続けてきました。医療の世界で多くの院長や経営者と話す中、参入ハードルの高い現実に直面。「法人と農業を繋げられるのは自分しかいない」と確信し、長年の情熱を具現化します。</p></div>
          </div>
        </div>
      </section>

      {/* DOMAINS */}
      <section className="zone" id="domains">
        <div className="wrap">
          <div className="z-head ru"><span className="tag">Our Services</span><h2>3つの領域で、<span className="hl">現場の課題に挑む。</span></h2></div>

          <div className="domain ru">
            <div className="dhead">
              <div className="no">01</div>
              <div><div className="en">Healthcare IT ／ 最重点領域</div><h3>IT事業（医療特化型システム）</h3><p className="dd">医療現場の<b>「底の抜けたバケツ（離職や機会損失）」</b>を塞ぎ、院長をマネジメントの重圧から解放する経営オートメーションシステム。適正価格と、それを遥かに超える手厚い伴走で真の価値を還元します。</p></div>
            </div>
            <div className="svc-grid">
              <div className="tile"><div className="tile-thumb"><img src="/hrms.png" alt="医療特化型HRMSのイメージ" loading="lazy" /></div><div className="t-no">01 / Medical HRMS</div><h4>医療特化型HRMS<br />メディマネージャー / デンタルマネージャー</h4><div className="cc">組織の定期健診と、明日使える処方箋</div><p>「ケースクエスチョン」で深層心理を可視化し、「明日Aさんにこう声をかけて」という具体的な行動指示を自動生成。院長とスタッフの相性診断に基づく適材適所で、離職を防ぎ、組織の定着を支えます。</p></div>
              <div className="tile"><div className="tile-thumb"><img src="/magokoro-ai.png" alt="まごころAIチャットのイメージ" loading="lazy" /></div><div className="t-no">02 / AI Concierge</div><h4>まごころAIチャット</h4><div className="cc">24時間働くデジタル受付</div><p>HPに常駐し定型質問へ即答し、現場の電話対応を軽減。夜間や休診日の問い合わせの取りこぼしを防ぎ、機会損失を抑制。患者の「本当のニーズ（検索キーワード）」を可視化し、広告費の無駄を抑えます。</p></div>
              <div className="tile"><div className="tile-thumb"><img src="/linemade-square.png" alt="LINEメイドのイメージ" loading="lazy" /></div><div className="t-no">03 / Official LINE</div><h4>LINEメイド</h4><div className="cc">月給1.5万円の電子お手伝いさん</div><p>予約・リマインド・リコール（定期検診案内）・デジタル診察券をLINEで全自動化。【独自】スタッフ専用メニューでの出退勤・シフト管理・業務日報を完結。【独自】訪問歯科の請求書を訪問先から直接ご家族のLINEへ送信。</p><a className="more" href="https://linemade.link/lp" target="_blank" rel="noreferrer">VIEW DETAIL →</a></div>
            </div>
          </div>

          <div className="domain ru">
            <div className="dhead">
              <div className="no">02</div>
              <div><div className="en">Human Resources</div><h3>人事事業（超・伴走型 外部人事）</h3><p className="dd">採用から定着、組織文化の醸成まで、企業の<b>「熱き人事部門」</b>として二人三脚で伴走する完全オーダーメイドの人事支援。</p></div>
            </div>
            <div className="svc-grid cols4">
              <div className="tile"><div className="t-no">01 / Strategy</div><h4>採用計画・戦略立案</h4><p>経営ビジョンや現場課題に基づいた、上流の採用戦略構築。</p></div>
              <div className="tile"><div className="t-no">02 / Operation</div><h4>運用代行・クロージング</h4><p>媒体運用から面接の実施、候補者の心を動かす「口説き落とし」まで実行。</p></div>
              <div className="tile"><div className="t-no">03 / Onboarding</div><h4>入社前インターン・研修</h4><p>入社前の助走期間をサポートし、ミスマッチ防止と即戦力化を実現。</p></div>
              <div className="tile"><div className="t-no">04 / Culture</div><h4>社内イベントの企画運営</h4><p>組織の士気を高める集会や社内イベントのゼロからのプロデュースと進行管理。</p></div>
            </div>
          </div>

          <div className="domain ru">
            <div className="dhead">
              <div className="no">03</div>
              <div><div className="en">Agriculture &amp; Food</div><h3>農業・食事業（次世代農業プロデュース）<span className="soon">準備中</span></h3><p className="dd">医療と農業を繋ぎ、生産者も消費者も豊かになる<b>「新しい食の循環」</b>を創る。</p></div>
            </div>
            <div className="svc-grid">
              <div className="tile"><div className="t-no">01 / Farmer Support</div><h4>農家の包括的支援</h4><p>よもぎ・米農家の環境改善、就労支援を通じた雇用創出。</p></div>
              <div className="tile"><div className="t-no">02 / Direct Trade</div><h4>加工・ダイレクトトレード</h4><p>中間マージンを排除し、適正価格での卸売で農家の収入を直接向上。</p></div>
              <div className="tile"><div className="t-no">03 / Product</div><h4>オリジナル商品の開発</h4><p>美容やストレス緩和に効くよもぎ、グルテンフリーのお米など、働く人への「処方箋」となる食の提供。</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* POLICY */}
      <section className="zone zone--ink" id="policy">
        <div className="wrap">
          <div className="z-head ru"><span className="tag">Our Policy</span><h2>soularの、<span className="hl">5つのポリシー。</span></h2><p style={{ maxWidth: 'none' }}>「適正価格で、それ以上の伴走を」。私たちが現場にお約束する、5つの「どこよりも」です。</p></div>
          <div className="policy">
            <div className="p-item ru"><div className="p-no">01</div><div className="p-txt"><span className="p-pre">どこよりも</span>手厚いフォロー</div></div>
            <div className="p-item ru"><div className="p-no">02</div><div className="p-txt"><span className="p-pre">どこよりも</span>柔軟な対応</div></div>
            <div className="p-item ru"><div className="p-no">03</div><div className="p-txt"><span className="p-pre">どこよりも</span>手頃で明朗な価格</div></div>
            <div className="p-item ru"><div className="p-no">04</div><div className="p-txt"><span className="p-pre">どこよりも</span>早い対応と導入</div></div>
            <div className="p-item ru"><div className="p-no">05</div><div className="p-txt"><span className="p-pre">どこよりも</span>使いやすい仕様とデザイン</div></div>
          </div>
        </div>
      </section>

      {/* COMPANY */}
      <section className="zone" id="company" style={{ background: '#e7eeff' }}>
        <div className="wrap">
          <div className="z-head ru"><span className="tag">Company</span><h2>会社情報</h2></div>
          <div className="ctable ru">
            <div className="crow"><div className="k">会社名</div><div className="v">株式会社soular</div></div>
            <div className="crow"><div className="k">設立</div><div className="v">2026年3月</div></div>
            <div className="crow"><div className="k">代表者</div><div className="v">{'代表取締役\u3000浜田颯流'}</div></div>
            <div className="crow"><div className="k">事業内容</div><div className="v">IT事業（医療特化型システムの開発・販売・運用）<br />人事事業（超・伴走型 外部人事支援）<br />農業・食事業（次世代農業プロデュース）</div></div>
            <div className="crow"><div className="k">所在地</div><div className="v">〒110-0005 東京都台東区上野1丁目17番6号 広小路ビル8F-B</div></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="start">
        <div className="shards"><span className="shard s2" style={{ left: '8%', bottom: '10%' }} /><span className="shard s3" style={{ right: '12%', top: '24%' }} /></div>
        <div className="cta-in wrap">
          <span className="tag">Contact</span>
          <h2>その課題に、<br />魂を込めて<span className="dot">。</span></h2>
          <p>医療・人事・農業——どの領域も、まずは現場の声から。お仕事のご依頼・ご相談はお気軽にどうぞ。</p>
          <div className="hero-actions"><a href="mailto:info@soular-inc.com" className="btn btn-fill">お問い合わせ <span className="arr">→</span></a></div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div className="f-top">
            <div><div className="brand">soular</div><p className="f-tag">すべての事業に魂（Soul）を宿し、社会を照らす太陽（Solar）となる。株式会社soular。</p></div>
            <div className="f-cols">
              <div className="f-col"><h5>Services</h5><a href="#domains">IT事業（医療特化）</a><a href="#domains">人事事業</a><a href="#domains">農業・食事業</a><a href="https://linemade.link/lp" target="_blank" rel="noreferrer">LINEメイド</a></div>
              <div className="f-col"><h5>Company</h5><a href="#philosophy">理念</a><a href="#story">創業ストーリー</a><a href="#company">会社情報</a><a href="#start">お問い合わせ</a></div>
            </div>
          </div>
          <div className="f-bot"><span>© 2026 SOULAR, INC.</span><span>〒110-0005 東京都台東区上野1-17-6 広小路ビル8F-B</span></div>
        </div>
      </footer>
    </div>
  )
}
