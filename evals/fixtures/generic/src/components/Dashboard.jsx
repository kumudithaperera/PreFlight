import { useEffect, useState } from "react";

export function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/dashboard-data")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return null;
  return <div>{JSON.stringify(data)}</div>;
}
