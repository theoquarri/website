/* Quarri drafting language - runtime.

   Two devices need script: the wood grain on the homepage, and the gutter
   rules on the vertical, listing and article pages. Everything else in the
   language is pure CSS and needs nothing here.

   Which one runs is decided by data-bp-page on <html>, stamped by
   _sync_blueprint.py. A page with no attribute runs neither, which is the
   safe default.

   The grain is desktop-only by design (Theo, 4 Sep 2026: drop it on mobile).
   It also lives in the free gutter beside the 1240px column, which does not
   exist on a narrow screen, so the CSS hides it below 1420px and the runtime
   never fetches the drawing there - the 122KB SVG is not downloaded on a
   phone at all. */
(function(){
  var page = document.documentElement.getAttribute('data-bp-page');
  if (!page) return;

  var GRAIN_URL = document.documentElement.getAttribute('data-bp-grain') || 'assets/grain.svg';

  function grain(){

function boot(tpl){
var VB=6000, FADE=400, NS='http://www.w3.org/2000/svg', io=null;
/* parse the template once, then detach it: the clones below are all the DOM
   the page needs, so the template should not double the node count */
var bands=[].map.call(tpl.querySelectorAll('g.bp-b'),function(g){
  var y=g.getAttribute('data-y').split(',').map(Number);
  return {y0:y[0], y1:y[1], g:g};
});
var knots=[].map.call(tpl.querySelectorAll('g.bp-k'),function(g){
  var b=g.getAttribute('data-box').split(',').map(Number);
  return {x0:b[0], y0:b[1], x1:b[2], y1:b[3], g:g};
});
tpl.parentNode.removeChild(tpl);

function svgFor(g,x,y,w,h,stripW){
  var s=document.createElementNS(NS,'svg');
  s.setAttribute('viewBox',x+' '+y+' '+w+' '+h);
  s.setAttribute('preserveAspectRatio','none');
  /* only the horizontal squash matters: the vertical scale is identical in
     every box by construction, so one figure keeps every line at 0.8 CSS px */
  s.style.strokeWidth=(160/stripW).toFixed(3)+'px';
  s.appendChild(g.cloneNode(true));
  return s;
}

function fit(){
  if(io){ io.disconnect(); io=null; }
  var parts=[];
  document.querySelectorAll('.bp-sect').forEach(function(n){n.remove();});
  var a=document.getElementById('serve');
  var top=a?(a.getBoundingClientRect().top+scrollY):0;
  var docH=document.documentElement.scrollHeight, vh=innerHeight, slabH=docH-top;
  var FRONT=0.42*vh;          /* the reveal edge, measured down the viewport.
                                 0.60 then 0.52 both read as too low (Theo, 4 Sep):
                                 the drawn foot of the grain sat below the
                                 midline, so it unfolded out of the bottom
                                 of the frame rather than in view. The start
                                 anchor (#serve) is unchanged. */
  var u2p=slabH/VB;           /* drawing units to document pixels */
  /* The front must reach the foot of the document exactly as the scrollbar
     does. A front sitting FRONT down the viewport is still that far short of
     the bottom at maximum scroll, which left the last screenful permanently
     half drawn. Mapping scroll position onto front position takes up the
     slack across the whole page instead of lurching at the end. */
  var maxS=Math.max(1, docH-vh), kS=maxS/Math.max(1, docH-FRONT);
  function sFor(y){ return Math.max(0, Math.min(maxS, (y-FRONT)*kS)); }

  document.querySelectorAll('section, footer').forEach(function(sec){
    var r=sec.getBoundingClientRect(), st=r.top+scrollY, hgt=r.height;
    var visTop=Math.max(st,top), visH=st+hgt-visTop;
    if(visH<1) return;
    var cs=getComputedStyle(sec);
    if(cs.position==='static') sec.style.position='relative';
    if(cs.zIndex==='auto') sec.style.zIndex='0';
    /* the strip is a negative-z child of the section, so it paints above that
       section background (photo backgrounds included) and below all content.
       clientTop keeps a bordered section from shifting the drawing down by
       its border width and cutting a hairline gap at the boundary. */
    var strip=document.createElement('div');
    var dark=sec.classList.contains('on-dark')||sec.tagName==='FOOTER';
    var photo=dark && getComputedStyle(sec).backgroundImage!=='none';
    strip.className='bp-sect'+(dark?(photo?' bp-lite bp-photo':' bp-lite'):'');
    strip.style.top=(visTop-st-sec.clientTop)+'px';
    strip.style.height=visH+'px';
    sec.appendChild(strip);
    var w=strip.getBoundingClientRect().width;
    if(!w){ strip.remove(); return; }

    function place(el,dTop,dH,left,width){
      el.className='bp-part';
      el.style.top=(dTop-visTop)+'px'; el.style.height=dH+'px';
      el.style.left=(left*100)+'%';    el.style.width=(width*100)+'%';
      /* hidden until the edge arrives, fully drawn once it has passed */
      el.style.setProperty('--m0', -(dH+FADE)+'px');
      var s=sFor(dTop-FADE), e=sFor(dTop+dH);
      el.style.animationRange=s+'px '+(e>s?e:s+1)+'px';
      strip.appendChild(el); parts.push(el);
    }
    bands.forEach(function(b){
      var dT=top+b.y0*u2p, dB=top+b.y1*u2p;
      if(dB<visTop-20 || dT>visTop+visH+20) return;
      var d=document.createElement('div');
      d.appendChild(svgFor(b.g,0,b.y0,200,b.y1-b.y0,w));
      place(d,dT,dB-dT,0,1);
    });
    knots.forEach(function(k){
      var dT=top+k.y0*u2p, dB=top+k.y1*u2p;
      if(dB<visTop-20 || dT>visTop+visH+20) return;
      var d=document.createElement('div');
      d.appendChild(svgFor(k.g,k.x0,k.y0,k.x1-k.x0,k.y1-k.y0,w));
      place(d,dT,dB-dT,k.x0/200,(k.x1-k.x0)/200);
    });
  });
  io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var el=e.target;
      if(e.isIntersecting){ el.classList.remove('bp-done'); el.classList.add('bp-live'); }
      else{
        el.classList.remove('bp-live');
        /* past it: drop the mask for good. Not yet reached: stay hidden. */
        if(e.boundingClientRect.bottom<=0) el.classList.add('bp-done');
      }
    });
  },{rootMargin:'0px 0px 25% 0px'});
  parts.forEach(function(el){ io.observe(el); });
}
addEventListener('resize',fit);addEventListener('load',fit);fit();}
var inl=document.querySelector('.bp-tpl');
if(inl){ boot(inl); return; }
fetch(GRAIN_URL).then(function(r){ return r.ok?r.text():''; }).then(function(t){
  if(!t) return;
  var doc=new DOMParser().parseFromString(t,'image/svg+xml');
  var w=document.createElement('div'); w.className='bp-tpl'; w.setAttribute('aria-hidden','true');
  w.appendChild(document.importNode(doc.documentElement,true));
  document.body.appendChild(w); boot(w);
}).catch(function(){});
  }

