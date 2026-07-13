(function(){
  "use strict";

  document.documentElement.classList.add('js');

  /* ── Activate the deferred Google Fonts stylesheet ──
     Loaded with media="print" in <head> so it never blocks first paint;
     swapping it to "all" here applies the webfont once ready.
     display=swap on the font URL already prevents invisible text. */
  document.querySelectorAll('link[data-font-swap]').forEach(function(l){
    l.media = 'all';
  });

  /* ── Light / dark theme toggle (present on every page) ──
     The initial theme is applied instantly by theme-init.js in <head>
     (an external, CSP-safe script — avoids a flash of the wrong theme);
     this just wires up the toggle button(s) and keeps the preference in sync. */
  var root = document.documentElement;
  function applyTheme(t){
    root.setAttribute('data-theme', t);
    try{ localStorage.setItem('scs-theme', t); }catch(e){}
    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
    });
  }
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  document.querySelectorAll('.theme-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  });

  /* ── Nav scroll state (present on every page) ── */
  var nav = document.getElementById('nav');
  if(nav){
    window.addEventListener('scroll', function(){
      nav.classList.toggle('sc', window.scrollY > 30);
    }, {passive:true});
  }

  /* ── Mobile menu (present on every page) ── */
  var hbg = document.getElementById('hbg');
  var mob = document.getElementById('mob');
  var mobx = document.getElementById('mobx');
  function closeMob(){
    if(!mob || !hbg) return;
    mob.classList.remove('on');
    hbg.setAttribute('aria-expanded','false');
    hbg.style.visibility = 'visible';
  }
  if(hbg && mob){
    hbg.addEventListener('click', function(){
      mob.classList.add('on');
      hbg.setAttribute('aria-expanded','true');
      hbg.style.visibility = 'hidden';
    });
  }
  if(mobx){ mobx.addEventListener('click', closeMob); }
  document.querySelectorAll('.ml').forEach(function(a){ a.addEventListener('click', closeMob); });
  /* Tapping the dimmed backdrop (outside the one-third sidebar panel) closes the menu */
  if(mob){
    mob.addEventListener('click', function(e){
      if(e.target === mob) closeMob();
    });
  }
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && mob && mob.classList.contains('on')) closeMob();
  });

  /* ── Hero rotating phrase (home page only) ── */
  var phrases = [
    "plug in, tune out, create.",
    "turn up the volume on your potential.",
    "elevate your audio.",
    "you're buying confidence before release."
  ];
  var rword = document.getElementById('rword');
  var ri = 0;
  if(rword){
    rword.style.transition = 'opacity .3s ease, transform .3s ease';
    setInterval(function(){
      rword.style.opacity = '0'; rword.style.transform = 'translateY(6px)';
      setTimeout(function(){
        ri = (ri + 1) % phrases.length;
        rword.textContent = phrases[ri];
        rword.style.opacity = '1'; rword.style.transform = 'translateY(0)';
      }, 280);
    }, 3800);
  }

  /* ── Scroll reveal (present wherever .reveal elements exist) ── */
  var revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length && 'IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          setTimeout(function(){ entry.target.classList.add('vis'); }, i * 45);
          obs.unobserve(entry.target);
        }
      });
    }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
    revealEls.forEach(function(el){ obs.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('vis'); });
  }

  /* ── Rate tabs (rates page only) ── */
  var rates = document.getElementById('rates');
  var rateTabs = document.querySelectorAll('.rate-tab');
  var ratePanels = document.querySelectorAll('.rate-panel');
  var bgMap = { rust:'var(--rust)', pine:'var(--pine)', gold:'var(--gold)', navy:'var(--navy)', blood:'var(--blood)' };
  if(rates && rateTabs.length){
    rateTabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var key = tab.dataset.bg;
        rateTabs.forEach(function(t){ t.classList.remove('on'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('on'); tab.setAttribute('aria-selected','true');
        ratePanels.forEach(function(p){ p.classList.toggle('on', p.dataset.panel === key); });
        rates.style.background = bgMap[key] || bgMap.rust;
        rates.classList.toggle('light-bg', key === 'gold');
      });
    });
  }

  /* ── Work filters (work page only) ── */
  document.querySelectorAll('.wf-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      document.querySelectorAll('.wf-btn').forEach(function(b){ b.classList.remove('on'); });
      btn.classList.add('on');
      var f = btn.dataset.f;
      document.querySelectorAll('.vid-card').forEach(function(card){
        var cats = (card.dataset.c || '').split(' ');
        card.style.display = (f === 'all' || cats.indexOf(f) !== -1) ? '' : 'none';
      });
    });
  });

  /* ── YouTube video frames (work page only) ── */
  document.querySelectorAll('.vid-frame').forEach(function(frame){
    var btn = frame.querySelector('.vid-play');
    if(!btn) return;
    var id = (btn.dataset.yt || '').trim();
    var validId = /^[A-Za-z0-9_-]{11}$/.test(id);

    if(!validId){
      frame.innerHTML =
        '<div class="vid-placeholder">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="6" width="13" height="11" rx="1.5"/><path d="M15.5 10.2 21 7.5v8.8l-5.5-2.7z"/></svg>' +
          '<span>Video coming soon...</span>' +
        '</div>';
      return;
    }

    var thumb = document.createElement('img');
    thumb.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg';
    thumb.alt = '';
    thumb.loading = 'lazy';
    frame.insertBefore(thumb, btn);

    btn.addEventListener('click', function(){
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = 'Soundcore Studio video';
      iframe.loading = 'lazy';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      iframe.frameBorder = '0';
      frame.innerHTML = '';
      frame.appendChild(iframe);
    });
  });

  /* ── Testimonials carousel (reviews page only) ── */
  var tTrack = document.getElementById('testiTrack');
  if(tTrack){
    var tCards = tTrack.querySelectorAll('.testi-card');
    var tDotsWrap = document.getElementById('tDots');
    var tPrevBtn = document.getElementById('tPrev');
    var tNextBtn = document.getElementById('tNext');
    var tSlide = 0;
    function visibleCount(){ return window.innerWidth <= 640 ? 1 : (window.innerWidth <= 960 ? 2 : 3); }
    function totalSlides(){ return Math.max(1, tCards.length - visibleCount() + 1); }
    function buildDots(){
      if(!tDotsWrap) return;
      tDotsWrap.innerHTML = '';
      for(var i=0;i<totalSlides();i++){
        var d = document.createElement('button');
        d.className = 'tc-dot' + (i===tSlide ? ' on' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i+1));
        d.addEventListener('click', function(idx){ return function(){ goTo(idx); }; }(i));
        tDotsWrap.appendChild(d);
      }
    }
    function goTo(n){
      if(!tCards.length) return;
      tSlide = Math.max(0, Math.min(n, totalSlides()-1));
      var cardW = tCards[0].getBoundingClientRect().width + 22.4;
      tTrack.style.transform = 'translateX(-' + (tSlide * cardW) + 'px)';
      if(tDotsWrap){
        tDotsWrap.querySelectorAll('.tc-dot').forEach(function(d,i){ d.classList.toggle('on', i===tSlide); });
      }
    }
    if(tPrevBtn){ tPrevBtn.addEventListener('click', function(){ goTo(tSlide-1); }); }
    if(tNextBtn){ tNextBtn.addEventListener('click', function(){ goTo(tSlide+1); }); }
    buildDots();
    window.addEventListener('resize', function(){ buildDots(); goTo(0); });
    var testiAuto = setInterval(function(){ goTo((tSlide+1) % totalSlides()); }, 5500);
    tTrack.addEventListener('mouseenter', function(){ clearInterval(testiAuto); });
  }

  /* ── FAQ accordion (faq page only) ── */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-q').forEach(function(b){
        b.setAttribute('aria-expanded','false');
        b.nextElementSibling.classList.remove('on');
      });
      if(!open){
        btn.setAttribute('aria-expanded','true');
        btn.nextElementSibling.classList.add('on');
      }
    });
  });

  /* ── Booking form (contact page only) ── */
  var form = document.getElementById('bookingForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();

      var hp = form.querySelector('#f-website');
      if(hp && hp.value.trim() !== ''){ return; }

      var valid = true;
      function markField(id, ok){
        var group = document.getElementById(id).closest('.f-group');
        group.classList.toggle('err', !ok);
        if(!ok) valid = false;
      }

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var msg = form.message.value.trim();
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      markField('f-name', name.length > 1);
      markField('f-email', emailOk);
      markField('f-msg', msg.length > 5);

      if(!valid) return;

      var submitBtn = form.querySelector('.form-submit');
      if(submitBtn){ submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
      .then(function(res){
        if(res.ok){
          form.style.display = 'none';
          var ok = document.getElementById('formOk');
          if(ok) ok.style.display = 'block';
        } else {
          alert('Something went wrong. Please email us directly at bookings@soundcorestudio.ng');
          if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Send My Project Brief'; }
        }
      })
      .catch(function(){
        alert('Connection error. Please email us directly at bookings@soundcorestudio.ng');
        if(submitBtn){ submitBtn.disabled = false; submitBtn.textContent = 'Send My Project Brief'; }
      });

    });
  }

  /* ── Footer year (present on every page) ── */
  var yr = document.getElementById('yr');
  if(yr){ yr.textContent = new Date().getFullYear(); }

})();
