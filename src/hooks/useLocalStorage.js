import { useCallback, useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  const update = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // 저장소를 쓸 수 없어도 화면 동작에는 영향이 없다.
      }
      return resolved;
    });
  }, [key]);

  return [value, update];
};
