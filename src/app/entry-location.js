// Capture the actual landing URL before scenario/share modules normalize it.
// First-visit intent must not mistake defaults inserted by the app for a link
// explicitly chosen by the reader.
export const ENTRY_LOCATION=location.href;
