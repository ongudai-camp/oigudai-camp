(function() {
  var attrs = ["hix-version", "hix-id"];
  var body = document.body;
  if (body) {
    attrs.forEach(function(n) { if (body.hasAttribute(n)) body.removeAttribute(n); });
  }
  var obs = new MutationObserver(function() {
    var b = document.body;
    if (b) {
      attrs.forEach(function(n) { if (b.hasAttribute(n)) b.removeAttribute(n); });
    }
  });
  obs.observe(document.documentElement, {
    attributes: true,
    attributeFilter: attrs,
    subtree: true,
    childList: true
  });
})();
