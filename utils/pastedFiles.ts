const comparable = (name: string) => name.normalize('NFC').toLowerCase();

/** The file a line of clipboard text names: a bare name, a path, or a file URL. */
function namedFile(line: string): string {
  const name = line.slice(Math.max(line.lastIndexOf('/'), line.lastIndexOf('\\')) + 1);
  if (!line.startsWith('file:')) return comparable(name);
  try {
    return comparable(decodeURIComponent(name));
  } catch {
    return comparable(name);
  }
}

/**
 * The files of a paste that carries nothing but files; none otherwise, so a
 * paste with text of its own is left to the browser and the image that Word or
 * a web page copies beside its text is never taken for an attachment.
 */
export function pastedFiles(clipboard: DataTransfer): File[] {
  const files = Array.from(clipboard.files);
  if (files.length === 0) return [];
  const types = Array.from(clipboard.types);
  if (types.includes('text/html') || types.includes('text/rtf')) return [];

  // File managers add the copied files' names as plain text, sometimes without the extension.
  const names = new Set<string>();
  for (const file of files) {
    const name = comparable(file.name);
    names.add(name);
    const dot = name.lastIndexOf('.');
    if (dot > 0) names.add(name.slice(0, dot));
  }
  const lines = clipboard
    .getData('text/plain')
    .split(/[\r\n]+/)
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.every((line) => names.has(namedFile(line))) ? files : [];
}
