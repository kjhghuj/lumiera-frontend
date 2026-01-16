interface SubmitButtonProps {
  processing: boolean;
  disabled: boolean;
}

export function SubmitButton({ processing, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full mt-8 bg-terracotta text-white py-4 rounded-full hover:bg-terracotta-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm uppercase tracking-wider"
    >
      {processing ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Processing...</span>
        </>
      ) : (
        "Complete Payment"
      )}
    </button>
  );
}
