/**
 * Formatting & UI helper functions
 */

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timeString) {
  if (!timeString) return '';
  if (timeString.includes(':') && timeString.length <= 8 && !timeString.includes('T')) {
    return timeString;
  }
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  return `${formatDate(dateTimeString)} at ${formatTime(dateTimeString)}`;
}

export function getStatusBadgeProps(status) {
  switch (status) {
    case 'VERIFIED':
    case 'Verified':
    case 'Active':
    case 'ACTIVE':
    case 'Present':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Verified',
      };
    case 'FLAGGED_DISTANCE':
    case 'Flagged':
    case 'Out of Bounds':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Flagged (Out of Range)',
      };
    case 'PENDING_LOCATION':
    case 'Pending':
    case 'Upcoming':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Pending GPS',
      };
    case 'ABSENT':
    case 'Absent':
    case 'Completed':
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status === 'Completed' ? 'Completed' : 'Absent',
      };
    default:
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: status || 'Unknown',
      };
  }
}

/**
 * Trigger mock CSV download in the browser
 */
export function exportToCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] === null || row[header] === undefined ? '' : String(row[header]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
