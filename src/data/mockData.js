/**
 * Chart series datasets for Recharts visualizations
 */

export const mockWeeklyAttendanceChart = [
  { day: 'Mon', verified: 180, flagged: 5, absent: 22 },
  { day: 'Tue', verified: 210, flagged: 8, absent: 15 },
  { day: 'Wed', verified: 245, flagged: 6, absent: 19 },
  { day: 'Thu', verified: 195, flagged: 4, absent: 25 },
  { day: 'Fri', verified: 260, flagged: 9, absent: 14 },
  { day: 'Sat', verified: 75, flagged: 2, absent: 8 },
  { day: 'Sun', verified: 40, flagged: 1, absent: 5 },
];

export const mockHourlyArrivalPattern = [
  { time: '09:45', count: 12 },
  { time: '09:50', count: 28 },
  { time: '09:55', count: 64 },
  { time: '10:00', count: 85 },
  { time: '10:05', count: 32 },
  { time: '10:10', count: 14 },
  { time: '10:15', count: 5 },
];

export const mockDepartmentDistribution = [
  { name: 'Computer Science', students: 340, color: '#6366F1' },
  { name: 'Electrical Eng', students: 210, color: '#8B5CF6' },
  { name: 'Data Science & Stats', students: 165, color: '#EC4899' },
  { name: 'Mechanical Eng', students: 120, color: '#F59E0B' },
  { name: 'Bioengineering', students: 95, color: '#10B981' },
];

export const mockVerificationMethodBreakdown = [
  { name: 'Geofence + Dynamic QR', value: 88, color: '#10B981' },
  { name: 'Manual Organizer Approval', value: 8, color: '#6366F1' },
  { name: 'Flagged / Distance Warning', value: 4, color: '#F43F5E' },
];
