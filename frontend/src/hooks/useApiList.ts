import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

interface UseApiListOptions<T> {
  endpoint: string;
  mapItem?: (item: any) => T;
  initialLoading?: boolean;
}

function extractList<T>(data: any): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && Array.isArray(data.results)) return data.results as T[];
  return [];
}

export function useApiList<T>({
  endpoint,
  mapItem,
  initialLoading = true,
}: UseApiListOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(endpoint);
      const list = extractList<any>(res.data);
      setData(mapItem ? list.map(mapItem) : list);
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, mapItem]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, setData, loading, error, refetch };
}

