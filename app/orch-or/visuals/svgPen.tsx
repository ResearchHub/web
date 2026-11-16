import type { ReactElement } from 'react';
import type { Pen, PathOpts, Rgb } from './pen';

const r1 = (n: number) => Math.round(n * 10) / 10;
const col = (c: Rgb) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
const op = (a: number) => Math.round(Math.max(0, Math.min(1, a)) * 1000) / 1000;

/**
 * SVG backend of `Pen`, run on the server to draw each figure's still. Marks
 * drawn while `additive` is on go in groups blended with `screen`, the
 * nearest SVG has to the canvas's additive light.
 */
export class SvgPen implements Pen {
  private groups: { additive: boolean; items: ReactElement[] }[] = [{ additive: false, items: [] }];
  private defs = new Map<string, ReactElement>();
  private n = 0;
  readonly detail = 0.4;

  constructor(
    readonly w: number,
    readonly h: number,
    private idPrefix: string
  ) {}

  private push(el: ReactElement) {
    this.groups[this.groups.length - 1].items.push(el);
  }

  private key() {
    return `k${this.n++}`;
  }

  additive(on: boolean) {
    const last = this.groups[this.groups.length - 1];
    if (last.additive === on) return;
    this.groups.push({ additive: on, items: [] });
  }

  rect(x: number, y: number, w: number, h: number, c: Rgb, a: number) {
    if (a <= 0.004) return;
    this.push(
      <rect
        key={this.key()}
        x={r1(x)}
        y={r1(y)}
        width={r1(w)}
        height={r1(h)}
        fill={col(c)}
        fillOpacity={op(a)}
      />
    );
  }

  circle(x: number, y: number, r: number, c: Rgb, a: number) {
    if (a <= 0.004 || r <= 0) return;
    this.push(
      <circle key={this.key()} cx={r1(x)} cy={r1(y)} r={r1(r)} fill={col(c)} fillOpacity={op(a)} />
    );
  }

  ring(x: number, y: number, r: number, c: Rgb, a: number, width: number) {
    if (a <= 0.004 || r <= 0) return;
    this.push(
      <circle
        key={this.key()}
        cx={r1(x)}
        cy={r1(y)}
        r={r1(r)}
        fill="none"
        stroke={col(c)}
        strokeOpacity={op(a)}
        strokeWidth={width}
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  glow(x: number, y: number, r: number, c: Rgb, a: number) {
    if (a <= 0.004 || r <= 0.2) return;
    const id = `${this.idPrefix}-g${c.map(Math.round).join('-')}`;
    if (!this.defs.has(id)) {
      this.defs.set(
        id,
        <radialGradient key={id} id={id}>
          <stop offset="0" stopColor={col(c)} stopOpacity={1} />
          <stop offset="0.25" stopColor={col(c)} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={col(c)} stopOpacity={0.12} />
          <stop offset="1" stopColor={col(c)} stopOpacity={0} />
        </radialGradient>
      );
    }
    this.push(
      <circle
        key={this.key()}
        cx={r1(x)}
        cy={r1(y)}
        r={r1(r)}
        fill={`url(#${id})`}
        opacity={op(a)}
      />
    );
  }

  line(x1: number, y1: number, x2: number, y2: number, c: Rgb, a: number, width: number) {
    if (a <= 0.004) return;
    this.push(
      <line
        key={this.key()}
        x1={r1(x1)}
        y1={r1(y1)}
        x2={r1(x2)}
        y2={r1(y2)}
        stroke={col(c)}
        strokeOpacity={op(a)}
        strokeWidth={width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  path(pts: ArrayLike<number>, c: Rgb, a: number, width: number, opts: PathOpts = {}) {
    if (pts.length < 4) return;
    let d = `M${r1(pts[0])} ${r1(pts[1])}`;
    for (let i = 2; i < pts.length; i += 2) d += `L${r1(pts[i])} ${r1(pts[i + 1])}`;
    if (opts.closed) d += 'Z';
    let stroke = col(c);
    if (opts.gradient) {
      const id = `${this.idPrefix}-lg${opts.gradient.map((g) => g.map(Math.round).join('-')).join('_')}`;
      if (!this.defs.has(id)) {
        this.defs.set(
          id,
          <linearGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1={0}
            y1={0}
            x2={this.w}
            y2={0}
          >
            <stop offset="0.2" stopColor={col(opts.gradient[0])} />
            <stop offset="0.5" stopColor={col(opts.gradient[1])} />
            <stop offset="0.8" stopColor={col(opts.gradient[2])} />
          </linearGradient>
        );
      }
      stroke = `url(#${id})`;
    }
    const drawStroke = a > 0.004 && width > 0;
    this.push(
      <path
        key={this.key()}
        d={d}
        fill={opts.fill ? col(opts.fill) : 'none'}
        fillOpacity={opts.fill ? op(opts.fillAlpha ?? 1) : undefined}
        stroke={drawStroke ? stroke : 'none'}
        strokeOpacity={drawStroke ? op(a) : undefined}
        strokeWidth={drawStroke ? width : undefined}
        strokeDasharray={opts.dash ? opts.dash.join(' ') : undefined}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    );
  }

  /** The finished picture, as children of an <svg>. */
  render(): ReactElement {
    return (
      <>
        <defs>{[...this.defs.values()]}</defs>
        {this.groups
          .filter((g) => g.items.length > 0)
          .map((g, i) => (
            <g key={i} style={g.additive ? { mixBlendMode: 'screen' } : undefined}>
              {g.items}
            </g>
          ))}
      </>
    );
  }
}
