function oklchToRgb(l, c, h, alpha = 1) {
  if (typeof l === "string" && l.endsWith("%")) l = parseFloat(l) / 100;
  else l = parseFloat(l);
  c = parseFloat(c);
  h = parseFloat(h);
  if (isNaN(h)) h = 0;

  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const rLin = +4.0767434770 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const toGamma = (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
  };

  const r = Math.round(toGamma(rLin) * 255);
  const g = Math.round(toGamma(gLin) * 255);
  const bVal = Math.round(toGamma(bLin) * 255);

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

function convertOklchInString(str) {
  return str.replace(/oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+|none)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi, (match, l, c, h, a) => {
    let alpha = 1;
    if (a) {
      if (a.endsWith("%")) alpha = parseFloat(a) / 100;
      else alpha = parseFloat(a);
    }
    return oklchToRgb(l, c, h === "none" ? 0 : h, alpha);
  });
}

const THEME_HEX = {
  "emerald-50": [236, 253, 245],
  "emerald-100": [209, 250, 229],
  "emerald-200": [167, 243, 208],
  "emerald-300": [110, 231, 183],
  "emerald-400": [52, 211, 153],
  "emerald-500": [16, 185, 129],
  "emerald-600": [5, 150, 105],
  "emerald-700": [4, 120, 87],
  "emerald-800": [6, 95, 70],
  "emerald-900": [6, 78, 59],
  "teal-400": [45, 212, 191],
  "teal-500": [20, 184, 166],
  "teal-600": [13, 148, 136],
  "teal-700": [15, 118, 110],
  "cyan-300": [103, 232, 249],
  "cyan-400": [34, 211, 238],
  "cyan-500": [6, 182, 212],
  "blue-400": [96, 165, 250],
  "blue-500": [59, 130, 246],
  "blue-600": [37, 99, 235],
  "amber-300": [252, 211, 77],
  "amber-400": [251, 191, 36],
  "amber-500": [245, 158, 11],
  "amber-600": [217, 119, 6],
  "rose-500": [244, 63, 94],
  "rose-600": [225, 29, 72],
  "slate-700": [51, 65, 85],
  "slate-800": [30, 41, 59],
  "slate-900": [15, 23, 42],
  "slate-950": [2, 6, 23],
};

function resolveColorMixFallback(value) {
  const varMatch = value.match(/color-mix\(\s*in\s+(?:oklab|srgb),\s*var\(--color-([a-zA-Z0-9-]+)\)\s+([\d.]+)%?,\s*transparent\s*\)/i);
  if (varMatch) {
    const name = varMatch[1];
    const pct = parseFloat(varMatch[2]) / 100;
    if (THEME_HEX[name]) {
      const [r, g, b] = THEME_HEX[name];
      return `rgba(${r}, ${g}, ${b}, ${pct})`;
    }
    return `var(--color-${name})`;
  }

  const hexMatch = value.match(/color-mix\(\s*in\s+(?:oklab|srgb),\s*#([0-9a-fA-F]{3,8})\s+([\d.]+)%?,\s*transparent\s*\)/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    const pct = parseFloat(hexMatch[2]) / 100;
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${pct})`;
  }

  const curMatch = value.match(/color-mix\(\s*in\s+(?:oklab|srgb),\s*currentcolor\s+([\d.]+)%?,\s*transparent\s*\)/i);
  if (curMatch) {
    const pct = parseFloat(curMatch[1]) / 100;
    return `rgba(15, 23, 42, ${pct})`;
  }

  return null;
}

const legacyCompatPlugin = () => ({
  postcssPlugin: "postcss-legacy-compat",
  Declaration(decl) {
    // 1. Remove modern color interpolation keywords from linear gradients
    if (decl.value.includes("in oklab") || decl.value.includes("in srgb")) {
      decl.value = decl.value.replace(/\s+in\s+oklab/gi, "").replace(/\s+in\s+srgb/gi, "");
    }

    // 2. Transpile OKLCH into standard RGB/RGBA for legacy browsers (Chrome 109 / Windows 7)
    if (decl.value.includes("oklch(")) {
      decl.value = convertOklchInString(decl.value);
    }

    // 3. Fallbacks for color-mix()
    if (decl.value.includes("color-mix(")) {
      const fallback = resolveColorMixFallback(decl.value);
      if (fallback) {
        decl.cloneBefore({ value: fallback });
      } else {
        const varMatch = decl.value.match(/var\((--color-[a-zA-Z0-9-]+)\)/);
        if (varMatch) {
          decl.cloneBefore({ value: `var(${varMatch[1]})` });
        } else if (decl.value.includes("#fff")) {
          decl.cloneBefore({ value: "rgba(255, 255, 255, 0.9)" });
        } else if (decl.value.includes("#000")) {
          decl.cloneBefore({ value: "rgba(0, 0, 0, 0.8)" });
        }
      }
    }
  },
});
legacyCompatPlugin.postcss = true;

const config = {
  plugins: [
    "@tailwindcss/postcss",
    legacyCompatPlugin(),
  ],
};

export default config;
