import { describe, expect, it } from 'vitest';
import { assemblyViewFromQuery, explorerQuery, followFromQuery } from './explorer-url.js';

describe('shared enclosure views', () => {
  it('retains a supported orbital follow view without leaking it to other scenes',()=>{
    const query=explorerQuery('?orbit=leo',{scene:0,mode:'data',follow:'leo'});
    expect(followFromQuery(query)).toBe('leo');
    expect(followFromQuery(explorerQuery(query,{scene:2,mode:'data'}))).toBeNull();
    expect(followFromQuery(explorerQuery(query,{scene:0,mode:'light',selected:'earth',follow:'geo'}))).toBeNull();
    expect(followFromQuery('?follow=invalid')).toBeNull();
  });
  it('round-trips an Inside overview while preserving independent scenario inputs', () => {
    const search = new URLSearchParams('view=0.light&orbit=heo&aperture=representative&band=lwir&detector=qwip&custom=kept');
    const query = explorerQuery(search, { scene: 2, mode: 'data', assemblyView: 'inside' });
    expect(query.get('view')).toBe('2.data');
    expect(assemblyViewFromQuery(query)).toBe('inside');
    for (const key of ['orbit', 'aperture', 'band', 'detector', 'custom']) expect(query.get(key)).toBe(search.get(key));
    expect(search.get('view')).toBe('0.light');
    expect(search.has('assembly')).toBe(false);
  });

  it.each([
    ['controller', 'inside'], ['optics', 'inside'], ['optics', 'assembled'],
  ])('keeps selected %s separate from its %s enclosure view', (selected, assemblyView) => {
    const query = explorerQuery('?view=2.light&assembly=assembled', { scene: 2, mode: 'heat', selected, assemblyView });
    expect(query.get('view')).toBe(`2.heat.${selected}`);
    expect(assemblyViewFromQuery(query)).toBe(assemblyView);
  });

  it('does not carry enclosure state into a scene without this presentation', () => {
    const query = explorerQuery('?view=2.data&assembly=inside&orbit=leo', { scene: 3, mode: 'light', selected: 'readout' });
    expect(query.get('view')).toBe('3.light.readout');
    expect(query.has('assembly')).toBe(false);
    expect(query.get('orbit')).toBe('leo');
  });

  it.each(['?view=2.light', '?view=2.data.controller', '?view=2.light&assembly=exploded', '?assembly=INSIDE'])('leaves default behavior intact for %s', search => {
    expect(assemblyViewFromQuery(search)).toBeNull();
  });
});
