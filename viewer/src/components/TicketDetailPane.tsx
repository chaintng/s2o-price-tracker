import { ReactNode } from "react";
import { formatDateTime } from "../lib/ohlc";
import { ChartMode, Interval, LinePoint, OHLCPoint, TicketKey, TicketSummary, isSameTicket, ticketKey, ticketLabel, ticketShortLabel } from "../types";
import { PriceChart } from "./PriceChart";

type DetailPaneLayout = "desktop" | "mobile";

interface OrderedTicketState {
  key: TicketKey;
  summary: TicketSummary | null;
}

interface FocusOverview {
  currentPrice: number | null;
  highestPrice: number | null;
  lowestPrice: number | null;
  averagePrice: number | null;
}

interface CompactTabOption<T extends string> {
  label: string;
  value: T;
}

interface TicketDetailPaneProps {
  layout: DetailPaneLayout;
  loading: boolean;
  lastCapturedAt: string | null;
  activeTicket: TicketKey | null;
  activeSummary: TicketSummary | null;
  focusOverview: FocusOverview;
  durationLabel: ReactNode;
  symbolMenuOpen: boolean;
  orderedTicketStates: OrderedTicketState[];
  interval: Interval;
  intervalOptions: CompactTabOption<Interval>[];
  mode: ChartMode;
  detailSeries: {
    key: TicketKey;
    color: string;
    points: LinePoint[];
  }[];
  activeLinePoints: LinePoint[];
  activeCandles: OHLCPoint[];
  resaleUrl: string;
  onBack: (() => void) | null;
  onToggleSymbolMenu: () => void;
  onSelectTicket: (ticket: TicketKey) => void;
  onIntervalChange: (interval: Interval) => void;
  onToggleMode: () => void;
  formatPrice: (value: number | null) => string;
  formatChange: (value: number | null) => string;
}

function CompactTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: CompactTabOption<T>[];
  value: T;
  onChange: (nextValue: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`compact-tab ${value === option.value ? "compact-tab-active" : ""}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function TicketDetailPane({
  layout,
  loading,
  lastCapturedAt,
  activeTicket,
  activeSummary,
  focusOverview,
  durationLabel,
  symbolMenuOpen,
  orderedTicketStates,
  interval,
  intervalOptions,
  mode,
  detailSeries,
  activeLinePoints,
  activeCandles,
  resaleUrl,
  onBack,
  onToggleSymbolMenu,
  onSelectTicket,
  onIntervalChange,
  onToggleMode,
  formatPrice,
  formatChange,
}: TicketDetailPaneProps) {
  const isDesktop = layout === "desktop";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="detail-header">
        <div className={isDesktop ? "py-4" : ""}>
          <div className={isDesktop ? "relative min-w-0 overflow-hidden px-4" : "flex items-center gap-3 px-4 pt-4"}>
            {!isDesktop && onBack ? (
              <button type="button" onClick={onBack} className="back-button">
                ←
              </button>
            ) : null}
            <div className={`relative min-w-0 ${isDesktop ? "" : "flex-1"}`}>
              <div className="flex items-start justify-between gap-3 lg:flex-wrap">
                <div className="min-w-0">
                  <p className="market-kicker">
                    Updated {lastCapturedAt ? formatDateTime(lastCapturedAt) : "—"}
                  </p>
                  <button
                    type="button"
                    onClick={onToggleSymbolMenu}
                    className="symbol-trigger"
                  >
                    <span className="truncate">
                      {activeTicket ? ticketLabel(activeTicket) : "Ticket"}
                    </span>
                    <span className={`transition-transform ${symbolMenuOpen ? "rotate-180" : ""}`}>
                      ▾
                    </span>
                  </button>
                </div>
                {isDesktop ? (
                  <div className="hidden lg:flex lg:max-w-full lg:flex-col lg:items-end lg:gap-2">
                    <div className="live-badge">
                      <span className="live-pulse" />
                      <span>Live</span>
                    </div>
                    <div className="desktop-trade-actions">
                      <a
                        href={resaleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="trade-btn trade-btn-buy"
                      >
                        Buy
                      </a>
                      <a
                        href={resaleUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="trade-btn trade-btn-sell"
                      >
                        Sell
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="live-badge">
                    <span className="live-pulse" />
                    <span>Live</span>
                  </div>
                )}
              </div>
              {symbolMenuOpen && (
                <div className="symbol-menu">
                  {orderedTicketStates.map(({ key, summary }) => (
                    <button
                      key={ticketKey(key)}
                      type="button"
                      disabled={summary === null}
                      onClick={() => {
                        if (summary === null) {
                          return;
                        }
                        onSelectTicket(key);
                      }}
                      className={`symbol-menu-item ${isSameTicket(key, activeTicket) ? "symbol-menu-item-active" : ""}`}
                    >
                      <span>{ticketShortLabel(key)}</span>
                      {!summary && <span className="symbol-menu-item-meta">N/A</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={`mt-4 flex items-start justify-between gap-4 border-t border-[#1f2630] ${isDesktop ? "px-4 pt-4 lg:flex-wrap" : "p-4"}`}>
            <div className={`min-w-0 ${isDesktop ? "flex-1" : ""}`}>
              <p className="market-stat-label">Spot price</p>
              <div className="mt-1 flex items-end gap-2">
                <p className={`font-semibold leading-none text-[#f0f4f8] ${isDesktop ? "text-[38px]" : "text-[34px] sm:text-[44px]"}`}>
                  {formatPrice(focusOverview.currentPrice)}
                </p>
                <p
                  className={`pb-1 font-medium ${isDesktop ? "text-base" : "text-sm sm:text-lg"} ${activeSummary?.changeRate === null
                    ? "text-[#848e9c]"
                    : (activeSummary?.changeRate ?? 0) >= 0
                      ? "text-[#0ecb81]"
                      : "text-[#f6465d]"
                    }`}
                >
                  {formatChange(activeSummary?.changeRate ?? null)}
                </p>
              </div>
              <p className="mt-2 text-sm text-[#848e9c]">{durationLabel}</p>
            </div>

            <div className={`grid grid-cols-2 gap-x-5 gap-y-2 text-sm ${isDesktop ? "max-w-full flex-shrink-0" : "flex-shrink-0"}`}>
              <div>
                <p className="market-stat-label">Volume</p>
                <p className="market-stat-value">
                  {activeSummary?.latestVolume?.toLocaleString() ?? "—"}
                </p>
              </div>
              <div>
                <p className="market-stat-label">Avg</p>
                <p className="market-stat-value">{formatPrice(focusOverview.averagePrice)}</p>
              </div>
              <div>
                <p className="market-stat-label">High</p>
                <p className="market-stat-value">{formatPrice(focusOverview.highestPrice)}</p>
              </div>
              <div>
                <p className="market-stat-label">Low</p>
                <p className="market-stat-value">{formatPrice(focusOverview.lowestPrice)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="detail-toolbar">
        <div className="detail-toolbar-inner">
          <div className="detail-toolbar-row">
            <CompactTabs options={intervalOptions} value={interval} onChange={onIntervalChange} />
            <button
              type="button"
              onClick={onToggleMode}
              className="micro-toggle"
            >
              {mode === "candlestick" ? "Candles" : "Line"}
            </button>
          </div>
        </div>
      </section>

      <div className={isDesktop ? "flex-1 min-h-0 overflow-hidden" : "flex-1 min-h-[220px] sm:min-h-[260px]"}>
        <PriceChart
          mode={mode}
          interval={interval}
          loading={loading}
          visibleSeries={detailSeries}
          activeTicket={activeTicket}
          activeLinePoints={activeLinePoints}
          activeCandles={activeCandles}
          heightClassName={isDesktop ? "h-[320px] sm:h-[360px] lg:h-[min(62vh,560px)]" : "h-full"}
        />
      </div>

      {!isDesktop ? (
        <section className="trade-actions">
          <a
            href={resaleUrl}
            target="_blank"
            rel="noreferrer"
            className="trade-btn trade-btn-buy"
          >
            Buy
          </a>
          <a
            href={resaleUrl}
            target="_blank"
            rel="noreferrer"
            className="trade-btn trade-btn-sell"
          >
            Sell
          </a>
        </section>
      ) : null}
    </div>
  );
}
