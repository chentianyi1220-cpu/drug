/* =========================================================
   薄弱体质项目训练处方系统
   1. 器材字典   2. SVG 绘制工具   3. 项目数据   4. 页面渲染
   ========================================================= */

/* ---------- 1. 器材字典 ---------- */
const EQUIP = {
  hurdle : {name:'跨栏架', color:'#ff8a3d'},
  mat    : {name:'瑜伽垫', color:'#5cc26a'},
  vb     : {name:'软排球', color:'#ffd23f'},
  ladder : {name:'绳梯',   color:'#4fc3f7'},
  ring   : {name:'敏捷圈', color:'#ff6b9d'},
  medball: {name:'实心球', color:'#8a5cf6'},
  rope   : {name:'跳绳',   color:'#ff5757'},
  bosu   : {name:'波速球', color:'#20c997'}
};

/* ---------- 2. SVG 绘制工具 ---------- */
const SKIN = '#ffe1bd', OUT = '#2b3a55', SHIRT = '#5aa9e6', SHORTS = '#ff9f43', SHOE = '#ff9f43';

/* 器材：背景层 */
const ART = {
  mat: (cx=100,y=176,w=160,h=9)=>`
    <rect x="${cx-w/2}" y="${y}" width="${w}" height="${h}" rx="4.5" fill="#b9e6a4" stroke="#3f9147" stroke-width="2.5"/>
    <line x1="${cx-w/2+8}" y1="${y+h/2}" x2="${cx+w/2-8}" y2="${y+h/2}" stroke="#3f9147" stroke-width="1.4" stroke-dasharray="6 5" opacity=".7"/>`,

  ladder: (cx=100,y=170,w=150,cols=5)=>{
    let s=`<path d="M${cx-w/2} ${y-6} L${cx+w/2+16} ${y+16}" stroke="#4fc3f7" stroke-width="3.5"/>
           <path d="M${cx-w/2} ${y+14} L${cx+w/2+16} ${y+34}" stroke="#4fc3f7" stroke-width="3.5"/>`;
    for(let i=0;i<=cols;i++){
      const t=i/cols, x1=cx-w/2+w*t, ya=y-6+22*t, yb=y+14+20*t;
      s+=`<line x1="${x1}" y1="${ya}" x2="${x1}" y2="${yb}" stroke="#4fc3f7" stroke-width="3"/>`;
    }
    return s;
  },

  ring: (x,y,rx=28,ry=10,c='#ff6b9d')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}22" stroke="${c}" stroke-width="5"/>`,

  hurdle: (cx=100,top=150,w=54)=>`
    <rect x="${cx-w/2}" y="${top}" width="${w}" height="5" rx="2.5" fill="#ff8a3d" stroke="#d9621c" stroke-width="2"/>
    <path d="M${cx-w/2+3} ${top} L${cx-w/2-4} ${top+26} M${cx+w/2-3} ${top} L${cx+w/2+4} ${top+26}" stroke="#d9621c" stroke-width="3" fill="none"/>
    <line x1="${cx-w/2+6}" y1="${top+24}" x2="${cx+w/2+2}" y2="${top+24}" stroke="#d9621c" stroke-width="2.5"/>`,

  bosu: (cx=100, topY=158, w=56)=>`
    <path d="M${cx-w/2} ${topY+10} a${w/2} ${w/2} 0 0 1 ${w} 0 z" fill="#a8f0dc" stroke="#0f9b78" stroke-width="2.5"/>
    <rect x="${cx-w/2-3}" y="${topY+10}" width="${w+6}" height="8" rx="3.5" fill="#20c997" stroke="#0f9b78" stroke-width="2.5"/>`,

  ball: (x,y,r=12,type='vb')=>{
    const c = type==='vb' ? {f:'#ffd23f',s:'#d99b00'} : {f:'#c9b3f5',s:'#6b45c9'};
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.f}" stroke="${c.s}" stroke-width="2.5"/>
            <path d="M${x-r+2} ${y-2} q${r} ${-r-2} ${2*r-4} 0 M${x-r+2} ${y+3} q${r} ${r+2} ${2*r-4} 0"
                  fill="none" stroke="${c.s}" stroke-width="1.8"/>`;
  },

  arrow: (x1,y1,x2,y2,c='#e5533d')=>{
    const a=Math.atan2(y2-y1,x2-x1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
            <path d="M${x2} ${y2} L${x2-11*Math.cos(a-0.4)} ${y2-11*Math.sin(a-0.4)} L${x2-11*Math.cos(a+0.4)} ${y2-11*Math.sin(a+0.4)} z" fill="${c}"/>`;
  },

  motion: (pts,c='#8aa8c8')=>`<path d="M${pts[0][0]} ${pts[0][1]} Q${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}"
        fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/>`
};

/* 基础站立姿势 */
const BASE = {
  head:[100,32,16], neck:[100,50], hip:[100,102],
  aL:[[88,58],[76,76],[72,92]],   aR:[[112,58],[124,76],[128,92]],
  lL:[[94,102],[86,134],[84,166]], lR:[[106,102],[114,134],[116,166]]
};

function bone(a,b,w,col){
  return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${OUT}" stroke-width="${w+5}" stroke-linecap="round"/>
          <line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
}
function chain(pts,w,col){
  let s=''; for(let i=0;i<pts.length-1;i++) s+=bone(pts[i],pts[i+1],w,col);
  return s;
}