/* -- Gutter rules: verticals, listings and articles ----------------------
   One .bp-rule per section, a negative-z CHILD of that section so it paints
   above the section background (photo backgrounds included) and below all of
   its content. A body-level layer clips in and out as sections paint.
   clientTop is subtracted because inside a bordered section the strip would
   otherwise shift down by the border width and cut a hairline gap at the
   boundary. Dark/photo is read off the section, not assumed, so the ink
   follows the surface the way the grain does.
   No mask and no scroll-driven animation here: this is a static picture that
   repaints only on resize. */
function gutterRules(){
  var t = null;
  function fit(){
    document.querySelectorAll('.bp-rule').forEach(function(n){ n.remove(); });
    if (innerWidth <= 1420) return;
    document.querySelectorAll('section, footer').forEach(function(sec){
      var hgt = sec.getBoundingClientRect().height;
      if (hgt < 1) return;
      var cs = getComputedStyle(sec);
      if (cs.position === 'static') sec.style.position = 'relative';
      if (cs.zIndex === 'auto') sec.style.zIndex = '0';
      var d = document.createElement('div');
      var dark = sec.classList.contains('on-dark') || sec.tagName === 'FOOTER';
      var photo = dark && cs.backgroundImage !== 'none';
      d.className = 'bp-rule' + (dark ? (photo ? ' bp-lite bp-photo' : ' bp-lite') : '');
      d.style.top = (-sec.clientTop) + 'px';
      d.style.height = hgt + 'px';
      sec.appendChild(d);
    });
  }
  function later(){ clearTimeout(t); t = setTimeout(fit, 120); }
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', fit);
  else fit();
  addEventListener('load', fit);
  addEventListener('resize', later);
}

  if (page === 'home' && innerWidth > 1420) grain();
  if (page === 'vertical' || page === 'listing' || page === 'article') gutterRules();
})();
