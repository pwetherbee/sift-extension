import { useEffect, useState, useRef } from "react";

export default function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);

  const storedValueRef = useRef<T>();

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      setState(result[key] !== undefined ? result[key] : defaultValue);
      storedValueRef.current =
        result[key] !== undefined ? result[key] : defaultValue;
    });
  }, [key]);

  useEffect(() => {
    if (JSON.stringify(state) !== JSON.stringify(storedValueRef.current)) {
      chrome.storage.local.set({ [key]: state }, () => {
        storedValueRef.current = state;
      });
    }
  }, [key, state]);

  return [state, setState];
}
