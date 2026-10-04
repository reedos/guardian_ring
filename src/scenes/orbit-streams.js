import * as THREE from 'three';
import {createFlowRibbon} from './flow-ribbon.js';

const TAU = Math.PI * 2;
function overlay(object) {
  object.userData.teachingOverlay = true;
  object.userData.solidForCamera = false;
  object.frustumCulled = false;
  return object;
}

// Nonphysical teaching strokes only. The straight backbone is the propagation
// path; traveling glyphs identify its type, not wave frequency or throughput.
export function createOrbitalStream(kind, color, { count = 8, width = .055 } = {}) {
  const group = overlay(new THREE.Group()); group.name = `${kind} schematic stream`; group.userData.flowKind = kind;
  const spineGeometry = new THREE.BufferGeometry();
  spineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  const spine = overlay(new THREE.Line(spineGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .28, depthWrite: false })));
  const segments = kind === 'radio' ? 16 : 3;
  const markGeometry = new THREE.BufferGeometry();
  markGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * segments * 6), 3));
  const mark = overlay(new THREE.LineSegments(markGeometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending })));
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const points = overlay(new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color, size: kind === 'radio' ? 3.5 : 2.5, sizeAttenuation: false, transparent: true, opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending })));
  group.add(spine, mark, points);
  const ribbon=kind==='light'?createFlowRibbon(color,count*segments):null;if(ribbon)group.add(ribbon.group);
  const a = new THREE.Vector3(), direction = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3(), p = new THREE.Vector3(), q = new THREE.Vector3();
  return { group,
    update(start, end, phase, visible = true) {
      group.visible = visible;
      if (!visible) return;
      a.set(...start); direction.set(...end).sub(a); const length = direction.length();
      if (length < 1e-5) { group.visible = false; return; }
      direction.divideScalar(length);
      u.crossVectors(direction, Math.abs(direction.y) > .95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
      v.crossVectors(direction, u).normalize();
      const backbone = spineGeometry.attributes.position;
      backbone.array.set(start, 0); backbone.array.set(end, 3); backbone.needsUpdate = true;
      const marks = markGeometry.attributes.position, dots = pointGeometry.attributes.position;
      let write = 0;
      const vertex = point => { marks.array[write++] = point.x; marks.array[write++] = point.y; marks.array[write++] = point.z; };
      for (let i = 0; i < count; i++) {
        const t = ((phase + i / count) % 1 + 1) % 1;
        p.copy(a).addScaledVector(direction, length * t);
        dots.setXYZ(i, p.x, p.y, p.z);
        const radius = width * (.35 + .65 * Math.sin(Math.PI * t));
        if (kind === 'radio') {
          for (let s = 0; s < segments; s++) for (const theta of [s * TAU / segments, (s + 1) * TAU / segments]) {
            q.copy(p).addScaledVector(u, Math.cos(theta) * radius).addScaledVector(v, Math.sin(theta) * radius); vertex(q);
          }
        } else {
          // Three luminous streaks remain readable from any camera azimuth.
          for (let s = 0; s < segments; s++) {
            const theta = s * TAU / segments;
            q.copy(p).addScaledVector(u, Math.cos(theta) * radius * .2).addScaledVector(v, Math.sin(theta) * radius * .2); vertex(q);
            q.addScaledVector(direction, -Math.min(length * t, length * .045, .12)); vertex(q);
          }
        }
      }
      marks.needsUpdate = true; dots.needsUpdate = true;
      ribbon?.update(marks.array,write/6,true);
    },
  };
}

export function createNadirReference() {
  const group = overlay(new THREE.Group()); group.name = 'Geometric nadir reference, not a sensor footprint';
  const markerGeometry = new THREE.BufferGeometry(); markerGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
  const marker = overlay(new THREE.LineSegments(markerGeometry, new THREE.LineBasicMaterial({ color: '#e6ba82', transparent: true, opacity: 1, depthWrite: false })));
  const trailGeometry = new THREE.BufferGeometry(); trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(49 * 3), 3));
  const trail = overlay(new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: '#e6ba82', transparent: true, opacity: .5, depthWrite: false })));
  group.add(marker, trail);
  const p = new THREE.Vector3(), normal = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3(), q = new THREE.Vector3();
  return { group,
    update(point, history) {
      p.set(...point); normal.copy(p).normalize();
      u.crossVectors(normal, Math.abs(normal.y) > .95 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0)).normalize();
      v.crossVectors(normal, u).normalize();
      const marks = markerGeometry.attributes.position;
      for (const [i, axis, sign] of [[0, u, -1], [1, u, 1], [2, v, -1], [3, v, 1]]) {
        q.copy(p).addScaledVector(axis, sign * .055); marks.setXYZ(i, q.x, q.y, q.z);
      }
      marks.needsUpdate = true;
      trail.visible = history.length > 1;
      if (trail.visible) {
        const positions = trailGeometry.attributes.position;
        history.forEach((position, i) => positions.setXYZ(i, ...position));
        trailGeometry.setDrawRange(0, history.length); positions.needsUpdate = true;
      }
    },
  };
}
