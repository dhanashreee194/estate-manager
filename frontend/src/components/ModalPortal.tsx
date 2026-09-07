import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
};

/**
 * Renders dialogs on document.body so dashboard overflow/transform
 * cannot clip them. Also locks page scroll while open.
 */
export default function ModalPortal({ children }: Props) {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return createPortal(children, document.body);
}
