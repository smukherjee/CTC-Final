import { useEffect, useState } from 'react';
import axios from 'axios';
import { Vehicle } from '@/types';

export default function VehicleMaster() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/vehicle/')
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) setVehicles(data);
        else if ((data as any).results) setVehicles((data as any).results);
        else {
          console.warn('Unexpected vehicle response shape:', data);
          setVehicles([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load vehicles:', err);
        setVehicles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Vehicle Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{v.number}</td>
                <td>{v.type}</td>
                <td>{v.capacity}</td>
                <td>{v.owner_id}</td>
                <td>{v.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
