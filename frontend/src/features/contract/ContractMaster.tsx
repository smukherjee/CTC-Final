import { useEffect, useState } from 'react';
import axios from 'axios';
import type { Contract } from '@/types';

export default function ContractMaster() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/contract/')
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) setContracts(data);
        else if ((data as any).results) setContracts((data as any).results);
        else {
          console.warn('Unexpected contract response shape:', data);
          setContracts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load contracts:', err);
        setContracts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Contract Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Party</th>
              <th>Start</th>
              <th>End</th>
              <th>Expiry Alert (days)</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.party_id}</td>
                <td>{c.start_date}</td>
                <td>{c.end_date}</td>
                <td>{c.expiry_alert_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
