export function ShipmentBadge({ shipment }) {
  const d = new Date(shipment.shippedAt);
  const formatted = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  return <span>Shipped {formatted}</span>;
}
