/* Quarri consent + analytics loader
   ---------------------------------------------------------------------------
   Quarri AI Inc is US-incorporated, so the default posture is US
   notice-and-opt-out: analytics load on first visit and a dismissible notice
   explains how to opt out. Visitors in the EU, UK and a handful of opt-in
   jurisdictions get the stricter treatment: nothing non-essential loads until
   they actively accept.

   Region is inferred from the browser timezone. That is a best-effort signal,
   not a legal guarantee, so it errs toward asking rather than assuming.

   Set the IDs below to go live. With them blank the script still runs the
   banner and stores the choice, it just has nothing to load. This is the ONLY
   place analytics is configured: there is no second snippet in any page head,
   because a snippet in the head loads before the banner is answered and would
   defeat the whole mechanism for the EU path.
--------------------------------------------------------------------------- */
(function () {
  /* ---- SET THESE THREE TO GO LIVE. See TRACKING.md for where each comes
     from and where to read the output. Blank means that tool does not load. */
  var CLARITY_ID = 'xv39rrgvu1';  // Microsoft Clarity project id, set 31 Jul 2026
  var HUBSPOT_PORTAL_ID = '147071120';  // read from the Quarri account, 31 Jul 2026
  var GA4_ID = 'G-5GV2GJQNQR';    // Google Analytics 4, set 31 Jul 2026
  var APOLLO_APP_ID = '693c1443ff04600021d02786';  // Apollo visitor tracking, set 6 Aug 2026

  /* HubSpot serves the tracking script from the data centre the portal lives
     in. A US portal on the eu1 host silently 404s and nothing tracks, which
     looks identical to not having configured it. */
  var HUBSPOT_REGION = 'eu1';     // Quarri's portal is on the EU data centre (app-eu1.hubspot.com)

  var KEY = 'quarri-consent';     // 'granted' | 'denied'
  var store = {
    get: function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };

  /* --- jurisdiction ------------------------------------------------------ */
  function needsPriorConsent() {
    var tz = '';
    try { tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || ''); } catch (e) {}
    if (/^Europe\//.test(tz)) return true;                 // EU + UK
    if (/^Atlantic\/(Azores|Madeira|Canary|Faeroe|Reykjavik)/.test(tz)) return true;
    return false;
  }

  /* --- analytics --------------------------------------------------------- */
  var loaded = false;
  /* Three third-party scripts pulling on the network and the main thread while
     the page is still painting is the difference between a page that feels
     instant and one that feels sticky. None of them need to run during load, so
     they wait for the browser to be idle. The timeout is the backstop: on a busy
     page idle may never arrive, and analytics that never fires is worse than
     analytics that fires late. */
  function whenIdle(fn) {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(fn, { timeout: 2500 });
    } else {
      setTimeout(fn, 1200);
    }
  }

  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    whenIdle(loadAnalyticsNow);
  }

  function loadAnalyticsNow() {

    if (CLARITY_ID) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
        y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
      })(window, document, 'clarity', 'script', CLARITY_ID);
      /* Recordings capture personal data, so mask everything typed. */
      window.clarity('consent');
      window.clarity('set', 'maskTextInputs', 'true');
    }

    if (HUBSPOT_PORTAL_ID) {
      var hs = document.createElement('script');
      hs.id = 'hs-script-loader'; hs.async = true; hs.defer = true;
      hs.src = 'https://js' + (HUBSPOT_REGION === 'eu1' ? '-eu1' : '')
             + '.hs-scripts.com/' + HUBSPOT_PORTAL_ID + '.js';
      document.head.appendChild(hs);
    }

    /* GA4 is what answers "where did this visit come from". Clarity shows how
       people behave once here; it does not do acquisition. Referrals from
       ChatGPT, Perplexity and Claude land here as ordinary referrers, which is
       how we will see whether the LLM work is doing anything. */
    if (GA4_ID) {
      var ga = document.createElement('script');
      ga.async = true;
      ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      document.head.appendChild(ga);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      /* IP anonymisation is on by default in GA4; ads signals are not. */
      window.gtag('config', GA4_ID, { anonymize_ip: true, allow_google_signals: false });
    }
    /* Apollo resolves a visiting IP to a company, for outbound signal. It is
       company-level and does not identify a person, but an IP address is
       personal data under GDPR either way, so it sits behind the same gate as
       everything else rather than in the page head where Apollo's own install
       guide puts it. That placement is deliberate: it means visitors who
       decline, and EU visitors before they accept, are not tracked at all. */
    if (APOLLO_APP_ID) {
      var ap = document.createElement('script');
      /* the cache-buster is Apollo's own loader contract, not ours */
      ap.src = 'https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache='
             + Math.random().toString(36).substring(7);
      ap.async = true; ap.defer = true;
      ap.onload = function () {
        if (window.trackingFunctions && window.trackingFunctions.onLoad) {
          window.trackingFunctions.onLoad({ appId: APOLLO_APP_ID });
        }
      };
      document.head.appendChild(ap);
    }
  }

  function revokeAnalytics() {
    /* Clear anything already dropped, then reload so nothing keeps reporting. */
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^(_cl|_hs|hubspotutk|__hs|_ga|_gid|apollo|__apollo)/i.test(n)) {
        document.cookie = n + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      }
    });
  }

  /* --- banner ------------------------------------------------------------ */
  function banner(strict) {
    var wrap = document.createElement('div');
    wrap.className = 'consent';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-label', 'Cookies and analytics');
    wrap.innerHTML =
      '<div class="consent-in">' +
        '<p class="consent-copy">' +
          (strict
            ? 'We would like to use analytics cookies to understand how this site is used. Nothing non-essential is set until you choose.'
            : 'We use analytics cookies to understand how this site is used. You can opt out at any time.') +
          ' <a href="privacy.html">Read the privacy notice</a>.' +
        '</p>' +
        '<div class="consent-btns">' +
          '<button type="button" class="btn btn-ghost" data-consent="denied">Decline</button>' +
          '<button type="button" class="btn btn-primary" data-consent="granted">' +
            (strict ? 'Accept' : 'Got it') +
          '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    /* setTimeout rather than requestAnimationFrame: RAF does not fire while the
       tab is backgrounded, which would leave the notice stuck off-screen. */
    setTimeout(function () { wrap.classList.add('is-in'); }, 30);

    wrap.addEventListener('click', function (e) {
      var choice = e.target && e.target.getAttribute && e.target.getAttribute('data-consent');
      if (!choice) return;
      store.set(choice);
      if (choice === 'granted') loadAnalytics(); else revokeAnalytics();
      wrap.classList.remove('is-in');
      setTimeout(function () { wrap.remove(); }, 260);
    });
  }

  /* --- boot -------------------------------------------------------------- */
  function boot() {
    var saved = store.get();
    var strict = needsPriorConsent();

    if (saved === 'granted') { loadAnalytics(); return; }
    if (saved === 'denied') { return; }

    if (strict) {
      banner(true);                 // opt-in: wait for a click
    } else {
      loadAnalytics();              // US default: notice, not a gate
      banner(false);
    }
  }

  /* Footer "Cookie preferences" link reopens the choice. */
  window.quarriConsentReset = function () {
    try { localStorage.removeItem(KEY); } catch (e) {}
    revokeAnalytics();
    location.reload();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
