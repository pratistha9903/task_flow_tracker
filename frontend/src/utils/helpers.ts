export function statusLabel(status: string) {
  return status.replace('_', ' ');
}

export function statusClass(status: string) {
  if (status === 'DONE') return 'status-done';
  if (status === 'IN_PROGRESS') return 'status-progress';
  return 'status-todo';
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
