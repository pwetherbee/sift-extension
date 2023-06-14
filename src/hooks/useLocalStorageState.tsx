import { useEffect, useState } from "react";

export default function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    // Fetch the value from chrome storage and update the state
    chrome.storage.local.get([key], (result) => {
      setState(result[key] ?? defaultValue);
    });
  }, [key, defaultValue]);

  useEffect(() => {
    // Whenever state changes, save it to chrome storage
    chrome.storage.local.set({ [key]: state });
  }, [key, state]);

  return [state, setState];
}
