'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-4 space-y-4 text-center">
      <h1 className="text-xl font-bold">Something went wrong</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
