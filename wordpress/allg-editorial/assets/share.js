/* No network requests: direct links are rendered by WordPress. */
document.querySelectorAll('.share-panel').forEach(panel => {
  const url = panel.dataset.shareUrl;
  const title = panel.dataset.shareTitle;
  const copy = panel.querySelector('[data-share-copy]');
  const native = panel.querySelector('[data-share-native]');
  const status = panel.querySelector('.share-status');
  const fallback = panel.querySelector('.share-fallback');
  const showFallback = () => {
    fallback.hidden = false;
    const input = fallback.querySelector('input');
    input.focus();
    input.select();
    status.textContent = 'Selecione o link e use a opção Copiar do seu dispositivo.';
  };
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        showFallback();
        return;
      }
      await navigator.clipboard.writeText(url);
      fallback.hidden = true;
      status.textContent = 'Link copiado!';
    } catch {
      showFallback();
    }
  });
  if (typeof navigator.share === 'function') {
    native.hidden = false;
    native.addEventListener('click', async () => {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        if (error.name !== 'AbortError') {
          status.textContent = 'Escolha uma rede acima ou copie o link.';
        }
      }
    });
  }
});
