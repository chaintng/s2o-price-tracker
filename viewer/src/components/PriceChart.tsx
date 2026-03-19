import * as echarts from "echarts/core";
import { CandlestickChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";
import type { ComposeOption } from "echarts/core";
import type { CandlestickSeriesOption, BarSeriesOption } from "echarts/charts";
import type {
  GridComponentOption,
  TooltipComponentOption,
  DataZoomComponentOption,
} from "echarts/components";
import { formatAxisTime } from "../lib/ohlc";
import { Interval, OHLCPoint, TicketKey } from "../types";

echarts.use([
  CandlestickChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

type ECOption = ComposeOption<
  | CandlestickSeriesOption
  | BarSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | DataZoomComponentOption
>;

interface Props {
  data: OHLCPoint[];
  selected: TicketKey;
  interval: Interval;
  loading: boolean;
}

const BULL = "#26a69a";
const BEAR = "#ef5350";
const BORDER_COLOR = "#2a2e39";
const TEXT_COLOR = "#787b86";
const GRID_COLOR = "#1e2030";
const BG_TOOLTIP = "#1a1d26";

function buildOption(data: OHLCPoint[], interval: Interval): ECOption {
  const times = data.map((d) => formatAxisTime(d.time, interval));
  // ECharts candlestick: [open, close, low, high]
  const candleData = data.map((d) => [d.open, d.close, d.low, d.high]);
  const volumeData = data.map((d, i) => ({
    value: d.volume,
    itemStyle: {
      color: d.close >= d.open ? `${BULL}cc` : `${BEAR}cc`,
    },
    i,
  }));

  return {
    animation: true,
    animationDuration: 400,
    animationEasing: "cubicOut",
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        lineStyle: { color: "#444c61", width: 1 },
        crossStyle: { color: "#444c61", width: 1 },
      },
      backgroundColor: BG_TOOLTIP,
      borderColor: BORDER_COLOR,
      borderWidth: 1,
      padding: 12,
      textStyle: { color: "#d1d4dc", fontSize: 12 },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const candle = Array.isArray(params)
          ? params.find((p: { seriesType: string }) => p.seriesType === "candlestick")
          : null;
        const vol = Array.isArray(params)
          ? params.find((p: { seriesType: string }) => p.seriesType === "bar")
          : null;
        if (!candle) return "";

        const [o, c, l, h] = candle.data as [number, number, number, number];
        const isUp = c >= o;
        const color = isUp ? BULL : BEAR;
        const pct = o !== 0 ? (((c - o) / o) * 100).toFixed(2) : "0.00";
        const fmt = (n: number) => `฿${n.toLocaleString()}`;

        const row = (label: string, val: string) =>
          `<div style="display:flex;justify-content:space-between;gap:24px">` +
          `<span style="color:${TEXT_COLOR}">${label}</span>` +
          `<span style="color:${color};font-weight:600">${val}</span></div>`;

        return (
          `<div style="font-size:11px;line-height:1.7">` +
          `<div style="color:${TEXT_COLOR};margin-bottom:4px;font-size:10px">${candle.name}</div>` +
          row("O", fmt(o)) +
          row("H", fmt(h)) +
          row("L", fmt(l)) +
          row("C", fmt(c)) +
          (vol
            ? `<div style="display:flex;justify-content:space-between;gap:24px;margin-top:4px">` +
              `<span style="color:${TEXT_COLOR}">Vol</span>` +
              `<span style="color:${TEXT_COLOR}">${vol.data.value}</span></div>`
            : "") +
          `<div style="color:${color};text-align:right;margin-top:4px;font-size:11px">` +
          `${isUp ? "+" : ""}${pct}%</div>` +
          `</div>`
        );
      },
    },
    grid: [
      { left: 64, right: 12, top: 16, bottom: 110 },
      { left: 64, right: 12, top: "74%", bottom: 64 },
    ],
    xAxis: [
      {
        type: "category",
        data: times,
        gridIndex: 0,
        axisLine: { lineStyle: { color: BORDER_COLOR } },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
        boundaryGap: true,
      },
      {
        type: "category",
        data: times,
        gridIndex: 1,
        axisLine: { lineStyle: { color: BORDER_COLOR } },
        axisTick: { show: false },
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 10,
          interval: "auto",
          rotate: 0,
          margin: 8,
        },
        splitLine: { show: false },
        boundaryGap: true,
      },
    ],
    yAxis: [
      {
        scale: true,
        gridIndex: 0,
        axisLabel: {
          color: TEXT_COLOR,
          fontSize: 10,
          formatter: (v: number) => `฿${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: GRID_COLOR, type: "dashed" } },
      },
      {
        gridIndex: 1,
        axisLabel: { color: TEXT_COLOR, fontSize: 10 },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        splitNumber: 2,
      },
    ],
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: [0, 1],
        start: data.length > 48 ? 70 : 0,
        end: 100,
        minValueSpan: 4,
      },
      {
        type: "slider",
        xAxisIndex: [0, 1],
        bottom: 8,
        height: 44,
        borderColor: BORDER_COLOR,
        fillerColor: "rgba(41,98,255,0.08)",
        handleStyle: { color: "#2962ff", borderColor: "#2962ff" },
        moveHandleStyle: { color: "#2962ff" },
        selectedDataBackground: {
          lineStyle: { color: "#2962ff" },
          areaStyle: { color: "rgba(41,98,255,0.04)" },
        },
        textStyle: { color: TEXT_COLOR, fontSize: 10 },
        brushSelect: false,
      },
    ],
    series: [
      {
        name: "Price",
        type: "candlestick",
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: candleData,
        itemStyle: {
          color: BULL,
          color0: BEAR,
          borderColor: BULL,
          borderColor0: BEAR,
          borderWidth: 1.5,
        },
        emphasis: {
          itemStyle: {
            color: BULL,
            color0: BEAR,
            borderColor: BULL,
            borderColor0: BEAR,
            shadowBlur: 8,
            shadowColor: "rgba(41,98,255,0.3)",
          },
        },
      },
      {
        name: "Volume",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumeData,
        barMaxWidth: 20,
        emphasis: { focus: "none" },
      },
    ],
  };
}

function ticketLabel(t: TicketKey) {
  const level = t.level === "vip" ? "VIP" : "Regular";
  return `${level} · ${t.type}`;
}

export function PriceChart({ data, selected, interval, loading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // Init chart
  useEffect(() => {
    if (!containerRef.current) return;
    chartRef.current = echarts.init(containerRef.current, undefined, { renderer: "canvas" });

    const onResize = () => chartRef.current?.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!chartRef.current) return;
    if (data.length === 0) {
      chartRef.current.clear();
      return;
    }
    chartRef.current.setOption(buildOption(data, interval), { notMerge: true, lazyUpdate: false });
  }, [data, interval]);

  return (
    <div className="flex flex-col flex-1 min-h-0 px-4 pt-3 pb-4">
      {/* Chart label */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={[
            "text-[10px] font-bold rounded px-1.5 py-0.5",
            selected.level === "vip"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-accent/20 text-accent",
          ].join(" ")}
        >
          {selected.level === "vip" ? "VIP" : "REG"}
        </span>
        <span className="text-sm font-semibold text-white">{ticketLabel(selected)}</span>
        <span className="text-xs text-muted ml-auto">
          {data.length > 0 ? `${data.length} candles` : ""}
        </span>
      </div>

      {/* Chart area */}
      <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-card border border-border">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-muted">Loading data…</span>
            </div>
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm text-muted">No data for this ticket</p>
              <p className="text-xs text-muted/60 mt-1">Try a wider time range</p>
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" style={{ minHeight: 360 }} />
      </div>
    </div>
  );
}
