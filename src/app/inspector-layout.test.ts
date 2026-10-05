import { describe, expect, it } from 'vitest';
import { explanationHeightLimit, inspectorHeightLimits, missionInvitationFits, inspectorDragExpanded } from './inspector-layout.js';

describe('phone inspector height budget', () => {
  it('keeps a dragged sheet open when its available height is below 35% of the viewport', () => {
    for(const viewportHeight of [844,667]){
      const allowedHeight=viewportHeight*.22;
      expect(allowedHeight).toBeLessThan(viewportHeight*.35);
      expect(inspectorDragExpanded(allowedHeight)).toBe(true);
    }
    expect(inspectorDragExpanded(48)).toBe(false);
    expect(inspectorDragExpanded(53)).toBe(false);
    expect(inspectorDragExpanded(54)).toBe(true);
  });
  it('reserves the canvas and full side-level transport before sizing the pane', () => {
    expect(inspectorHeightLimits({ availableHeight: 737, controlsHeight: 214 })).toEqual({ minimum: 150, maximum: 383 });
  });
  it('reduces the drag ceiling when an animation explanation expands', () => {
    const compact = inspectorHeightLimits({ availableHeight: 737, controlsHeight: 214 });
    const expanded = inspectorHeightLimits({ availableHeight: 737, controlsHeight: 400 });
    expect(expanded.maximum).toBe(197);
    expect(expanded.maximum).toBeLessThan(compact.maximum);
    expect(expanded.maximum + 400 + 140).toBe(737);
  });
  it('never produces a negative or inverted drag interval in a short viewport', () => {
    const limits = inspectorHeightLimits({ availableHeight: 400, controlsHeight: 290 });
    expect(limits).toEqual({ minimum: 0, maximum: 0 });
  });
  it('caps an expanded explanation while preserving the pane and canvas on a short phone', () => {
    expect(explanationHeightLimit({ availableHeight: 560, fixedControlsHeight: 185 })).toBe(85);
    expect(explanationHeightLimit({ availableHeight: 737, fixedControlsHeight: 185 })).toBe(150);
  });
  it('reserves a landscape reading pane beside the independent canvas column', () => {
    expect(explanationHeightLimit({ availableHeight: 268, fixedControlsHeight: 72, canvasMinimum: 0 })).toBe(46);
  });
  it('rounds a fractional viewport down rather than pushing the pane past its edge', () => {
    expect(explanationHeightLimit({ availableHeight: 543.594, fixedControlsHeight: 185 })).toBe(68);
  });
  it('keeps the Follow row exposed with its summary while preserving the phone minima', () => {
    const height = explanationHeightLimit({ availableHeight: 560, fixedControlsHeight: 176, summaryMinimum: 94 });
    expect(height).toBe(94);
    expect(height + 176 + 140 + 150).toBe(560);
  });
  it('reclaims the invitation before fixed playback would take space from the canvas or pane', () => {
    expect(missionInvitationFits({ availableHeight: 544, controlsHeight: 232, invitationHeight: 53 })).toBe(false);
    expect(missionInvitationFits({ availableHeight: 737, controlsHeight: 232, invitationHeight: 53 })).toBe(true);
  });
  it('counts the invitation even while hidden and allows it exactly when the full budget fits', () => {
    expect(missionInvitationFits({ availableHeight: 575, controlsHeight: 232, invitationHeight: 53 })).toBe(true);
    expect(missionInvitationFits({ availableHeight: 574.5, controlsHeight: 232, invitationHeight: 53 })).toBe(false);
  });
});
