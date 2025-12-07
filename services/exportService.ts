import { CaseData } from '../types';

export const exportToJson = (data: CaseData) => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.id}_full_dump.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToCsv = (data: CaseData) => {
  const headers = ['Timestamp', 'Kind', 'Source/From/Lat/File', 'Target/To/Lng/Size', 'Content/Duration/Label/Type', 'Metadata/App/Type/Mime'];
  
  const rows: string[][] = [];

  // Calls
  data.calls.forEach(c => {
    rows.push([
      c.timestamp,
      'CALL',
      c.from,
      c.to,
      `${c.duration}s`,
      c.type
    ]);
  });

  // Messages
  data.messages.forEach(m => {
    rows.push([
      m.timestamp,
      'MESSAGE',
      m.from,
      m.to,
      m.content,
      m.app
    ]);
  });

  // Locations
  data.locations.forEach(l => {
    rows.push([
      l.timestamp,
      'LOCATION',
      l.lat.toString(),
      l.lng.toString(),
      l.label,
      ''
    ]);
  });

  // Media
  if (data.media) {
    data.media.forEach(m => {
      rows.push([
        m.timestamp,
        'MEDIA',
        m.fileName,
        m.size,
        m.type.toUpperCase(),
        m.mimeType || ''
      ]);
    });
  }

  // Sort by timestamp
  rows.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  // Escape function for CSV
  const escapeCsv = (str: string) => {
    if (str === null || str === undefined) return '';
    const stringValue = String(str);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.id}_timeline.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};