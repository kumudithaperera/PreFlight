export function OrderCard({ order }) {
  const d = new Date(order.createdAt);
  const formatted = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return <div>{order.item} - {formatted}</div>;
}
