import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { SiteButton } from "./site/SiteButton";

export const SHOTS = [
  { src: "/gallery/dashboard-portfolio.svg", alt: "Portfolio dashboard with a Balanced asset mix, holdings table and market proxy prices", caption: "Portfolio dashboard: your model mix with market proxies." },
  { src: "/gallery/forecast-fan-chart.svg", alt: "90-day balance fan chart with an uncertainty band, median, red zero line and 4 February risk marker", caption: "90-day forecast: 1,000 simulated futures in one picture." },
  { src: "/gallery/what-if-shocks.svg", alt: "What-if shocks for lost shifts, boiler repair and rent increase with an updated shortfall risk", caption: "What-if shocks: test a bad month before it happens." },
  { src: "/gallery/goal-simulator.svg", alt: "Goal simulator with monthly contribution slider, 74 percent goal probability and growth fan chart", caption: "Goal simulator: your chance of hitting the goal, and when." },
  { src: "/gallery/resilience-ladder.svg", alt: "Five-rung Resilience Ladder from Stabilise to Grow with the current rung highlighted", caption: "Resilience Ladder: protect first, then grow." },
  { src: "/gallery/briefing.svg", alt: "News briefing tagged energy, rates and housing with personal bill impacts in pounds", caption: "Briefing: the news, translated into your numbers." },
];

export function Gallery() {
  const [index, setIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const opener = useRef<HTMLButtonElement | null>(null);
  const gesture = useRef<{ x: number; y: number; multiple: boolean } | null>(null);
  const go = (direction: number) => { setIndex(current => ((current ?? 0) + direction + SHOTS.length) % SHOTS.length); setScale(1); };
  const shot = SHOTS[index ?? 0];
  return <Dialog.Root open={index !== null} onOpenChange={open => { if (!open) setIndex(null); }}>
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SHOTS.map((item, i) => <li key={item.src}><figure className="h-figure">
        <SiteButton className="h-gallery-thumb" onClick={event => { opener.current = event.currentTarget; setIndex(i); setScale(1); }} aria-label={`Open larger image: ${item.caption}`}>
          <img src={item.src} alt={item.alt} width={1200} height={750} loading="lazy" decoding="async" />
        </SiteButton><figcaption>{item.caption}</figcaption>
      </figure></li>)}
    </ul>
    <Dialog.Portal><Dialog.Content className="h-lightbox" aria-describedby="gallery-caption"
      onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}
      onKeyDown={event => {
        if (event.key === "ArrowRight") { event.preventDefault(); go(1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); go(-1); }
      }}>
      <Dialog.Title className="sr-only">PointUs product screenshot {index === null ? 1 : index + 1} of {SHOTS.length}</Dialog.Title>
      <TransformWrapper key={index} minScale={1} maxScale={4} initialScale={1} centerOnInit wheel={{ step: 0.06 }} doubleClick={{ mode: "toggle", step: 1 }} onTransform={(_, state) => setScale(state.scale)}>
        {({ zoomIn, zoomOut, resetTransform }) => <>
          <div className="flex flex-wrap items-center justify-between gap-2 p-3" onKeyDown={event => {
            if (event.key === "+" || event.key === "=") { event.preventDefault(); zoomIn(); }
            if (event.key === "-") { event.preventDefault(); zoomOut(); }
            if (event.key === "0") resetTransform();
          }}>
            <p className="text-sm h-num" aria-live="polite">{(index ?? 0) + 1} / {SHOTS.length} · {Math.round(scale * 100)}%</p>
            <div className="flex gap-2">
              <SiteButton className="h-icon-btn" aria-label="Zoom out" title="Zoom out" disabled={scale <= 1} onClick={() => zoomOut()}><Minus /></SiteButton>
              <SiteButton className="h-icon-btn" aria-label="Zoom in" title="Zoom in" disabled={scale >= 4} onClick={() => zoomIn()}><Plus /></SiteButton>
              <SiteButton className="h-icon-btn" aria-label="Reset zoom" title="Reset zoom" onClick={() => resetTransform()}><RotateCcw /></SiteButton>
              <Dialog.Close asChild><SiteButton className="h-icon-btn" aria-label="Close image viewer" title="Close image viewer"><X /></SiteButton></Dialog.Close>
            </div>
          </div>
          <div className="h-lightbox-stage" onKeyDown={event => {
            if (event.key === "+" || event.key === "=") { event.preventDefault(); zoomIn(); }
            if (event.key === "-") { event.preventDefault(); zoomOut(); }
            if (event.key === "0") resetTransform();
          }} onTouchStart={event => {
            const touch = event.touches[0];
            if (touch) gesture.current = { x: touch.clientX, y: touch.clientY, multiple: event.touches.length > 1 };
          }} onTouchMove={event => { if (gesture.current && event.touches.length > 1) gesture.current.multiple = true; }}
          onTouchEnd={event => {
            const start = gesture.current, touch = event.changedTouches[0];
            if (start && touch && !start.multiple && scale <= 1.01 && Math.abs(touch.clientX - start.x) > 60 && Math.abs(touch.clientY - start.y) < 60) go(touch.clientX < start.x ? 1 : -1);
            gesture.current = null;
          }}>
            <TransformComponent><img src={shot.src} alt={shot.alt} width={1200} height={750} draggable={false} /></TransformComponent>
            <SiteButton className="h-icon-btn h-gallery-prev" onClick={() => go(-1)} aria-label="Previous image" title="Previous image"><ChevronLeft /></SiteButton>
            <SiteButton className="h-icon-btn h-gallery-next" onClick={() => go(1)} aria-label="Next image" title="Next image"><ChevronRight /></SiteButton>
          </div>
        </>}
      </TransformWrapper>
      <Dialog.Description id="gallery-caption" className="h-gallery-caption">{shot.caption}</Dialog.Description>
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
