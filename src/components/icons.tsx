import type { SVGProps } from 'react';

export function BlockVoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
      <path d="m9 12 2 2 4-4" />
      <path d="M16 22.5a4.5 4.5 0 0 0 0-9" />
      <path d="M20.5 18a4.5 4.5 0 0 0-9 0" />
    </svg>
  );
}
