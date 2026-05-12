if (typeof document !== "undefined") {
  const body = document.body;
  if (body) {
    body.removeAttribute("hix-version");
    body.removeAttribute("hix-id");
  }
}
