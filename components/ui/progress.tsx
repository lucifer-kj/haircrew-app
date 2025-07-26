import React from "react";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, className = "" }) => {
  return (
    <div
      className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}; 