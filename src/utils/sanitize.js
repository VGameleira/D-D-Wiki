export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}

export function safeInnerHTML(element, html) {
  element.innerHTML = html;
}
