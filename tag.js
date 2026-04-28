/* SavvyTech Transparency Tag — production snippet (v0.1).
 *
 * Customers paste this on their site:
 *   <script src="https://compliance.savvytechautomations.com/tag.js?id=XXX" async></script>
 *
 * What it does at load time:
 *   1. Detect visitor state via Cloudflare's CF-IPCountry header on a probe
 *      fetch (no third-party API).
 *   2. Pick the matching disclosure JSON (states/<code>.json on this same
 *      origin — instantly cached by Cloudflare's edge).
 *   3. Inject a small banner at the top of the page with the disclosure +
 *      action links the customer configured.
 *
 * Customers update {purpose}, {privacy_url}, {contact_url} via data-* attrs:
 *   <script src="...tag.js?id=XXX"
 *           data-purpose="recommend products"
 *           data-privacy="/privacy"
 *           data-contact="mailto:hello@example.com" async></script>
 *
 * If we can't determine the state we default to the strictest known
 * disclosure (Colorado, currently). Failing safe = covered by default.
 */
(function () {
  if (window.__SAVVYTECH_TAG_LOADED__) return;
  window.__SAVVYTECH_TAG_LOADED__ = true;

  var script = document.currentScript;
  var origin = script ? new URL(script.src).origin : 'https://compliance.savvytechautomations.com';

  var cfg = {
    purpose: (script && script.dataset.purpose) || 'process your request',
    privacy_url: (script && script.dataset.privacy) || '#',
    contact_url: (script && script.dataset.contact) || '#',
    detector_url: (script && script.dataset.detector) || origin + '/detect'
  };

  var STRICTEST = 'co';

  function detectState(cb) {
    /* Cloudflare echoes CF-IPCountry on every response. We probe a tiny
     * endpoint on our own origin to read it. Falls back to STRICTEST. */
    fetch(origin + '/cdn-cgi/trace', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        var m = txt.match(/loc=([A-Z]{2})/);
        var country = m ? m[1] : null;
        if (country !== 'US') return cb(STRICTEST);
        var rm = txt.match(/region=([A-Z]{2,3})/);
        var region = rm ? rm[1].toLowerCase() : STRICTEST;
        cb(region);
      })
      .catch(function () { cb(STRICTEST); });
  }

  function fetchDisclosure(code, cb) {
    fetch(origin + '/states/' + code + '.json', { cache: 'force-cache' })
      .then(function (r) {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then(function (j) { cb(j); })
      .catch(function () {
        if (code !== STRICTEST) fetchDisclosure(STRICTEST, cb);
        else cb(null);
      });
  }

  function fill(template) {
    return String(template)
      .replace(/\{purpose\}/g, cfg.purpose)
      .replace(/\{privacy_url\}/g, cfg.privacy_url)
      .replace(/\{contact_url\}/g, cfg.contact_url)
      .replace(/\{detector_url\}/g, cfg.detector_url);
  }

  function render(json) {
    if (!json || !json.disclosure) return;
    var d = json.disclosure;
    var bar = document.createElement('div');
    bar.id = 'savvytech-transparency-tag';
    bar.style.cssText = [
      'position:fixed','top:0','left:0','right:0','z-index:99999',
      'background:#fffbeb','border-bottom:2px solid #fbbf24',
      'padding:10px 16px','font:14px/1.4 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif',
      'color:#0a0a0a','box-shadow:0 1px 3px rgba(0,0,0,.08)'
    ].join(';');

    var headline = document.createElement('strong');
    headline.textContent = d.headline + ' ';
    bar.appendChild(headline);

    var body = document.createElement('span');
    body.textContent = fill(d.body);
    bar.appendChild(body);

    (d.actions || []).forEach(function (a) {
      bar.appendChild(document.createTextNode(' '));
      var link = document.createElement('a');
      link.href = fill(a.href);
      link.textContent = a.label + ' →';
      link.style.cssText = 'margin-left:12px;color:#92400e;font-weight:600;text-decoration:underline';
      bar.appendChild(link);
    });

    var dismiss = document.createElement('button');
    dismiss.textContent = '×';
    dismiss.setAttribute('aria-label', 'Dismiss');
    dismiss.style.cssText = 'position:absolute;right:8px;top:6px;background:none;border:0;font-size:20px;cursor:pointer;color:#92400e;line-height:1';
    dismiss.onclick = function () { bar.style.display = 'none'; try { sessionStorage.setItem('savvytech-tag-dismissed', '1'); } catch (e) {} };
    bar.appendChild(dismiss);

    if (sessionStorage.getItem('savvytech-tag-dismissed') === '1') return;

    if (document.body) document.body.appendChild(bar);
    else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(bar); });
  }

  detectState(function (code) {
    fetchDisclosure(code, render);
  });
})();
