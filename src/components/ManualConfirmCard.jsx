export function ManualConfirmCard({
  value,
  onChange,
  onSubmit,
  placeholder = 'http://localhost:3000/api/orders/{id}/confirm',
}) {
  return (
    <div className="manual-card">
      <h2>Confirmar pegando la URL</h2>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button onClick={onSubmit} disabled={!value}>
        Confirmar
      </button>
    </div>
  );
}

