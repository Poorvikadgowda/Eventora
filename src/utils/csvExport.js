/**
 * Normalized CSV export and import helpers
 */

export const exportAttendeesToCSV = (attendees, eventName = 'AutoEvent') => {
  if (!attendees || attendees.length === 0) return;

  const headers = [
    'Attendee ID',
    'Full Name',
    'Email',
    'Phone',
    'Organization',
    'Job Title',
    'Tier',
    'Track',
    'Registration Date',
    'Verified',
    'Checked In',
    'Check-In Time',
    'Last Checked-in Session',
    'Feedback Submitted',
    'Rating (1-5)',
    'NPS Score (0-10)',
    'Feedback Comments',
    'Certificate Generated',
    'Certificate ID',
    'Certificate Hash'
  ];

  const escapeField = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = attendees.map(a => [
    escapeField(a.id),
    escapeField(a.name),
    escapeField(a.email),
    escapeField(a.phone),
    escapeField(a.organization),
    escapeField(a.jobTitle),
    escapeField(a.tier),
    escapeField(a.track),
    escapeField(a.registeredAt ? new Date(a.registeredAt).toLocaleString() : ''),
    escapeField(a.verified ? 'Yes' : 'No'),
    escapeField(a.checkedIn ? 'Yes' : 'No'),
    escapeField(a.checkedInAt ? new Date(a.checkedInAt).toLocaleString() : 'N/A'),
    escapeField(a.checkedInSession || 'N/A'),
    escapeField(a.feedbackSubmitted ? 'Yes' : 'No'),
    escapeField(a.feedback?.rating || 'N/A'),
    escapeField(a.feedback?.npsScore || 'N/A'),
    escapeField(a.feedback?.comments || ''),
    escapeField(a.certificateGenerated ? 'Yes' : 'No'),
    escapeField(a.certificateId || 'N/A'),
    escapeField(a.certificateHash || 'N/A')
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${eventName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Regex to parse comma separated values handling quotes
    const values = [];
    let match;
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    
    // Simpler split if no quotes or robust match
    const rowCells = rawLine.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    if (rowCells.length > 0 && rowCells[0]) {
      const rowObj = {};
      header.forEach((key, idx) => {
        rowObj[key] = rowCells[idx] || '';
      });
      results.push(rowObj);
    }
  }

  return results;
};
