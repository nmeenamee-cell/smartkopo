'use client';
import {useRef} from 'react';
const points:Array<{x:number;y:number;r:number;opacity:number;bright:boolean;z:number}>=[];
for(let a=0;a<96;a++)for(let b=0;b<24;b++){
 const u=a/96*Math.PI*2,v=b/24*Math.PI*2,rad=1.15+.43*Math.cos(v);
 const x=rad*Math.cos(u),y=rad*Math.sin(u),z=.43*Math.sin(v)+.3*Math.sin(u*3);
 const angle=-.3,tilt=.65;
 const xx=x*Math.cos(angle)+z*Math.sin(angle),zz=-x*Math.sin(angle)+z*Math.cos(angle);
 const yy=y*Math.cos(tilt)-zz*Math.sin(tilt),z2=y*Math.sin(tilt)+zz*Math.cos(tilt),p=3.5/(3.5-z2);
 points.push({x:300+xx*145*p,y:280+yy*145*p,r:(z2+2.5)*.5,opacity:.2+(z2+1.8)/4.2,bright:b%6===0,z:z2});
}
points.sort((a,b)=>a.z-b.z);
export default function CodeUniverse({paused=false}:{paused?:boolean}){
 const art=useRef<HTMLDivElement>(null);
 return <div className="universe" ref={art} onPointerMove={e=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const r=e.currentTarget.getBoundingClientRect();e.currentTarget.style.setProperty('--tilt-x',((e.clientY-r.top)/r.height*12-6)+'deg');e.currentTarget.style.setProperty('--tilt-y',((e.clientX-r.left)/r.width*12-6)+'deg')}} onPointerLeave={e=>{e.currentTarget.style.setProperty('--tilt-x','0deg');e.currentTarget.style.setProperty('--tilt-y','0deg')}}><svg className="universe-svg" viewBox="0 0 600 560" role="img" aria-label="코드 입자로 이루어진 입체 궤도"><g className="universe-orbit" style={{animationPlayState:paused?'paused':'running'}}>{points.map((p,i)=><circle key={i} cx={p.x.toFixed(2)} cy={p.y.toFixed(2)} r={p.r.toFixed(2)} fill={p.bright?'#dcffad':'#acdf79'} opacity={p.opacity.toFixed(2)}/>)}</g></svg></div>;
}
