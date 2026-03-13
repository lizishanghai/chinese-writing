export interface StrokeClassification {
  name: string;
  pinyin: string;
}

// Median points use Y-UP math coordinates (higher y = higher on screen).
// We negate dy to convert to visual (y-down) for direction classification.

interface Segment {
  dx: number;
  dy: number; // visual dy (y-down): positive = visually downward
  length: number;
}

function getSegments(medians: number[][]): Segment[] {
  if (medians.length < 3) {
    const dx = medians[medians.length - 1][0] - medians[0][0];
    const dy = -(medians[medians.length - 1][1] - medians[0][1]);
    return [{ dx, dy, length: Math.sqrt(dx * dx + dy * dy) }];
  }

  const segments: Segment[] = [];
  let segStart = 0;

  // Get angle in visual (y-down) coordinates between two median points
  function getAngle(fromIdx: number, toIdx: number): number {
    const dx = medians[toIdx][0] - medians[fromIdx][0];
    const dy = -(medians[toIdx][1] - medians[fromIdx][1]);
    return Math.atan2(dy, dx);
  }

  // Reference angle: direction at the start of the current segment
  let refAngle = getAngle(0, Math.min(2, medians.length - 1));

  for (let i = 2; i < medians.length; i++) {
    // Compare current local direction against the segment's reference direction
    const lookback = Math.max(segStart, i - 2);
    const curAngle = getAngle(lookback, i);

    let diff = curAngle - refAngle;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    if (Math.abs(diff) > Math.PI / 3.5) {
      // Cut at i-1
      const dx = medians[i - 1][0] - medians[segStart][0];
      const dy = -(medians[i - 1][1] - medians[segStart][1]);
      segments.push({ dx, dy, length: Math.sqrt(dx * dx + dy * dy) });
      segStart = i - 1;
      refAngle = getAngle(segStart, Math.min(segStart + 2, medians.length - 1));
    }
  }

  // Final segment
  const dx = medians[medians.length - 1][0] - medians[segStart][0];
  const dy = -(medians[medians.length - 1][1] - medians[segStart][1]);
  segments.push({ dx, dy, length: Math.sqrt(dx * dx + dy * dy) });

  return segments;
}

type Dir = 'right' | 'down' | 'left' | 'up' | 'down-left' | 'down-right' | 'up-right' | 'up-left';

// dx/dy in visual coordinates (y-down): positive dy = visually downward
function classifyDirection(dx: number, dy: number): Dir {
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angle >= -25 && angle < 25) return 'right';
  if (angle >= 25 && angle < 55) return 'down-right';
  if (angle >= 55 && angle < 100) return 'down';
  if (angle >= 100 && angle < 155) return 'down-left';
  if (angle >= 155 || angle < -155) return 'left';
  if (angle >= -155 && angle < -120) return 'up-left';
  if (angle >= -120 && angle < -55) return 'up';
  if (angle >= -55 && angle < -25) return 'up-right';
  return 'right';
}

function classifyByDirection(dx: number, dy: number): StrokeClassification {
  const dir = classifyDirection(dx, dy);
  switch (dir) {
    case 'right': return { name: '横', pinyin: 'héng' };
    case 'down': return { name: '竖', pinyin: 'shù' };
    case 'down-left': return { name: '撇', pinyin: 'piě' };
    case 'left': return { name: '撇', pinyin: 'piě' };
    case 'down-right': return { name: '捺', pinyin: 'nà' };
    case 'up-right': return { name: '提', pinyin: 'tí' };
    default: return { name: '横', pinyin: 'héng' };
  }
}

// Deduplicate consecutive identical directions (handles over-segmentation)
function dedup(dirs: Dir[]): Dir[] {
  return dirs.filter((d, i) => i === 0 || d !== dirs[i - 1]);
}

