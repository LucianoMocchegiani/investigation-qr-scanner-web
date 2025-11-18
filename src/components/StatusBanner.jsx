export function StatusBanner({ message, isError }) {
  return (
    <section className={`status ${isError ? 'error' : ''}`}>
      {message}
    </section>
  );
}

