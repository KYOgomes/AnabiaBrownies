"use client";

import { useEffect, useRef } from "react";

/** Rola até este ponto quando `value` muda (não no primeiro carregamento). */
export function ScrollOnChange({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(value);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [value]);

  return <div ref={ref} className="scroll-mt-20" />;
}
