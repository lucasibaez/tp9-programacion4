import { useEffect } from "react";
import type { RefObject } from "react";

export default function useFiltroFocus(
  ref: RefObject<HTMLInputElement | null>
) {

  useEffect(() => {

    const handleKeyDown = (
      e: KeyboardEvent
    ) => {

      if (e.ctrlKey && e.key === "b") {

        e.preventDefault();

        ref.current?.focus();

      }

    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [ref]);

}