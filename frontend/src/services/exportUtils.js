// Utilities to export table data as CSV or open print dialog for PDF
export function downloadCSV(filename, headers, rows) {
  const esc = (s) => String(s ?? '').replace(/"/g, '""');
  const csvRows = [];
  if (headers && headers.length) {
    csvRows.push(headers.map((h) => `"${esc(h)}"`).join(','));
  }
  for (const row of rows) {
    const values = headers.map((h) => `"${esc(row[h] ?? '')}"`);
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function openPrintPreview(title, htmlTable) {
  const style = `
    <style>
      body { font-family: Arial, Helvetica, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #ddd; padding: 8px; }
      th { background: #f3f4f6; }
    </style>`;

  const newWindow = window.open('', '_blank');
  if (!newWindow) {
    alert('No se pudo abrir la ventana de impresión. Revisa el bloqueador de ventanas.');
    return;
  }
  newWindow.document.write(`<html><head><title>${title}</title>${style}</head><body><h2>${title}</h2>${htmlTable}</body></html>`);
  newWindow.document.close();
  // Give browser a moment to render then trigger print
  setTimeout(() => {
    newWindow.focus();
    newWindow.print();
  }, 500);
}

export function buildHtmlTable(headers, rows) {
  const ths = headers.map((h) => `<th>${h}</th>`).join('');
  const trs = rows
    .map(
      (r) =>
        `<tr>${headers.map((h) => `<td>${String(r[h] ?? '')}</td>`).join('')}</tr>`
    )
    .join('');
  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

export default { downloadCSV, openPrintPreview, buildHtmlTable };
