export function getRuLocaleDate(date?: string) {
  if (typeof date !== 'string') {
    return new Date().toLocaleString('ru-RU');
  }
  return new Date(date).toLocaleString('ru-RU');
}
