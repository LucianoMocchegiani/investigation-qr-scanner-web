import { useCallback, useState } from 'react';
import './App.css';
import { ScannerCard } from './components/ScannerCard.jsx';
import { ManualConfirmCard } from './components/ManualConfirmCard.jsx';
import { StatusBanner } from './components/StatusBanner.jsx';
import { ResultCard } from './components/ResultCard.jsx';
import { useHtml5QrScanner } from './hooks/useHtml5QrScanner.js';

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';

function App() {
  const [status, setStatus] = useState('Listo para escanear.');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [manualUrl, setManualUrl] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const { readerDomId, isScanning, start, stop } = useHtml5QrScanner();

  const normalizeUrl = useCallback((text) => {
    try {
      return new URL(text).toString();
    } catch {
      return new URL(text, backendBaseUrl).toString();
    }
  }, []);

  const confirmOrder = useCallback(async (text) => {
    if (!text) return;
    setStatus('QR detectado. Confirmando orden...');
    setError(null);
    setIsConfirming(true);
    try {
      const url = normalizeUrl(text);
      const response = await fetch(url);
      const contentType = response.headers.get('content-type') ?? '';
      const body = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      setResult({
        ok: response.ok,
        source: text,
        body,
      });
      setStatus(response.ok ? 'Orden confirmada' : 'No se pudo confirmar');
    } catch (err) {
      console.error(err);
      setError('No se pudo procesar el QR. Revisá la URL o el backend.');
      setStatus('Error al confirmar');
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    setResult(null);
    setError(null);
    setStatus('Iniciando cámara...');
    try {
      await start((decodedText) => {
        setStatus('QR detectado, procesando...');
        if (!decodedText || isConfirming) return;
        confirmOrder(decodedText);
      }, (err) => console.warn('[qr] error escaneando', err));
      setStatus('Escaneando...');
    } catch (err) {
      console.error(err);
      setError('No se pudo acceder a la cámara.');
      setStatus('Error de cámara');
    }
  }, [confirmOrder, start, isConfirming]);

  const stopScanner = useCallback(async () => {
    await stop();
    setStatus('Escaneo detenido.');
  }, [stop]);

  const handleManualSubmit = useCallback(() => {
    if (!manualUrl) return;
    confirmOrder(manualUrl);
  }, [manualUrl, confirmOrder]);

  const handleRetryScanner = useCallback(() => {
    setManualUrl('');
    startScanner();
  }, [startScanner]);

  return (
    <div className="app">
      <header>
        <h1>Escáner QR</h1>
        <p>Confirmar órdenes desde el navegador</p>
      </header>

      <section className="scanner-section">
        <ScannerCard
          readerDomId={readerDomId}
          isScanning={isScanning}
          onStart={startScanner}
          onStop={stopScanner}
        />

        <ManualConfirmCard
          value={manualUrl}
          onChange={setManualUrl}
          onSubmit={handleManualSubmit}
        />
      </section>

      <StatusBanner message={error ?? status} isError={Boolean(error)} />

      <ResultCard result={result} onRetry={handleRetryScanner} />
    </div>
  );
}

export default App;