/* 画人物 */
function drawFig(art){
  const p = Object.assign({}, BASE, art.p||{});
  const H=p.head, N=p.neck, HIP=p.hip;
  let svg = `<svg viewBox="0 0 200 200">`;
  svg += art.back || '';
  /* 远侧腿、远侧臂 */
  svg += chain(p.aL,10,SKIN) + bone(HIP,p.lL[0],13,SHORTS) + chain(p.lL,12,SKIN);
  /* 躯干 */
  svg += bone(N,HIP,22,SHIRT);
  /* 头 */
  svg += `<circle cx="${H[0]}" cy="${H[1]}" r="${H[2]}" fill="${SKIN}" stroke="${OUT}" stroke-width="3"/>
          <circle cx="${H[0]+H[2]*0.34}" cy="${H[1]-2}" r="2.1" fill="${OUT}"/>
          <circle cx="${H[0]-H[2]*0.34}" cy="${H[1]-2}" r="2.1" fill="${OUT}"/>
          <path d="M${H[0]-4} ${H[1]+6} q4 4 8 0" stroke="${OUT}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  /* 近侧腿、臂 */
  svg += bone(HIP,p.lR[0],13,SHORTS) + chain(p.lR,12,SKIN);
  svg += `<line x1="${p.lL[2][0]-4}" y1="${p.lL[2][1]+2}" x2="${p.lL[2][0]+10}" y2="${p.lL[2][1]+2}" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/>
          <line x1="${p.lR[2][0]-4}" y1="${p.lR[2][1]+2}" x2="${p.lR[2][0]+10}" y2="${p.lR[2][1]+2}" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/>
          <line x1="${p.lL[2][0]-3}" y1="${p.lL[2][1]+2}" x2="${p.lL[2][0]+9}" y2="${p.lL[2][1]+2}" stroke="${SHOE}" stroke-width="5" stroke-linecap="round"/>
          <line x1="${p.lR[2][0]-3}" y1="${p.lR[2][1]+2}" x2="${p.lR[2][0]+9}" y2="${p.lR[2][1]+2}" stroke="${SHOE}" stroke-width="5" stroke-linecap="round"/>`;
  svg += chain(p.aR,10,SKIN);
  svg += `<circle cx="${p.aL[2][0]}" cy="${p.aL[2][1]}" r="5.5" fill="${SKIN}" stroke="${OUT}" stroke-width="2.4"/>
          <circle cx="${p.aR[2][0]}" cy="${p.aR[2][1]}" r="5.5" fill="${SKIN}" stroke="${OUT}" stroke-width="2.4"/>`;
  svg += art.front || '';
  svg += `</svg>`;
  return svg;
}

/* ---------- 肌肉示意 контр ---------- */
/* sd = 标注徽章所在侧（L 左 / R 右），gy = 该肌肉在人体上的纵向位置（用于自动排序布点） */
const MPARTS = {
  deltF  : {n:'三角肌前束', sd:'L', gy:90,  g:'<circle cx="118" cy="90" r="13"/><circle cx="182" cy="90" r="13"/>'},
  lat    : {n:'背阔肌',     sd:'L', gy:112, g:'<ellipse cx="132" cy="112" rx="17" ry="29" transform="rotate(9 132 112)"/><ellipse cx="168" cy="112" rx="17" ry="29" transform="rotate(-9 168 112)"/>'},
  tricep : {n:'肱三头肌',   sd:'L', gy:118, g:'<ellipse cx="110" cy="118" rx="9" ry="17" transform="rotate(8 110 118)"/><ellipse cx="190" cy="118" rx="9" ry="17" transform="rotate(-8 190 118)"/>'},
  forearm: {n:'前臂/手腕肌群',sd:'L',gy:152, g:'<ellipse cx="100" cy="152" rx="8" ry="16" transform="rotate(4 100 152)"/><ellipse cx="200" cy="152" rx="8" ry="16" transform="rotate(-4 200 152)"/>'},
  ilio   : {n:'髂腰肌',     sd:'L', gy:170, g:'<ellipse cx="140" cy="170" rx="11" ry="13"/><ellipse cx="160" cy="170" rx="11" ry="13"/>'},
  quad   : {n:'股四头肌',   sd:'L', gy:208, g:'<ellipse cx="133" cy="208" rx="15" ry="38" transform="rotate(2 133 208)"/><ellipse cx="167" cy="208" rx="15" ry="38" transform="rotate(-2 167 208)"/>'},
  tibialis:{n:'胫骨前肌',   sd:'L', gy:264, g:'<ellipse cx="131" cy="264" rx="8" ry="26"/><ellipse cx="169" cy="264" rx="8" ry="26"/>'},
  pec    : {n:'胸大肌',     sd:'R', gy:100, g:'<ellipse cx="137" cy="100" rx="16" ry="11" transform="rotate(-18 137 100)"/><ellipse cx="163" cy="100" rx="16" ry="11" transform="rotate(18 163 100)"/>'},
  abs    : {n:'腹直肌（核心）',sd:'R',gy:130,g:'<rect x="137" y="112" width="26" height="48" rx="12"/>'},
  oblique: {n:'腹斜肌',     sd:'R', gy:136, g:'<ellipse cx="130" cy="136" rx="9" ry="21"/><ellipse cx="170" cy="136" rx="9" ry="21"/>'},
  erect  : {n:'竖脊肌',     sd:'R', gy:140, g:'<rect x="142" y="118" width="16" height="44" rx="8"/>'},
  glute  : {n:'臀大肌',     sd:'R', gy:180, g:'<ellipse cx="134" cy="180" rx="16" ry="17"/><ellipse cx="166" cy="180" rx="16" ry="17"/>'},
  ham    : {n:'腘绳肌',     sd:'R', gy:216, g:'<ellipse cx="133" cy="216" rx="14" ry="34" transform="rotate(2 133 216)"/><ellipse cx="167" cy="216" rx="14" ry="34" transform="rotate(-2 167 216)"/>'},
  calf   : {n:'小腿三头肌', sd:'R', gy:266, g:'<ellipse cx="131" cy="266" rx="9.5" ry="25"/><ellipse cx="169" cy="266" rx="9.5" ry="25"/>'}
};

function bodySilhouette(){
  return `
  <g fill="#e3eefa" stroke="#9dbadb" stroke-width="2.5" stroke-linejoin="round">
    <circle cx="150" cy="42" r="24"/>
    <path d="M116 80 Q150 70 184 80 L180 130 Q170 150 178 176 Q150 187 122 176 Q130 150 126 130 Z"/>
    <path d="M118 86 L102 126 L94 166" stroke="#9dbadb" stroke-width="19" stroke-linecap="round" fill="none"/>
    <path d="M182 86 L198 126 L206 166" stroke="#9dbadb" stroke-width="19" stroke-linecap="round" fill="none"/>
    <path d="M134 172 L130 238 L128 298" stroke="#9dbadb" stroke-width="23" stroke-linecap="round" fill="none"/>
    <path d="M166 172 L170 238 L172 298" stroke="#9dbadb" stroke-width="23" stroke-linecap="round" fill="none"/>
    <path d="M128 300 L112 312 M172 300 L188 312" stroke="#9dbadb" stroke-width="13" stroke-linecap="round" fill="none"/>
  </g>`;
}

/* 自动布点：按所在侧分组 → 按人体纵向位置排序 → 等距排列，保证徽章不重叠 */
function drawMuscleMap(list){
  const COL = {1:'#e5533d', 2:'#f0a20b', 3:'#7aa6d8'};
  const pos = {};                       // key -> {x,y}

  const sides = {L:[], R:[]};
  list.forEach(m=>sides[MPARTS[m.k].sd].push(m.k));
  /* 单侧超过 4 个时，把多余项挪到另一侧，保持两侧平衡 */
  while(sides.L.length > 4){ sides.R.push(sides.L.pop()); }
  while(sides.R.length > 4){ sides.L.push(sides.R.pop()); }

  Object.keys(sides).forEach(sd=>{
    const ks = sides[sd].slice().sort((a,b)=>MPARTS[a].gy-MPARTS[b].gy);
    const n = ks.length; if(!n) return;
    const step = 34, total = (n-1)*step, start = 195 - total/2;
    ks.forEach((k,i)=>{ pos[k] = {x: sd==='L' ? 30 : 270, y: start + i*step}; });
  });

  let parts='', badges='';
  list.forEach((m,i)=>{
    const P = MPARTS[m.k], p = pos[m.k];
    const fill = COL[m.lv] || COL[2];
    const dash = m.back ? ' stroke-dasharray="5 4"' : '';
    parts += `<g fill="${fill}" fill-opacity="${m.back?.45:.8}" stroke="${fill}" stroke-width="2"${dash}>${P.g}</g>`;
    const dx = p.x<150 ? 24 : -24;
    badges += `<line x1="${p.x+dx}" y1="${p.y}" x2="${p.x}" y2="${p.y}" stroke="#9dbadb" stroke-width="1.8" stroke-dasharray="3 3"/>
               <circle cx="${p.x}" cy="${p.y}" r="12.5" fill="${fill}" stroke="#fff" stroke-width="2.6"/>
               <text x="${p.x}" y="${p.y+4.6}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${i+1}</text>`;
  });
  return `<svg viewBox="0 0 300 340">${bodySilhouette()}${parts}${badges}</svg>`;
}

