import { useEffect, useState, useRef, useCallback } from "react";

export default function useLocalStorageState<T>(
  key: string,
  defaultValue: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>, boolean] {
  const [loading, setLoading] = useState<boolean>(true);
  const storedValueRef = useRef<T>();
  const defaultValueRef = useRef(defaultValue);

  const [state, setState] = useState<T>(() => {
    const valueInStorage = window.localStorage.getItem(key);
    if (valueInStorage !== null) {
      return JSON.parse(valueInStorage) as T;
    }
    return typeof defaultValue === "function"
      ? (defaultValue as Function)()
      : defaultValue;
  });

  const changeState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (value: React.SetStateAction<T>) => {
      const newState =
        typeof value === "function" ? (value as Function)(state) : value;

      if (
        !storedValueRef.current ||
        !deepEqual(newState, storedValueRef.current)
      ) {
        setLoading(true);
        chrome.storage.local.set({ [key]: newState }, () => {
          storedValueRef.current = newState;
          setState(newState);
          setLoading(false);
        });
      }
    },
    [state, key]
  );

  useEffect(() => {
    storedValueRef.current = state;
  }, [state]);

  useEffect(() => {
    chrome.storage.local.get([key], (result) => {
      const value =
        result[key] !== undefined ? result[key] : defaultValueRef.current;
      setState(value as T);
      storedValueRef.current = value as T;
      setLoading(false);
    });
  }, [key]);

  return [state, changeState, loading];
}

function isObject(object: any): object is Record<string, any> {
  return object != null && typeof object === "object";
}

function deepEqual(
  object1: Record<string, any>,
  object2: Record<string, any>
): boolean {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      (areObjects && !deepEqual(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}
