export function toKey(date) {
  return date.toISOString().split('T')[0];
}

export function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a, b) {
  return stripTime(a).getTime() === stripTime(b).getTime();
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Finds the start date of the most recent consecutive period cluster
export function getMostRecentPeriodStart(loggedPeriods) {
  if (!loggedPeriods.length) return null;
  const sorted = [...loggedPeriods].map(k => new Date(k)).sort((a, b) => b - a);
  let clusterStart = sorted[0];
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = (sorted[i] - sorted[i + 1]) / 86400000;
    if (diff === 1) clusterStart = sorted[i + 1];
    else break;
  }
  return clusterStart;
}

export function getDayInfo(date, loggedPeriods, cycleLength) {
  const key = toKey(stripTime(date));
  const isPeriod = loggedPeriods.includes(key);
  const periodStart = getMostRecentPeriodStart(loggedPeriods);

  let phase = 'unknown';
  let isFertile = false;
  let isOvulation = false;
  let cycleDay = null;

  if (periodStart) {
    const msPerDay = 86400000;
    const diffDays = Math.floor((stripTime(date) - stripTime(periodStart)) / msPerDay);
    cycleDay = (((diffDays % cycleLength) + cycleLength) % cycleLength) + 1;

    const ovulationDay = cycleLength - 14;
    const fertileStart = ovulationDay - 4;
    const fertileEnd = ovulationDay + 1;

    isFertile = cycleDay >= fertileStart && cycleDay <= fertileEnd;
    isOvulation = cycleDay === ovulationDay;

    if (isPeriod) phase = 'period';
    else if (isFertile) phase = 'fertile';
    else if (cycleDay > fertileEnd) phase = 'luteal';
    else phase = 'follicular';
  } else if (isPeriod) {
    phase = 'period';
  }

  return { cycleDay, phase, isPeriod, isFertile, isOvulation, isToday: isSameDay(date, new Date()) };
}

// Clusters raw logged period-day keys into distinct period START dates.
// loggedPeriods is a flat array of every logged day (e.g. 5 consecutive
// days show up as 5 separate keys) — this collapses each run into one
// start date so cycle length can be measured start-to-start.
function getPeriodStartDates(loggedPeriods) {
  if (!loggedPeriods.length) return [];
  const sortedAsc = [...loggedPeriods].map(k => new Date(k)).sort((a, b) => a - b);
  const starts = [];
  let prev = null;
  sortedAsc.forEach((d) => {
    if (!prev || (d - prev) / 86400000 > 1) {
      starts.push(d);
    }
    prev = d;
  });
  return starts;
}

// Predicts the next period start, ovulation date, and fertile window
// based on cycle lengths observed over the last `monthsBack` months
// (default 5). Falls back to `fallbackCycleLength` when there isn't
// enough logged history yet to compute a real average. Also returns
// `history`, a chronological list of each observed cycle length paired
// with the date that cycle ended on — meant for charting, not just display.
export function getCyclePredictions(loggedPeriods, fallbackCycleLength = 28, monthsBack = 5) {
  const periodStarts = getPeriodStartDates(loggedPeriods);

  if (periodStarts.length < 2) {
    return {
      avgCycleLength: fallbackCycleLength,
      shortestCycle: null,
      longestCycle: null,
      cyclesUsed: 0,
      history: [],
      predictedNextPeriodStart: null,
      predictedOvulationDate: null,
      predictedFertileStart: null,
      predictedFertileEnd: null,
      hasEnoughData: false,
    };
  }

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - monthsBack);

  // Gap between each pair of consecutive starts = one observed cycle length,
  // tagged with the later start date (when that cycle "ended").
  const allPairs = [];
  for (let i = 1; i < periodStarts.length; i++) {
    const diff = Math.round((periodStarts[i] - periodStarts[i - 1]) / 86400000);
    if (diff > 0) {
      allPairs.push({ length: diff, endDate: periodStarts[i] });
    }
  }

  let usablePairs = allPairs.filter((p) => p.endDate >= cutoff);
  // If nothing falls inside the window (sparse logging), fall back to
  // the most recent cycles available so there's still something to show.
  if (!usablePairs.length) {
    usablePairs = allPairs.slice(-5);
  }

  const usableLengths = usablePairs.map((p) => p.length);
  const avgCycleLength = Math.round(
    usableLengths.reduce((sum, n) => sum + n, 0) / usableLengths.length
  );

  const lastPeriodStart = periodStarts[periodStarts.length - 1];
  const predictedNextPeriodStart = addDays(lastPeriodStart, avgCycleLength);

  const ovulationOffset = avgCycleLength - 14;
  const predictedOvulationDate = addDays(lastPeriodStart, ovulationOffset);
  const predictedFertileStart = addDays(predictedOvulationDate, -4);
  const predictedFertileEnd = addDays(predictedOvulationDate, 1);

  return {
    avgCycleLength,
    shortestCycle: Math.min(...usableLengths),
    longestCycle: Math.max(...usableLengths),
    cyclesUsed: usableLengths.length,
    history: usablePairs,
    predictedNextPeriodStart,
    predictedOvulationDate,
    predictedFertileStart,
    predictedFertileEnd,
    hasEnoughData: true,
  };
}