(function(){
var d=document,root=d.documentElement,rm=root.classList.contains('rm');
window.MU_READY=true;
function clamp(v){return v<0?0:v>1?1:v}

/* loader */
var loader=d.getElementById('loader'),names=loader?loader.querySelectorAll('.ld-names span'):[],bar=d.getElementById('ldBar'),pct=d.getElementById('ldPct');
function finish(){if(loader)loader.classList.add('done');d.body.classList.add('ready');setTimeout(function(){if(loader)loader.style.display='none'},1000)}
if(rm||!loader){finish()}else{
  var t0=performance.now(),dur=1900,last=-1;
  (function tick(now){var k=clamp((now-t0)/dur),i=Math.min(names.length-1,Math.floor(k*names.length));
    if(i!==last){for(var j=0;j<names.length;j++)names[j].classList.toggle('on',j===i);last=i}
    bar.style.width=(k*100)+'%';pct.textContent=(k*100|0).toString().padStart(2,'0');
    if(k<1)requestAnimationFrame(tick);else setTimeout(finish,250)})(t0);
  loader.addEventListener('click',finish);
}

/* menu */
var burger=d.getElementById('burger'),menu=d.getElementById('mmenu'),closeB=d.getElementById('mmClose');
function openM(){menu.hidden=false;burger.setAttribute('aria-expanded','true');d.body.classList.add('menu-open');closeB.focus()}
function closeM(){menu.hidden=true;burger.setAttribute('aria-expanded','false');d.body.classList.remove('menu-open')}
burger.addEventListener('click',openM);closeB.addEventListener('click',function(){closeM();burger.focus()});
menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeM)});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){closeM();burger.focus()}});

/* scenes */
var scenes=[].slice.call(d.querySelectorAll('[data-scene]'));
var rail=d.querySelector('.rail'),railA=rail?[].slice.call(rail.querySelectorAll('a')):[],dnav=[].slice.call(d.querySelectorAll('.dnav a'));
var hudN=d.querySelector('.hud-n'),hudS=d.querySelector('.hud-s');
var thor=d.getElementById('thor'),canvas=thor&&thor.querySelector('.bolt'),flash=thor&&thor.querySelector('.flash'),ctx=canvas&&canvas.getContext('2d');
var hulk=d.getElementById('hulk'),smashed=false;
var thorOn=false,thorA=0;
if(rm){return}
var hs=d.querySelector('[data-h]'),track=hs&&hs.querySelector('.h-track');
var mf=d.querySelector('.mf'),wds=[];if(mf){var hl=['heroes','thank','hand','entrance'];mf.innerHTML=mf.textContent.split(' ').map(function(w){var k=w.replace(/[^a-z]/gi,'').toLowerCase();return '<span class="wd'+(hl.indexOf(k)>-1?' hl':'')+'">'+w+'</span>'}).join(' ');wds=[].slice.call(mf.querySelectorAll('.wd'))}
var vh=innerHeight,ticking=false;
function update(){
  ticking=false;vh=innerHeight;var active=-1;
  for(var i=0;i<scenes.length;i++){
    var s=scenes[i],r=s.getBoundingClientRect();
    if(r.bottom<-vh*0.2||r.top>vh*1.2){continue}
    var L=(r.height-vh)/vh,raw=-r.top/vh;
    var p=clamp((raw+1)/(L+1));
    var a=clamp((raw+0.65)/1.15);
    var rv=clamp((raw-0.75)/(L-1.45));
    var x=clamp((raw-(L-0.45))/0.45);
    s.style.setProperty('--p',p.toFixed(4));s.style.setProperty('--a',a.toFixed(4));s.style.setProperty('--r',rv.toFixed(4));s.style.setProperty('--x',x.toFixed(4));
    if(r.top<=vh*0.5&&r.bottom>vh*0.5)active=i;
    if(s.id==='iron'&&hudN){hudN.textContent=Math.round(clamp(a/0.95)*100).toString().padStart(2,'0');hudS.textContent=rv>0.05?'OPEN':(a>0.95?'LOCKED':'SYNCING')}
    if(s===thor){thorOn=r.top<vh&&r.bottom>0;thorA=a}
    if(s===hulk){if(a>=0.98&&!smashed){smashed=true;s.classList.remove('smash');void s.offsetWidth;s.classList.add('smash')}else if(a<0.9&&smashed){smashed=false;s.classList.remove('smash')}}
  }
  if(hs){var hr=hs.getBoundingClientRect(),hp=clamp(-hr.top/(hr.height-vh));hs.style.setProperty('--p',hp.toFixed(4));track.style.setProperty('--tx',(-hp*(track.scrollWidth-innerWidth))+'px')}
  if(mf){var mr=mf.getBoundingClientRect(),mp=clamp((vh*0.85-mr.top)/(mr.height+vh*0.25));var lit=Math.round(mp*wds.length);for(var q=0;q<wds.length;q++)wds[q].classList.toggle('on',q<lit)}
  rail&&rail.classList.toggle('show',active>-1);
  railA.forEach(function(a,j){a.classList.toggle('on',j===active)});
  dnav.forEach(function(a,j){a.classList.toggle('on',j===active)});
}
function req(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);update();

