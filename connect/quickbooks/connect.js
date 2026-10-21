/*
 * Connect QuickBooks (Theo, 21 Oct 2026). Static pages, no server: nothing here swaps the code or
 * holds a token. The QuickBooks connector does that on its next run, with the customer's own client
 * secret, from the address the done page shows (credential field auth_redirect_url).
 *
 * The connect page puts a random, single-use state in this tab's sessionStorage and sends the browser
 * to Intuit. The done page shows the address only when that state comes back within STATE_MINUTES,
 * so a forged or replayed answer shows nothing (CSRF). No analytics run on these pages: the done
 * page's URL carries the one-time code.
 *
 * Kept out of inline handlers on purpose: Netlify re-quotes inline handlers on the live site
 * (_knowledge/engineering/netlify-rewrites-inline-handlers.md).
 */
(function () {
    // The client ids of Intuit app "Quarri": production keys for real companies, development keys for
    // Intuit sandbox companies (?env=sandbox, for rehearsing the journey). An id travels in every
    // authorize URL, so it is not secret; the client secret never comes near the website.
    // Empty = connections switched off.
    var CLIENT_IDS = {
        production: 'ABceVQE4ZvsKSVHf7UGQd8PiASHVwxlgAzCFQQzAnDWCJmbZIn',
        sandbox: 'AB8LSlLsQoN8TSVDR9ZAVBEzt06lvNgLhqvEbeQSpbS4hw2tza'
    };
    var ENV = new URLSearchParams(window.location.search).get('env') === 'sandbox' ? 'sandbox' : 'production';
    var CLIENT_ID = CLIENT_IDS[ENV];
    var AUTHORIZE_URL = 'https://appcenter.intuit.com/connect/oauth2';
    var SCOPE = 'com.intuit.quickbooks.accounting';
    var REDIRECT_URI = 'https://quarri.ai/connect/quickbooks/done/';
    var STATE_KEY = 'qbo_connect_state';
    var STATE_MINUTES = 15;

    function show(id) { document.getElementById(id).hidden = false; }

    function newState() {
        var bytes = new Uint8Array(24);
        crypto.getRandomValues(bytes);
        var s = '';
        for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function store() {
        try { return window.sessionStorage; } catch (e) { return null; }
    }

    function connectPage() {
        var button = document.getElementById('connect');
        if (ENV === 'sandbox') show('sandbox');
        if (!CLIENT_ID) {
            show('off');
            button.disabled = true;
            return;
        }
        button.addEventListener('click', function () {
            var ss = store();
            if (!ss) { show('nostore'); return; }
            var state = newState();
            ss.setItem(STATE_KEY, JSON.stringify({ value: state, at: Date.now(), env: ENV }));
            var q = new URLSearchParams({ client_id: CLIENT_ID, response_type: 'code', scope: SCOPE,
                                          redirect_uri: REDIRECT_URI, state: state });
            window.location.assign(AUTHORIZE_URL + '?' + q.toString());
        });
    }

    function donePage() {
        var q = new URLSearchParams(window.location.search);
        var ss = store();
        var saved = null;
        try { saved = JSON.parse((ss && ss.getItem(STATE_KEY)) || 'null'); } catch (e) { saved = null; }
        if (ss) ss.removeItem(STATE_KEY);                       // single use
        var given = q.get('state') || '';
        var fresh = saved && typeof saved.value === 'string' && Date.now() - saved.at <= STATE_MINUTES * 60000;
        var code = q.get('code'), realm = q.get('realmId');
        // Take the code out of the address bar and the tab's history either way.
        if (window.history && history.replaceState) history.replaceState(null, '', window.location.pathname);

        if (!(fresh && given && given === saved.value)) { show('refused'); return; }
        // The environment comes from what this tab started, never from the answer's address.
        if (saved.env === 'sandbox') {
            show('sandbox');
            var again = document.querySelectorAll('a[href="/connect/quickbooks/"]');
            for (var i = 0; i < again.length; i++) again[i].href = '/connect/quickbooks/?env=sandbox';
        }
        if (q.get('error')) { show('cancelled'); return; }   // access_denied: Cancel on Intuit's screen
        if (!code || !realm) { show('refused'); return; }

        var address = REDIRECT_URI + '?' + new URLSearchParams({ code: code, state: given, realmId: realm }).toString();
        document.getElementById('realm').textContent = realm;
        var field = document.getElementById('address');
        field.value = address;
        show('done');
        document.getElementById('copy').addEventListener('click', function () {
            field.select();
            var ok = function () { show('copied'); };
            if (navigator.clipboard) {
                navigator.clipboard.writeText(address).then(ok, function () { document.execCommand('copy'); ok(); });
            } else {
                document.execCommand('copy');
                ok();
            }
        });
    }

    var page = document.body.getAttribute('data-page');
    if (page === 'connect') connectPage();
    if (page === 'done') donePage();
})();
