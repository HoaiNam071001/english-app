import { useCallback } from "react";

const useLocalStorage = () => {
  const getStorage = useCallback((key: string) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const setStorage = useCallback((key: string, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const hasValue = useCallback((key: string) => {
    return window.localStorage.getItem(key) !== null;
  }, []);

  const removeStorage = useCallback((key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return { getStorage, setStorage, hasValue, removeStorage };
};

export default useLocalStorage;
