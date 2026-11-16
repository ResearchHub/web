import { Fragment } from 'react';

/** Science text with "E_G" set as E with a subscript G. */
export function Rich({ children }: { children: string }) {
  const parts = children.split('E_G');
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              E<sub className="text-[0.7em]">G</sub>
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}
