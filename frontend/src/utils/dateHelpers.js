import { format, parse, addDays, startOfWeek, endOfWeek } from 'date-fns';

// Format date to DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy');
};

// Format time to 24h HH:mm
export const formatTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'HH:mm');
};

// Format datetime for input fields
export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
};

// Parse DD/MM/YYYY to Date
export const parseDate = (dateString) => {
  if (!dateString) return null;
  return parse(dateString, 'dd/MM/yyyy', new Date());
};

// Parse HH:mm to time
export const parseTime = (timeString) => {
  if (!timeString) return null;
  return parse(timeString, 'HH:mm', new Date());
};

// Get week start (Monday)
export const getWeekStart = (date = new Date()) => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

// Get week end (Sunday)
export const getWeekEnd = (date = new Date()) => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

// Calculate hours between two times
export const calculateHours = (startTime, endTime, breakMinutes = 0) => {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const diffMs = end - start;
  const diffMinutes = diffMs / (1000 * 60);
  const totalMinutes = diffMinutes - breakMinutes;
  const totalHours = totalMinutes / 60;
  
  // Round to nearest 0.25 (15 minutes)
  return Math.round(totalHours * 4) / 4;
};

// Format hours to display (e.g., 8.5h)
export const formatHours = (hours) => {
  if (!hours && hours !== 0) return '0.00h';
  return `${hours.toFixed(2)}h`;
};

// Get current date/time for inputs
export const getCurrentDateTime = () => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
};

export const getCurrentDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentTime = () => {
  return format(new Date(), 'HH:mm');
};
