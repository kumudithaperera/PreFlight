export function InvoiceRow({ invoice }) {
  const d = new Date(invoice.date);
  const formatted = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return <tr><td>{invoice.number}</td><td>{formatted}</td></tr>;
}
