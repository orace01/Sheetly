"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <Reveal key={item.question} delay={i * 60}>
            <div
              style={{
                borderTop: "1px solid var(--line)",
                borderBottom: i === items.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${i}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  padding: "1.375rem 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "var(--text-hi)",
                }}
              >
                <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{item.question}</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--lime)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    flexShrink: 0,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 300ms var(--ease-out-quint)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                id={`faq-answer-${i}`}
                style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 300ms var(--ease-out-quint)",
                }}
              >
                <div style={{ overflow: "hidden" }}>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-hi-mid)",
                      lineHeight: 1.6,
                      margin: 0,
                      paddingBottom: "1.375rem",
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