/* =========================================================
   3. 项目数据
   ========================================================= */
const PROJECTS = [

/* ---------------- 跳绳 ---------------- */
{
  id:'rope', name:'一分钟跳绳', emoji:'🪢', short:'跳绳',
  tag:'协调 · 速率 · 足踝刚度',
  intro:'跳绳成绩差，90% 不是体力问题，而是<b>「跳得太高、落得太重、摇绳靠胳膊」</b>。训练重点是：足踝像弹簧一样快起快落 + 手腕摇绳 + 稳定节奏不断绳。',
  goals:[
    {t:'核心能力：足踝弹性', d:'脚踝快速蹬伸与缓冲（反应力量），落地时间越短、连续跳越省力。'},
    {t:'动力链：手腕摇绳', d:'大臂夹紧体侧，只用前臂与手腕转动绳子，减少能量消耗。'},
    {t:'控制链：躯干稳定', d:'核心收紧、目视前方，避免左右晃动与撅臀导致落地失衡。'}
  ],
  muscles:[
    {k:'calf',   lv:1, note:'第一主力。控制脚踝快速蹬伸（绷脚）与落地缓冲，决定"连得起、跳得快"。'},
    {k:'tibialis',lv:2, note:'勾脚尖，负责绳子通过脚底瞬间的抬脚，防挂绳。'},
    {k:'quad',   lv:2, note:'膝关节保持微屈，像减震器一样缓冲落地冲击。'},
    {k:'ilio',   lv:3, note:'维持身体直立微前倾，避免塌腰撅臀。'},
    {k:'abs',    lv:3, note:'躯干稳定，减少左右晃动造成的空跳失误。'},
    {k:'forearm',lv:1, note:'摇绳的真正发动机——手腕画小圈，而不是抡大胳膊。'}
  ],
  drills:[
    {
      id:'rope-1', name:'绳梯 · 节奏开合跳', equip:['ladder'],
      target:'建立<b>轻快落地节奏</b>与左右分腿协调，纠正"跳一次歇一下"。',
      steps:['绳梯平铺地面，站在起点前一格，双脚并拢、大臂自然下垂。','口令"开-合-开-合"：向外跳成分腿落在两侧格子外，随即并回同一格。','前一格一格向前推进，全程前脚掌着地。'],
      dose:'3 组 × 10 格（约 20 次），组间歇 60 秒', 
      cue:'落地轻、声响脆；膝盖永远不要伸直锁死。',
      mis:'落地重重砸脚跟 → 改为前脚掌；向上跳太高 → 改为"擦地面"式快弹。',
      art:{p:{head:[100,26,16],aL:[[88,58],[70,44],[60,30]],aR:[[112,58],[130,44],[140,30]],
              lL:[[94,102],[70,132],[58,164]],lR:[[106,102],[130,132],[142,164]]},back:ART.ladder(100,168)}
    },
    {
      id:'rope-2', name:'敏捷圈 · 连续跳跃', equip:['ring'],
      target:'提高<b>连续弹跳的反应力量</b>与腾空收腿意识，服务跳绳的连贯性。',
      steps:['5-6 个敏捷圈间隔 40-50 cm 一字排开。','双腿屈膝半蹲，双臂后摆→前摆蹬地，跳入第一个圈。','落地即起跳入下一个圈，中间不允许停顿调整。'],
      dose:'4 组 × 6 圈，组间歇 90 秒',
      cue:'落地-起跳要在 0.3 秒内完成，像皮球落地回弹。',
      mis:'每跳一次都要重新蹲深（脱节）→ 强调"直膝快弹"。',
      art:{p:{head:[100,26,16],aL:[[88,58],[72,42],[64,28]],aR:[[112,58],[128,42],[136,28]],
              lL:[[94,102],[84,126],[92,150]],lR:[[106,102],[116,126],[110,152]]},
           back:ART.ring(40,180,26,9)+ART.ring(100,184,30,10)+ART.ring(160,188,34,11)}
    },
    {
      id:'rope-3', name:'跳绳 · 手腕摇绳 30 秒', equip:['rope'],
      target:'把发力改到<b>手腕</b>，用最小动作幅度维持最高频率。',
      steps:['绳子对折检查长度：双脚踩绳，手柄达腋下到胸部之间。','大臂夹紧两肋，肘部固定在腰侧，仅靠手腕画小圆圈摇绳。','起跳高度控制在 2-3 cm，前脚掌轻点地面。','30 秒计时，记录次数并要求下一次超过。'],
      dose:'5 组 × 30 秒，间歇 60 秒',
      cue:'数自己 10 秒内的次数，作为即时反馈。',
      mis:'大臂外张甩肩；跳得高耽误时间；抡一次停一次。',
      art:{p:{aL:[[88,58],[78,72],[80,88]],aR:[[112,58],[122,72],[120,88]],
              lL:[[94,102],[88,130],[86,152]],lR:[[106,102],[112,130],[114,152]]},
           back:`<path d="M80 88 C 66 26 134 26 120 88" fill="none" stroke="#ff5757" stroke-width="2.6" stroke-dasharray="6 5"/>`,
           front:`<path d="M80 88 C 62 168 138 168 120 88" fill="none" stroke="#ff5757" stroke-width="3"/>`}
    },
    {
      id:'rope-4', name:'软排 · 夹球节奏跳', equip:['vb'],
      target:'用夹球的<b>约束</b>强迫大臂夹紧、身体不散，直接迁移到跳绳动作。',
      steps:['双膝/双脚踝之间夹一个软排球，双臂自然下垂夹住另一个球（初学可只用 1 个）。','原地连续轻跳，要求球全程不掉。','熟练后加入"快-快-慢"口令变化。'],
      dose:'3 组 × 40 次（或 40 秒），组间歇 60 秒',
      cue:'球掉了就重来，重点是身体"拧成一股绳"。',
      mis:'用胸口去顶球、撅屁股夹球 → 保持躯干直立。',
      art:{p:{aL:[[88,58],[80,74],[94,82]],aR:[[112,58],[120,74],[106,82]],
              lL:[[94,102],[88,128],[88,156]],lR:[[106,102],[112,128],[112,156]]},
           front:ART.ball(100,80,11,'vb')}
    },
    {
      id:'rope-5', name:'瑜伽垫 · 直膝踝关节快弹', equip:['mat'],
      target:'纯踝关节发力训练，打造跳绳的"弹簧脚"。',
      steps:['站/坐在瑜伽垫上，双脚与肩同宽，膝盖尽量不弯。','脚跟提起→快速下落，脚掌像打鼓一样连续敲击垫面。','按节拍器 120-160 次/分推进。'],
      dose:'4 组 × 20 秒（渐进到 30 秒），组间歇 45 秒',
      cue:'小腿后侧要"发热"才练到位；膝盖不许参与屈伸。',
      mis:'变成深蹲起；脚离地太高。',
      art:{p:{aL:[[88,58],[82,74],[72,86]],aR:[[112,58],[118,74],[128,86]],
              lL:[[94,102],[92,132],[90,162]],lR:[[106,102],[108,132],[110,162]]},
           back:ART.mat(100,176), front:ART.arrow(100,192,100,172,'#e5533d')}
    }
  ]
},

/* ---------------- 跳远 ---------------- */
{
  id:'ljump', name:'立定跳远', emoji:'🦘', short:'跳远',
  tag:'爆发力 · 蹬伸 · 收腹举腿',
  intro:'立定跳远 = <b>蹬伸角度 × 爆发力 × 空中收腿</b>。很多孩子只会"往上跳"，所以需要练三个点：髋膝踝充分蹬直、双臂有力前摆带出、腾空主动收腹伸小腿去"够"。',
  goals:[
    {t:'发力：髋膝踝三关节蹬伸', d:'臀大肌伸髋 + 股四头肌伸膝 + 小腿末端蹬伸，决定起跳初速度。'},
    {t:'传导：核心刚度', d:'躯干刚性足够，下肢力量才能完整传递，避免"软腰"泄力。'},
    {t:'落地：收腹举腿', d:'空中主动收腹、小腿前伸，脚跟先着地，落地成绩能多 10-15 cm。'}
  ],
  muscles:[
    {k:'glute',  lv:1, back:true, note:'伸髋主力（往前"顶髋"），决定起跳初速度。'},
    {k:'quad',   lv:1, note:'伸膝爆发，把蓄力的蹲姿瞬间打开。'},
    {k:'calf',   lv:1, back:true, note:'最后一道蹬伸，起跳瞬间绷脚贡献约 15% 力量。'},
    {k:'ham',    lv:2, back:true, note:'协同伸髋并负责空中收腿折叠，同时预防拉伤。'},
    {k:'abs',    lv:2, note:'收腹举腿——把腿"提"到身体前面延长落点。'},
    {k:'deltF',  lv:3, note:'双臂有力前上摆，制造向上的动量、提高重心轨迹。'}
  ],
  drills:[
    {
      id:'lj-1', name:'敏捷圈 · 连续蛙跳', equip:['ring'],
      target:'完整的<b>摆臂—蹬伸—收腹—落地</b>链条，是跳远的缩小版。',
      steps:['6 个敏捷圈按 60-80 cm 间距排成一列。','半蹲、双臂后摆，随即双臂猛向前上方摆，同时蹬地跳出。','腾空主动收腹抬膝，落地立刻衔接下一次。'],
      dose:'4 组 × 6 圈，组间歇 90-120 秒',
      cue:'每次都追求"更远一点点"，而不是更快。',
      mis:'落地时坐屁股往后坐（重心留在后面）→ 落地要"蹲下吸收"。',
      art:{p:{head:[100,28,16],aL:[[88,58],[70,52],[58,42]],aR:[[112,58],[130,60],[144,52]],
              lL:[[94,102],[72,124],[58,148]],lR:[[106,102],[122,128],[142,150]]},
           back:ART.ring(35,178,26,9)+ART.ring(95,182,30,10)+ART.ring(160,186,32,11)}
    },
    {
      id:'lj-2', name:'跨栏架 · 低栏收腹跳', equip:['hurdle'],
      target:'强迫<b>腾空高度 + 收腿折叠</b>，直接迁移跳远的空中动作。',
      steps:['3-4 个低栏架（30-40 cm）间距 1 m 摆放。','双脚起跳越过第一个栏，空中双膝主动向胸口收。','落地即刻起跳过下一栏，身体保持正直不前倾。'],
      dose:'4 组 × 4 栏，组间歇 120 秒',
      cue:'口令"收！"提醒孩子在最高点团身。',
      mis:'只追求越过不收腿；落地向后仰。',
      art:{p:{head:[100,24,16],aL:[[88,58],[72,42],[64,28]],aR:[[112,58],[128,42],[136,28]],
              lL:[[94,102],[84,118],[96,136]],lR:[[106,102],[114,118],[108,138]]},
           back:ART.hurdle(100,150)+ART.mat(100,180)}
    },
    {
      id:'lj-3', name:'绳梯 · 蹬直前跳', equip:['ladder'],
      target:'体会<b>三关节充分蹬直</b>的发力量，改正"蹲下去就起不来"。',
      steps:['站在绳梯起点，半蹲准备，双臂后引。','每一跳跨越 2 格，起跳瞬间脚踝、膝、髋依次充分伸展（完全蹬直）。','前脚掌扒地落地后迅速再起，共 8-10 格。'],
      dose:'4 组 × 8 格，组间歇 90 秒',
      cue:'想象"头顶有一根线把自己往上拔"——全力向上+向前。',
      mis:'只向远不向上，跳成"趴着"；起跳时先抬脚后伸膝（顺序错）。',
      art:{p:{head:[94,30,16],neck:[96,50],hip:[100,104],
              aL:[[88,58],[74,50],[62,56]],aR:[[112,58],[130,62],[144,56]],
              lL:[[94,104],[74,116],[72,140]],lR:[[106,104],[128,130],[146,156]]},
           back:ART.ladder(100,168)}
    },
    {
      id:'lj-4', name:'波速球 · 半蹲控稳', equip:['bosu'],
      target:'提升踝膝<b>稳定</b>与下肢离心力量，让落地不塌、发力不漏。',
      steps:['双脚站上波速球平面侧，屈膝半蹲（大腿约与地面成 45°）。','保持上身直立、目视前方，静态控制或缓慢起落。','进阶：站稳后做 1/4 幅度的快速蹲起（离心-向心转换）。'],
      dose:'3 组 × 30 秒控稳 / 15 次蹲起，组间歇 60 秒',
      cue:'膝盖不许内扣；球不晃是靠"脚掌抓地"而不是绷脚拼命。',
      mis:'弓背塌腰；为了不掉球而完全放弃幅度。',
      art:{p:{hip:[100,106],aL:[[88,62],[70,66],[56,66]],aR:[[112,62],[130,66],[144,66]],
              lL:[[94,106],[86,132],[84,156]],lR:[[106,106],[114,132],[116,156]]},
           back:ART.bosu(100,158)}
    },
    {
      id:'lj-5', name:'瑜伽垫 · 立定多级跳', equip:['mat'],
      target:'专项转化：把力量变成<b>连续水平位移</b>，最接近真实立定跳远。',
      steps:['瑜伽垫上站立，双臂预摆两次后全力蹬地。','第 1 跳尽量远并够高；第 2、3 跳强调快速衔接（三跳：跨—跳—落）。','最后落在垫外软地面或厚垫上，屈膝深蹲吸收冲击。'],
      dose:'5 组 × 3 级跳，组间歇 120 秒',
      cue:'每一跳都要"顶髋-绷脚-摆臂"三件事同时做。',
      mis:'第一跳太保守；三跳之间停顿丢失水平速度。',
      art:{p:{head:[100,30,16],aL:[[88,58],[70,64],[58,74]],aR:[[112,58],[130,64],[142,74]],
              lL:[[94,102],[70,110],[84,130]],lR:[[106,102],[130,110],[116,132]]},
           back:ART.mat(100,182)}
    }
  ]
},

/* ---------------- 50 米跑 ---------------- */
{
  id:'run', name:'50 米跑', emoji:'🏃', short:'50 米跑',
  tag:'步频 · 步幅 · 反应起动',
  intro:'50 米全程约 7-10 秒，几乎全部是<b>加速过程</b>。孩子成绩差多因：起跑反应慢、抬腿低、落地重、身体左右晃。训练围绕"快速折叠摆腿 + 高频蹬摆 + Correct 摆臂"展开。',
  goals:[
    {t:'启动：反应与前倾加速', d:'听信号即动，前 10 m 身体大幅前倾、步长由短到长。'},
    {t:'途中：步频 × 步幅', d:'高抬腿+后蹬，步频优先；落地要"扒地"而非踩地。'},
    {t:'控制：核心抗旋转', d:'躯干不能左右晃，摆臂在矢状面（前后摆，不横跨）.'}
  ],
  muscles:[
    {k:'ilio',  lv:1, note:'屈髋抬腿的第一主力，直接决定步频快慢。'},
    {k:'quad',  lv:1, note:'伸膝蹬地与落地支撑，保证每一步"蹬得出去、撑得回来"。'},
    {k:'glute', lv:1, back:true, note:'后蹬（伸髋）产生推进力，是步幅的来源。'},
    {k:'ham',   lv:2, back:true, note:'高速下拉小腿完成折叠摆腿，也是最易拉伤的肌群，必须练。'},
    {k:'calf',  lv:2, back:true, note:'踝关节刚度——落地不塌陷，才能马上弹起来。'},
    {k:'abs',   lv:2, note:'抗旋转与维持前倾姿态，避免左右摆动浪费能量。'},
    {k:'deltF', lv:3, note:'摆臂节奏引导腿部节奏，前摆到胸、后摆到髋。'}
  ],
  drills:[
    {
      id:'run-1', name:'绳梯 · 高抬腿跑格', equip:['ladder'],
      target:'提高<b>抬腿高度与步频</b>，建立快速折叠摆腿的动作模式。',
      steps:['绳梯每格一步快速通过，大腿抬至水平，小腿自然折叠在体下。','前脚掌着地、落地即起，手臂配合前后快速摆动。','先慢后快，保证每格准确，再逐步提速。'],
      dose:'4 组 × 10 格来回，组间歇 90 秒',
      cue:'口令"膝！膝！膝！"——每一声对应一次抬膝到水平。',
      mis:'后仰坐着跑；脚 downtime 太长（拖沓）。',
      art:{p:{head:[100,32,16],aL:[[88,58],[72,68],[86,54]],aR:[[112,58],[128,66],[134,56]],
              lL:[[94,102],[68,104],[72,136]],lR:[[106,102],[112,132],[116,166]]},
           back:ART.ladder(100,168)}
    },
    {
      id:'run-2', name:'跨栏架 · 跨步跳衔接', equip:['hurdle'],
      target:'拉长<b>步幅</b>并练前后摆腿的协调，改善"小碎步"。',
      steps:['4-6 个低栏架（腿部见习 20-30 cm），间距约 1.2-1.5 m。','连续跨步跳过，摆动腿膝盖领先带动小腿前伸，落地在大腿正下方。','两臂如同正常跑摆臂，躯干保持小幅前倾。'],
      dose:'4 组 × 5 栏，组间歇 120 秒',
      cue:'落地要有"鞭打"感——脚掌主动向下向后扒地。',
      mis:'跳过头导致落地脚在重心前面（刹车效应）；身体后仰。',
      art:{p:{head:[98,32,16],neck:[100,50],hip:[102,104],
              aL:[[90,58],[76,66],[74,80]],aR:[[114,58],[130,52],[138,42]],
              lL:[[96,104],[70,116],[52,130]],lR:[[108,104],[126,126],[144,144]]},
           back:ART.hurdle(100,152)+ART.mat(100,184)}
    },
    {
      id:'run-3', name:'敏捷圈 · 听信号反应起跑', equip:['ring'],
      target:'练<b>起动反应</b>与前 10 m 的加速技术，这是 50 米最值钱的一段。',
      steps:['学生背对/侧向站在敏捷圈后，教练随机发出口令或哨声（也可用举手、落球）。','听到信号立刻转身直冲 10-15 m，身体由大幅前倾逐步抬起。','前 5 步小而快、重心逐渐抬高，跑过终点线后才减速。'],
      dose:'6-8 次 × 10-15 m，每次充分恢复（60-90 秒）',
      cue:'第一步一定要"快"，第二步开始加长度。',
      mis:'一开始就迈大步（ overcautious）；起动时先站起来再跑。',
      art:{p:{head:[84,34,16],neck:[88,52],hip:[100,104],
              aL:[[82,58],[64,68],[56,60]],aR:[[94,58],[112,64],[122,56]],
              lL:[[96,104],[76,110],[62,132]],lR:[[104,104],[120,132],[134,158]]},
           back:ART.ring(52,178,24,8)+ART.ring(150,186,30,10)}
    },
    {
      id:'run-4', name:'软排 · 持球大幅摆臂', equip:['vb'],
      target:'固定<b>前后摆臂平面</b>，用握球消除横向摆臂的动作串扰。',
      steps:['双手（或单手）持软排球，原地站立做原地摆臂：手从髋后摆到胸前高度。','保持肘关节约 90°，手不前越过身体中线。','熟练后在慢跑中做，最后加 20 m 加速跑不持球，体会相同节奏。'],
      dose:'3 组 × 30 秒 / 4 组 × 20 m 迁移跑，组间歇 60 秒',
      cue:'口诀"前不露肘、后不甩手"。',
      mis:'肩膀端起来；手臂横向划过身体（ cross-body）。',
      art:{p:{head:[98,32,16],neck:[100,50],hip:[100,104],
              aL:[[90,58],[72,50],[58,40]],aR:[[112,58],[128,66],[140,76]]},
           front:ART.ball(54,36,10,'vb')+ART.motion([[150,86],[168,70],[186,58]],'#8aa8c8')}
    },
    {
      id:'run-5', name:'波速球 · 单腿支撑稳控', equip:['bosu'],
      target:'强化踝膝髋的<b>稳定性</b>，减少落地塌陷与跑步时的左右晃动。',
      steps:['单脚站上波速球，另一腿屈膝抬起，双臂侧平举维持平衡。','先静态控制 20-30 秒；进阶加入轻抛接球或对同伴轻推的抗干扰。','换腿重复，两腿各 3 组。'],
      dose:'每腿 3 组 × 30 秒',
      cue:'骨盆保持水平，支撑腿膝盖对准脚尖方向。',
      mis:'骨盆歪斜、用腰代偿；憋气。',
      art:{p:{hip:[100,102],aL:[[88,58],[70,52],[58,46]],aR:[[112,58],[130,52],[142,46]],
              lL:[[94,102],[92,130],[92,152]],lR:[[106,102],[124,116],[112,138]]},
           back:ART.bosu(100,158)}
    }
  ]
},

/* ---------------- 投掷实心球 ---------------- */
{
  id:'throw', name:'投掷实心球', emoji:'🎯', short:'实心球',
  tag:'躯干鞭打 · 核心传导 · 出手角',
  intro:'孩子把实心球扔不远，多半是<b>只用手臂扔</b>。正确顺序是：蹬地 → 送髋 → 躯干鞭打（满弓到收腹） → 肩肘腕依次加速，出手角约 40-45°。核心是把地面的力量传导到指尖。',
  goals:[
    {t:'蓄力：背弓（拉伸-缩短周期）', d:'躯干后仰成"弓"，先拉长前侧链，再快速收缩产生更大力量。'},
    {t:'传导：核心刚度 + 髋部旋转', d:'下肢蹬地的力通过刚性躯干无损传到上肢，不能"软肚皮泄力"。'},
    {t:'末端：肩肘腕依次加速', d:'鞭打顺序不能反，最后手腕拨球决定出手角度与旋转。'}
  ],
  muscles:[
    {k:'pec',    lv:1, note:'手臂"鞭打"收拢阶段的主力，负责向前推球。'},
    {k:'deltF',  lv:1, note:'肩关节前屈发力，把球从脑后加速向前上方送出。'},
    {k:'tricep', lv:2, note:'伸肘是关键末梢发力点，决定出手速度。'},
    {k:'lat',    lv:2, back:true, note:'把球在脑后"拉满弓"，并为向下的牵拉-回弹提供张力。'},
    {k:'oblique',lv:1, note:'躯干旋转与侧屈鞭打，是连接下肢与上肢的桥梁。'},
    {k:'erect',  lv:2, back:true, note:'伸展脊柱完成"由弓到直"的鞭打。'},
    {k:'glute',  lv:2, back:true, note:'蹬地起势，力量从这里出发。'},
    {k:'forearm',lv:3, note:'手腕拨球，控制 40-45° 的出手角度。'}
  ],
  drills:[
    {
      id:'th-1', name:'实心球 · 双手头上抛掷', equip:['medball'],
      target:'完整技术练习：<b>蹬地—满弓—鞭打—拨腕</b>的完整动力链。',
      steps:['双脚前后开立，双手握球举过头顶后方，身体成反弓（挺髋、后仰）。','蹬地→收腹→胸部前扑，双臂像鞭子一样甩过头顶。','于 40-45° 方向出手，手腕最后主动拨球，出手后顺势跨一步制动不前冲。'],
      dose:'5 组 × 6-8 次（轻球 1-2 kg），组间歇 90 秒',
      cue:'口令"蹬（地）—顶（髋）—甩（臂）"，出手后才准跨步。',
      mis:'只用胳膊而没有挺髋；出手角度太平（打在地的前面或打地）；踩线犯规。',
      art:{p:{head:[88,36,16],neck:[94,52],hip:[104,106],
              aL:[[88,58],[70,44],[58,32]],aR:[[100,58],[82,44],[66,28]],
              lL:[[98,106],[90,136],[84,164]],lR:[[110,106],[122,132],[130,162]]},
           front:ART.ball(62,26,13,'med')+ART.arrow(78,20,176,42,'#8a5cf6')}
    },
    {
      id:'th-2', name:'瑜伽垫 · 仰卧头后抛球', equip:['mat','medball'],
      target:'<b>隔离上肢</b>练鞭打：没有腿部借力，逼迫躯干和手臂完成"甩鞭"动作。',
      steps:['仰卧在瑜伽垫上，双臂伸直持球于头后贴地。','听到"抛"的口令，快速收腹坐起同时双臂从头后甩向前上（对墙或对着同伴抛球）。','必须在坐起瞬间把球拨出，不能先坐起再慢慢扔。'],
      dose:'4 组 × 8 次，组间歇 75 秒',
      cue:'仰卧起坐是"顺带"的，重点是球的出手速度。',
      mis:'坐起来再扔（分节断裂）；球出手角度太低。',
      art:{p:{head:[46,124,15],neck:[62,130],hip:[110,150],
              aL:[[60,126],[76,116],[100,110]],aR:[[64,134],[82,126],[102,118]],
              lL:[[112,152],[136,140],[152,124]],lR:[[110,154],[134,146],[150,132]]},
           back:ART.mat(100,178),
           front:ART.ball(112,106,10,'med')+ART.arrow(126,100,176,80,'#8a5cf6')}
    },
    {
      id:'th-3', name:'软排 · 坐姿胸前快传', equip:['vb'],
      target:'专练<b>出手速度</b>（而不是力量），纠正"慢动作推铅球"。',
      steps:['两人面对面坐/跪于垫上（相距 2-3 m），持软排球于胸前。','仅靠伸肘与拨腕把球快速水平传出，禁用大臂摆动和挺腰。','追求"球在手里停留时间最短"，逐步提高爆发。'],
      dose:'4 组 × 15 次 / 人，组间歇 60 秒',
      cue:'口诀"肘领先、腕收尾"，球出手瞬间手掌外翻。',
      mis:'用腰部助力；传球像"递东西"一样软绵绵。',
      art:{p:{head:[76,96,15],neck:[78,112],hip:[80,152],
              aL:[[72,118],[96,110],[112,104]],aR:[[84,118],[100,112],[114,108]],
              lL:[[80,152],[110,148],[122,164]],lR:[[82,154],[112,152],[126,168]]},
           back:ART.mat(90,178,180),
           front:ART.ball(126,102,11,'vb')+ART.arrow(142,96,186,84,'#f0a20b')}
    },
    {
      id:'th-4', name:'敏捷圈 · 蹬旋转髋步法', equip:['ring','medball'],
      target:'练<b>下肢发力 → 髋部旋转</b>的顺序，这是传导链最常被漏掉的一环。',
      steps:['双脚分别踩入两个敏捷圈（前后开立），双手持球于体侧。','后腿蹬地推动骨盆朝投掷方向旋转（后髋"往前顶"）。','体会"脚一蹬，腰就转"的顺序，再逐步加入完整投掷动作。'],
      dose:'4 组 × 10 次（每侧 5 次），组间歇 75 秒',
      cue:'口令"蹬地→转髋→到出手"，顺序不能反。',
      mis:'上体先转、髋不动（脱节）；前脚过早抬起。',
      art:{p:{head:[100,32,16],aL:[[112,58],[124,72],[128,86]],aR:[[88,58],[106,74],[120,86]],
              lL:[[94,102],[80,130],[74,162]],lR:[[106,102],[124,132],[134,164]]},
           back:ART.ring(70,180,26,9)+ART.ring(130,182,26,9),
           front:ART.ball(132,92,11,'med')}
    },
    {
      id:'th-5', name:'波速球 · 站姿核心抗旋传递', equip:['bosu','medball'],
      target:'在不稳定支撑上强化<b>抗旋转核心</b>，让力量传导不泄漏。',
      steps:['双脚站于波速球上（初学可先站球后的一只脚），双手持球于胸前。','同伴从侧面轻推或自身做小幅左右转体传递球，躯干尽量不被转动。','进阶：站在球上完成完整的双手头上抛掷动作（轻球）。'],
      dose:'3 组 × 20 次传递 / 3 组 × 5 次完整抛掷，组间歇 75 秒',
      cue:'保持"腰像一个圆筒"，呼吸不要憋气。',
      mis:'为了不掉球而放弃动作幅度；用膝盖代偿。',
      art:{p:{hip:[100,104],neck:[98,50],aL:[[90,54],[80,36],[86,24]],aR:[[106,54],[104,36],[96,24]],
              lL:[[94,104],[92,132],[92,150]],lR:[[106,104],[110,132],[110,150]]},
           back:ART.bosu(100,154), front:ART.ball(91,18,10,'med')}
    }
  ]
}
];

