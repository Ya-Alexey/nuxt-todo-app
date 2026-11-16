export function getRuLocaleDate(date?: string) {
  const parsedDate = typeof date === 'string' ? new Date(date) : new Date();
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toLocaleString('ru-RU');
  }
  return parsedDate.toLocaleString('ru-RU');
}
