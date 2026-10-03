import * as THREE from 'three';

// The globe, rather than the complete compressed orbit diagram, owns the first
// frame. Orbital arcs may leave the frame; selecting a family inspects its craft.
export function orbitalOverviewPose(width, height) {
  const aspect = Math.max(1, width) / Math.max(1, height);
  const fov = aspect < .9 ? 48 : 35;
  const halfAngle = Math.atan(Math.tan(THREE.MathUtils.degToRad(fov) / 2) * Math.min(1, aspect));
  const distance = 1 / Math.sin(Math.atan(Math.tan(halfAngle) * .68));
  const target = new THREE.Vector3(0, .06, 0);
  const position = new THREE.Vector3(1.6, 1.8, 5.6).normalize().multiplyScalar(distance).add(target);
  return { pos: position.toArray(), target: target.toArray() };
}

export function createOrbitBackdrop() {
  const positions = [], colors = [];
  let seed = 714;
  const random = () => ((seed = Math.imul(seed, 1664525) + 1013904223 >>> 0) / 4294967296);
  for (let i = 0; i < 420; i++) {
    const y = random() * 2 - 1, angle = random() * Math.PI * 2, radius = Math.sqrt(1-y*y);
    positions.push(55 * radius * Math.cos(angle), 55 * y, 55 * radius * Math.sin(angle));
    const light = .12 + random() * .32;
    colors.push(light * .86, light * .93, light);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const stars = new THREE.Points(geometry, new THREE.PointsMaterial({size:1.2,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.75,depthWrite:false,toneMapped:false}));
  stars.name = 'Illustrative starfield'; stars.userData.teachingOverlay = true;
  return stars;
}

// Small, deliberately illustrative patches identify the relationship between
// the GEO vehicles and Earth-fixed ground. Their angular size is an art choice:
// no instrument FOV, visibility horizon, coverage or detection limit is encoded.
// Parenting this overlay to EarthSpin makes a patch stay on the same ground.
export function createGeoViewingPatches(vehicles) {
  const centers = vehicles.map(node => node.position.clone().normalize());
  const material = new THREE.ShaderMaterial({
    uniforms:{centers:{value:centers},tint:{value:new THREE.Color('#e6ba82')}},
    transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:'varying vec3 localDirection;void main(){localDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform vec3 centers[${centers.length}];uniform vec3 tint;varying vec3 localDirection;
      void main(){float strength=0.0;for(int i=0;i<${centers.length};i++){
        float d=acos(clamp(dot(normalize(localDirection),centers[i]),-1.0,1.0));
        float rim=exp(-pow((d-.53)/.012,2.0));
        float fill=(1.0-smoothstep(.12,.53,d))*.12;
        float dotMark=exp(-pow(d/.021,2.0));
        strength=max(strength,rim*.72+fill+dotMark*.9);
      }gl_FragColor=vec4(tint,strength);}`,
  });
  const patches = new THREE.Mesh(new THREE.SphereGeometry(1.009,96,64),material);
  patches.name='Illustrative Earth-fixed GEO viewing patches';
  patches.userData.teachingOverlay=true;
  patches.userData.physicalCoverage=false;
  return patches;
}