/* =========================================================
   4. 页面渲染
   ========================================================= */
let CUR = 'rope';
let FILTER = {};

/* --- 顶部八件器材小图 --- */
function renderHeroArt(){
  const items = [
    {k:'rope',    d:'<circle cx="26" cy="52" r="10" fill="none" stroke="#ff5757" stroke-width="3"/><path d="M36 52 C 70 10 130 10 164 52" fill="none" stroke="#ff5757" stroke-width="3"/>'},
    {k:'ladder',  d:'<path d="M10 40 H90 M10 62 H90" stroke="#4fc3f7" stroke-width="3.5"/><path d="M20 38 V64 M45 38 V64 M70 38 V64" stroke="#4fc3f7" stroke-width="3"/>'},
    {k:'ring',    d:'<ellipse cx="50" cy="52" rx="36" ry="13" fill="#ff6b9d22" stroke="#ff6b9d" stroke-width="5"/>'},
    {k:'hurdle',  d:'<rect x="14" y="34" width="72" height="6" rx="3" fill="#ff8a3d"/><path d="M20 40 L12 76 M80 40 L88 76" stroke="#ff8a3d" stroke-width="4"/>'},
    {k:'bosu',    d:'<path d="M14 66 a36 36 0 0 1 72 0 z" fill="#a8f0dc" stroke="#0f9b78" stroke-width="3"/><rect x="12" y="66" width="76" height="8" rx="4" fill="#20c997" stroke="#0f9b78" stroke-width="3"/>'},
    {k:'medball', d:'<circle cx="50" cy="52" r="26" fill="#c9b3f5" stroke="#6b45c9" stroke-width="3"/><path d="M28 48 q22 -22 44 0 M28 58 q22 22 44 0" fill="none" stroke="#6b45c9" stroke-width="2.4"/>'},
    {k:'vb',      d:'<circle cx="50" cy="52" r="26" fill="#ffd23f" stroke="#d99b00" stroke-width="3"/><path d="M28 48 q22 -22 44 0 M28 58 q22 22 44 0" fill="none" stroke="#d99b00" stroke-width="2.4"/>'},
    {k:'mat',     d:'<rect x="10" y="42" width="80" height="16" rx="7" fill="#b9e6a4" stroke="#3f9147" stroke-width="3"/><line x1="18" y1="50" x2="82" y2="50" stroke="#3f9147" stroke-width="1.6" stroke-dasharray="6 5"/>'}
  ];
  let s = '<svg viewBox="0 0 840 120" style="width:100%;height:auto">';
  items.forEach((it,i)=>{
    const x = i*105;
    s += `<g transform="translate(${x},0)">${it.d}
          <text x="50" y="104" text-anchor="middle" font-size="15" font-weight="800" fill="#2b6cb0">${EQUIP[it.k].name}</text></g>`;
  });
  s += '</svg>';
  document.getElementById('heroArt').innerHTML = s;
}

