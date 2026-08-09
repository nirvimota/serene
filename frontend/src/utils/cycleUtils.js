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