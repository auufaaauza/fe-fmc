export function LoadingSpinner() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="h-12 w-12 animate-spin border-4 border-black border-t-yellow-400" />
    </div>
  );
}
