// Round hours to nearest 15 minutes (0.25 hours)
export const roundToQuarterHour = (hours) => {
  return Math.round(hours * 4) / 4;
};

// Calculate total hours from start/end times with break
export const calculateTotalHours = (startTime, endTime, breakMinutes = 0) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const diffMs = end - start;
  const diffMinutes = diffMs / (1000 * 60);
  const totalMinutes = diffMinutes - breakMinutes;
  const totalHours = totalMinutes / 60;
  
  return roundToQuarterHour(totalHours);
};

// Validate break minutes
export const isValidBreak = (breakMinutes) => {
  return [0, 15, 30, 60].includes(breakMinutes);
};
