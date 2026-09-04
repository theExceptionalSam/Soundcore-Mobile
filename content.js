/* ════════════════════════════════════════════════════════════
   content.js — dynamic content renderer for Soundcore Studio
   ─────────────────────────────────────────────────────────────
   Fetches /data/*.json and renders into placeholder containers
   on each page. If the fetch fails (e.g. admin broke something),
   the page silently keeps the static fallback already in HTML.

   Each page calls SCSCMS.render('<pageKey>') at the bottom.
   ════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  window.SCS = window.SCS || {};

  function $(id){ return document.getElementById(id); }
  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html != null) e.innerHTML = html;
    return e;
  }
  function esc(s){
    if(s == null) return '';
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function fetchJSON(path){
    return fetch(path).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* ── RATES ── */
  function renderRates(data){
    var tabs = $('rateTabs');
    var panelsHost = $('ratePanels');
    if(!tabs || !panelsHost) return;

    var bgMap = { rust:'var(--rust)', pine:'var(--pine)', gold:'var(--gold)', navy:'var(--navy)', blood:'var(--blood)' };
    var ratesSection = $('rates');
    tabs.innerHTML = '';
    panelsHost.innerHTML = '';

    data.forEach(function(cat, i){
      // tab
      var tab = el('button', 'rate-tab' + (i === 0 ? ' on' : ''));
      tab.setAttribute('data-bg', cat.bg_color);
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.textContent = cat.name;
      tabs.appendChild(tab);

      // panel
      var tiersHTML = (cat.tiers || []).map(function(t){
        var feats = (t.features || []).map(function(f){
          return '<li>' + esc(f) + '</li>';
        }).join('');
        return '<div class="tier-card' + (t.is_featured ? ' mid' : '') + '">' +
                 '<div class="tier-name">' + esc(t.name) + '</div>' +
                 '<div class="tier-price">' + esc(t.price) + (t.unit ? '<small>' + esc(t.unit) + '</small>' : '') + '</div>' +
                 '<ul>' + feats + '</ul>' +
               '</div>';
      }).join('');

      var panel = el('div', 'rate-panel' + (i === 0 ? ' on' : ''));
      panel.setAttribute('data-panel', cat.bg_color);
      panel.innerHTML =
        '<div class="rate-panel-hd"><h3>' + esc(cat.heading) + '</h3><span>' + esc(cat.subtitle || '') + '</span></div>' +
        '<div class="tier-grid">' + tiersHTML + '</div>' +
        (cat.notes ? '<div class="rate-notes"><b>Notes</b>' + esc(cat.notes) + '</div>' : '');
      panelsHost.appendChild(panel);
    });

    // Re-bind tab clicks (mirrors logic in script.js — keep both in sync)
    var rateTabs = tabs.querySelectorAll('.rate-tab');
    var ratePanels = panelsHost.querySelectorAll('.rate-panel');
    rateTabs.forEach(function(tab){
      tab.addEventListener('click', function(){
        var key = tab.dataset.bg;
        rateTabs.forEach(function(t){ t.classList.remove('on'); t.setAttribute('aria-selected','false'); });
        tab.classList.add('on'); tab.setAttribute('aria-selected','true');
        ratePanels.forEach(function(p){ p.classList.toggle('on', p.dataset.panel === key); });
        if(ratesSection){
          ratesSection.style.background = bgMap[key] || bgMap.rust;
          ratesSection.classList.toggle('light-bg', key === 'gold');
        }
      });
    });
  }

  /* ── SERVICES ── */
  function renderServices(data){
    var host = $('servicesGrid');
    if(!host) return;
    host.innerHTML = '';
    var icons = [
      '<rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/><path d="M9 21h6"/>',
      '<path d="M3 12h3l2-6 4 12 3-9 2 3h4"/>',
      '<circle cx="12" cy="12" r="3.2"/><path d="M3 12a9 9 0 0 1 18 0M6 12a6 6 0 0 1 12 0"/>',
      '<rect x="2.5" y="6" width="13" height="11" rx="1.5"/><path d="M15.5 10.2 21 7.5v8.8l-5.5-2.7z"/>',
      '<path d="M4 7h5M4 12h9M4 17h6"/><circle cx="13" cy="7" r="1.6"/><circle cx="17" cy="12" r="1.6"/><circle cx="14" cy="17" r="1.6"/>',
      '<path d="M6 5c3 0 4 1.5 6 1.5S15 5 18 5"/><path d="M6 5v9a3 3 0 1 0 3 0V9"/><path d="M18 5v6a3 3 0 1 1-3 0V9"/>'
    ];
    data.forEach(function(s, i){
      var card = el('div', 'svc-card reveal cut-tr');
      var svgPath = icons[i % icons.length] || icons[0];
      card.innerHTML =
        '<div class="svc-num">' + esc(s.num || ('0' + (i+1)).slice(-2)) + '</div>' +
        '<div class="svc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' + svgPath + '</svg></div>' +
        '<div class="svc-name">' + esc(s.name) + '</div>' +
        '<p class="svc-desc">' + esc(s.description) + '</p>';
      host.appendChild(card);
    });
    // Re-trigger reveal animation
    if('IntersectionObserver' in window){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('vis'); obs.unobserve(e.target); }
        });
      }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
      host.querySelectorAll('.reveal').forEach(function(e){ obs.observe(e); });
    } else {
      host.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('vis'); });
    }
  }

  /* ── WORK ── */
  function renderWork(data){
    var host = $('workGrid');
    if(!host) return;
    host.innerHTML = '';
    data.forEach(function(item){
      var cats = (item.categories || []).join(' ');
      var card = el('article', 'vid-card reveal');
      card.setAttribute('data-c', cats);
      var ytId = (item.youtube_id || '').trim();
      card.innerHTML =
        '<div class="vid-frame">' +
          '<button class="vid-play" data-yt="' + esc(ytId) + '" aria-label="Play video: ' + esc(item.title) + '">' +
            '<span class="vid-play-ic"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' +
          '</button>' +
        '</div>' +
        '<div class="vid-body">' +
          '<div class="vid-cat">' + esc(item.category || '') + '</div>' +
          '<div class="vid-title">' + esc(item.title || '') + '</div>' +
          '<p class="vid-desc">' + esc(item.description || '') + '</p>' +
        '</div>';
      host.appendChild(card);
    });
    // Re-trigger the YouTube embed setup that script.js does on init.
    // We mirror that logic here so newly rendered cards work too.
    host.querySelectorAll('.vid-frame').forEach(function(frame){
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
  }

  /* ── TESTIMONIALS ── */
  function renderTestimonials(data){
    var track = $('testiTrack');
    if(!track) return;
    track.innerHTML = '';
    data.forEach(function(t){
      var card = el('div', 'testi-card');
      card.innerHTML =
        '<div class="testi-stars">' + esc(t.stars || '★★★★★') + '</div>' +
        '<p class="testi-quote">' + esc(t.quote) + '</p>' +
        '<div class="testi-auth">' +
          '<div class="testi-av">' + esc(t.initial || (t.name || '?').charAt(0)) + '</div>' +
          '<div><div class="testi-name">' + esc(t.name) + '</div><div class="testi-role">' + esc(t.role) + '</div></div>' +
        '</div>';
      track.appendChild(card);
    });
    // Re-init carousel dots (script.js runs on DOMContentLoaded before this fetch
    // resolves — so we manually rebuild dots + goTo 0 here).
    if(window.SCS && window.SCS.rebuildTestiCarousel){
      window.SCS.rebuildTestiCarousel();
    }
  }

  /* ── FAQs ── */
  function renderFaqs(data){
    var host = $('faqList');
    if(!host) return;
    host.innerHTML = '';
    data.forEach(function(f, i){
      var item = el('div', 'faq-item');
      item.innerHTML =
        '<button class="faq-q" aria-expanded="' + (i === 0 ? 'true' : 'false') + '">' + esc(f.question) + '<span class="faq-tog">+</span></button>' +
        '<div class="faq-a' + (i === 0 ? ' on' : '') + '"><p>' + esc(f.answer) + '</p></div>';
      host.appendChild(item);
    });
    // Re-bind accordion
    host.querySelectorAll('.faq-q').forEach(function(btn){
      btn.addEventListener('click', function(){
        var open = btn.getAttribute('aria-expanded') === 'true';
        host.querySelectorAll('.faq-q').forEach(function(b){
          b.setAttribute('aria-expanded','false');
          b.nextElementSibling.classList.remove('on');
        });
        if(!open){
          btn.setAttribute('aria-expanded','true');
          btn.nextElementSibling.classList.add('on');
        }
      });
    });
  }

  /* ── ABOUT ── */
  function renderAbout(data){
    var paras = $('aboutParas');
    if(paras && data.description_paragraphs){
      paras.innerHTML = data.description_paragraphs.map(function(p){
        return '<p class="reveal">' + esc(p) + '</p>';
      }).join('');
    }
    var tags = $('aboutTags');
    if(tags && data.brand_tags){
      tags.innerHTML = data.brand_tags.map(function(t){
        return '<span class="tag">' + esc(t) + '</span>';
      }).join('');
    }
    var mission = $('aboutMission');
    if(mission && data.mission){
      mission.querySelector('.mv-t').textContent = data.mission.title;
      mission.querySelector('p').textContent = data.mission.body;
    }
    var vision = $('aboutVision');
    if(vision && data.vision){
      vision.querySelector('.mv-t').textContent = data.vision.title;
      vision.querySelector('p').textContent = data.vision.body;
    }
  }

  /* ── SITE-WIDE (footer, nav) — best-effort ── */
  function renderSite(data){
    // Footer brand desc
    document.querySelectorAll('.foot-desc').forEach(function(e){
      e.textContent = data.description;
    });
    // Footer tag
    document.querySelectorAll('.foot-tag').forEach(function(e){
      e.textContent = data.tagline;
    });
    // Footer legal (RC number etc.)
    document.querySelectorAll('.foot-legal').forEach(function(e){
      var yrEl = e.querySelector('#yr');
      var yr = yrEl ? yrEl.textContent : new Date().getFullYear();
      e.innerHTML = '© <span id="yr">' + yr + '</span> ' + esc(data.brand) + '. All rights reserved.<span>' + esc(data.rc_number) + ' · ' + esc(data.incorporation_note) + '</span>';
    });
    // Phone + email links (anywhere they appear as wa.me or mailto)
    if(data.contact && data.contact.whatsapp){
      document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function(a){
        a.setAttribute('href', 'https://wa.me/' + data.contact.whatsapp);
      });
    }
    if(data.contact && data.contact.email){
      document.querySelectorAll('a[href^="mailto:"]').forEach(function(a){
        a.setAttribute('href', 'mailto:' + data.contact.email);
        if(!a.textContent.trim() || a.textContent.trim() === 'bookings@soundcorestudio.ng'){
          a.textContent = data.contact.email;
        }
      });
    }
  }

  /* ── Public API ── */
  window.SCS.render = function(pageKey){
    var map = {
      'rates':       ['data/rates.json', renderRates],
      'services':   ['data/services.json', renderServices],
      'work':       ['data/work.json', renderWork],
      'testimonials':['data/testimonials.json', renderTestimonials],
      'faqs':       ['data/faqs.json', renderFaqs],
      'about':      ['data/about.json', renderAbout],
      'site':       ['data/site.json', renderSite]
    };
    // 'site' is loaded on every page
    fetchJSON('data/site.json').then(renderSite).catch(function(){ /* keep static */ });
    if(pageKey && map[pageKey]){
      fetchJSON(map[pageKey][0]).then(map[pageKey][1]).catch(function(){ /* keep static */ });
    }
  };
})();
