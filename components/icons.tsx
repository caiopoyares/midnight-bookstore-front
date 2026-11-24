export function Icon({
  name,
  size = 20,
}: {
  name: 'search' | 'bag' | 'filter' | 'close' | 'book' | 'moon';
  size?: number;
}) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    bag: (
      <>
        <path d="M4 8h16l1 13H3L4 8Z" />
        <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      </>
    ),
    filter: (
      <>
        <path d="M3 7h10m4 0h4M3 17h4m4 0h10" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    close: <path d="m5 5 14 14M19 5 5 19" />,
    book: (
      <>
        <path d="M2 6c4-1 8 0 10 3 3-3 7-4 10-3v12c-4-1-7 0-10 3-3-3-6-4-10-3Z" />
        <path d="M12 9v12" />
      </>
    ),
    moon: <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4a8.5 8.5 0 1 0 11.5 11.5Z" />,
  };
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brandmark" aria-hidden="true">
        <svg viewBox="0 0 42 38" fill="none">
          <path
            d="M3 10c9 0 13 3 18 8 4-6 10-10 18-11l-4 16-14 9L7 25Z"
            fill="currentColor"
          />
          <path
            d="m8 15 12 7m-10-2 10 6m4-5 10-9m-10 14 8-7"
            stroke="#171615"
            strokeWidth="1.6"
          />
          <path
            d="M17 11a7 7 0 0 1 9-8 6 6 0 0 0 0 9c-4 2-7 1-9-1Z"
            fill="currentColor"
          />
        </svg>
      </span>
      Nightjar <em>Books</em>
    </span>
  );
}
