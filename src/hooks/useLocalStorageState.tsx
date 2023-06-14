import { useEffect, useState, useRef } from "react";

export default function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const storedValueRef = useRef<T>();

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      const value = result[key] !== undefined ? result[key] : defaultValue;
      setState(value);
      storedValueRef.current = value;
      setLoading(false);
    });
  }, [key, defaultValue]);

  const changeState: React.Dispatch<React.SetStateAction<T>> = (
    value: React.SetStateAction<T>
  ) => {
    const newState =
      typeof value === "function" ? (value as Function)(state) : value;

    if (JSON.stringify(newState) !== JSON.stringify(storedValueRef.current)) {
      setLoading(true);
      chrome.storage.local.set({ [key]: newState }, () => {
        storedValueRef.current = newState;
        setState(newState);
        setLoading(false);
      });
    }
  };

  return [state, changeState, loading];
}
