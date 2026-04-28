/* Demo: render the disclosure for the picked state.
 * The same state JSONs are what the production tag.js will fetch — what you
 * see here is what your visitors will see. */
(function () {
  var pick = document.getElementById('state-pick');
  var box  = document.getElementById('demo-banner');
  if (!pick || !box) return;

  function render(json) {
    if (!json || !json.disclosure) {
      box.innerHTML = '<em>No disclosure on file for that state.</em>';
      return;
    }
    var d = json.disclosure;
    var actions = (d.actions || []).map(function (a) {
      return '<a href="#" style="margin-right:12px;color:#92400e;font-weight:600;">' + escapeHTML(a.label) + ' →</a>';
    }).join('');
    box.innerHTML =
      '<h4>' + escapeHTML(d.headline) + '</h4>' +
      '<p style="margin:0 0 10px;">' + escapeHTML(d.body.replace(/\{purpose\}/g, 'help with your request')) + '</p>' +
      (actions ? '<div>' + actions + '</div>' : '') +
      '<p style="font-size:12px;color:#92400e;margin:10px 0 0;">' +
      escapeHTML(json.lawFull) + ' · effective ' + escapeHTML(json.effective) + '</p>';
  }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function load() {
    var code = pick.value;
    fetch('states/' + code + '.json', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(render)
      .catch(function () { box.innerHTML = '<em>Could not load disclosure for ' + escapeHTML(code) + '.</em>'; });
  }

  pick.addEventListener('change', load);
  load();
})();
