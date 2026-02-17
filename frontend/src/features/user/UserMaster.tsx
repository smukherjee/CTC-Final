import { useEffect, useState } from 'react';
import axios from 'axios';
import type { User } from '@/types';

export default function UserMaster() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/user/')
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) setUsers(data);
        else if ((data as any).results) setUsers((data as any).results);
        else {
          console.warn('Unexpected user response shape:', data);
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load users:', err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>User Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Branch</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
                <td>{u.branch_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
