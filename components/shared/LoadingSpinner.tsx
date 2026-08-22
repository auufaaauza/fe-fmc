export function LoadingSpinner() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500 shadow-sm" />
    </div>
  );
}
