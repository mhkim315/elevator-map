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

    async function load() {
      try {
        setProgress(0);
        const resp = await fetch(DATA_URL);

        if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);

        const reader = resp.body?.getReader();
        if (!reader) throw new Error('Response body is not readable');

        const contentLength = parseInt(resp.headers.get('Content-Length') || '0');
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (contentLength > 0) {
            setProgress(Math.round((receivedLength / contentLength) * 80));
          }
        }

        setProgress(85);

        // Combine chunks and decode
        const allBytes = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          allBytes.set(chunk, position);
          position += chunk.length;
        }

        const text = new TextDecoder('utf-8').decode(allBytes);
        setProgress(95);

        const parsed: ElevatorDataset = JSON.parse(text);
        setProgress(100);

        if (!cancelled) {
          setData(parsed);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '데이터 로드 실패');
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, progress };
}
