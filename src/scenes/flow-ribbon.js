// Adapted from IF's screen-width, exact-route ribbons. Explanatory overlays
// remain depth-tested against hardware and never become camera obstacles.
import {Group,AdditiveBlending} from 'three';
import {LineSegments2} from 'three/addons/lines/LineSegments2.js';
import {LineSegmentsGeometry} from 'three/addons/lines/LineSegmentsGeometry.js';
import {LineMaterial} from 'three/addons/lines/LineMaterial.js';
export function createFlowRibbon(color,capacity,{staticRoute=false}={}){
 const group=new Group(),geometry=new LineSegmentsGeometry().setPositions(new Float32Array(capacity*6));
 group.name=staticRoute?'Functional optical connection — not a ray trace':'Exact-route luminous activity';
 group.userData.teachingOverlay=true;group.userData.solidForCamera=false;
 for(const halo of [true,false]){
  const material=new LineMaterial({color,linewidth:halo?6:2.2,transparent:true,opacity:halo?.18:.95,depthTest:true,depthWrite:false,toneMapped:false,blending:AdditiveBlending,dashed:staticRoute,dashSize:.11,gapSize:.085});
  const line=new LineSegments2(geometry,material);line.frustumCulled=false;line.userData.teachingOverlay=true;line.userData.solidForCamera=false;group.add(line);
 }
 const starts=geometry.getAttribute('instanceStart'),ends=geometry.getAttribute('instanceEnd');
 return {group,geometry,update(positions,count,visible=true,gain=1){
  group.visible=visible&&count>0;if(!group.visible)return;
  for(let i=0;i<count;i++){const p=i*6;starts.setXYZ(i,positions[p],positions[p+1],positions[p+2]);ends.setXYZ(i,positions[p+3],positions[p+4],positions[p+5]);}
  geometry.instanceCount=count;starts.needsUpdate=ends.needsUpdate=true;
  for(const [i,line] of group.children.entries()){line.material.opacity=(i?.95:.18)*gain;if(staticRoute)line.computeLineDistances();}
 },dispose(){geometry.dispose();for(const line of group.children)line.material.dispose();group.removeFromParent();}};
}
