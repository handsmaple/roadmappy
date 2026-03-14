import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

/* ─────────────────────────────────────────
   GLOBAL STYLES  (roadmap + planner merged)
───────────────────────────────────────── */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #F2F1EC; font-family: 'DM Sans', -apple-system, sans-serif; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #C8C7BE; border-radius: 99px; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(7px); } to { opacity:1; transform:translateY(0); } }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes pop { 0%{transform:scale(0.94);opacity:0} 100%{transform:scale(1);opacity:1} }
    @keyframes slideIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
    .fade-up { animation: fadeUp 0.22s ease both; }
    .pop { animation: pop 0.14s ease both; }
    .slide { animation: slideIn 0.18s ease both; }
    /* planner */
    .day-col { transition: background 0.12s; }
    .day-col.over { background: rgba(79,70,229,0.05) !important; outline: 2px dashed rgba(79,70,229,0.2); outline-offset: -2px; }
    .kcard { transition: box-shadow 0.12s, transform 0.12s; cursor: grab; }
    .kcard:hover { box-shadow: 0 3px 10px rgba(0,0,0,0.10) !important; transform: translateY(-1px); }
    .kcard:active { cursor: grabbing; }
    .p-add-btn:hover { background: rgba(79,70,229,0.07) !important; color: #4F46E5 !important; border-color: #4F46E5 !important; }
    .p-nav-btn:hover { background: #EEEEF8 !important; }
    .ai-row { transition: background 0.12s; }
    .ai-row:hover { background: #F5F6FF !important; }
    input, textarea { font-family: 'DM Sans', sans-serif !important; }
    button { cursor: pointer; }
  `}</style>
);

/* ─────────────────────────────────────────
   COLOR TOKENS
   T = roadmap theme  |  C = planner theme
───────────────────────────────────────── */
const T = {
  bg:"#F2F1EC", s1:"#FFFFFF", s2:"#ECEAE4", s3:"#E2E0D8",
  border:"#DEDAD0", border2:"#CAC8BE",
  cyan:"#1D4ED8", green:"#15803D", yellow:"#92400E",
  purple:"#5B21B6", orange:"#C2410C", red:"#B91C1C",
  text:"#1A1917", sub:"#57534E", muted:"#78716C", muted2:"#A8A29E",
  font:"'DM Sans',-apple-system,sans-serif",
  disp:"'Syne','DM Sans',sans-serif",
};

const C = {
  bg:"#F7F8FC", surface:"#FFFFFF", surface2:"#F0F2F9",
  border:"#E4E7F0", border2:"#CDD2E1",
  indigo:"#4F46E5", indigoBg:"#EEF0F8",
  green:"#059669", greenBg:"#ECFDF5",
  amber:"#D97706", amberBg:"#FFFBEB",
  rose:"#E11D48", roseBg:"#FFF1F2",
  sky:"#0284C7", skyBg:"#F0F9FF",
  violet:"#7C3AED", violetBg:"#F5F3FF",
  text:"#111827", sub:"#374151", muted:"#6B7280", muted2:"#9CA3AF",
  todayBg:"#F0F1FF",
  font:"'DM Sans',sans-serif", disp:"'Syne','DM Sans',sans-serif",
};

/* ─────────────────────────────────────────
   ROADMAP STATIC DATA
───────────────────────────────────────── */
const DEFAULT_PHASES = [
  { id:1, short:"Cash + Learn", title:"Cash Bridge + Skill Build", date:"Mar–Apr 2026", target:3500, color:T.cyan,
    tasks:[
      {id:"1-1",cat:"Tutoring",text:"Post on 김과외/숨고 — list all 4 subjects (국/수/영/과), SKY credential front-and-center"},
      {id:"1-2",cat:"Tutoring",text:"Set rate at ₩40,000/hr (justified: SKY + 수능 전과목 1-2등급)"},
      {id:"1-3",cat:"Tutoring",text:"Secure first 2 students within Week 1 (goal: 6 hrs/week minimum)"},
      {id:"1-4",cat:"Tutoring",text:"Scale to 4–5 students, 10–12 hrs/week by end of Month 1"},
      {id:"1-5",cat:"Tutoring",text:"Ask every parent for a referral after first month — word-of-mouth is #1 channel"},
      {id:"1-6",cat:"Setup",text:"Create Make.com free account + complete official tutorial (Days 1–3)"},
      {id:"1-7",cat:"Setup",text:"Create 크몽 seller account — save listing for later"},
      {id:"1-8",cat:"Setup",text:"Create Upwork freelancer profile — fill 100% but don't bid yet"},
      {id:"1-9",cat:"Setup",text:"Create LinkedIn profile — Korean + English"},
      {id:"1-10",cat:"Learning",text:"Week 1–2: Watch Make.com/n8n crash courses (2 hrs/day during non-tutoring time)"},
      {id:"1-11",cat:"Learning",text:"Week 2–3: Build Automation #1 — Email auto-reply bot (practice project)"},
      {id:"1-12",cat:"Learning",text:"Week 3–4: Build Automation #2 — Lead capture → Notion DB"},
      {id:"1-13",cat:"Learning",text:"Week 5–6: Build Automation #3 — AI customer support chatbot"},
      {id:"1-14",cat:"Portfolio",text:"Build free demo: Korean 학원 AI chatbot (use your tutoring knowledge)"},
      {id:"1-15",cat:"Portfolio",text:"Record 3-min Loom walkthrough of each demo"},
      {id:"1-16",cat:"Portfolio",text:"Create Notion portfolio page (KR + EN) with all 3 demos"},
      {id:"1-17",cat:"Milestone",text:"✅ Month 2 checkpoint: ₩40K/hr × 10hrs/week = ₩1.6M/mo tutoring + portfolio ready"},
    ]},
  { id:2, short:"First Clients", title:"First Agency Revenue", date:"May–Jul 2026", target:12000, color:T.green,
    tasks:[
      {id:"2-1",cat:"Outreach",text:"Post first 크몽 service listing at ₩200K–₩400K intro price"},
      {id:"2-2",cat:"Outreach",text:"Write Korean cold DM script with Claude — target 학원/병원/부동산"},
      {id:"2-3",cat:"Outreach",text:"Write English outreach script for Upwork proposals"},
      {id:"2-4",cat:"Outreach",text:"Send 15 Korean Instagram DMs per day for 2 weeks straight (target: 200+)"},
      {id:"2-5",cat:"Outreach",text:"Bid on 5+ Upwork AI automation projects per week"},
      {id:"2-6",cat:"Revenue",text:"Close first paying agency client (any platform, any price)"},
      {id:"2-7",cat:"Revenue",text:"Close second paying client — aim for ₩500K+ this time"},
      {id:"2-8",cat:"Revenue",text:"Close third client — target retainer model (₩300K–500K/month)"},
      {id:"2-9",cat:"Tutoring",text:"Maintain tutoring at 8–10 hrs/week (₩1.3–1.6M/month cash flow)"},
      {id:"2-10",cat:"Setup",text:"Register domain on Namecheap (~$12) + connect to Vercel"},
      {id:"2-11",cat:"Setup",text:"Create Stripe account for international payments"},
      {id:"2-12",cat:"Content",text:"Post first 3 Naver Blog posts about AI automation for Korean SMBs"},
      {id:"2-13",cat:"Content",text:"Post first LinkedIn build-in-public update (EN)"},
      {id:"2-14",cat:"Digital Products",text:"Create first Notion template for Korean 학원 owners (free lead magnet)"},
      {id:"2-15",cat:"Milestone",text:"✅ Month 4 checkpoint: $12K cumulative (tutoring ~$6K + agency ~$3K + buffer)"},
    ]},
  { id:3, short:"Agency Scale", title:"Agency Scale + First Products", date:"Aug–Oct 2026", target:28000, color:T.yellow,
    tasks:[
      {id:"3-1",cat:"Revenue",text:"Scale to 4–6 active agency clients (mix of 크몽 + Upwork + direct)"},
      {id:"3-2",cat:"Revenue",text:"Raise 크몽 packages to ₩500K–₩1M per project"},
      {id:"3-3",cat:"Revenue",text:"Raise Upwork rate to $30–$45/hr (justified by 3+ reviews)"},
      {id:"3-4",cat:"Revenue",text:"Land first ₩1M+ single project"},
      {id:"3-5",cat:"Tutoring",text:"Reduce tutoring to 4–6 hrs/week (keep best-paying students only)"},
      {id:"3-6",cat:"Product",text:"Create first paid digital product — niche prompt pack or template ($19–$39) on Gumroad"},
      {id:"3-7",cat:"Product",text:"Create Beehiiv email list — use Naver Blog + LinkedIn to drive signups"},
      {id:"3-8",cat:"Content",text:"Start Korean faceless YouTube channel (audience build, NOT revenue yet)"},
      {id:"3-9",cat:"Content",text:"Post weekly Naver Blog — aim for 10 posts by end of phase"},
      {id:"3-10",cat:"Learning",text:"Start learning Cursor AI or v0.dev basics for vibe coding"},
      {id:"3-11",cat:"Milestone",text:"✅ Month 7 checkpoint: $28K cumulative · agency revenue > tutoring revenue"},
    ]},
  { id:4, short:"Multi-Stream", title:"Multiple Revenue Streams", date:"Nov 2026–Jun 2027", target:72000, color:T.purple,
    tasks:[
      {id:"4-1",cat:"Revenue",text:"Agency: 5–8 retainer clients at ₩500K–₩1.5M/month each"},
      {id:"4-2",cat:"Revenue",text:"Raise Upwork rate to $45–$60/hr"},
      {id:"4-3",cat:"Revenue",text:"Land first $3,000+ high-ticket project (full workflow automation)"},
      {id:"4-4",cat:"Product",text:"Identify first micro-SaaS idea from client pain points"},
      {id:"4-5",cat:"Product",text:"Build micro-SaaS MVP with AI dev tools (Cursor + v0.dev)"},
      {id:"4-6",cat:"Product",text:"Launch on Product Hunt + list on 크몽 digital products"},
      {id:"4-7",cat:"Course",text:"Launch mini-course: 'AI 자동화 기초' on 클래스101 (₩59,000)"},
      {id:"4-8",cat:"Course",text:"Launch English version on Gumroad ($49)"},
      {id:"4-9",cat:"Tutoring",text:"Phase out tutoring entirely OR keep 1–2 premium students"},
      {id:"4-10",cat:"Scale",text:"Hire first part-time VA for admin/scheduling (~$300–500/mo)"},
      {id:"4-11",cat:"Content",text:"YouTube: 20+ videos posted, aim for 500+ subscribers"},
      {id:"4-12",cat:"Milestone",text:"✅ Month 15 checkpoint: $72K cumulative · $6K–$9K/month income"},
    ]},
  { id:5, short:"Compound", title:"Compound Growth · Choose Your Path", date:"Jul 2027–Mar 2028", target:150000, color:T.orange,
    tasks:[
      {id:"5-1",cat:"Path A",text:"Agency: scale to $8K–$12K/month with 8–12 clients + subcontractors"},
      {id:"5-2",cat:"Path A",text:"Productize your best automation into a repeatable package"},
      {id:"5-3",cat:"Path B",text:"SaaS: if micro-SaaS gained traction, push to 100+ paying users"},
      {id:"5-4",cat:"Path B",text:"SaaS: target $2K–$5K MRR (top 30% of micro-SaaS outcomes)"},
      {id:"5-5",cat:"Path C",text:"Course: scale to ₩3M–5M/month with ads + organic YouTube"},
      {id:"5-6",cat:"Path C",text:"Create flagship course — $197 INT / ₩190K KR"},
      {id:"5-7",cat:"Scale",text:"Total monthly income target: $8K–$15K/month across all streams"},
      {id:"5-8",cat:"Scale",text:"Build email list to 2,000+ subscribers"},
      {id:"5-9",cat:"Scale",text:"Enterprise/retainer: land 1–2 clients at ₩3M+/month"},
      {id:"5-10",cat:"Milestone",text:"✅ Year 2 target: $150K cumulative (conservative)"},
      {id:"5-11",cat:"Milestone",text:"🎯 Stretch target: $250K cumulative (top 10% outcome)"},
    ]},
];

const DEFAULT_TODAY_TASKS = [
  {id:"t0",pri:"⚠️",time:"0 min",text:"Your $1,000 is investment capital, NOT survival money. Living costs are covered. Protect it."},
  {id:"t1",pri:"🔴",time:"15 min",text:"김과외 or 숨고 — register as tutor. List: 국어/수학/영어/과학, SKY + 수능 1-2등급 in profile"},
  {id:"t2",pri:"🔴",time:"10 min",text:"당근마켓/에브리타임 — post tutor availability (₩40,000/hr, 수능 전과목 1-2등급)"},
  {id:"t3",pri:"🔴",time:"20 min",text:"make.com — create free account + open the tutorial (don't need to finish today)"},
  {id:"t4",pri:"🔴",time:"15 min",text:"upwork.com — create freelancer profile (fill 100%, set $20/hr placeholder rate)"},
  {id:"t5",pri:"🔴",time:"10 min",text:"kmong.com — create seller account (save listing for Phase 2)"},
  {id:"t6",pri:"🟡",time:"30 min",text:"YouTube: Watch 'Make.com tutorial 2025' or 'n8n crash course' — 30 min today"},
  {id:"t7",pri:"🟡",time:"20 min",text:"LinkedIn — create bilingual profile, headline: 'AI Automation Specialist | SKY Univ'"},
  {id:"t8",pri:"🟡",time:"10 min",text:"Set weekly schedule: tutoring hours (evenings/weekends) vs. learning hours (mornings/weekdays)"},
];

const WEEK1_PLAN = [
  {day:"Day 1–2",focus:"Get listed + start learning",actions:["Register on 김과외/숨고/당근마켓 as tutor — list all 4 subjects with credentials","Create Make.com, Upwork, 크몽 accounts — fill profiles 100%","Watch 'Make.com crash course' 2 hrs — take notes on what you don't understand"]},
  {day:"Day 3–5",focus:"Secure first students + build first automation",actions:["Follow up with tutor platform leads — aim for 2 students confirmed this week","Start first practice automation: email auto-reply bot in Make.com","Build second automation: lead capture → Notion DB — document everything in screenshots"]},
  {day:"Day 6–7",focus:"First tutoring session + portfolio groundwork",actions:["Deliver first tutoring session (₩40K/hr) — ask for referral commitment at end","Build third automation: simple AI chatbot flow — record a Loom walkthrough","Create Notion portfolio page with your 3 demo automations — this becomes your pitch deck"]},
];

const NICHES = [
  {title:"KSAT Tutoring (Cash Bridge)",badge:"#1 Immediate",bc:T.green,desc:"SKY + 수능 전과목 1-2등급 = ₩40K–50K/hr. 4–6 students, 10–12 hrs/week. Generates ₩1.6M–2.4M/month from Week 2. Phase out as agency scales.",cost:"₩0",ceil:"₩2.5M/mo",comp:"Moderate",note:"2024 통계청: Korean private education spending hit ₩29.2 trillion, up 7.7% YoY. 80% participation rate."},
  {title:"AI Automation Agency",badge:"#1 Growth",bc:T.cyan,desc:"Make.com / n8n + ChatGPT API for Korean & international SMBs. Remote-only via Loom demos. 크몽 + Upwork + DMs. Revenue starts Month 3–4 after skill build.",cost:"$0–$50/mo",ceil:"$8K–$15K/mo",comp:"Growing",note:"Upwork 2025: AI engineer median rate $50/hr. Beginners from non-US countries typically start $15–$30/hr."},
  {title:"B2B Cold Outreach Copywriting",badge:"High ROI",bc:T.green,desc:"Use AI to write high-converting cold email sequences for B2B companies. $500–$2,500/month per retainer client.",cost:"$0",ceil:"$5K/mo",comp:"Low",note:"Email marketing ROI is well-documented across multiple industry studies at $30–$40 return per $1 spent."},
  {title:"Korean-English Translation",badge:"Non-AI Hedge",bc:T.purple,desc:"Your bilingual SKY background = premium positioning. 크몽/프리모아 pay ₩30K–60K per page. Game, legal, marketing localization. AI hasn't killed this — it shifted it to post-editing.",cost:"₩0",ceil:"₩1.5M/mo part-time",comp:"Moderate",note:"Korean gaming industry generated $7.1B in 2023 (KOCCA). Localization is a constant need."},
  {title:"Hyper-Niche Digital Products",badge:"Passive",bc:T.purple,desc:"Build and sell hyper-specific prompt packs, Notion templates, Figma kits on Gumroad. Zero fulfillment cost.",cost:"$0",ceil:"$2K/mo",comp:"Low",note:"Gumroad creators with <5 products can generate meaningful income, but expect $100–$500/mo initially."},
  {title:"Korean Faceless YouTube",badge:"Long Game",bc:T.yellow,desc:"⚠️ 12–18 month play, NOT 6-month revenue. Start Month 3 as audience-building. Monetize via affiliate + digital products.",cost:"$0",ceil:"Variable",comp:"Very Low",note:"Pew Research (2019): Top 3% of YouTube channels generate ~85% of views. Most channels earn <$100/mo."},
  {title:"AI Chatbots for Local Biz",badge:"Agency Add-on",bc:T.orange,desc:"Customer service bots for Korean clinics, restaurants, 부동산. Setup ₩300K–₩1M + monthly maintenance ₩100K–300K.",cost:"$20–100/mo",ceil:"$3K/mo",comp:"Low",note:"Natural upsell from automation clients. Best sold as add-on, not standalone."},
  {title:"⛔ Crypto Day Trading",badge:"Avoid",bc:T.red,desc:"ESMA data: 74–89% of retail crypto traders lose money. Not a viable income source at any capital level. Long-hold only if/when savings exceed $50K.",cost:"$1,000+ at risk",ceil:"Negative expected value",comp:"Extreme",note:"ESMA 2023 regulatory disclosures: 74–89% of retail CFD/crypto accounts lose money."},
];

const PROMPTS = [
  {title:"01 · RCTF Framework",sub:"Role + Context + Task + Format",
    bad:"Write me a cold email for my business",
    good:`[ROLE] You are a senior B2B sales copywriter with 10 years in SaaS outreach.\n\n[CONTEXT] I run an AI automation agency targeting dental clinics in Korea. I automate patient follow-ups and reminders — saves 15hrs/week. Average clinic saves ₩4,000,000/month.\n\n[TASK] Write a cold Instagram DM to a clinic owner with 2 locations. Lead with the pain (staff forgetting follow-ups), introduce the solution briefly, soft CTA asking if they want a 3-min demo video.\n\n[FORMAT] Under 120 words. Conversational Korean. No corporate language.`,
    tip:"The AI knows who it's being, what situation exists, exactly what to produce, and the constraints. Near-publishable output on the first try."},
  {title:"02 · Chain of Thought",sub:"Make AI reason step-by-step before answering",
    bad:"What should I charge for my automation service?",
    good:`Before answering, think through this step by step and show your reasoning:\n\nI want to price my AI chatbot setup for Korean dental clinics. Consider:\n(1) What does it save them in staff time and cost?\n(2) What do Korean competitors charge?\n(3) What price closes deals without undervaluing me?\n(4) One-time fee vs monthly retainer?\n\nWalk me through each point, then give a final recommendation with rationale.`,
    tip:"Use this for strategy, pricing, planning — any time you need reasoning, not just generation."},
  {title:"03 · Few-Shot Examples",sub:"Show the pattern — AI replicates it instantly",
    bad:"Write YouTube titles for my channel",
    good:`Write titles in my style. Here are examples that performed well:\n\nExample 1: "I tried to make ₩10M in 30 days with no skills. Here's what happened."\nExample 2: "I automated a Korean clinic with AI. They made ₩8M more next month."\nExample 3: "Zero coding. Zero experience. I built an AI business in 2 weeks."\n\nNow generate 10 titles for a video about landing my first client via 200 Instagram DMs.`,
    tip:"AI is a pattern machine. Feed it the pattern, it replicates at scale."},
  {title:"04 · The Critique Loop",sub:"AI attacks its own output — 3× stronger result",
    bad:"Write a sales script for pitching AI automation",
    good:`Step 1: Write a Zoom sales script for pitching AI automation to a Korean restaurant owner.\n\nStep 2: Now act as a skeptical Korean restaurant owner who is busy, has heard too many tech pitches, and doesn't trust salespeople. List every objection and weak point.\n\nStep 3: Rewrite the script to handle all those objections preemptively.`,
    tip:"Three iterations in one prompt. The final output handles objections you never would have thought of."},
  {title:"05 · The Meta-Prompt",sub:"Use this when starting any new project",
    bad:"Help me plan my business strategy",
    good:`Before we begin, act as both an expert practitioner AND a devil's advocate.\n\nFor every suggestion you make, also provide:\n(1) The strongest counter-argument\n(2) One real-world example of it working\n(3) One real-world example of it failing\n\nDo not let me believe something is easier than it is. My goal is [X]. My constraints are [Y]. Let's start.`,
    tip:"Forces Claude to stress-test every idea before you commit time or money to it."},
];

/* ─────────────────────────────────────────
   PLANNER STATIC DATA
───────────────────────────────────────── */
const PLAN_TYPES = {
  task:     { label:"Task",     color:C.indigo, bg:C.indigoBg, pill:"#C7D2FE" },
  learning: { label:"Learning", color:C.sky,    bg:C.skyBg,    pill:"#BAE6FD" },
  content:  { label:"Content",  color:C.amber,  bg:C.amberBg,  pill:"#FDE68A" },
  client:   { label:"Client",   color:C.green,  bg:C.greenBg,  pill:"#A7F3D0" },
};

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const HOURS = Array.from({length:16},(_,i)=>i+7);

const DEFAULT_PHASE_TASKS = [
  {id:"1-1",text:"Register on 김과외/숨고 as tutor — all 4 subjects",phase:1,cat:"Tutoring"},
  {id:"1-2",text:"Set rate at ₩40,000/hr with SKY credentials",phase:1,cat:"Tutoring"},
  {id:"1-3",text:"Secure first 2 students within Week 1",phase:1,cat:"Tutoring"},
  {id:"1-4",text:"Scale to 4–5 students, 10–12 hrs/week",phase:1,cat:"Tutoring"},
  {id:"1-5",text:"Ask every parent for a referral after first month",phase:1,cat:"Tutoring"},
  {id:"1-6",text:"Create Make.com free account + start tutorial",phase:1,cat:"Setup"},
  {id:"1-7",text:"Create 크몽 seller account",phase:1,cat:"Setup"},
  {id:"1-8",text:"Create Upwork freelancer profile — fill 100%",phase:1,cat:"Setup"},
  {id:"1-9",text:"Create LinkedIn profile — KR + EN",phase:1,cat:"Setup"},
  {id:"1-10",text:"Week 1–2: Make.com/n8n crash courses (2 hrs/day)",phase:1,cat:"Learning"},
  {id:"1-11",text:"Build Automation #1 — Email auto-reply bot",phase:1,cat:"Learning"},
  {id:"1-12",text:"Build Automation #2 — Lead capture → Notion DB",phase:1,cat:"Learning"},
  {id:"1-13",text:"Build Automation #3 — AI customer support chatbot",phase:1,cat:"Learning"},
  {id:"1-14",text:"Build free demo: Korean 학원 AI chatbot",phase:1,cat:"Portfolio"},
  {id:"1-15",text:"Record 3-min Loom walkthrough of each demo",phase:1,cat:"Portfolio"},
  {id:"1-16",text:"Create Notion portfolio page (KR + EN)",phase:1,cat:"Portfolio"},
  {id:"2-1",text:"Post first 크몽 service listing at ₩200K–₩400K",phase:2,cat:"Outreach"},
  {id:"2-2",text:"Write Korean cold DM script with Claude",phase:2,cat:"Outreach"},
  {id:"2-3",text:"Write English Upwork proposal template",phase:2,cat:"Outreach"},
  {id:"2-4",text:"Send 15 Korean Instagram DMs per day for 2 weeks",phase:2,cat:"Outreach"},
  {id:"2-5",text:"Bid on 5+ Upwork projects per week",phase:2,cat:"Outreach"},
  {id:"2-6",text:"Close first paying agency client",phase:2,cat:"Revenue"},
  {id:"2-7",text:"Close second paying client — aim ₩500K+",phase:2,cat:"Revenue"},
  {id:"2-8",text:"Close third client — target retainer model",phase:2,cat:"Revenue"},
  {id:"2-9",text:"Register domain + connect to Vercel",phase:2,cat:"Setup"},
  {id:"2-10",text:"Create Stripe account for intl payments",phase:2,cat:"Setup"},
  {id:"2-11",text:"Post first 3 Naver Blog posts about AI automation",phase:2,cat:"Content"},
  {id:"2-12",text:"Post first LinkedIn build-in-public update",phase:2,cat:"Content"},
  {id:"2-13",text:"Create free Notion template lead magnet for 학원 owners",phase:2,cat:"Digital Products"},
];

/* ─────────────────────────────────────────
   SHARED UTILITIES
───────────────────────────────────────── */
const fmt       = n => n>=1e6?`$${(n/1e6).toFixed(2)}M`:n>=1e3?`$${(n/1e3).toFixed(1)}K`:`$${Math.round(n).toLocaleString()}`;
const daysUntil = d => Math.max(0,Math.ceil((new Date(d)-new Date())/86400000));
const todayISO  = () => new Date().toISOString().slice(0,10);
const fmtDate   = iso => new Date(iso+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric"});
const getWeekStart = d => { const dt=new Date(d),day=dt.getDay(); dt.setDate(dt.getDate()+(day===0?-6:1-day)); dt.setHours(0,0,0,0); return dt; };
const addDays   = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt; };
const isoDate   = d => d.toISOString().slice(0,10);

/* ─────────────────────────────────────────
   AI FUNCTIONS
───────────────────────────────────────── */
function getApiKey() { return localStorage.getItem("anthropic_api_key") || ""; }

async function fetchAIAdvice({ earned, doneTasks, totalTasks, d100k, dayNeed, journal, tasks, phases }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_KEY");
  const incompleteSample = phases.flatMap(p=>p.tasks.filter(t=>!tasks[t.id]).slice(0,4).map(t=>`[${p.short}] ${t.text}`)).slice(0,15).join("\n");
  const recentJournal = journal.slice(0,3).map(j=>`- ${j.date}: ${j.text}`).join("\n") || "No journal entries yet.";
  const prompt = `You are a brutally honest business advisor for a Korean entrepreneur building an AI automation agency from scratch with $1,000.

CURRENT STATE (${new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}):
- Income earned: $${earned.toLocaleString()} toward $150,000 goal (2-year target)
- Days until $30K milestone (Dec 31 2026): ${d100k} days
- Daily income needed to hit $30K: $${dayNeed}/day
- Roadmap tasks completed: ${doneTasks}/${totalTasks}

RECENT JOURNAL:
${recentJournal}

NEXT INCOMPLETE TASKS:
${incompleteSample}

Give exactly 4 specific, actionable recommendations for RIGHT NOW.
- Be direct and specific, not motivational
- Each action must be completable today or this week
- Prioritize revenue-generating actions over learning
- Consider the daily income gap urgently

Return ONLY a JSON array, no markdown, no explanation, no backticks:
[{"action":"exact specific action","priority":"high","timeMin":30,"why":"one direct sentence","category":"outreach|learning|product|content|revenue"}]`;
  const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,messages:[{role:"user",content:prompt}]})});
  const data = await res.json();
  const text = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

