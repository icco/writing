'use client'

import React from "react";
import Vivus from "vivus";

// This modifies the DOM, as such, can only be called from componentDidMount.
function buildSVG(size: number): React.JSX.Element {
  let viewBox = [0, 0, size, size].join(" ");
  let paths: React.JSX.Element[] = [];

  let k = size / 4;
  [
    [k * 1, k * 1],
    [k * 3, k * 1],
    [k * 1, k * 3],
    [k * 3, k * 3],
  ].forEach(function (arr, i) {
    let r = k / 2.0 + size / 20.0;
    let cx = arr[0];
    let cy = arr[1];

    const pathArray = [
      ["M", cx - r, cy],
      ["A", r, r, 0, 0, 0, cx + r, cy],
      ["A", r, r, 0, 0, 0, cx - r, cy],
      ["z"],
    ]

    let path = pathArrayToString(pathArray);

    paths[i] = <path strokeWidth={0.04 * size} fill="none" d={path} key={i} />;
  });

  return (
    <svg
      xmlns="http://www.w3.org/svg/2000"
      viewBox={viewBox}
      width={size}
      height={size}
      id="logo"
    >
      {paths}
    </svg>
  );
}

function pathArrayToString(a: (string | number)[][]): string {
  for (var i = 0, il = a.length, s = ""; i < il; i++) {
    s += a[i][0];

    if (a[i][1] != null) {
      s += a[i][1];

      if (a[i][2] != null) {
        s += " ";
        s += a[i][2];

        if (a[i][3] != null) {
          s += " ";
          s += a[i][3];
          s += " ";
          s += a[i][4];

          if (a[i][5] != null) {
            s += " ";
            s += a[i][5];
            s += " ";
            s += a[i][6];

            if (a[i][7] != null) {
              s += " ";
              s += a[i][7];
            }
          }
        }
      }
    }
  }

  return s + " ";
}

export type LogoProps = {
  size: number;
  className?: string;
  style?: React.CSSProperties;
}

class Logo extends React.Component<LogoProps> {
  componentDidMount() {
    new Vivus("logo", { duration: 200 });
  }

  render() {
    const { size } = this.props;

    return (
      <div style={{ width: `${size}px`, height: `${size}px` }} {...this.props}>
        {buildSVG(size)}
      </div>
    );
  }
}

export default Logo;