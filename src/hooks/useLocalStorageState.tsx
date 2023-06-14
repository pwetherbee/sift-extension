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

  const changeState: React.Dispatch<React.SetStateAction<T>> = (
    value: React.SetStateAction<T>
  ) => {
    const newState =
      typeof value === "function" ? (value as Function)(state) : value;

    if (JSON.stringify(newState) !== JSON.stringify(storedValueRef.current)) {
      chrome.storage.local.set({ [key]: newState }, () => {
        storedValueRef.current = newState;
        setState(newState);
      });
    }
  };

  return [state, changeState];
}
