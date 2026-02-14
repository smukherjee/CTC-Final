import { useEffect, useState } from 'react';
import axios from 'axios';
import { Template } from '@/types';

export default function TemplateMaster() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('/api/template/')
      .then((r) => {
        const data = r.data;
        if (Array.isArray(data)) setTemplates(data);
        else if ((data as any).results) setTemplates((data as any).results);
        else {
          console.warn('Unexpected template response shape:', data);
          setTemplates([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load templates:', err);
        setTemplates([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2>Document Template Master</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>File</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.name}</td>
                <td>{t.description}</td>
                <td>{t.file_url ? (<a href={t.file_url} target="_blank" rel="noreferrer">View</a>) : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
