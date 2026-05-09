import React from "react";
import "./headerActionButton.css";

type Props = {
  variant: "primary" | "outline";
  children: React.ReactNode;
  onClick?: () => void;
};

export default function HeaderActionButton({
  variant,
  children,
  onClick,
}: Props) {
  return (
    <div className="header-action-wrapper">
      <button
        className={`header-action-btn ${variant}`}
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
    </div>
  );
}