async function fetchAIAssign({ incompleteTasks, weekDates, income, doneTasks, totalTasks, journal }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_KEY");
  const taskList = incompleteTasks.slice(0,30).map((t,i)=>`${i+1}. [${t.cat}] ${t.text}`).join("\n");
  const recentJournal = journal.slice(0,3).map(j=>`- ${j.date}: ${j.text}`).join("\n") || "No journal entries yet.";
  const earned = 1000 + income.reduce((a,e)=>a+e.amount,0);
  const prompt = `You are a productivity AI advisor for a Korean entrepreneur building an AI automation agency.

CURRENT STATE:
- Total earned: $${earned.toLocaleString()} toward $150,000
- Roadmap tasks done: ${doneTasks}/${totalTasks}
- Week: ${weekDates.map((d,i)=>`${DAYS[i]} ${d}`).join(", ")}

RECENT JOURNAL:
${recentJournal}

INCOMPLETE TASKS AVAILABLE (numbered):
${taskList}

INSTRUCTIONS:
- Select exactly 7 to 10 tasks from the list above that are most important THIS WEEK
- Assign each to a specific day (0=Mon,1=Tue,2=Wed,3=Thu,4=Fri,5=Sat,6=Sun)
- Prioritize revenue-generating and outreach tasks early in the week
- Group related tasks on the same day to preserve focus
- Leave weekends lighter (max 2 tasks each)
- For each task, assign a card type: task, learning, content, or client
- Give a one-sentence reason for the day chosen

Return ONLY a JSON array, no markdown, no backticks:
[{"taskIndex":1,"dayIdx":0,"type":"task","reason":"Monday momentum — accounts must be live before outreach can start"}]`;
  const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,messages:[{role:"user",content:prompt}]})});
  const data = await res.json();
  const text = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

