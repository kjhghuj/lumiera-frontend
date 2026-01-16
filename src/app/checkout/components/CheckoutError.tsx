interface CheckoutErrorProps {
  error: string | null;
  onClear: () => void;
}

export function CheckoutError({ error, onClear }: CheckoutErrorProps) {
  if (!error) return null;
  return (
    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
      {error}
      <button
        onClick={onClear}
        type="button"
        className="mt-4 text-red-600 hover:text-red-700 underline block"
      >
        Try Again
      </button>
    </div>
  );
}