/* thor lightning */
function bolt(x1,y1,x2,y2,disp,out){if(disp<6){out.push([x2,y2]);return}var mx=(x1+x2)/2+(Math.random()-.5)*disp,my=(y1+y2)/2+(Math.random()-.5)*disp*.4;bolt(x1,y1,mx,my,disp/2,out);bolt(mx,my,x2,y2,disp/2,out)}
var nextStrike=0,strikes=[];
function sizeC(){if(!canvas)return;var dpr=Math.min(devicePixelRatio||1,2);canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
sizeC();addEventListener('resize',sizeC);
function loop(now){
  requestAnimationFrame(loop);
  if(!ctx||!thorOn)return;
  var w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);
  var mobile=w<760,tx=mobile?w*.5:w*.68,ty=mobile?h*.33-h*.08:h*.5-h*.14;
  if(thorA>0.6&&now>nextStrike){nextStrike=now+500+Math.random()*1100;
    var n=1+(Math.random()*2|0);for(var k=0;k<n;k++){var pts=[[tx+(Math.random()-.5)*w*.6,-10]];bolt(pts[0][0],pts[0][1],tx+(Math.random()-.5)*60,ty,w*.25,pts);strikes.push({pts:pts,t:now})}
    if(flash){flash.style.transition='none';flash.style.opacity=.35;requestAnimationFrame(function(){flash.style.transition='opacity .5s';flash.style.opacity=0})}}
  strikes=strikes.filter(function(s){return now-s.t<260});
  strikes.forEach(function(s){var al=1-(now-s.t)/260;ctx.strokeStyle='rgba(190,225,255,'+al+')';ctx.shadowColor='#7cc4ff';ctx.shadowBlur=18;ctx.lineWidth=2.4;ctx.beginPath();s.pts.forEach(function(p,i){i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='rgba(255,255,255,'+al+')';ctx.stroke()});
}
requestAnimationFrame(loop);

/* pointer effects (desktop) */
var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var cur=d.querySelector('.cursor');
var spot=d.querySelector('.reveal-spot'),rev=d.querySelector('[data-reveal]');
function spotAt(cx,cy,rad){if(!rev)return;var b=rev.getBoundingClientRect();spot.style.setProperty('--mx',((cx-b.left)/b.width*100)+'%');spot.style.setProperty('--my',((cy-b.top)/b.height*100)+'%');spot.style.setProperty('--rad',rad)}
if(rev){rev.addEventListener('pointermove',function(e){spotAt(e.clientX,e.clientY,'22%')});rev.addEventListener('pointerleave',function(){spot.style.setProperty('--rad','0px')});rev.addEventListener('pointerdown',function(e){spotAt(e.clientX,e.clientY,'22%')})}
window.MU_spot=spotAt;
var prev=d.querySelector('.ix-prev'),cards=[].slice.call(d.querySelectorAll('.grid .card-art'));
d.querySelectorAll('.ix').forEach(function(a){a.addEventListener('mouseenter',function(){var c=cards[+a.dataset.i];if(c&&prev){prev.innerHTML=c.innerHTML;prev.classList.add('on')}});a.addEventListener('mouseleave',function(){prev&&prev.classList.remove('on')})});
if(fine){
  addEventListener('pointermove',function(e){
    if(cur){cur.style.setProperty('--cx',e.clientX+'px');cur.style.setProperty('--cy',e.clientY+'px');cur.classList.toggle('big',!!e.target.closest('a,button,[data-reveal]'))}
    if(prev){prev.style.setProperty('--px',(e.clientX+30)+'px');prev.style.setProperty('--py',(e.clientY-130)+'px')}
    var nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;
    d.querySelectorAll('.art .art-svg,.art .reveal').forEach(function(el){el.style.transform='perspective(900px) rotateY('+(nx*16)+'deg) rotateX('+(-ny*12)+'deg)'});
  },{passive:true});
  d.querySelectorAll('.card').forEach(function(c){c.addEventListener('pointermove',function(e){var b=c.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;c.style.transform='perspective(800px) rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg) translateY(-6px)'});c.addEventListener('pointerleave',function(){c.style.transform=''})});
}
})();