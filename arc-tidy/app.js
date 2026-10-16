const body = document.body;
const button = document.querySelector('#download');
const status = document.querySelector('#status');
const hashNode = document.querySelector('#verified-hash');

const payloadUrl = new URL(body.dataset.payload, location.href);
const expectedHash = body.dataset.sha256;

async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function preflight() {
  try {
    const response = await fetch(payloadUrl, {cache: 'no-store'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = await response.arrayBuffer();
    const actualHash = await sha256(bytes);
    if (actualHash !== expectedHash) throw new Error('payload digest mismatch');
    hashNode.textContent = actualHash;
    status.textContent = 'Payload verified. Click the button to start one ordinary download.';
    button.disabled = false;
  } catch (error) {
    status.textContent = `Preflight failed: ${error.message}`;
  }
}

button.addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = payloadUrl.href;
  link.download = body.dataset.filename;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  status.textContent = `Download requested as ${body.dataset.filename}.`;
});

preflight();