export function classifyStroke(medians: number[][]): StrokeClassification {
  if (!medians || medians.length < 2) {
    return { name: '点', pinyin: 'diǎn' };
  }

  const totalDx = medians[medians.length - 1][0] - medians[0][0];
  const totalDy = -(medians[medians.length - 1][1] - medians[0][1]); // visual

  // Compute path length (sum of distances between consecutive points)
  let pathLength = 0;
  for (let i = 1; i < medians.length; i++) {
    const pdx = medians[i][0] - medians[i - 1][0];
    const pdy = medians[i][1] - medians[i - 1][1];
    pathLength += Math.sqrt(pdx * pdx + pdy * pdy);
  }

  // Short stroke: classify as dot, short横, or short提
  if (pathLength < 270) {
    const dir = classifyDirection(totalDx, totalDy);
    if (dir === 'right') return { name: '横', pinyin: 'héng' };
    if (dir === 'up-right') return { name: '提', pinyin: 'tí' };
    return { name: '点', pinyin: 'diǎn' };
  }

  const segments = getSegments(medians);
  const rawDirs = segments.map(s => classifyDirection(s.dx, s.dy));
  const dirs = dedup(rawDirs);
  const lastSeg = segments[segments.length - 1];
  const lastIsShort = lastSeg.length < 180;

  // Single direction (possibly over-segmented but all same direction)
  if (dirs.length === 1) {
    return classifyByDirection(totalDx, totalDy);
  }

  // Two-direction compound strokes
  if (dirs.length === 2) {
    const [d1, d2] = dirs;

    // 横折/横撇/横钩: right + downward
    if (d1 === 'right' && (d2 === 'down' || d2 === 'down-left')) {
      if (d2 === 'down') return { name: '横折', pinyin: 'héng zhé' };
      // d2 === 'down-left': distinguish 横折 (more vertical) vs 横撇 (more diagonal)
      // Use actual angle of second segment to decide
      const lastDirSeg = segments[segments.length - 1];
      const angle = Math.atan2(lastDirSeg.dy, lastDirSeg.dx) * (180 / Math.PI);
      if (lastIsShort) return { name: '横钩', pinyin: 'héng gōu' };
      if (angle >= 115) return { name: '横撇', pinyin: 'héng piě' };
      return { name: '横折', pinyin: 'héng zhé' };
    }
    // 横撇: right + left
    if (d1 === 'right' && d2 === 'left') {
      return { name: '横撇', pinyin: 'héng piě' };
    }
    // 竖钩: down + left/up-left/up hook
    if (d1 === 'down' && (d2 === 'left' || d2 === 'up-left' || d2 === 'up')) {
      return { name: '竖钩', pinyin: 'shù gōu' };
    }
    // 竖折/竖提: down + right
    if (d1 === 'down' && (d2 === 'right' || d2 === 'up-right')) {
      if (lastIsShort) return { name: '竖提', pinyin: 'shù tí' };
      return { name: '竖折', pinyin: 'shù zhé' };
    }
    // 撇点: down-left + down-right/right
    if ((d1 === 'down-left' || d1 === 'left') && (d2 === 'down-right' || d2 === 'right')) {
      return { name: '撇点', pinyin: 'piě diǎn' };
    }
    // 弯钩/斜钩: down-right/down + up
    if ((d1 === 'down-right' || d1 === 'down') && (d2 === 'up' || d2 === 'up-right' || d2 === 'up-left')) {
      if (d1 === 'down-right') return { name: '斜钩', pinyin: 'xié gōu' };
      return { name: '弯钩', pinyin: 'wān gōu' };
    }
    // 撇折: down-left + right
    if (d1 === 'down-left' && d2 === 'right') {
      return { name: '撇折', pinyin: 'piě zhé' };
    }
  }

  // Three+ direction compound strokes
  if (dirs.length >= 3) {
    const [d1, d2, d3] = dirs;

    // 横折钩: right + down + left-hook
    if (d1 === 'right' && (d2 === 'down' || d2 === 'down-left') && (d3 === 'left' || d3 === 'up-left' || d3 === 'down-left')) {
      return { name: '横折钩', pinyin: 'héng zhé gōu' };
    }
    // 横折弯(钩): right + down + right(/up)
    if (d1 === 'right' && (d2 === 'down' || d2 === 'down-left') && (d3 === 'right' || d3 === 'up-right')) {
      if (dirs.length >= 4) return { name: '横折弯钩', pinyin: 'héng zhé wān gōu' };
      return { name: '横折弯', pinyin: 'héng zhé wān' };
    }
    // 竖弯钩: down + right + up
    if (d1 === 'down' && (d2 === 'right' || d2 === 'down-right') && (d3 === 'up' || d3 === 'up-right')) {
      return { name: '竖弯钩', pinyin: 'shù wān gōu' };
    }
    // 横折折: right + down + right
    if (d1 === 'right' && (d2 === 'down' || d2 === 'down-left') && d3 === 'right') {
      return { name: '横折折', pinyin: 'héng zhé zhé' };
    }
    // 横折折撇
    if (dirs.length >= 4 && d1 === 'right' && (d2 === 'down' || d2 === 'down-left') && d3 === 'right') {
      const d4 = dirs[3];
      if (d4 === 'down-left' || d4 === 'left') {
        return { name: '横折折撇', pinyin: 'héng zhé zhé piě' };
      }
    }
  }

  // Fallback: classify by overall direction
  return classifyByDirection(totalDx, totalDy);
}
