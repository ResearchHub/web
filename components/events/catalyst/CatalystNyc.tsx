const NYC_CELLS: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [12.69, 0],
  [0, 3.17],
  [3.17, 3.17],
  [12.69, 3.17],
  [0, 6.34],
  [3.17, 6.34],
  [12.69, 6.34],
  [0, 9.52],
  [6.34, 9.52],
  [12.69, 9.52],
  [0, 12.69],
  [9.52, 12.69],
  [12.69, 12.69],
  [0, 15.86],
  [9.52, 15.86],
  [12.69, 15.86],
  [0, 19.03],
  [12.69, 19.03],
  [18.89, 0],
  [31.58, 0],
  [18.89, 3.17],
  [31.58, 3.17],
  [22.06, 6.34],
  [28.4, 6.34],
  [25.23, 9.52],
  [25.23, 12.69],
  [25.23, 15.86],
  [25.23, 19.03],
  [40.95, 0],
  [44.12, 0],
  [47.29, 0],
  [37.78, 3.17],
  [50.46, 3.17],
  [37.78, 6.34],
  [37.78, 9.52],
  [37.78, 12.69],
  [37.78, 15.86],
  [50.46, 15.86],
  [40.95, 19.03],
  [44.12, 19.03],
  [47.29, 19.03],
];

const NATIVE_WIDTH = 53.1;
const NATIVE_HEIGHT = 21.6;

interface CatalystNycProps {
  fill: string;
  height?: number;
  className?: string;
}

export function CatalystNyc({
  fill,
  height = NATIVE_HEIGHT,
  className,
}: Readonly<CatalystNycProps>) {
  const width = (height * NATIVE_WIDTH) / NATIVE_HEIGHT;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 53.1 21.6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="NYC"
      className={className}
    >
      {NYC_CELLS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="2.6" height="2.6" rx="0.47" fill={fill} />
      ))}
    </svg>
  );
}
