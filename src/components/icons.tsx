import type { SVGProps } from "react";

export function BookOpenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M12 6.5c-2.3-1.6-6.5-1.6-9 0V20c2.5-1.6 6.7-1.6 9 0"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6.5c2.3-1.6 6.5-1.6 9 0V20c-2.5-1.6-6.7-1.6-9 0"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6v14"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        strokeWidth="1.7"
      />
      <path d="M21 21l-4.2-4.2" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path d="M18 6 6 18" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6 6l12 12" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