/* ─────────────────────────────────────────
   ROADMAP COMPONENTS
───────────────────────────────────────── */
const catColors = { outreach:T.cyan, learning:T.purple, product:T.green, content:T.yellow, revenue:T.orange };

function AIAdvisorModal({ earned, doneTasks, totalTasks, d100k, dayNeed, journal, tasks, phases, onClose }) {
  const [advice,setAdvice]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(null);
  useEffect(()=>{
    (async()=>{
      try { setAdvice(await fetchAIAdvice({earned,doneTasks,totalTasks,d100k,dayNeed,journal,tasks,phases})); }
      catch(e) { setError(e.message==="NO_KEY"?"Set your Anthropic API key first: click the ⚙️ button in the top nav bar.":"AI advisor unavailable right now. Check your connection and API key."); }
      finally { setLoading(false); }
    })();
  },[]);
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.22)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px",width:480,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 16px 48px rgba(0,0,0,0.14)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:3}}>🤖 AI Advisor</div>
            <div style={{fontSize:12,color:T.muted}}>Analyzing your current state & generating actions</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:T.muted2,lineHeight:1,padding:"0 2px"}}>×</button>
        </div>
        {loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 0",gap:14}}><div style={{width:32,height:32,border:`3px solid ${T.border2}`,borderTopColor:T.cyan,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/><div style={{fontSize:13,color:T.muted,textAlign:"center",lineHeight:1.7}}>Reading your progress...<br/><span style={{fontSize:11,color:T.muted2}}>Generating personalized actions</span></div></div>}
        {error&&<div style={{background:`${T.red}08`,border:`1px solid ${T.red}30`,borderRadius:8,padding:"14px 16px",fontSize:13,color:T.red}}>{error}</div>}
        {advice&&(
          <div style={{overflowY:"auto",flex:1}}>
            <div style={{fontSize:11,fontWeight:700,color:T.muted2,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · Personalized for your stage</div>
            {advice.map((item,i)=>{
              const c=catColors[item.category]||T.cyan;
              return (
                <div key={i} style={{background:T.s2,border:`1px solid ${T.border}`,borderLeft:`4px solid ${c}`,borderRadius:8,padding:"14px 16px",marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,gap:8}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.text,lineHeight:1.45,flex:1}}>{item.action}</div>
                    <span style={{fontSize:10,fontWeight:700,background:item.priority==="high"?`${T.red}15`:`${T.yellow}15`,color:item.priority==="high"?T.red:T.yellow,padding:"2px 7px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.05em",flexShrink:0}}>{item.priority}</span>
                  </div>
                  <div style={{fontSize:12,color:T.muted,lineHeight:1.55,marginBottom:6}}>{item.why}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,fontWeight:600,color:c,background:`${c}12`,padding:"2px 8px",borderRadius:4}}>{item.category}</span>
                    <span style={{fontSize:10,color:T.muted2}}>⏱ ~{item.timeMin} min</span>
                  </div>
                </div>
              );
            })}
            <div style={{fontSize:11,color:T.muted2,textAlign:"center",marginTop:8,padding:"8px 0",borderTop:`1px solid ${T.border}`}}>Log your actions in the Journal tab to improve future advice.</div>
          </div>
        )}
        <button onClick={onClose} style={{marginTop:14,padding:"9px",background:"none",border:`1px solid ${T.border2}`,borderRadius:7,fontSize:13,color:T.muted,fontFamily:T.font}}>Close</button>
      </div>
    </div>
  );
}

const AmountInput = memo(({ onAdd }) => {
  const [amt,setAmt]=useState(""); const [note,setNote]=useState("");
  const base={background:T.s1,border:`1px solid ${T.border2}`,color:T.text,padding:"9px 12px",fontSize:13,outline:"none",borderRadius:6,fontFamily:T.font};
  const submit=()=>{ const n=parseFloat(amt); if(!n||n<=0) return; onAdd(n,note.trim()); setAmt(""); setNote(""); };
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <input value={amt} onChange={e=>setAmt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Amount e.g. 350" style={{...base,width:140}}/>
      <input value={note} onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Source / note (optional)" style={{...base,flex:1,minWidth:140}}/>
      <button onClick={submit} style={{background:T.green,border:"none",color:"#fff",padding:"9px 20px",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:6,fontFamily:T.font}}>+ Log Income</button>
    </div>
  );
});

