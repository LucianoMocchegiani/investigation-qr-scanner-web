export function ScannerCard({ onStart, onStop, isScanning, readerDomId }) {
  return (
    <div className="scanner-card">
      <h2>Escanear con cámara</h2>
      <div className="actions">
        <button onClick={onStart} disabled={isScanning}>
          {isScanning ? 'Escaneando...' : 'Iniciar cámara'}
        </button>
        <button onClick={onStop} disabled={!isScanning}>
          Detener
        </button>
      </div>
      <div id={readerDomId} className="reader" />
    </div>
  );
}

