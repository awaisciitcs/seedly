/** Quote spreadsheet cells and neutralize formula prefixes in untrusted customer fields. */
export function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function csvDocument(rows: unknown[][]): string { return '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'); }
