'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Take files dropped on `targetRef`, and report whether a file drag is over
 * it. Passing null for `onFiles` leaves drops to the browser.
 */
export function useFileDrop(
  targetRef: RefObject<HTMLElement | null>,
  onFiles: ((files: File[]) => void) | null
): boolean {
  const [dragging, setDragging] = useState(false);
  const onFilesRef = useRef(onFiles);
  onFilesRef.current = onFiles;
  const active = onFiles != null;

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !active) return;
    // Enter and leave fire for every child the pointer crosses.
    let depth = 0;
    const carriesFiles = (event: DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files');
    const handleEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const handleOver = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      // Without this the browser refuses the drop and opens the file instead.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };
    const handleLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDragging(false);
    };
    const handleDrop = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const files = Array.from(event.dataTransfer?.files ?? []);
      if (files.length > 0) onFilesRef.current?.(files);
    };
    target.addEventListener('dragenter', handleEnter);
    target.addEventListener('dragover', handleOver);
    target.addEventListener('dragleave', handleLeave);
    target.addEventListener('drop', handleDrop);
    return () => {
      target.removeEventListener('dragenter', handleEnter);
      target.removeEventListener('dragover', handleOver);
      target.removeEventListener('dragleave', handleLeave);
      target.removeEventListener('drop', handleDrop);
      setDragging(false);
    };
  }, [targetRef, active]);

  return dragging;
}
