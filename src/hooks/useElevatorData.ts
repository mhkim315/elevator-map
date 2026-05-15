import { useState, useEffect } from 'react';
import { ElevatorDataset, RegionsDataset } from '../types';

const DATA_BASE = '/elevator-map/data';

interface UseRegionDataResult {
  data: ElevatorDataset | null;
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useRegionData(regionName: string | null): UseRegionDataResult {
  const [data, setData] = useState<ElevatorDataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!regionName) {
      setData(null);
      setLoading(false);
      setError(null);
      setProgress(0);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setProgress(0);
    setError(null);

    const url = `${DATA_BASE}/${encodeURIComponent(regionName)}.json`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'text';

    xhr.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.min(90, Math.round((e.loaded / e.total) * 90)));
      }
    };

    xhr.onload = () => {
      if (cancelled) return;
      if (xhr.status !== 200) {
        setError(`HTTP ${xhr.status}`);
        setLoading(false);
        return;
      }
      try {
        const parsed: ElevatorDataset = JSON.parse(xhr.responseText);
        setProgress(100);
        setData(parsed);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '파싱 실패');
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
  }, [regionName]);

  return { data, loading, error, progress };
}

export function useRegionsList() {
  const [regions, setRegions] = useState<RegionsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`${DATA_BASE}/regions.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: RegionsDataset) => {
        if (!cancelled) {
          setRegions(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'regions.json 로드 실패');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { regions, loading, error };
}
