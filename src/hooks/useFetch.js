import { useEffect, useState } from 'react';
import axios from 'axios';

export const useFetch = (url) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    axios.get(url)
      .then((response) => {
        if (!cancelled) setState({ data: response.data, loading: false, error: null });
      })
      .catch((error) => {
        console.error('데이터 요청 실패:', error);
        if (!cancelled) setState((prev) => ({ ...prev, loading: false, error }));
      });
    return () => { cancelled = true; };
  }, [url, attempt]);

  return { ...state, retry: () => setAttempt((a) => a + 1) };
};