/* --- 项目切换卡 --- */
function renderTabs(){
  document.getElementById('tabs').innerHTML = PROJECTS.map(p=>`
    <div class="tab ${p.id===CUR?'active':''}" onclick="switchProj('${p.id}')">
      <div class="t-emj">${p.emoji}</div>
      <div class="t-name">${p.short}</div>
      <div class="t-tag">${p.tag}</div>
    </div>`).join('');
}

function switchProj(id){
  CUR = id;
  FILTER[id] = null;
  window.__forceAll = true;
  renderTabs(); renderPanel();
}

function cur(){ return PROJECTS.find(p=>p.id===CUR); }

/* --- 主面板 --- */
function renderPanel(){
  const P = cur();
  const active = window.__forceAll ? null : FILTER[P.id];
  window.__forceAll = false;
  const allEq = [...new Set(P.drills.flatMap(d=>d.equip))];

  let html = `<div class="panel">
    <div class="sec-head">
      <div class="sh-emj">${P.emoji}</div>
      <div style="flex:1">
        <h2>${P.name}</h2>
        <p>${P.intro}</p>
      </div>
    </div>
    <div class="goal-bar">
      ${P.goals.map(g=>`<div class="goal"><div class="g-t">🎯 ${g.t}</div><div class="g-d">${g.d}</div></div>`).join('')}
    </div>

    <div class="muscle-wrap">
      <div class="card">
        <div class="card-h">💪 这个项目主要发展哪些肌肉力量</div>
        <div class="muscle-fig">${drawMuscleMap(P.muscles)}</div>
      </div>
      <div class="card">
        <div class="card-h">🔍 编号说明 · 发力职责</div>
        <div class="legend">
          ${P.muscles.map((m,i)=>`
            <div class="legend-item">
              <div class="lg-n lv${m.lv}">${i+1}</div>
              <div class="lg-b">
                <div class="lg-name">${MPARTS[m.k].n}<span class="lv-tag">${m.lv===1?'★★★ 主发力':m.lv===2?'★★ 次发力':'★ 稳定协同'}</span></div>
                <div class="lg-note">${m.note}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="filter">
      <div class="f-t">按器材筛选练习方法（共 ${P.drills.length} 个）</div>
      <div class="chips">
        <button class="chip ${!active?'on':''}" onclick="setFilter('${P.id}',null)">全部</button>
        ${allEq.map(e=>`<button class="chip ${active===e?'on':''}" onclick="setFilter('${P.id}','${e}')">${EQUIP[e].name}</button>`).join('')}
      </div>
    </div>

    <div class="grid">
      ${P.drills.filter(d=>!active||d.equip.includes(active)).map((d,i)=>`
        <div class="drill" onclick="openDrill('${d.id}')">
          <div class="drill-h"><span>${d.name}</span><span class="idx">0${i+1}</span></div>
          <div class="drill-fig">${drawFig(d.art)}</div>
          <div class="drill-b">
            <div class="eq-tags">${d.equip.map(e=>`<span class="eq" style="background:${EQUIP[e].color}33">${EQUIP[e].name}</span>`).join('')}</div>
            <div class="drill-target">${d.target}</div>
            <div class="dose">⏱ ${d.dose}</div>
            <div class="drill-more">点击查看完整练习方法 ▸</div>
          </div>
        </div>`).join('')}
    </div>
  </div>`;
  document.getElementById('main').innerHTML = html;
}

function setFilter(pid,e){ FILTER[pid]=e; renderPanel(); }

/* --- 详情弹窗 --- */
function openDrill(id){
  const P = cur();
  const d = P.drills.find(x=>x.id===id);
  document.getElementById('modalCard').innerHTML = `
    <div class="m-h">
      <h3>${d.name}</h3>
      <div class="m-x" onclick="document.getElementById('modalBg').classList.remove('on')">✕</div>
    </div>
    <div class="m-b">
      <div class="m-fig">${drawFig(d.art)}</div>
      <div class="m-meta">
        ${d.equip.map(e=>`<span class="eq" style="background:${EQUIP[e].color}44">🛠 ${EQUIP[e].name}</span>`).join('')}
        <span class="eq">⏱ ${d.dose}</span>
      </div>
      <div class="m-row">
        <div class="m-box"><div class="bt">训练目的</div><div class="bd">${d.target}</div></div>
        <div class="m-box"><div class="bt">动作口诀</div><div class="bd">${d.cue}</div></div>
      </div>
      <div class="m-sec">
        <h4>练习步骤</h4>
        <ol>${d.steps.map(s=>`<li>${s}</li>`).join('')}</ol>
      </div>
      <div class="m-sec">
        <h4>常见错误与纠正</h4>
        <ul><li>${d.mis}</li></ul>
      </div>
    </div>`;
  document.getElementById('modalBg').classList.add('on');
}
function closeModal(e){ if(e.target.id==='modalBg') document.getElementById('modalBg').classList.remove('on'); }
function scrollToId(id){ document.getElementById(id).scrollIntoView({behavior:'smooth'}); }

/* =========================================================
   训练方案生成器
   ========================================================= */
function renderPlannerProjects(){
  document.getElementById('planProjects').innerHTML = PROJECTS.map(p=>`
    <label class="ck" onclick="this.classList.toggle('on')">
      <input type="checkbox" value="${p.id}" ${p.id==='rope'?'checked':''} onchange="this.parentNode.classList.toggle('on',this.checked)">
      <span>${p.emoji} ${p.short}</span>
    </label>`).join('');
  document.querySelectorAll('#planProjects .ck').forEach(el=>{
    if(el.querySelector('input').checked) el.classList.add('on');
  });
}

function buildPlan(){
  const checked = [...document.querySelectorAll('#planProjects input:checked')].map(i=>i.value);
  if(!checked.length){ alert('请至少勾选一个薄弱项目'); return; }
  const stage = document.getElementById('planStage').value;
  const min   = +document.getElementById('planMin').value;
  const level = document.getElementById('planLevel').value;
  const weeks = +document.getElementById('planWeek').value;

  const lv = level==='初学' ? {w:.8, set:-1} : level==='提高' ? {w:1, set:0} : {w:1.15, set:1};
  const setsOf = base => Math.max(2, base + lv.set);

  const WARM = [
    ['绕场慢跑 + 徒手操（肩、髋、踝腕关节环绕）', '5 min', '—'],
    ['动态牵拉：弓步转体、最伟大拉伸、小步跑、高抬腿', '4 min', '—'],
    ['专项激活：原地提踵 20 次 × 2 组 + 快速摆臂 20 秒', '3 min', '—']
  ];

  let rows = [];
  const picked = checked.map(id=>PROJECTS.find(p=>p.id===id));

  WARM.forEach((w,i)=>rows.push({seg:i===0?'准备部分\n(约 12 min)':(i===1?'':''), ...packBlock(w)}));

  /* 主项 */
  picked.forEach((P,pi)=>{
    const pickCount = Math.ceil(6/picked.length) || 2;
    const ds = P.drills.slice(0, Math.max(2, Math.min(pickCount, P.drills.length)));
    ds.forEach((d,di)=>{
      const mm = d.dose.match(/^(\d+)\s*组/);
      const n  = Math.max(2, (mm?+mm[1]:3) + lv.set);
      const rest = mm ? d.dose.replace(/^\d+\s*组\s*×\s*/,'') : d.dose;
      rows.push({
        seg: di===0 ? `主项 ${pi+1}：${P.short}\n(${Math.round(min*0.5/picked.length)} min)` : '',
        content: `<b>${d.name}</b><br>${stripTags(d.target)}`,
        equip: d.equip.map(e=>EQUIP[e].name).join('、'),
        dose: `<b>${n} 组</b>${mm?' × ':''}${rest}`,
        note: d.cue
      });
    });
  });

  /* 素质游戏 */
  const GAME = {
    rope : ['绳梯接力赛（比节奏与准确）','10 秒快摇挑战'],
    ljump: ['多级跳接力争上游','蛙跳过河越 Vegas 圈'],
    run  : ['听信号变向追捕','20 m 往返接力'],
    throw: ['双手抛球击标志物','坐传球积分赛']
  };
  rows.push({
    seg:'综合游戏\n(约 '+Math.round(min*0.15)+' min)',
    content: picked.map(p=>`<b>${p.short}</b>：${GAME[p.id][0]}`).join('<br>'),
    equip:'按所做练习',
    dose:`${2+lv.set} 组，每组 2-3 轮`,
    note:'以比赛形式进行，保持心率与趣味性'
  });

  rows.push({
    seg:'整理部分\n(约 5 min)',
    content:'静态牵拉：股四头肌、腘绳肌、小腿、胸肩；<br>呼吸放松 + 本课小结（表扬 2 个进步点）',
    equip:'瑜伽垫',
    dose:'每个动作 20-30 秒',
    note:'心率回落到 110 次/分以下再下课'
  });

  let table = `<table class="pt">
    <thead><tr>
      <th style="width:88px">环节</th><th>练习内容</th>
      <th style="width:96px">器材</th><th style="width:150px">组数 / 负荷</th><th style="width:150px">教师提示</th>
    </tr></thead><tbody>`;
  rows.forEach(r=>{
    table += `<tr>
      <td class="num"><b>${(r.seg||'').replace(/\n/g,'<br>')}</b></td>
      <td>${r.content}</td>
      <td class="num">${r.equip}</td>
      <td>${r.dose}</td>
      <td>${r.note}</td>
    </tr>`;
  });
  table += `</tbody></table>`;

  const totalMin = min;
  const stageNote = stage.indexOf('1-2')>-1
    ? '低年级以"玩中练"为主，动作简化、组数减少 1/3，单次技术练习不超过 30 秒。'
    : stage.indexOf('3-4')>-1
    ? '中年级重视动作规范建立，每节课固定一个技术要点打卡（如"绷脚""前摆到胸"）。'
    : stage.indexOf('5-6')>-1
    ? '高年级可加入计时计量的成绩记录，每 2 周重测一次，形成进步曲线。'
    : '初中生负荷可进一步提升，注意实心球与跳跃类的腰腹保护，课前必做专项热身。';

  document.getElementById('planOut').innerHTML = `
    <div class="plan-title">
      <h3>${stage} · ${picked.map(p=>p.short).join(' + ')} 提升课</h3>
      <p>单次 ${totalMin} 分钟 · ${level}阶段 · 建议周期 ${weeks} 周（每周 2-3 次）
        <button class="btn sm" style="margin-left:10px" onclick="window.print()">🖨 打印本课方案</button>
      </p>
    </div>
    ${table}
    <div class="plan-tips">
      <b>📌 周期安排建议（${weeks} 周）</b><br>
      · 第 1-${Math.max(1,Math.round(weeks/4))} 周：动作建立期，负荷 70%，每节课只抓 1 个技术要点。<br>
      · 第 ${Math.max(1,Math.round(weeks/4))+1}-${Math.round(weeks/2)} 周：负荷提升期，组数 +1，加入计时挑战。<br>
      · 第 ${Math.round(weeks/2)+1}-${weeks} 周：成绩突破期，按 85% 强度冲刺，每 2 周测验一次并记录。<br>
      <b>⚠️ 安全提示</b>：${stageNote}
      每次训练前必须检查器材摆放与地面防滑；跳跃类连续练习组间休息不少于 60 秒；实心球投掷必须统一口令、统一捡球。<br>
      <b>🏠 家庭作业</b>：每天 10 分钟——提踵 30 次 × 2 组 + ${picked[0].short}专项徒手模仿练习 3 分钟。
    </div>`;
}

function packBlock(w){ return {content:w[0], equip:w[2], dose:w[1], note:''}; }
function stripTags(s){ return s.replace(/<[^>]+>/g,''); }

/* ---------- 启动 ---------- */
renderHeroArt();
renderTabs();
renderPanel();
renderPlannerProjects();
