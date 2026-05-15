import { useState, useEffect } from 'react';
import { ElevatorDataset } from '../types';

const DATA_URL = '/elevator-map/data/elevators.json';

interface UseElevatorDataResult {
  data: ElevatorDataset | null;
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useElevatorData(): UseElevatorDataResult {
  const [data, setData] = useState<ElevatorDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', DATA_URL, true);
    xhr.responseType = 'text';

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 80));
      } else {
        // Content-Length 없으면 청크 수로 대략적 표시
        setProgress(Math.min(79, Math.floor(e.loaded / 500000)));
      }
    };

    xhr.onload = () => {
      if (cancelled) return;
      if (xhr.status !== 200) {
        setError(`HTTP ${xhr.status}: ${xhr.statusText}`);
        setLoading(false);
        return;
      }
      setProgress(85);
      try {
        setProgress(90);
        const parsed: ElevatorDataset = JSON.parse(xhr.responseText);
        setProgress(100);
        setData(parsed);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'JSON 파싱 실패');
        setLoading(false);
      }
    };

    xhr.onerror = () => {
      if (!cancelled) {
        setError('네트워크 오류');
        setLoading(false);
      }
    };

    xhr.send();
    return () => { cancelled = true; xhr.abort(); };
  }, []);

  return { data, loading, error, progress };
}