const JournalInput = memo(({ onAdd }) => {
  const [val,setVal]=useState("");
  const submit=()=>{ if(!val.trim()) return; onAdd(val.trim()); setVal(""); };
  return (
    <div style={{display:"flex",gap:8}}>
      <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="e.g. Closed first 크몽 client ₩300,000 · sent 25 DMs · built email auto-reply" style={{background:T.s1,border:`1px solid ${T.border2}`,color:T.text,padding:"9px 12px",fontSize:13,outline:"none",borderRadius:6,fontFamily:T.font,flex:1}}/>
      <button onClick={submit} style={{background:T.cyan,border:"none",color:"#fff",padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer",borderRadius:6,fontFamily:T.font}}>Save</button>
    </div>
  );
});

const IncomeChart = memo(({ entries }) => {
  const [range,setRange]=useState("month");
  const data=useMemo(()=>{
    if(!entries.length) return [];
    const b={};
    entries.forEach(e=>{
      const d=new Date(e.date+"T12:00:00"); let key;
      if(range==="week"){const mon=new Date(d);mon.setDate(d.getDate()-((d.getDay()+6)%7));key=mon.toLocaleDateString("en-US",{month:"short",day:"numeric"});}
      else if(range==="month"){key=d.toLocaleDateString("en-US",{month:"short",year:"2-digit"});}
      else{key=String(d.getFullYear());}
      b[key]=(b[key]||0)+e.amount;
    });
    return Object.entries(b).map(([label,amount])=>({label,amount})).slice(-14);
  },[entries,range]);
  const maxVal=data.length?Math.max(...data.map(d=>d.amount)):1;
  const total=entries.reduce((a,e)=>a+e.amount,0);
  const Tip=({active,payload,label})=>{ if(!active||!payload?.length) return null; return <div style={{background:T.s1,border:`1px solid ${T.border2}`,padding:"8px 12px",borderRadius:6,fontSize:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)"}}><div style={{color:T.muted,marginBottom:2}}>{label}</div><div style={{color:T.cyan,fontWeight:700,fontSize:14}}>{fmt(payload[0].value)}</div></div>; };
  const rBtn=r=>({padding:"4px 11px",border:`1px solid ${range===r?T.cyan:T.border2}`,background:range===r?`${T.cyan}15`:"transparent",color:range===r?T.cyan:T.muted,cursor:"pointer",fontSize:11,fontWeight:600,borderRadius:5,fontFamily:T.font});
  return (
    <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div><div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:2}}>Income Over Time</div><div style={{fontSize:12,color:T.muted}}>{entries.length===0?"Log your first income entry in Today →":`${entries.length} entries · ${fmt(total)} logged`}</div></div>
        <div style={{display:"flex",gap:4}}>{["week","month","year"].map(r=><button key={r} style={rBtn(r)} onClick={()=>setRange(r)}>{r[0].toUpperCase()+r.slice(1)}</button>)}</div>
      </div>
      {data.length===0?(<div style={{height:140,display:"flex",alignItems:"center",justifyContent:"center",color:T.muted2,fontSize:13,border:`1px dashed ${T.border2}`,borderRadius:6}}>No data yet — add income entries in the Today tab</div>):(
        <ResponsiveContainer width="100%" height={155}>
          <BarChart data={data} barSize={range==="year"?44:range==="month"?22:14} margin={{top:2,right:2,left:0,bottom:0}}>
            <XAxis dataKey="label" tick={{fill:T.muted,fontSize:10,fontFamily:T.font}} axisLine={false} tickLine={false}/>
            <YAxis tickFormatter={v=>fmt(v)} tick={{fill:T.muted,fontSize:10,fontFamily:T.font}} axisLine={false} tickLine={false} width={52}/>
            <Tooltip content={<Tip/>} cursor={{fill:"rgba(0,0,0,0.03)"}}/>
            <Bar dataKey="amount" radius={[3,3,0,0]}>{data.map((d,i)=><Cell key={i} fill={d.amount===maxVal?T.cyan:`${T.cyan}55`}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
});

/* ─────────────────────────────────────────
   PLANNER COMPONENTS
───────────────────────────────────────── */
function LiveClock() {
  const [t,setT]=useState(new Date());
  useEffect(()=>{const id=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(id);},[]);
  return <span style={{fontFamily:C.disp,fontSize:13,fontWeight:700,color:C.indigo,background:C.indigoBg,padding:"3px 10px",borderRadius:6,minWidth:78,textAlign:"center",display:"inline-block",letterSpacing:"0.03em"}}>{t.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false})}</span>;
}

function PAddModal({ dayIdx, weekStart, onSave, onClose }) {
  const [title,setTitle]=useState(""); const [type,setType]=useState("task"); const [time,setTime]=useState("");
  const inp=useRef(); useEffect(()=>{setTimeout(()=>inp.current?.focus(),60);},[]);
  const save=()=>{ if(!title.trim()) return; onSave({title:title.trim(),type,time,dayIdx}); onClose(); };
  const s={width:"100%",background:C.surface,border:`1.5px solid ${C.border2}`,color:C.text,padding:"9px 12px",fontSize:13,outline:"none",borderRadius:7};
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,20,40,0.22)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
      <div onClick={e=>e.stopPropagation()} className="pop" style={{background:C.surface,borderRadius:12,padding:"22px",width:360,boxShadow:"0 12px 40px rgba(0,0,0,0.14)",border:`1px solid ${C.border}`}}>
        <div style={{fontFamily:C.disp,fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>New card — {DAYS[dayIdx]}, {addDays(weekStart,dayIdx).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</div>
        <input ref={inp} value={title} onChange={e=>setTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()} placeholder="What needs to happen?" style={{...s,marginBottom:10}}/>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <select value={type} onChange={e=>setType(e.target.value)} style={{...s,flex:1}}>{Object.entries(PLAN_TYPES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select>
          <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{...s,width:112}}/>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1.5px solid ${C.border2}`,borderRadius:7,fontSize:13,color:C.muted}}>Cancel</button>
          <button onClick={save} style={{flex:1,padding:"9px",background:C.indigo,border:"none",borderRadius:7,fontSize:13,fontWeight:600,color:"#fff"}}>Add Card</button>
        </div>
      </div>
    </div>
  );
}

function PImportModal({ phaseTasks, weekStart, income, doneTasks, totalTasks, journal, onImport, onClose }) {
  const [tab,setTab]=useState("manual");
  const [sel,setSel]=useState({}); const [dayMap,setDayMap]=useState({});
  const [aiState,setAiState]=useState("idle"); const [aiResult,setAiResult]=useState([]); const [aiError,setAiError]=useState(""); const [excluded,setExcluded]=useState({});
  const toggle=id=>setSel(p=>({...p,[id]:!p[id]})); const setDay=(id,d)=>setDayMap(p=>({...p,[id]:d}));
  const incomplete=phaseTasks.filter(t=>!t.done); const selCnt=Object.values(sel).filter(Boolean).length;
  const doManualImport=()=>{ const items=Object.entries(sel).filter(([,v])=>v).map(([id])=>{ const t=phaseTasks.find(t=>t.id===id); return {id:`i${id}${Date.now()}`,title:t.text,type:"task",dayIdx:parseInt(dayMap[id]??0),fromPhase:true}; }); onImport(items); onClose(); };
  const runAI=async()=>{
    setAiState("loading");
    try {
      const weekDates=DAYS.map((_,i)=>addDays(weekStart,i).toLocaleDateString("en-US",{month:"short",day:"numeric"}));
      const result=await fetchAIAssign({incompleteTasks:incomplete,weekDates,income,doneTasks,totalTasks,journal});
      setAiResult(result.map(r=>({...r,task:incomplete[r.taskIndex-1]})).filter(r=>r.task));
      setAiState("preview");
    } catch(e){ setAiError("AI unavailable — check your connection and try again."); setAiState("error"); }
  };
  const doAIImport=()=>{ const items=aiResult.filter(r=>!excluded[r.taskIndex]).map(r=>({id:`ai${r.task.id}${Date.now()}`,title:r.task.text,type:r.type||"task",dayIdx:r.dayIdx,fromPhase:true})); onImport(items); onClose(); };
  const dayColors=[C.indigo,C.sky,C.green,C.amber,C.violet,C.rose,"#0891B2"];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,20,40,0.25)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(3px)"}}>
      <div onClick={e=>e.stopPropagation()} className="pop" style={{background:C.surface,borderRadius:14,width:540,maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:"0 20px 60px rgba(0,0,0,0.18)",border:`1px solid ${C.border}`}}>
        <div style={{padding:"20px 22px 0",flexShrink:0}}>
          <div style={{fontFamily:C.disp,fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Import Tasks</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:14}}>{incomplete.length} incomplete roadmap tasks available</div>
          <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`}}>
            {[{id:"manual",l:"✋ Manual Pick"},{id:"ai",l:"🤖 AI Auto-Assign"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",background:"none",border:"none",fontSize:13,fontWeight:tab===t.id?700:400,color:tab===t.id?C.indigo:C.muted,borderBottom:`2px solid ${tab===t.id?C.indigo:"transparent"}`,transition:"all 0.15s"}}>{t.l}</button>
            ))}
          </div>
        </div>

        {tab==="manual"&&(
          <>
            <div style={{overflowY:"auto",flex:1,padding:"12px 22px"}}>
              {incomplete.length===0?(<div style={{fontSize:13,color:C.muted2,textAlign:"center",padding:"28px 0"}}>🎉 All roadmap tasks complete!</div>)
              :incomplete.map(t=>(
                <div key={t.id} className="ai-row" style={{display:"flex",gap:10,alignItems:"center",padding:"8px 6px",borderBottom:`1px solid ${C.border}`,borderRadius:4}}>
                  <input type="checkbox" checked={!!sel[t.id]} onChange={()=>toggle(t.id)} style={{accentColor:C.indigo,flexShrink:0,width:14,height:14}}/>
                  <div style={{flex:1,fontSize:12,color:C.text,lineHeight:1.45}}><span style={{fontSize:10,fontWeight:700,color:C.muted2,marginRight:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t.cat}</span>{t.text}</div>
                  {sel[t.id]&&(<select value={dayMap[t.id]??0} onChange={e=>setDay(t.id,e.target.value)} style={{fontSize:11,border:`1px solid ${C.border2}`,borderRadius:5,padding:"3px 7px",background:C.surface,color:C.text,flexShrink:0}}>{DAYS.map((d,i)=>{const date=addDays(weekStart,i);return <option key={i} value={i}>{d} {date.getDate()}</option>;})}</select>)}
                </div>
              ))}
            </div>
            <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
              <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1.5px solid ${C.border2}`,borderRadius:7,fontSize:13,color:C.muted}}>Cancel</button>
              <button onClick={doManualImport} disabled={selCnt===0} style={{flex:2,padding:"9px",background:selCnt>0?C.indigo:C.surface2,border:"none",borderRadius:7,fontSize:13,fontWeight:600,color:selCnt>0?"#fff":C.muted2}}>Import{selCnt>0?` (${selCnt} tasks)`:""}</button>
            </div>
          </>
        )}

        {tab==="ai"&&(
          <>
            <div style={{overflowY:"auto",flex:1,padding:"16px 22px"}}>
              {aiState==="idle"&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"16px 0 8px",gap:16}}>
                  <div style={{width:56,height:56,background:`linear-gradient(135deg,${C.indigo},${C.violet})`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,boxShadow:`0 4px 16px ${C.indigo}35`}}>🤖</div>
                  <div><div style={{fontFamily:C.disp,fontSize:15,fontWeight:700,color:C.text,marginBottom:8}}>AI Auto-Assign</div><div style={{fontSize:13,color:C.muted,lineHeight:1.75,maxWidth:360,margin:"0 auto"}}>Claude analyzes your <strong style={{color:C.text}}>current income, progress, and journal</strong>, then selects the 7–10 highest-impact tasks and assigns each to the optimal day.</div></div>
                  <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:8,padding:"12px 16px",fontSize:12,color:C.muted,lineHeight:1.7,textAlign:"left",width:"100%",maxWidth:380}}>
                    <strong style={{color:C.sub}}>What AI considers:</strong><br/>· Revenue-generating tasks scheduled Mon–Wed<br/>· Related tasks grouped on the same day<br/>· Learning tasks mid-week when focus peaks<br/>· Weekends reserved for lighter work (max 2 tasks)
                  </div>
                  <button onClick={runAI} style={{padding:"11px 32px",background:`linear-gradient(135deg,${C.indigo},${C.violet})`,border:"none",borderRadius:8,fontSize:14,fontWeight:700,color:"#fff",boxShadow:`0 4px 14px ${C.indigo}40`}}>Generate AI Schedule →</button>
                </div>
              )}
              {aiState==="loading"&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"44px 0",gap:16}}>
                  <div style={{width:36,height:36,border:`3px solid ${C.border2}`,borderTopColor:C.indigo,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                  <div style={{textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>Analyzing your roadmap...</div><div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>Reading progress · Checking journal<br/>Selecting highest-impact tasks</div></div>
                </div>
              )}
              {aiState==="error"&&(<div style={{padding:"16px 0"}}><div style={{background:C.roseBg,border:`1px solid #FCA5A5`,borderRadius:8,padding:"14px 16px",fontSize:13,color:C.rose,marginBottom:14}}>{aiError}</div><button onClick={()=>setAiState("idle")} style={{padding:"8px 20px",background:"none",border:`1.5px solid ${C.border2}`,borderRadius:7,fontSize:13,color:C.muted}}>← Try again</button></div>)}
              {aiState==="preview"&&(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div><div style={{fontFamily:C.disp,fontSize:14,fontWeight:700,color:C.text}}>AI Schedule Preview</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{aiResult.filter(r=>!excluded[r.taskIndex]).length} tasks · click to exclude</div></div>
                    <button onClick={()=>setAiState("idle")} style={{fontSize:11,padding:"4px 10px",background:"none",border:`1px solid ${C.border2}`,borderRadius:5,color:C.muted}}>↺ Regenerate</button>
                  </div>
                  {DAYS.map((day,i)=>{
                    const dayTasks=aiResult.filter(r=>r.dayIdx===i); if(!dayTasks.length) return null;
                    const dc=dayColors[i];
                    return (
                      <div key={i} style={{marginBottom:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:8,height:8,borderRadius:"50%",background:dc,flexShrink:0}}/><span style={{fontFamily:C.disp,fontSize:11,fontWeight:700,color:dc,textTransform:"uppercase",letterSpacing:"0.07em"}}>{day}</span><span style={{fontSize:11,color:C.muted2}}>{addDays(weekStart,i).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span></div>
                        {dayTasks.map(r=>{
                          const tp=PLAN_TYPES[r.type]||PLAN_TYPES.task; const isExcl=!!excluded[r.taskIndex];
                          return (
                            <div key={r.taskIndex} className="ai-row" onClick={()=>setExcluded(p=>({...p,[r.taskIndex]:!p[r.taskIndex]}))}
                              style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 10px",marginBottom:4,borderRadius:7,border:`1px solid ${isExcl?C.border:dc+"40"}`,background:isExcl?C.surface2:"#fff",cursor:"pointer",opacity:isExcl?0.45:1,transition:"all 0.12s"}}>
                              <div style={{width:14,height:14,borderRadius:4,border:`2px solid ${isExcl?C.border2:dc}`,background:isExcl?"transparent":dc,flexShrink:0,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center"}}>{!isExcl&&<span style={{fontSize:7,color:"#fff",fontWeight:900,lineHeight:1}}>✓</span>}</div>
                              <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:isExcl?C.muted:C.text,textDecoration:isExcl?"line-through":"none",lineHeight:1.4,marginBottom:4}}>{r.task?.text}</div><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:10,fontWeight:600,color:tp.color,background:tp.bg,padding:"1px 7px",borderRadius:99}}>{tp.label}</span><span style={{fontSize:10,color:C.muted2,lineHeight:1.5,fontStyle:"italic"}}>"{r.reason}"</span></div></div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{padding:"14px 22px",borderTop:`1px solid ${C.border}`,display:"flex",gap:8,flexShrink:0}}>
              <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1.5px solid ${C.border2}`,borderRadius:7,fontSize:13,color:C.muted}}>Cancel</button>
              {aiState==="preview"&&(<button onClick={doAIImport} style={{flex:2,padding:"9px",background:`linear-gradient(135deg,${C.indigo},${C.violet})`,border:"none",borderRadius:7,fontSize:13,fontWeight:700,color:"#fff",boxShadow:`0 2px 8px ${C.indigo}30`}}>Add {aiResult.filter(r=>!excluded[r.taskIndex]).length} Tasks to Planner ✓</button>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KCard({ card, onToggle, onDelete, onDragStart, onDragEnd }) {
  const tp=PLAN_TYPES[card.type]||PLAN_TYPES.task; const [hover,setHover]=useState(false);
  return (
    <div className="kcard slide" draggable onDragStart={e=>onDragStart(e,card.id)} onDragEnd={onDragEnd} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{background:card.done?C.surface2:C.surface,border:`1.5px solid ${card.done?C.border:tp.pill}`,borderLeft:`4px solid ${card.done?C.border2:tp.color}`,borderRadius:8,padding:"8px 10px",marginBottom:5,userSelect:"none",position:"relative",boxShadow:card.done?"none":"0 1px 4px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",gap:7,alignItems:"flex-start"}}>
        <div onClick={()=>onToggle(card.id)} style={{width:14,height:14,borderRadius:4,border:`2px solid ${card.done?tp.color:C.border2}`,background:card.done?tp.color:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s",cursor:"pointer"}}>{card.done&&<span style={{fontSize:7,color:"#fff",fontWeight:900,lineHeight:1}}>✓</span>}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,fontWeight:500,color:card.done?C.muted:C.text,textDecoration:card.done?"line-through":"none",lineHeight:1.45,wordBreak:"break-word"}}>{card.title}</div>
          <div style={{display:"flex",gap:4,marginTop:4,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{fontSize:9,fontWeight:700,color:tp.color,background:tp.bg,padding:"1px 6px",borderRadius:99}}>{tp.label}</span>
            {card.time&&<span style={{fontSize:9,color:C.muted2}}>⏱ {card.time}</span>}
            {card.fromPhase&&<span style={{fontSize:9,color:C.indigo,background:C.indigoBg,padding:"1px 5px",borderRadius:99}}>roadmap</span>}
          </div>
        </div>
      </div>
      {hover&&<button onClick={()=>onDelete(card.id)} style={{position:"absolute",top:4,right:6,background:"none",border:"none",fontSize:14,color:C.muted2,lineHeight:1,padding:0}}>×</button>}
    </div>
  );
}

/* ─────────────────────────────────────────
   ROOT APP
───────────────────────────────────────── */
export default function App() {
  /* shared state */
  const [page,setPage]           = useState("tracker");
  const [income,setIncome]       = useState([]);
  const [tasks,setTasks]         = useState({});
  const [journal,setJournal]     = useState([]);
  const [saving,setSaving]       = useState(false);
  const [ready,setReady]         = useState(false);

  /* editable data */
  const [phases,setPhases]       = useState(DEFAULT_PHASES);
  const [todayTasks,setTodayTasks] = useState(DEFAULT_TODAY_TASKS);

  /* tracker-only state */
  const [tTab,setTTab]           = useState("dashboard");
  const [todayDone,setTodayDone] = useState({});
  const [aPhase,setAPhase]       = useState(1);
  const [openPh,setOpenPh]       = useState({1:true});
  const [openPr,setOpenPr]       = useState(null);
  const [showAI,setShowAI]       = useState(false);
  const [showSettings,setShowSettings] = useState(false);
  const [editPhase,setEditPhase] = useState(null);
  const [editToday,setEditToday] = useState(false);

  /* planner-only state */
  const [cards,setCards]         = useState([]);
  const [weekStart,setWeekStart] = useState(()=>getWeekStart(new Date()));
  const [pModal,setPModal]       = useState(null);
  const derivePhaseTasks = (ph,tk) => ph.flatMap(p=>p.tasks.map(t=>({id:t.id,text:t.text,phase:p.id,cat:t.cat,done:!!tk[t.id]}))); 
  const [phaseTasks,setPhaseTasks] = useState(()=>derivePhaseTasks(DEFAULT_PHASES,{}));
  const dragId=useRef(null); const dragOver=useRef(null);

  /* load all storage */
  useEffect(()=>{
    let loadedPhases = DEFAULT_PHASES;
    let loadedTasks = {};
    try { const r=localStorage.getItem("v4_phases"); if(r) { loadedPhases=JSON.parse(r)||DEFAULT_PHASES; setPhases(loadedPhases); } } catch(_){}
    try { const r=localStorage.getItem("v4_today_tasks"); if(r) setTodayTasks(JSON.parse(r)||DEFAULT_TODAY_TASKS); } catch(_){}
    try { const r=localStorage.getItem("v4_income");  if(r) setIncome(JSON.parse(r)||[]); } catch(_){}
    try { const r=localStorage.getItem("v4_tasks");   if(r) { loadedTasks=JSON.parse(r)||{}; setTasks(loadedTasks); } } catch(_){}
    try { const r=localStorage.getItem("v4_today");   if(r) setTodayDone(JSON.parse(r)||{}); } catch(_){}
    try { const r=localStorage.getItem("v4_journal"); if(r) setJournal(JSON.parse(r)||[]); } catch(_){}
    try { const r=localStorage.getItem("planner_cards"); if(r) setCards(JSON.parse(r)||[]); } catch(_){}
    setPhaseTasks(derivePhaseTasks(loadedPhases, loadedTasks));
    setReady(true);
  },[]);

  const save=(key,val)=>{ setSaving(true); try { localStorage.setItem(key,JSON.stringify(val)); } catch(_){} setTimeout(()=>setSaving(false),800); };

  /* phase editing */
  const savePhases = useCallback((next)=>{ setPhases(next); save("v4_phases",next); setPhaseTasks(derivePhaseTasks(next,tasks)); },[tasks]);
  const updatePhase = useCallback((id,updates)=>{ savePhases(phases.map(p=>p.id===id?{...p,...updates}:p)); },[phases,tasks]);
  const addTaskToPhase = useCallback((phaseId,text,cat)=>{ const tid=`${phaseId}-${Date.now()}`; savePhases(phases.map(p=>p.id===phaseId?{...p,tasks:[...p.tasks,{id:tid,cat:cat||"Task",text}]}:p)); },[phases,tasks]);
  const editTaskInPhase = useCallback((phaseId,taskId,text,cat)=>{ savePhases(phases.map(p=>p.id===phaseId?{...p,tasks:p.tasks.map(t=>t.id===taskId?{...t,text,cat:cat||t.cat}:t)}:p)); },[phases,tasks]);
  const removeTaskFromPhase = useCallback((phaseId,taskId)=>{ savePhases(phases.map(p=>p.id===phaseId?{...p,tasks:p.tasks.filter(t=>t.id!==taskId)}:p)); },[phases,tasks]);
  const addPhase = useCallback(()=>{ const newId=Math.max(...phases.map(p=>p.id))+1; savePhases([...phases,{id:newId,short:`Phase ${newId}`,title:`New Phase ${newId}`,date:"TBD",target:0,color:T.cyan,tasks:[]}]); },[phases,tasks]);
  const removePhase = useCallback((id)=>{ if(phases.length<=1) return; savePhases(phases.filter(p=>p.id!==id)); },[phases,tasks]);
  const saveTodayTasksList = useCallback((next)=>{ setTodayTasks(next); save("v4_today_tasks",next); },[]);
  const resetPhasesToDefault = useCallback(()=>{ savePhases(DEFAULT_PHASES); },[tasks]);

  /* roadmap callbacks */
  const addIncome  = useCallback((amount,note)=>{ setIncome(prev=>{const next=[...prev,{id:Date.now(),date:todayISO(),amount,note}];save("v4_income",next);return next;}); },[]);
  const toggleTask = useCallback((id)=>{ setTasks(prev=>{const next={...prev,[id]:!prev[id]};save("v4_tasks",next);setPhaseTasks(derivePhaseTasks(phases,next));return next;}); },[phases]);
  const toggleToday= useCallback((id)=>{ setTodayDone(prev=>{const next={...prev,[id]:!prev[id]};save("v4_today",next);return next;}); },[]);
  const addJournal = useCallback((text)=>{ const entry={id:Date.now(),date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),text}; setJournal(prev=>{const next=[entry,...prev].slice(0,100);save("v4_journal",next);return next;}); },[]);

  /* planner callbacks */
  const saveCards   = useCallback(next=>{ setSaving(true); try { localStorage.setItem("planner_cards",JSON.stringify(next)); } catch(_){} setTimeout(()=>setSaving(false),700); },[]);
  const wk          = isoDate(getWeekStart(weekStart));
  const weekCards   = cards.filter(c=>c.week===wk);
  const addCard     = useCallback(data=>{ const c={id:`c${Date.now()}`,week:isoDate(getWeekStart(weekStart)),done:false,...data}; setCards(p=>{const n=[...p,c];saveCards(n);return n;}); },[weekStart]);
  const importCards = useCallback(items=>{ const nc=items.map(i=>({...i,week:isoDate(getWeekStart(weekStart)),done:false})); setCards(p=>{const n=[...p,...nc];saveCards(n);return n;}); },[weekStart]);
  const toggleCard  = useCallback(id=>{ setCards(p=>{const n=p.map(c=>c.id===id?{...c,done:!c.done}:c);saveCards(n);return n;}); },[]);
  const deleteCard  = useCallback(id=>{ setCards(p=>{const n=p.filter(c=>c.id!==id);saveCards(n);return n;}); },[]);
  const moveCard    = useCallback((id,dayIdx)=>{ setCards(p=>{const n=p.map(c=>c.id===id?{...c,dayIdx}:c);saveCards(n);return n;}); },[]);
  const onDragStart = (e,id)=>{ dragId.current=id; e.dataTransfer.effectAllowed="move"; };
  const onDragEnd   = ()=>{ dragId.current=null; dragOver.current=null; document.querySelectorAll(".day-col").forEach(el=>el.classList.remove("over")); };
  const onDrop      = (e,idx)=>{ e.preventDefault(); if(dragId.current) moveCard(dragId.current,idx); };
  const onDragOverP = (e,idx)=>{ e.preventDefault(); if(dragOver.current!==idx){ document.querySelectorAll(".day-col").forEach(el=>el.classList.remove("over")); document.querySelectorAll(`[data-day="${idx}"]`).forEach(el=>el.classList.add("over")); dragOver.current=idx; } };

  /* derived */
  const earned    = useMemo(()=>1000+income.reduce((a,e)=>a+e.amount,0),[income]);
  const doneTasks = useMemo(()=>Object.values(tasks).filter(Boolean).length,[tasks]);
  const todayCnt  = useMemo(()=>Object.values(todayDone).filter(Boolean).length,[todayDone]);
  const totalTasks= phases.reduce((a,p)=>a+p.tasks.length,0);
  const pct       = Math.min((earned/150000)*100,100);
  const d100k     = daysUntil("2026-12-31");
  const dayNeed   = d100k>0?Math.ceil(Math.max(0,30000-earned)/d100k):0;
  const today     = isoDate(new Date());
  const totalWk   = weekCards.length;
  const doneWk    = weekCards.filter(c=>c.done).length;
  const pctWk     = totalWk>0?Math.round((doneWk/totalWk)*100):0;
  const weekIncome= income.filter(e=>{const d=new Date(e.date+"T12:00:00");return d>=weekStart&&d<addDays(weekStart,7);}).reduce((a,e)=>a+e.amount,0);

  /* style helpers */
  const card  = (x={})=>({background:T.s1,border:`1px solid ${T.border}`,borderRadius:8,padding:"18px 20px",boxShadow:"0 1px 3px rgba(0,0,0,0.05)",...x});
  const chip  = c=>({display:"inline-flex",alignItems:"center",padding:"2px 9px",fontSize:10,fontWeight:700,letterSpacing:"0.04em",background:`${c}18`,border:`1px solid ${c}35`,color:c,borderRadius:4});
  const check = (done,c)=>({width:16,height:16,border:`1.5px solid ${done?c:T.border2}`,borderRadius:4,background:done?c:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.12s",marginTop:2});

  if(!ready) return (
    <div style={{background:T.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:T.muted,fontFamily:T.font,fontSize:13,gap:10}}>
      <GlobalStyle/>
      <div style={{width:16,height:16,border:`2px solid ${T.border2}`,borderTopColor:T.cyan,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      Loading your data...
    </div>
  );

  /* ── NAV ── */
  const Nav=()=>(
    <div style={{background:T.s1,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 16px",position:"sticky",top:0,zIndex:100,gap:0,boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
      <div style={{display:"flex",alignItems:"center",gap:6,paddingRight:16,borderRight:`1px solid ${T.border}`,marginRight:6,flexShrink:0}}>
        <div style={{width:7,height:7,borderRadius:"50%",background:T.green,animation:"blink 2s step-end infinite"}}/>
        <span style={{fontFamily:T.disp,fontSize:13,fontWeight:700,color:T.text}}>$1K → $150K</span>
      </div>
      <div style={{display:"flex",overflow:"auto"}}>
        {[{id:"tracker",l:"Tracker"},{id:"roadmap",l:"Roadmap"},{id:"planner",l:"Planner"},{id:"niches",l:"Niches"},{id:"aiguide",l:"AI Guide"}].map(n=>(
          <button key={n.id} onClick={()=>setPage(n.id)} style={{padding:"14px 13px",background:"none",border:"none",color:page===n.id?T.cyan:T.muted,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:page===n.id?600:400,borderBottom:`2px solid ${page===n.id?T.cyan:"transparent"}`,transition:"color 0.15s",whiteSpace:"nowrap"}}>{n.l}</button>
        ))}
      </div>
      <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10,paddingLeft:12,flexShrink:0}}>
        {saving&&<span style={{fontSize:11,color:T.green,fontWeight:600}}>Saved ✓</span>}
        <span style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.cyan}}>{fmt(earned)}</span>
        <button onClick={()=>setShowSettings(true)} style={{background:"none",border:`1px solid ${T.border2}`,borderRadius:6,padding:"4px 8px",fontSize:14,color:T.muted,cursor:"pointer",lineHeight:1}} title="Settings (API Key)">⚙️</button>
      </div>
    </div>
  );

  /* ── TRACKER PAGE ── */
  const TrackerPage=()=>{
    const tabs=[{id:"dashboard",l:"Dashboard"},{id:"today",l:`Today  ${todayCnt}/${todayTasks.length}`},{id:"phases",l:`Tasks  ${doneTasks}/${totalTasks}`},{id:"log",l:`Journal  ${journal.length}`}];
    return (
      <div style={{maxWidth:860,margin:"0 auto",padding:"20px 16px"}} className="fade-up">
        <div style={{display:"flex",gap:0,marginBottom:20,borderBottom:`1px solid ${T.border}`}}>
          {tabs.map(t=>(<button key={t.id} onClick={()=>setTTab(t.id)} style={{padding:"10px 14px",background:"none",border:"none",color:tTab===t.id?T.cyan:T.muted,cursor:"pointer",fontSize:13,fontFamily:T.font,fontWeight:tTab===t.id?600:400,borderBottom:`2px solid ${tTab===t.id?T.cyan:"transparent"}`,transition:"color 0.15s",whiteSpace:"nowrap"}}>{t.l}</button>))}
        </div>

        {tTab==="dashboard"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}} className="fade-up">
            <div style={card({borderColor:`${T.red}30`,background:`${T.red}06`,padding:"14px 18px"})}>
              <div style={{fontSize:11,fontWeight:700,color:T.red,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>📊 Evidence-Based Anchor — Read This Daily</div>
              <div style={{fontSize:13,color:T.sub,lineHeight:1.7}}><strong style={{color:T.text}}>$30K by Dec 2026</strong> = ~$3,300/month across tutoring + agency. This is <strong style={{color:T.text}}>achievable if you execute consistently.</strong> Your advantage: SKY credential + 수능 전과목 1-2등급 = immediate ₩40K/hr tutoring income while learning agency skills. The single biggest killer is <strong style={{color:T.text}}>abandoning the cash bridge (tutoring) too early</strong> before agency revenue replaces it.</div>
            </div>
            <div style={card({borderColor:`${T.cyan}30`,background:`linear-gradient(135deg,#fff 60%,${T.cyan}06)`})}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Total Progress</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:8,marginBottom:10}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10}}><span style={{fontFamily:T.disp,fontSize:40,fontWeight:800,color:T.cyan}}>{fmt(earned)}</span><span style={{color:T.muted,fontSize:14}}>/ $150,000</span></div>
                <span style={{fontFamily:T.disp,fontSize:22,fontWeight:700,color:T.green}}>{pct.toFixed(4)}%</span>
              </div>
              <div style={{height:8,background:T.s2,borderRadius:99,overflow:"hidden",marginBottom:14}}><div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.cyan},${T.green})`,borderRadius:99,transition:"width 0.6s ease"}}/></div>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {[{l:"$30K",v:30000,c:T.yellow},{l:"$72K",v:72000,c:T.purple},{l:"$150K",v:150000,c:T.green}].map(m=>(
                  <div key={m.l} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:9,height:9,borderRadius:"50%",background:earned>=m.v?m.c:"transparent",border:`2px solid ${m.c}`,boxShadow:earned>=m.v?`0 0 8px ${m.c}60`:"",transition:"all 0.3s"}}/><span style={{fontSize:12,fontWeight:600,color:earned>=m.v?m.c:T.muted}}>{m.l}</span>{earned>=m.v&&<span style={{fontSize:10,color:T.green}}>✓</span>}</div>
                ))}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
              {[{l:"To $30K",v:fmt(Math.max(0,30000-earned)),c:T.yellow},{l:"To $72K",v:fmt(Math.max(0,72000-earned)),c:T.purple},{l:"Days left",v:`${d100k}d`,c:T.cyan},{l:"Daily need",v:`$${dayNeed.toLocaleString()}`,c:T.orange},{l:"Tasks done",v:`${doneTasks}/${totalTasks}`,c:T.green},{l:"Income logs",v:income.length,c:T.sub}].map(s=>(
                <div key={s.l} style={card({padding:"14px 16px",textAlign:"center"})}><div style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>{s.l}</div><div style={{fontFamily:T.disp,fontSize:20,fontWeight:700,color:s.c}}>{s.v}</div></div>
              ))}
            </div>
            <div style={card({borderColor:`${T.yellow}40`,background:`${T.yellow}06`})}>
              <div style={{fontSize:11,fontWeight:700,color:T.yellow,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Milestone 01 · $30K by December 31, 2026</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}><span style={{fontSize:13,color:T.muted}}>{d100k} days remaining · need <strong style={{color:T.text}}>${dayNeed.toLocaleString()}/day</strong></span><span style={{fontFamily:T.disp,fontSize:18,fontWeight:700,color:T.yellow}}>{Math.min(100,earned/30000*100).toFixed(1)}%</span></div>
              <div style={{height:6,background:T.s2,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,earned/30000*100)}%`,background:T.yellow,borderRadius:99,transition:"width 0.5s"}}/></div>
            </div>
            <div style={card()}>
              <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>Phase Completion</div>
              {phases.map(ph=>{const d=ph.tasks.filter(t=>tasks[t.id]).length;return(<div key={ph.id} style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5}}><span style={{color:ph.color,fontWeight:600}}>P{ph.id} · {ph.short}</span><span style={{color:T.muted,fontSize:12}}>{d}/{ph.tasks.length} · {ph.date}</span></div><div style={{height:4,background:T.s2,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${(d/ph.tasks.length)*100}%`,background:ph.color,borderRadius:99,transition:"width 0.4s"}}/></div></div>);})}
            </div>
            <IncomeChart entries={income}/>
            <div style={card({borderColor:`${T.cyan}30`,background:`linear-gradient(135deg,#fff 50%,${T.cyan}06)`})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
                <div><div style={{fontFamily:T.disp,fontSize:14,fontWeight:700,color:T.text,marginBottom:4}}>🤖 AI Advisor</div><div style={{fontSize:13,color:T.muted,lineHeight:1.6,maxWidth:400}}>Get 4 personalized actions for right now — based on your income, progress, and journal.</div></div>
                <button onClick={()=>setShowAI(true)} style={{padding:"10px 20px",background:T.cyan,border:"none",borderRadius:7,fontSize:13,fontWeight:700,color:"#fff",fontFamily:T.font,whiteSpace:"nowrap",boxShadow:`0 2px 8px ${T.cyan}40`}}>Ask AI Advisor →</button>
              </div>
            </div>
          </div>
        )}

        {tTab==="today"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}} className="fade-up">
            <div style={card({borderColor:`${T.green}35`,background:`${T.green}05`})}>
              <div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>Log Income</div>
              <div style={{fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.6}}>Every time money hits your account, log it here.</div>
              <AmountInput onAdd={addIncome}/>
              {income.length>0&&(<div style={{marginTop:12}}>{income.slice(-4).reverse().map(e=>(<div key={e.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:T.muted,padding:"5px 0",borderTop:`1px solid ${T.border}`}}><span>{fmtDate(e.date)}{e.note&&` · ${e.note}`}</span><span style={{color:T.green,fontWeight:600}}>+{fmt(e.amount)}</span></div>))}</div>)}
            </div>
            <div style={card({borderColor:`${T.cyan}20`})}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                <div><div style={{fontSize:14,fontWeight:600,color:T.text}}>Day 1 Checklist</div><div style={{fontSize:13,color:T.muted,marginBottom:4,lineHeight:1.6}}>~2.5 hours total. ⚠️ item is non-negotiable. 🔴 items first.</div></div>
                <button onClick={()=>setEditToday(true)} style={{padding:"4px 10px",background:"none",border:`1px solid ${T.border2}`,borderRadius:5,fontSize:11,color:T.muted,cursor:"pointer",flexShrink:0}}>✏️ Edit</button>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:todayCnt===todayTasks.length?T.green:T.muted,marginBottom:14}}>{todayCnt}/{todayTasks.length} done{todayCnt===todayTasks.length&&"  🔥 All done. You're launched."}</div>
              {todayTasks.map(m=>{const done=todayDone[m.id];return(<div key={m.id} onClick={()=>toggleToday(m.id)} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"9px 0",borderTop:`1px solid ${T.border}`,cursor:"pointer",opacity:done?0.4:1,transition:"opacity 0.14s"}}><div style={check(done,T.cyan)}>{done&&<span style={{fontSize:8,color:"#fff",fontWeight:900}}>✓</span>}</div><div style={{flex:1}}><div style={{fontSize:13,fontWeight:m.id==="t0"?600:500,textDecoration:done?"line-through":"none",color:m.id==="t0"?T.orange:done?T.muted:T.text}}>{m.pri} {m.text}</div>{m.time!=="0 min"&&<div style={{fontSize:11,color:T.muted2,marginTop:2}}>⏱ {m.time}</div>}</div></div>);})}
            </div>
            <div style={card({borderColor:`${T.purple}25`,background:`${T.purple}04`})}>
              <div style={{fontSize:11,fontWeight:700,color:T.purple,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>Week 1 — Day-by-Day Plan</div>
              {WEEK1_PLAN.map((w,i)=>(<div key={i} style={{marginBottom:i<WEEK1_PLAN.length-1?14:0,paddingBottom:i<WEEK1_PLAN.length-1?14:0,borderBottom:i<WEEK1_PLAN.length-1?`1px solid ${T.border}`:"none"}}><div style={{display:"flex",gap:10,alignItems:"baseline",marginBottom:6}}><span style={{fontSize:12,fontWeight:700,color:T.purple,fontFamily:T.disp}}>{w.day}</span><span style={{fontSize:12,color:T.muted}}>— {w.focus}</span></div>{w.actions.map((a,j)=>(<div key={j} style={{fontSize:13,color:T.sub,lineHeight:1.6,paddingLeft:14,position:"relative",marginBottom:2}}><span style={{position:"absolute",left:0,color:T.muted2}}>·</span>{a}</div>))}</div>))}
            </div>
            <div style={card({borderColor:`${T.orange}25`,background:`${T.orange}05`})}><div style={{fontSize:11,fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>Tonight at home</div><div style={{fontSize:13,color:T.muted,lineHeight:1.7}}>Watch n8n or Make.com tutorial (1hr min) · Draft Korean outreach DM with Claude · Set up Notion workspace · Sleep by 23:00</div></div>
          </div>
        )}

        {tTab==="phases"&&(
          <div className="fade-up">
            <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
              {phases.map(p=>{const d=p.tasks.filter(t=>tasks[t.id]).length;const a=aPhase===p.id;return <button key={p.id} onClick={()=>setAPhase(p.id)} style={{padding:"6px 13px",border:`1px solid ${a?p.color:T.border}`,background:a?`${p.color}12`:T.s1,color:a?p.color:T.muted,cursor:"pointer",fontSize:12,fontFamily:T.font,borderRadius:6,fontWeight:a?700:400,transition:"all 0.15s"}}>P{p.id} · {d}/{p.tasks.length}</button>;})}
            </div>
            {phases.filter(p=>p.id===aPhase).map(ph=>{
              const cats=[...new Set(ph.tasks.map(t=>t.cat))]; const done=ph.tasks.filter(t=>tasks[t.id]).length;
              return (<div key={ph.id}><div style={card({borderColor:`${ph.color}35`,marginBottom:10})}><div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:ph.color}}>{ph.title}</div><div style={{fontSize:12,color:T.muted,marginTop:4}}>{ph.date} · Target: {fmt(ph.target)}</div><div style={{height:4,background:T.s2,borderRadius:99,overflow:"hidden",marginTop:12}}><div style={{height:"100%",width:`${(done/ph.tasks.length)*100}%`,background:ph.color,borderRadius:99,transition:"width 0.4s"}}/></div></div>{cats.map(cat=>(<div key={cat} style={card({marginBottom:8})}><div style={{fontSize:10,fontWeight:700,color:T.muted2,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,paddingBottom:8,borderBottom:`1px solid ${T.border}`}}>{cat}</div>{ph.tasks.filter(t=>t.cat===cat).map(t=>{const done=tasks[t.id];return(<div key={t.id} onClick={()=>toggleTask(t.id)} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"8px 0",borderTop:`1px solid rgba(0,0,0,0.04)`,cursor:"pointer",opacity:done?0.35:1,transition:"opacity 0.12s"}}><div style={check(done,ph.color)}>{done&&<span style={{fontSize:8,color:"#fff",fontWeight:900}}>✓</span>}</div><div style={{fontSize:13,textDecoration:done?"line-through":"none",color:done?T.muted:T.text,lineHeight:1.5}}>{t.text}</div></div>);})}</div>))}</div>);
            })}
          </div>
        )}

        {tTab==="log"&&(
          <div className="fade-up">
            <div style={card({marginBottom:12})}><div style={{fontSize:14,fontWeight:600,color:T.text,marginBottom:3}}>Daily Journal</div><div style={{fontSize:13,color:T.muted,marginBottom:12,lineHeight:1.6}}>Wins, learnings, what you built, what failed. One entry per day minimum.</div><JournalInput onAdd={addJournal}/></div>
            {journal.length===0?(<div style={{...card({textAlign:"center",padding:"40px 20px"}),color:T.muted2,fontSize:13}}>No entries yet.</div>):journal.map(e=>(<div key={e.id} style={card({marginBottom:6,borderLeft:`3px solid ${T.border2}`,padding:"14px 16px"})}><div style={{fontSize:11,color:T.muted2,fontWeight:500,marginBottom:5}}>{e.date}</div><div style={{fontSize:13,lineHeight:1.65,color:T.text}}>{e.text}</div></div>))}
          </div>
        )}
      </div>
    );
  };

  /* ── ROADMAP PAGE ── */
  const RoadmapPage=()=>(
    <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}} className="fade-up">
      <div style={card({borderColor:`${T.cyan}30`,marginBottom:14,position:"relative",overflow:"hidden",background:`linear-gradient(135deg,#fff 55%,${T.cyan}06)`})}>
        <div style={{position:"absolute",right:-8,top:"50%",transform:"translateY(-50%)",fontFamily:T.disp,fontSize:110,fontWeight:800,color:"transparent",WebkitTextStroke:`1px rgba(29,78,216,0.05)`,userSelect:"none",lineHeight:1}}>$150K</div>
        <div style={{fontSize:11,fontWeight:700,color:T.cyan,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Roadmap v4 · Recalibrated · Evidence-Based · 🇰🇷 KR + 🌐 INT</div>
        <div style={{fontFamily:T.disp,fontSize:26,fontWeight:800,lineHeight:1.2,marginBottom:16,color:T.text}}>$1,000 <span style={{color:T.muted}}>→</span> <span style={{color:T.cyan}}>$30K</span> <span style={{color:T.muted}}>→</span> <span style={{color:T.green}}>$150,000</span></div>
        <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
          {[["Start","Mar 2026"],["$30K","Dec 31, 2026"],["$150K","Mar 1, 2028"],["Primary","Tutoring → AI Agency"],["Secondary","Digital Products + Content"]].map(([l,v])=>(<div key={l} style={{borderLeft:`2px solid ${T.border2}`,paddingLeft:12}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",fontWeight:600}}>{l}</div><div style={{fontSize:13,fontWeight:600,marginTop:2,color:T.text}}>{v}</div></div>))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:10,marginBottom:14}}>
        {[{l:"Track A",t:"KSAT Tutoring → Cash Bridge",c:T.cyan,d:"SKY + 수능 전과목 1-2등급 = immediate ₩40K/hr. Start Week 1. Generates ₩1.6M–2.4M/month while you build agency skills. Phase out by Month 8–10 as agency revenue replaces it."},{l:"Track B",t:"AI Automation Agency",c:T.green,d:"Make.com / n8n + ChatGPT API for Korean & international SMBs. Starts Month 2–3 after skill build. Your primary growth engine. 크몽 + Upwork + direct outreach."},{l:"Track C",t:"Digital Products + Content (Long Game)",c:T.purple,d:"Naver Blog + Gumroad + YouTube. Starts Month 4–5. Not a revenue source initially — audience building. Monetize through courses and templates from Month 8+."}].map(t=>(<div key={t.l} style={card({borderColor:`${t.c}25`})}><div style={{fontSize:10,fontWeight:700,color:t.c,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{t.l}</div><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,marginBottom:8,color:T.text}}>{t.t}</div><div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{t.d}</div></div>))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",marginBottom:6}}>
        <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Phases — click to expand · ✏️ to edit</div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={resetPhasesToDefault} style={{padding:"4px 10px",background:"none",border:`1px solid ${T.orange}40`,borderRadius:5,fontSize:10,color:T.orange,cursor:"pointer",fontWeight:600}}>Reset Defaults</button>
          <button onClick={addPhase} style={{padding:"4px 10px",background:`${T.cyan}15`,border:`1px solid ${T.cyan}40`,borderRadius:5,fontSize:10,color:T.cyan,cursor:"pointer",fontWeight:600}}>+ Add Phase</button>
        </div>
      </div>
      {phases.map(ph=>{
        const isOpen=openPh[ph.id]; const done=ph.tasks.filter(t=>tasks[t.id]).length;
        return (
          <div key={ph.id} style={card({padding:0,overflow:"hidden",marginBottom:6,borderColor:isOpen?`${ph.color}45`:T.border})}>
            <div style={{display:"grid",gridTemplateColumns:"46px 1fr auto 28px 28px",gap:14,alignItems:"center",padding:"16px 18px"}}>
              <div onClick={()=>setOpenPh(p=>({...p,[ph.id]:!p[ph.id]}))} style={{fontFamily:T.disp,fontSize:26,fontWeight:800,color:ph.color,opacity:0.22,lineHeight:1,cursor:"pointer"}}>0{ph.id}</div>
              <div onClick={()=>setOpenPh(p=>({...p,[ph.id]:!p[ph.id]}))} style={{cursor:"pointer"}}><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,marginBottom:3,color:T.text}}>{ph.title}</div><div style={{fontSize:12,color:T.muted}}>{ph.date} · {fmt(ph.target)} · {done}/{ph.tasks.length} tasks</div></div>
              <div style={{textAlign:"right"}}><div style={{fontFamily:T.disp,fontSize:17,fontWeight:800,color:ph.color}}>{fmt(ph.target)}</div><div style={{height:3,background:T.s2,borderRadius:99,marginTop:5,width:68,marginLeft:"auto"}}><div style={{height:"100%",width:`${ph.tasks.length?(done/ph.tasks.length)*100:0}%`,background:ph.color,borderRadius:99}}/></div></div>
              <button onClick={(e)=>{e.stopPropagation();setEditPhase(ph);}} style={{width:26,height:26,border:`1px solid ${T.border2}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.muted,background:"none",cursor:"pointer",flexShrink:0}} title="Edit phase">✏️</button>
              <div onClick={()=>setOpenPh(p=>({...p,[ph.id]:!p[ph.id]}))} style={{width:26,height:26,border:`1px solid ${isOpen?ph.color:T.border2}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:isOpen?ph.color:T.muted,transform:isOpen?"rotate(45deg)":"none",transition:"all 0.2s",flexShrink:0,cursor:"pointer"}}>+</div>
            </div>
            {isOpen&&(<div style={{padding:"0 18px 18px",borderTop:`1px solid ${T.border}`}} className="fade-up">{[...new Set(ph.tasks.map(t=>t.cat))].map(cat=>(<div key={cat}><div style={{fontSize:10,fontWeight:700,color:T.muted2,textTransform:"uppercase",letterSpacing:"0.08em",margin:"14px 0 6px"}}>{cat}</div>{ph.tasks.filter(t=>t.cat===cat).map(t=>{const done=tasks[t.id];return(<div key={t.id} onClick={()=>toggleTask(t.id)} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"7px 0",borderTop:`1px solid rgba(0,0,0,0.04)`,cursor:"pointer",opacity:done?0.35:1,transition:"opacity 0.12s"}}><div style={check(done,ph.color)}>{done&&<span style={{fontSize:8,color:"#fff",fontWeight:900}}>✓</span>}</div><div style={{fontSize:13,textDecoration:done?"line-through":"none",color:done?T.muted:T.text,lineHeight:1.5}}>{t.text}</div></div>);})}</div>))}</div>)}
          </div>
        );
      })}
      <div style={{fontSize:11,fontWeight:600,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",padding:"16px 0 8px"}}>Master Timeline</div>
      <div style={card({padding:"22px 20px"})}>
        {[{date:"March 2026 · NOW",title:"Start. Tutoring + Learning.",c:T.cyan,desc:"Register on 김과외/숨고. Secure first 2 students at ₩40K/hr. Start Make.com tutorials. Create all platform accounts. Total cost: under $20."},{date:"April 2026",title:"4–5 students + portfolio ready.",c:T.text,desc:"Tutoring at ₩1.6M+/month. 3 demo automations built. Loom walkthroughs recorded. Notion portfolio live. Ready to start outreach."},{date:"May–July 2026",title:"First agency clients. Dual income.",c:T.text,desc:"First 크몽 listing live. First Upwork gigs. 2–3 paying agency clients. Tutoring continues at reduced hours. $12K cumulative."},{date:"October 2026",title:"Agency > Tutoring. Transition point.",c:T.yellow,desc:"4–6 agency clients generating more than tutoring. Start reducing tutoring hours. First digital product on Gumroad. $28K cumulative."},{date:"December 2026 ★",title:"$30,000 cumulative.",c:T.yellow,desc:"Agency at $3K–$5K/month. Tutoring phased down to 0–4 hrs/week. First course in development. This is the first real milestone."},{date:"June 2027 ★",title:"$72,000 cumulative.",c:T.purple,desc:"Agency at $6K–$9K/month. Course launched on 클래스101 + Gumroad. Email list growing. VA hired for admin. Multiple income streams active."},{date:"March 1, 2028 ★",title:"$150,000 cumulative (conservative).",c:T.green,desc:"Agency + products + courses at $8K–$15K/month. Stretch: $250K if SaaS or course gains traction. You started with $1,000 and a SKY degree in Seoul."}].map((item,i,arr)=>(
          <div key={i} style={{display:"flex",gap:14,paddingBottom:i<arr.length-1?20:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}><div style={{width:10,height:10,borderRadius:"50%",background:item.c===T.text?"transparent":item.c,border:`2px solid ${item.c===T.text?T.border2:item.c}`,flexShrink:0,boxShadow:item.c!==T.text?`0 0 8px ${item.c}40`:"",marginTop:3}}/>{i<arr.length-1&&<div style={{width:1,flex:1,background:T.border,marginTop:4}}/>}</div>
            <div><div style={{fontSize:11,color:T.muted,fontWeight:500,marginBottom:3}}>{item.date}</div><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:item.c===T.text?T.text:item.c,marginBottom:4}}>{item.title}</div><div style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{item.desc}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── PLANNER PAGE ── */
  const PlannerPage=()=>{
    const weekEnd=addDays(weekStart,6);
    return (
      <div style={{background:C.bg,minHeight:"calc(100vh - 55px)",display:"flex",flexDirection:"column"}}>
        {/* Planner sub-header */}
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px",position:"sticky",top:55,zIndex:90,boxShadow:"0 1px 8px rgba(0,0,0,0.05)"}}>
          <div style={{maxWidth:1320,margin:"0 auto",display:"flex",alignItems:"center",height:50,gap:12}}>
            <div style={{display:"flex",alignItems:"center",gap:9,paddingRight:18,borderRight:`1px solid ${C.border}`,flexShrink:0}}>
              <div style={{width:28,height:28,background:C.indigo,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>📅</div>
              <div><div style={{fontFamily:C.disp,fontSize:12,fontWeight:700,color:C.text,lineHeight:1}}>Weekly Planner</div><div style={{fontSize:9,color:C.muted2,marginTop:1}}>synced · roadmap · AI</div></div>
            </div>
            <div style={{fontFamily:C.disp,fontSize:13,fontWeight:700,color:C.text,flexShrink:0}}>{weekStart.toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button className="p-nav-btn" onClick={()=>setWeekStart(d=>addDays(d,-7))} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"none",color:C.muted,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <button className="p-nav-btn" onClick={()=>setWeekStart(d=>addDays(d,7))} style={{width:26,height:26,border:`1px solid ${C.border}`,borderRadius:6,background:"none",color:C.muted,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              <button className="p-nav-btn" onClick={()=>setWeekStart(getWeekStart(new Date()))} style={{padding:"3px 9px",border:`1px solid ${C.border}`,borderRadius:6,background:"none",color:C.muted,fontSize:11,fontWeight:600}}>Today</button>
              <LiveClock/>
            </div>
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              {totalWk>0&&(<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:60,height:4,background:C.surface2,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${pctWk}%`,background:`linear-gradient(90deg,${C.indigo},${C.green})`,borderRadius:99,transition:"width 0.4s"}}/></div><span style={{fontSize:11,fontWeight:600,color:C.muted}}>{pctWk}%</span></div>)}
              {weekIncome>0&&<div style={{background:C.greenBg,border:`1px solid #A7F3D0`,borderRadius:6,padding:"2px 9px",fontSize:11,fontWeight:700,color:C.green}}>{fmt(weekIncome)}</div>}
              <button onClick={()=>setPModal({type:"import"})} style={{padding:"4px 12px",background:`linear-gradient(135deg,${C.indigo},${C.violet})`,border:"none",borderRadius:6,fontSize:11,fontWeight:700,color:"#fff",whiteSpace:"nowrap"}}>🤖 Import Tasks</button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{maxWidth:1320,margin:"0 auto",padding:"8px 20px 0",display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",width:"100%"}}>
          {Object.entries(PLAN_TYPES).map(([k,v])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:7,height:7,borderRadius:"50%",background:v.color}}/><span style={{fontSize:11,color:C.muted,fontWeight:500}}>{v.label}</span></div>))}
          <span style={{fontSize:11,color:C.muted2}}>· drag cards between days</span>
        </div>

        {/* Calendar grid */}
        <div style={{flex:1,overflowX:"auto",overflowY:"auto",padding:"0 20px 80px"}}>
          <div style={{maxWidth:1320,margin:"0 auto",minWidth:780}}>
            {/* Day headers — sticky below planner sub-header (55+50=105) */}
            <div style={{display:"grid",gridTemplateColumns:"54px repeat(7,1fr)",position:"sticky",top:105,background:C.bg,zIndex:50,borderBottom:`2px solid ${C.border}`}}>
              <div style={{borderRight:`1px solid ${C.border}`}}/>
              {DAYS.map((d,i)=>{
                const date=addDays(weekStart,i); const isTdy=isoDate(date)===today; const isSat=i===5; const isSun=i===6;
                return (
                  <div key={i} style={{padding:"10px 10px 8px",textAlign:"center",borderRight:`1px solid ${C.border}`,background:isTdy?C.todayBg:C.bg,position:"relative"}}>
                    {isTdy&&<div style={{position:"absolute",top:0,left:0,right:0,height:3,background:C.indigo,borderRadius:"0 0 3px 3px"}}/>}
                    <div style={{fontFamily:C.disp,fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:isTdy?C.indigo:isSun?C.rose:isSat?C.violet:C.muted}}>{d}</div>
                    <div style={{fontFamily:C.disp,fontSize:22,fontWeight:800,lineHeight:1.15,marginTop:2,color:isTdy?C.surface:C.text}}>{isTdy?<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:34,height:34,background:C.indigo,borderRadius:"50%",color:"#fff",fontSize:18}}>{date.getDate()}</span>:date.getDate()}</div>
                    <div style={{fontSize:9,color:isTdy?C.indigo:C.muted2,marginTop:1,fontWeight:500}}>{date.toLocaleDateString("en-US",{month:"short"})}</div>
                  </div>
                );
              })}
            </div>

            {/* Time grid */}
            <div style={{display:"grid",gridTemplateColumns:"54px repeat(7,1fr)"}}>
              <div style={{borderRight:`1px solid ${C.border}`}}>
                {HOURS.map(h=>(<div key={h} style={{height:88,borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:8,paddingTop:8,flexShrink:0}}><span style={{fontSize:10,fontWeight:600,color:C.muted2,whiteSpace:"nowrap"}}>{h===12?"12pm":h>12?`${h-12}pm`:`${h}am`}</span></div>))}
                <div style={{minHeight:110,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",paddingRight:8,paddingTop:10}}><span style={{fontSize:9,fontWeight:600,color:C.muted2,textAlign:"right",lineHeight:1.4}}>no<br/>time</span></div>
              </div>
              {DAYS.map((d,i)=>{
                const date=addDays(weekStart,i); const isTdy=isoDate(date)===today;
                const dayCards=weekCards.filter(c=>c.dayIdx===i);
                const timed=dayCards.filter(c=>c.time); const untimed=dayCards.filter(c=>!c.time);
                const buckets={}; HOURS.forEach(h=>{buckets[h]=[];}); timed.forEach(c=>{ const hr=parseInt(c.time.split(":")[0]); const b=HOURS.includes(hr)?hr:(hr<7?7:HOURS[HOURS.length-1]); if(buckets[b]) buckets[b].push(c); else buckets[HOURS[HOURS.length-1]].push(c); });
                return (
                  <div key={i} data-day={i} className="day-col" onDragOver={e=>onDragOverP(e,i)} onDrop={e=>onDrop(e,i)}
                    style={{borderRight:`1px solid ${C.border}`,background:isTdy?C.todayBg:"transparent",display:"flex",flexDirection:"column"}}>
                    {HOURS.map(h=>(<div key={h} style={{height:88,borderBottom:`1px solid ${C.border}`,padding:"5px 6px 2px",flexShrink:0}}>{buckets[h].map(card=><KCard key={card.id} card={card} onToggle={toggleCard} onDelete={deleteCard} onDragStart={onDragStart} onDragEnd={onDragEnd}/>)}</div>))}
                    <div style={{flex:1,minHeight:110,padding:"6px",background:isTdy?`${C.indigo}03`:"transparent"}}>
                      {untimed.map(card=><KCard key={card.id} card={card} onToggle={toggleCard} onDelete={deleteCard} onDragStart={onDragStart} onDragEnd={onDragEnd}/>)}
                      <button className="p-add-btn" onClick={()=>setPModal({type:"add",dayIdx:i})} style={{width:"100%",padding:"5px 0",background:"none",border:`1px dashed ${isTdy?C.indigo+"55":C.border2}`,borderRadius:6,fontSize:11,color:isTdy?C.indigo:C.muted2,marginTop:untimed.length?4:0,transition:"all 0.12s"}}>+ Add</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        {totalWk>0&&(
          <div style={{background:C.surface,borderTop:`1px solid ${C.border}`,padding:"8px 20px",zIndex:50,boxShadow:"0 -2px 12px rgba(0,0,0,0.05)"}}>
            <div style={{maxWidth:1320,margin:"0 auto",display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontFamily:C.disp,fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",flexShrink:0}}>{weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"})}–{weekEnd.toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
              <div style={{flex:1,minWidth:80,height:5,background:C.surface2,borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${pctWk}%`,background:`linear-gradient(90deg,${C.indigo},${C.green})`,borderRadius:99,transition:"width 0.4s"}}/></div>
              <span style={{fontSize:12,color:C.muted,fontWeight:600,flexShrink:0}}>{doneWk}/{totalWk} · {pctWk}%</span>
              {Object.entries(PLAN_TYPES).map(([k,v])=>{ const n=weekCards.filter(c=>c.type===k).length; if(!n) return null; return <span key={k} style={{fontSize:11,color:v.color,fontWeight:600,background:v.bg,padding:"2px 9px",borderRadius:99,flexShrink:0,border:`1px solid ${v.pill}`}}>{n} {v.label}</span>; })}
            </div>
          </div>
        )}

        {pModal?.type==="add"    &&<PAddModal   dayIdx={pModal.dayIdx} weekStart={weekStart} onSave={addCard}     onClose={()=>setPModal(null)}/>}
        {pModal?.type==="import" &&<PImportModal phaseTasks={phaseTasks} weekStart={weekStart} income={income} doneTasks={doneTasks} totalTasks={totalTasks} journal={journal} onImport={importCards} onClose={()=>setPModal(null)}/>}
      </div>
    );
  };

  /* ── NICHES PAGE ── */
  const NichesPage=()=>(
    <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}} className="fade-up">
      <div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>Niche Assessment · 2026 — Recalibrated</div><div style={{fontFamily:T.disp,fontSize:26,fontWeight:800,marginBottom:8,color:T.text}}>Markets ranked by real probability of success</div><div style={{fontSize:13,color:T.muted,lineHeight:1.7}}>Stats verified against 통계청, Upwork, ESMA, and Pew Research. Unverifiable claims removed. Read the ⛔ entry before considering crypto.</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10,marginBottom:24}}>
        {NICHES.map((n,i)=>(<div key={i} style={card({position:"relative",overflow:"hidden",borderColor:n.bc===T.red?`${T.red}40`:i===0?`${n.bc}45`:T.border,background:n.bc===T.red?`${T.red}04`:"#fff"})}><div style={{position:"absolute",top:0,left:0,right:0,height:2,background:n.bc,opacity:0.7}}/><div style={chip(n.bc)}>{n.badge}</div><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,margin:"8px 0 6px",color:T.text}}>{n.title}</div><div style={{fontSize:13,color:T.muted,lineHeight:1.65,marginBottom:10}}>{n.desc}</div>{n.note&&<div style={{fontSize:11,color:T.sub,lineHeight:1.6,padding:"8px 10px",background:T.s2,borderRadius:5,marginBottom:12,fontStyle:"italic"}}>📊 {n.note}</div>}<div style={{display:"flex",gap:16,flexWrap:"wrap"}}>{[["Startup Cost",n.cost],["Ceiling",n.ceil],["Competition",n.comp]].map(([l,v])=>(<div key={l}><div style={{fontSize:10,fontWeight:600,color:T.muted2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:T.text,marginTop:2}}>{v}</div></div>))}</div></div>))}
      </div>
      <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",padding:"8px 0 10px"}}>Your Dual Market</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{flag:"🇰🇷",title:"Korean Domestic",sub:"Year Zero for AI services — very low competition",items:[["크몽 (Kmong)","Korean Fiverr","Client"],["위시켓 (Wishket)","Korean Upwork","Client"],["클래스101","Online courses","Course"],["탈잉","1:1 coaching","Course"],["네이버 블로그","SEO — huge organic traffic","Content"],["카카오 오픈채팅","Community outreach","Community"]]},{flag:"🌐",title:"International",sub:"Higher rates · English-first · global scale",items:[["Upwork","$50–$150/hr AI work","Client"],["Contra","No-fee freelance","Client"],["Gumroad","Apps, templates, prompt packs","Product"],["Product Hunt","500K+ tech early adopters","Launch"],["Reddit","r/SideProject, r/entrepreneur","Content"],["Twitter / X","Build in public audience","Content"]]}].map(m=>(<div key={m.title} style={card({padding:0,overflow:"hidden"})}><div style={{padding:"14px 18px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>{m.flag}</span><div><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text}}>{m.title}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{m.sub}</div></div></div>{m.items.map(([name,desc,type])=>(<div key={name} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center",padding:"9px 18px",borderTop:`1px solid rgba(0,0,0,0.05)`}}><div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{name}</div><div style={{fontSize:11,color:T.muted,marginTop:1}}>{desc}</div></div><div style={chip(type==="Client"?T.cyan:type==="Course"?T.purple:type==="Product"?T.yellow:T.green)}>{type}</div></div>))}</div>))}
      </div>
    </div>
  );

  /* ── AI GUIDE PAGE ── */
  const AIGuidePage=()=>(
    <div style={{maxWidth:900,margin:"0 auto",padding:"20px 16px"}} className="fade-up">
      <div style={{marginBottom:20}}><div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>AI Prompting Mastery</div><div style={{fontFamily:T.disp,fontSize:26,fontWeight:800,marginBottom:8,color:T.text}}>How experts actually use AI</div><div style={{fontSize:13,color:T.muted,lineHeight:1.7,maxWidth:640}}>Most people use AI like a search engine. Experts direct it like a thinking partner. Learn these 5 frameworks and you're in the top 5% of AI users immediately.</div></div>
      {PROMPTS.map((p,i)=>{const isOpen=openPr===i;return(<div key={i} style={card({marginBottom:8,padding:0,overflow:"hidden",borderColor:isOpen?`${T.cyan}40`:T.border})}><div onClick={()=>setOpenPr(isOpen?null:i)} style={{padding:"16px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}><div><div style={{fontFamily:T.disp,fontSize:15,fontWeight:700,color:T.text}}>{p.title}</div><div style={{fontSize:12,color:T.muted,marginTop:3}}>{p.sub}</div></div><div style={{width:26,height:26,border:`1px solid ${isOpen?T.cyan:T.border2}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:isOpen?T.cyan:T.muted,transform:isOpen?"rotate(45deg)":"none",transition:"all 0.2s",flexShrink:0}}>+</div></div>{isOpen&&(<div style={{padding:"0 18px 18px",borderTop:`1px solid ${T.border}`}} className="fade-up"><div style={{fontSize:10,fontWeight:700,color:T.orange,textTransform:"uppercase",letterSpacing:"0.08em",margin:"14px 0 6px"}}>❌ Weak prompt</div><div style={{background:T.s2,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.orange}`,padding:"12px 14px",fontSize:13,color:T.sub,borderRadius:"0 6px 6px 0",marginBottom:14,fontStyle:"italic"}}>{p.bad}</div><div style={{fontSize:10,fontWeight:700,color:T.green,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>✅ Expert prompt</div><div style={{background:T.s2,border:`1px solid ${T.border}`,borderLeft:`3px solid ${T.green}`,padding:"14px 16px",fontSize:13,color:T.text,whiteSpace:"pre-wrap",lineHeight:1.75,borderRadius:"0 6px 6px 0",marginBottom:12,fontFamily:"ui-monospace,monospace"}}>{p.good}</div><div style={{background:`${T.cyan}0A`,border:`1px solid ${T.cyan}28`,padding:"12px 16px",fontSize:13,color:T.sub,lineHeight:1.7,borderRadius:6}}><strong style={{color:T.cyan}}>Why it works: </strong>{p.tip}</div></div>)}</div>);})}
      <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",padding:"16px 0 10px"}}>Power Patterns — Memorize These</div>
      <div style={card({padding:0,overflow:"hidden",marginBottom:14})}>{[['"Steelman this"','Make the strongest argument for X, even if you disagree. Use before major decisions.'],['"Give me 20 options"','Always ask for more than you need. The best idea is rarely in the first 5.'],['"What am I missing?"','After any plan. AI finds blind spots you never thought of.'],['"Be brutally honest"','AI defaults to being nice. Override it. Add: "Don\'t soften this."'],['"ELI5 then go deep"','Simple first, then expert level. Layer complexity for faster learning.'],['"Compress this"','Paste any document + "give me the 5 most actionable points." Saves hours.'],['"Act as a hostile user"','Best QA tool. Finds bugs and objections before your clients do.'],['"You are my Korean copywriter"','Give it cultural identity for native-quality Korean output.'],['"Critique your own output"','After any generation, ask Claude to attack its own answer.']].map(([p,d],i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"185px 1fr",borderTop:i>0?`1px solid ${T.border}`:"none"}}><div style={{padding:"11px 16px",background:T.s2,borderRight:`1px solid ${T.border}`,fontSize:12,fontFamily:"ui-monospace,monospace",color:T.cyan,display:"flex",alignItems:"center",fontWeight:600}}>{p}</div><div style={{padding:"11px 16px",fontSize:13,color:T.muted,lineHeight:1.6}}>{d}</div></div>))}</div>
      <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",padding:"8px 0 10px"}}>Your Multi-AI Dev Team</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>{[{icon:"🏗️",role:"Architect",tool:"Claude Sonnet",desc:"System design, code review, tech stack decisions. Use the Meta-Prompt (Framework 05) here."},{icon:"🎨",role:"UI/UX Designer",tool:"v0.dev + Lovable",desc:"Full React UI from text prompts. Production-quality design in hours, not weeks."},{icon:"⚡",role:"Full-Stack Builder",tool:"Cursor + Bolt.new",desc:"Write, debug, and iterate entire codebases with AI assistance inline."},{icon:"🧪",role:"QA Tester",tool:"Claude + GPT-4o",desc:'"You are a hostile user. Break this app." Run before every client delivery.'},{icon:"📦",role:"DevOps",tool:"Vercel + Expo EAS",desc:"One-command web deploy. Expo EAS handles iOS + Android builds automatically."},{icon:"📣",role:"Marketer",tool:"Claude + Perplexity",desc:"App Store copy in KR + EN, ad copy, Product Hunt posts, cold outreach scripts."}].map(a=>(<div key={a.role} style={card({padding:"16px"})}><div style={{fontSize:20,marginBottom:8}}>{a.icon}</div><div style={{fontFamily:T.disp,fontSize:14,fontWeight:700,marginBottom:3,color:T.text}}>{a.role}</div><div style={{fontSize:11,fontWeight:600,color:T.cyan,marginBottom:8}}>{a.tool}</div><div style={{fontSize:12,color:T.muted,lineHeight:1.6}}>{a.desc}</div></div>))}</div>
    </div>
  );

  /* ── PHASE EDIT MODAL ── */
  const PhaseEditModal=({phase,onClose})=>{
    const [title,setTitle]=useState(phase.title);
    const [short,setShort]=useState(phase.short);
    const [date,setDate]=useState(phase.date);
    const [target,setTarget]=useState(String(phase.target));
    const [taskList,setTaskList]=useState(phase.tasks.map(t=>({...t})));
    const [newText,setNewText]=useState(""); const [newCat,setNewCat]=useState("Task");
    const inp={width:"100%",background:T.s2,border:`1px solid ${T.border2}`,color:T.text,padding:"8px 11px",fontSize:13,outline:"none",borderRadius:6,fontFamily:T.font};
    const doSave=()=>{
      updatePhase(phase.id,{title,short,date,target:parseFloat(target)||0,tasks:taskList});
      onClose();
    };
    const addT=()=>{ if(!newText.trim()) return; setTaskList(p=>[...p,{id:`${phase.id}-${Date.now()}`,cat:newCat,text:newText.trim()}]); setNewText(""); };
    const rmT=id=>setTaskList(p=>p.filter(t=>t.id!==id));
    const editT=(id,field,val)=>setTaskList(p=>p.map(t=>t.id===id?{...t,[field]:val}:t));
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.22)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px",width:560,maxHeight:"85vh",display:"flex",flexDirection:"column",boxShadow:"0 16px 48px rgba(0,0,0,0.14)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text}}>✏️ Edit Phase {phase.id}</div>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:T.muted2,cursor:"pointer"}}>×</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            <div><div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>Title</div><input value={title} onChange={e=>setTitle(e.target.value)} style={inp}/></div>
            <div><div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>Short Name</div><input value={short} onChange={e=>setShort(e.target.value)} style={inp}/></div>
            <div><div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>Date Range</div><input value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
            <div><div style={{fontSize:11,fontWeight:600,color:T.muted,marginBottom:4}}>Target ($)</div><input type="number" value={target} onChange={e=>setTarget(e.target.value)} style={inp}/></div>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}>Tasks ({taskList.length})</div>
          <div style={{overflowY:"auto",flex:1,marginBottom:12,maxHeight:"40vh"}}>
            {taskList.map((t,i)=>(
              <div key={t.id} style={{display:"flex",gap:6,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                <input value={t.cat} onChange={e=>editT(t.id,"cat",e.target.value)} style={{...inp,width:80,padding:"5px 7px",fontSize:11,flexShrink:0}}/>
                <input value={t.text} onChange={e=>editT(t.id,"text",e.target.value)} style={{...inp,flex:1,padding:"5px 7px",fontSize:12}}/>
                <button onClick={()=>rmT(t.id)} style={{background:"none",border:"none",fontSize:16,color:T.red,cursor:"pointer",flexShrink:0,padding:"0 4px"}}>×</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Category" style={{...inp,width:80,fontSize:11}}/>
            <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addT()} placeholder="New task description..." style={{...inp,flex:1,fontSize:12}}/>
            <button onClick={addT} style={{padding:"8px 14px",background:T.cyan,border:"none",borderRadius:6,fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>+ Add</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{if(confirm("Delete this entire phase? This cannot be undone.")){removePhase(phase.id);onClose();}}} style={{padding:"9px 12px",background:`${T.red}10`,border:`1px solid ${T.red}35`,borderRadius:7,fontSize:12,color:T.red,cursor:"pointer",flexShrink:0}}>🗑 Delete</button>
            <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1px solid ${T.border2}`,borderRadius:7,fontSize:13,color:T.muted,cursor:"pointer"}}>Cancel</button>
            <button onClick={doSave} style={{flex:2,padding:"9px",background:T.cyan,border:"none",borderRadius:7,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>Save Changes</button>
          </div>
        </div>
      </div>
    );
  };

  /* ── TODAY EDIT MODAL ── */
  const TodayEditModal=({onClose})=>{
    const [list,setList]=useState(todayTasks.map(t=>({...t})));
    const [newText,setNewText]=useState(""); const [newPri,setNewPri]=useState("🔴"); const [newTime,setNewTime]=useState("15 min");
    const inp={width:"100%",background:T.s2,border:`1px solid ${T.border2}`,color:T.text,padding:"8px 11px",fontSize:13,outline:"none",borderRadius:6,fontFamily:T.font};
    const doSave=()=>{ saveTodayTasksList(list); onClose(); };
    const addT=()=>{ if(!newText.trim()) return; setList(p=>[...p,{id:`t${Date.now()}`,pri:newPri,time:newTime,text:newText.trim()}]); setNewText(""); };
    const rmT=id=>setList(p=>p.filter(t=>t.id!==id));
    const editT=(id,field,val)=>setList(p=>p.map(t=>t.id===id?{...t,[field]:val}:t));
    return (
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.22)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px",width:520,maxHeight:"80vh",display:"flex",flexDirection:"column",boxShadow:"0 16px 48px rgba(0,0,0,0.14)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text}}>✏️ Edit Today's Checklist</div>
            <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,color:T.muted2,cursor:"pointer"}}>×</button>
          </div>
          <div style={{overflowY:"auto",flex:1,marginBottom:12}}>
            {list.map(t=>(
              <div key={t.id} style={{display:"flex",gap:6,alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                <select value={t.pri} onChange={e=>editT(t.id,"pri",e.target.value)} style={{...inp,width:52,padding:"5px 4px",fontSize:13,flexShrink:0}}><option>⚠️</option><option>🔴</option><option>🟡</option><option>🟢</option></select>
                <input value={t.text} onChange={e=>editT(t.id,"text",e.target.value)} style={{...inp,flex:1,padding:"5px 7px",fontSize:12}}/>
                <input value={t.time} onChange={e=>editT(t.id,"time",e.target.value)} style={{...inp,width:65,padding:"5px 7px",fontSize:11,flexShrink:0}}/>
                <button onClick={()=>rmT(t.id)} style={{background:"none",border:"none",fontSize:16,color:T.red,cursor:"pointer",flexShrink:0,padding:"0 4px"}}>×</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            <select value={newPri} onChange={e=>setNewPri(e.target.value)} style={{...inp,width:52,padding:"5px 4px",fontSize:13,flexShrink:0}}><option>⚠️</option><option>🔴</option><option>🟡</option><option>🟢</option></select>
            <input value={newText} onChange={e=>setNewText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addT()} placeholder="New task..." style={{...inp,flex:1,fontSize:12}}/>
            <input value={newTime} onChange={e=>setNewTime(e.target.value)} placeholder="Time" style={{...inp,width:65,fontSize:11,flexShrink:0}}/>
            <button onClick={addT} style={{padding:"8px 14px",background:T.cyan,border:"none",borderRadius:6,fontSize:12,fontWeight:600,color:"#fff",cursor:"pointer",flexShrink:0}}>+ Add</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{saveTodayTasksList(DEFAULT_TODAY_TASKS);onClose();}} style={{padding:"9px 14px",background:"none",border:`1px solid ${T.orange}40`,borderRadius:7,fontSize:12,color:T.orange,cursor:"pointer"}}>Reset to Default</button>
            <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",border:`1px solid ${T.border2}`,borderRadius:7,fontSize:13,color:T.muted,cursor:"pointer"}}>Cancel</button>
            <button onClick={doSave} style={{flex:2,padding:"9px",background:T.cyan,border:"none",borderRadius:7,fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer"}}>Save</button>
          </div>
        </div>
      </div>
    );
  };

  /* ── SETTINGS MODAL ── */
  const SettingsModal=()=>{
    const [key,setKey]=useState(()=>localStorage.getItem("anthropic_api_key")||"");
    const [saved,setSaved]=useState(false);
    const doSave=()=>{
      if(key.trim()) localStorage.setItem("anthropic_api_key",key.trim());
      else localStorage.removeItem("anthropic_api_key");
      setSaved(true); setTimeout(()=>setSaved(false),2000);
    };
    const doReset=()=>{
      if(!confirm("This will delete ALL your saved data (income, tasks, journal, planner cards). Are you sure?")) return;
      ["v4_income","v4_tasks","v4_today","v4_journal","planner_cards","anthropic_api_key","v4_phases","v4_today_tasks"].forEach(k=>localStorage.removeItem(k));
      window.location.reload();
    };
    return (
      <div onClick={()=>setShowSettings(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.22)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(2px)"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"24px",width:440,boxShadow:"0 16px 48px rgba(0,0,0,0.14)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontFamily:T.disp,fontSize:16,fontWeight:700,color:T.text,marginBottom:3}}>⚙️ Settings</div>
              <div style={{fontSize:12,color:T.muted}}>API key & data management</div>
            </div>
            <button onClick={()=>setShowSettings(false)} style={{background:"none",border:"none",fontSize:20,color:T.muted2,lineHeight:1,padding:"0 2px",cursor:"pointer"}}>×</button>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Anthropic API Key</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:8,lineHeight:1.6}}>Required for AI Advisor and AI Auto-Assign features. Get yours at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener" style={{color:T.cyan}}>console.anthropic.com</a>. Stored in your browser only.</div>
            <input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="sk-ant-api03-..." style={{width:"100%",background:T.s2,border:`1px solid ${T.border2}`,color:T.text,padding:"9px 12px",fontSize:13,outline:"none",borderRadius:6,fontFamily:"ui-monospace,monospace",marginBottom:8}}/>
            <div style={{display:"flex",gap:8}}>
              <button onClick={doSave} style={{padding:"8px 18px",background:T.cyan,border:"none",borderRadius:6,fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}>{saved?"Saved ✓":"Save Key"}</button>
              {key&&<button onClick={()=>{setKey("");localStorage.removeItem("anthropic_api_key");}} style={{padding:"8px 14px",background:"none",border:`1px solid ${T.border2}`,borderRadius:6,fontSize:13,color:T.muted,cursor:"pointer"}}>Remove</button>}
            </div>
          </div>
          <div style={{borderTop:`1px solid ${T.border}`,paddingTop:16}}>
            <div style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:6}}>Data Management</div>
            <div style={{fontSize:12,color:T.muted,marginBottom:8,lineHeight:1.6}}>All data is stored locally in your browser. Clearing browser data will erase it.</div>
            <button onClick={doReset} style={{padding:"8px 14px",background:`${T.red}10`,border:`1px solid ${T.red}35`,borderRadius:6,fontSize:13,color:T.red,fontWeight:600,cursor:"pointer"}}>Reset All Data</button>
          </div>
          <button onClick={()=>setShowSettings(false)} style={{marginTop:16,width:"100%",padding:"9px",background:"none",border:`1px solid ${T.border2}`,borderRadius:7,fontSize:13,color:T.muted,fontFamily:T.font,cursor:"pointer"}}>Close</button>
        </div>
      </div>
    );
  };

  /* ── AUTO-REFRESH at midnight ── */
  useEffect(()=>{
    const checkMidnight=()=>{
      const now=new Date();
      if(now.getHours()===0 && now.getMinutes()===0){
        window.location.reload();
      }
    };
    const id=setInterval(checkMidnight,30000); // check every 30 seconds
    return ()=>clearInterval(id);
  },[]);

  /* ── RENDER ── */
  return (
    <div style={{background:page==="planner"?C.bg:T.bg,minHeight:"100vh",color:T.text,fontFamily:T.font}}>
      <GlobalStyle/>
      <Nav/>
      {page==="tracker" &&<TrackerPage/>}
      {page==="roadmap" &&<RoadmapPage/>}
      {page==="planner" &&<PlannerPage/>}
      {page==="niches"  &&<NichesPage/>}
      {page==="aiguide" &&<AIGuidePage/>}
      {showAI&&(
        <AIAdvisorModal earned={earned} doneTasks={doneTasks} totalTasks={totalTasks} d100k={d100k} dayNeed={dayNeed} journal={journal} tasks={tasks} phases={phases} onClose={()=>setShowAI(false)}/>
      )}
      {showSettings&&<SettingsModal/>}
      {editPhase&&<PhaseEditModal phase={editPhase} onClose={()=>setEditPhase(null)}/>}
      {editToday&&<TodayEditModal onClose={()=>setEditToday(false)}/>}
    </div>
  );
}
