import { useEffect, useState } from "react";
import axios from "axios";

export interface City {
  id: number;
  name: string;
  state?: string;
  code?: string;
}

export default function CityMaster() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/city/")
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setCities(data);
        } else if (data && Array.isArray((data as any).results)) {
          setCities((data as any).results);
        } else {
          console.warn("Unexpected city response shape:", data);
          setCities([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load cities:", err);
        setCities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Cities Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left px-2">ID</th>
              <th className="text-left px-2">Name</th>
              <th className="text-left px-2">State</th>
              <th className="text-left px-2">Code</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.id}>
                <td className="px-2">{c.id}</td>
                <td className="px-2">{c.name}</td>
                <td className="px-2">{c.state}</td>
                <td className="px-2">{c.code}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
