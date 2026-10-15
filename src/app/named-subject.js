// Which named civil hardware a card row describes. The drawn parts are representative, so a Spec chip on a row about
// "ABI" or "TIRS-2" means "published for that named instrument", never "true of the part on screen".
// Row labels in the content files start with the hardware name, so the label decides.
export const namedSubject = label => {
  const text = String(label || '');
  if (/^ABI\b/.test(text)) return 'GOES-R ABI, named instrument';
  if (/^GOES-R\b/.test(text)) return 'GOES-R, named spacecraft';
  if (/^TIRS-2\b/.test(text)) return 'Landsat 9 TIRS-2, named instrument';
  if (/^TIRS\b/.test(text)) return 'Landsat TIRS and TIRS-2, named instruments';
  return null;
};
export const NOT_DRAWN_NOTE = 'Not the drawn part: rows tagged with a named instrument describe that civil hardware. The drawing is representative.';
