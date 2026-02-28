import React from "react";
import FadeInUp from "./FadeInUp";

export default function Stagger({
  children,
  baseDelay = 80,
  step = 80,
}: {
  children: React.ReactNode;
  baseDelay?: number;
  step?: number;
}) {
  const items = React.Children.toArray(children);
  return (
    <>
      {items.map((child, idx) => (
        <FadeInUp key={idx} delay={baseDelay + idx * step} distance={12}>
          {child}
        </FadeInUp>
      ))}
    </>
  );
}
