interface Props {
  lastUpdated: Date | null;
}

export function Header({ lastUpdated }: Props) {
  return (
    <header className="flex items-center justify-between px-4 pt-5 pb-3">
      <div>
        <h1 className="text-base font-bold tracking-wide text-white">S2O 2026</h1>
        <p className="text-xs text-muted">Resale Price Tracker</p>
      </div>
      {lastUpdated && (
        <p className="text-[10px] text-muted text-right">
          Updated
          <br />
          {lastUpdated.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </header>
  );
}
