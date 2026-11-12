export const USER_COLOR_BASE = "#2563EB";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function hashUserId(userId: string | number): number {
  const value = String(userId);
  let hash = FNV_OFFSET_BASIS;

  const hashByte = (byte: number) => {
    hash = Math.imul(hash ^ byte, FNV_PRIME) >>> 0;
  };

  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);

    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff) {
        codePoint =
          0x10000 + ((codePoint - 0xd800) << 10) + (nextCodeUnit - 0xdc00);
        index += 1;
      } else {
        codePoint = 0xfffd;
      }
    } else if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
      codePoint = 0xfffd;
    }

    if (codePoint <= 0x7f) {
      hashByte(codePoint);
    } else if (codePoint <= 0x7ff) {
      hashByte(0xc0 | (codePoint >> 6));
      hashByte(0x80 | (codePoint & 0x3f));
    } else if (codePoint <= 0xffff) {
      hashByte(0xe0 | (codePoint >> 12));
      hashByte(0x80 | ((codePoint >> 6) & 0x3f));
      hashByte(0x80 | (codePoint & 0x3f));
    } else {
      hashByte(0xf0 | (codePoint >> 18));
      hashByte(0x80 | ((codePoint >> 12) & 0x3f));
      hashByte(0x80 | ((codePoint >> 6) & 0x3f));
      hashByte(0x80 | (codePoint & 0x3f));
    }
  }

  return hash;
}

function getHueFromHex(color: string): number {
  const red = Number.parseInt(color.slice(1, 3), 16) / 255;
  const green = Number.parseInt(color.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(color.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;

  if (delta === 0) {
    return 0;
  }

  let hue: number;
  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return ((hue * 60) % 360 + 360) % 360;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSegment = hue / 60;
  const secondary = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  const lightnessOffset = lightness - chroma / 2;

  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSegment < 1) {
    red = chroma;
    green = secondary;
  } else if (hueSegment < 2) {
    red = secondary;
    green = chroma;
  } else if (hueSegment < 3) {
    green = chroma;
    blue = secondary;
  } else if (hueSegment < 4) {
    green = secondary;
    blue = chroma;
  } else if (hueSegment < 5) {
    red = secondary;
    blue = chroma;
  } else {
    red = chroma;
    blue = secondary;
  }

  const toHex = (channel: number) =>
    Math.round((channel + lightnessOffset) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

export const UserColorGenerator = {
  generate(userId: string | number): string {
    const hash = hashUserId(userId);
    const baseHue = getHueFromHex(USER_COLOR_BASE);
    const hueOffset = (hash % 81) - 40;
    const saturation = 0.7 + ((hash >>> 8) % 7) / 100;
    const lightness = 0.27 + ((hash >>> 16) % 3) / 100;

    return hslToHex(
      (baseHue + hueOffset + 360) % 360,
      saturation,
      lightness,
    );
  },
};
