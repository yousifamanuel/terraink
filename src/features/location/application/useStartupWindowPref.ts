import { useCallback, useState } from "react";
import {
  loadStartupWindowHidden,
  saveStartupWindowHidden,
} from "@/core/services";

/** The "Don't show again" choice for the startup location window. */
export function useStartupWindowPref() {
  const [hidden, setHiddenState] = useState(loadStartupWindowHidden);

  const setHidden = useCallback((value: boolean) => {
    saveStartupWindowHidden(value);
    setHiddenState(value);
  }, []);

  return { hidden, setHidden };
}
