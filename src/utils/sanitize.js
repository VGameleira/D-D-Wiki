const HTML_ESCAPE = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

const ESCAPE_RE = /[&<>"']/g;

export function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(ESCAPE_RE, ch => HTML_ESCAPE[ch]);
}
