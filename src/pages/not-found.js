/**
 * Página 404 — exibida quando nenhuma rota corresponde.
 * @param {HTMLElement} outlet
 */
export function renderNotFoundPage(outlet) {
  const div = document.createElement('div');
  div.className = 'container';
  div.style.cssText = 'text-align:center;padding:4rem 1rem;';
  div.innerHTML = `
    <h1 style="font-family:var(--font-display,'Cinzel',serif);font-size:4rem;color:var(--color-primary,#8b0000);">404</h1>
    <p style="font-size:var(--font-size-lg,1.125rem);color:var(--color-text-muted,#6b5a4a);margin:var(--spacing-md,1rem) 0;">
      Página não encontrada na Torre do Sábio.
    </p>
    <a href="/" data-nav style="display:inline-block;padding:0.75rem 1.5rem;background:var(--color-primary,#8b0000);color:#fff;border-radius:var(--radius-md,8px);text-decoration:none;font-weight:700;">
      ← Voltar ao início
    </a>
  `;
  outlet.appendChild(div);
}
