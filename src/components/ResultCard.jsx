export function ResultCard({ result, onRetry }) {
  if (!result) return null;

  return (
    <section className="result">
      <div className="result-header">
        <h3>Respuesta</h3>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Escanear otro
          </button>
        )}
      </div>
      <p>
        <strong>QR:</strong> {result.source}
      </p>
      <p>
        <strong>Estado:</strong> {result.ok ? 'OK' : 'Error'}
      </p>
      <pre>
        {typeof result.body === 'string'
          ? result.body
          : JSON.stringify(result.body, null, 2)}
      </pre>
    </section>
  );
}

