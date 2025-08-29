const els = {
// top
cartCount: gi('cartCount'), cartTotal: gi('cartTotal'), btnSetup: gi('btnSetup'), btnMax: gi('btnMax'), btnFill: gi('btnFill'), btnDiag: gi('btnDiag'),
btnChallenge: gi('btnChallenge'), btnLearn: gi('btnLearn'), btnMap: gi('btnMap'), btnReset: gi('btnReset'), points: gi('points'), level: gi('level'), streak: gi('streak'), timer: gi('timer'),
// catalog
grid: gi('grid'), search: gi('search'),
// cart
cart: gi('cart'), clearCart: gi('clearCart'), subtotal: gi('subtotal'), tax: gi('tax'), total: gi('total'),
// policy
privacy: gi('privacy'), maxSlip: gi('maxSlip'), avoidChains: gi('avoidChains'), assetIO: gi('assetIO'),
// pay
payAnoma: gi('payAnoma'), payCard: gi('payCard'),
// settings
setupOv: gi('setupOv'), saveSetup: gi('saveSetup'), closeSetup: gi('closeSetup'), theme: gi('theme'), currency: gi('currency'), merchant: gi('merchant'),
// stepper
st1: gi('st1'), st2: gi('st2'), st3: gi('st3'),
// log
logList: gi('logList'), clearLog: gi('clearLog'), copyLog: gi('copyLog'), autoScroll: gi('autoScroll'),
// modal pay
payOv: gi('payOv'), qr: gi('qr'), qrStr: gi('qrStr'), iAmount: gi('iAmount'), iAssets: gi('iAssets'), iPrivacy: gi('iPrivacy'), iPolicy: gi('iPolicy'), iRoute: gi('iRoute'), iHops: gi('iHops'), powerNote: gi('powerNote'), routeViz: gi('routeViz'), compare: gi('compare'), btnClosePay: gi('btnClosePay'), btnApprove: gi('btnApprove'), btnSimScan: gi('btnSimScan'),
// receipt
rcpOv: gi('rcpOv'), receiptBox: gi('receiptBox'), btnDone: gi('btnDone'),
// diagnostics
diagOv: gi('diagOv'), diagBody: gi('diagBody'), closeDiag: gi('closeDiag'), runDiag: gi('runDiag'),
// gamification overlay
gameOv: gi('gameOv'), closeGame: gi('closeGame'), chText: gi('chText'), achList: gi('achList'),
// learn
learnOv: gi('learnOv'), closeLearn: gi('closeLearn'),
// quiz
quizOv: gi('quizOv'), quizQ: gi('quizQ'), quizOpts: gi('quizOpts'), quizSubmit: gi('quizSubmit'), quizSkip: gi('quizSkip'),
// map
mapOv: gi('mapOv'), mapSvg: gi('mapSvg'), closeMap: gi('closeMap')
};
function gi(id){ return document.getElementById(id) }
function step(k){ els.st1.classList.toggle('step--active', k===1); els.st2.classList.toggle('step--active', k===2); els.st3.classList.toggle('step--active', k===3); }
function log(type,msg){ const e={ts:Date.now(),type,msg}; const row=document.createElement('div'); row.className='log-entry'; row.innerHTML=`<div class="log-time">${new Date(e.ts).toLocaleTimeString([], {hour12:false})}</div><div class="log-type">${type}</div><div class="log-msg">${msg.replace(/[&<>]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))}</div>`; els.logList.appendChild(row); if(els.autoScroll.checked){ els.logList.scrollTop=els.logList.scrollHeight; } }


const CFG = { theme:'anoma-pro', currency:'USD', taxRate:0.075 };
const STORE = [
{id:'p1', name:'Espresso', price:3.50, desc:'Double shot, rich & bold'},
{id:'p2', name:'Latte', price:4.75, desc:'Milk smoothness, classic'},
{id:'p3', name:'Cappuccino', price:4.50, desc:'Foamy delight'},
{id:'p4', name:'Cold Brew', price:5.00, desc:'Slow‑steeped, refreshing'},
{id:'p5', name:'Croissant', price:3.25, desc:'Buttery, flaky'},
{id:'p6', name:'Blueberry Muffin', price:3.00, desc:'Sweet & soft'},
{id:'p7', name:'Turkey Sandwich', price:6.90, desc:'Hearty lunch'},
{id:'p8', name:'Beans (250g)', price:12.00, desc:'House roast'}
];
const CART = new Map();


// ===== Gamification State =====
const GAME = {
points: +(localStorage.getItem('ap_points')||0)
};