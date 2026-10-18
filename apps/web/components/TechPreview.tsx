'use client';
import {ArrowUpRight,ArrowRight,Monitor,Globe2,Cloud,Cpu,Sparkles,Code2,Check,Terminal,Layers,GitBranch,ShieldCheck} from 'lucide-react';
import styles from './TechPreview.module.css';
function Preview({id}:{id:'ai'|'web'|'cloud'|'computer'}){
 if(id==='ai')return <div className={styles.aiScene}><div className={styles.assistantMark}><Sparkles size={29}/></div><h3>안녕, 어떤 걸 만들어볼까?</h3><p>작은 호기심에서 시작하는 나의 첫 AI 서비스.</p><div className={styles.prompt}>시간표를 정리해주는 AI를 만들고 싶어 <span><ArrowUpRight size={16}/></span></div><div className={styles.response}><span className={styles.responseIcon}><Sparkles size={15}/></span><div><b>좋아! 이런 순서로 연결해볼까?</b><div className={styles.aiSteps}><span>데이터 준비</span><ArrowRight size={12}/><span>AI 연결</span><ArrowRight size={12}/><span>웹으로 구현</span></div></div></div><div className={styles.sceneFoot}><span><i/> YOUR IDEA, NOW CONNECTED</span><span>프로젝트 아이디어 예시</span></div></div>;
 if(id==='web')return <div className={styles.webScene}><div className={styles.webNav}><b><Code2 size={17}/> MY SPACE</b><span>WORK · ABOUT ↗</span></div><span className={styles.webLabel}>DESIGNED & BUILT BY ME</span><h3>Hello, world.<br/><em>This is my work.</em></h3><div className={styles.webTiles}><div><span>01</span><Code2/><b>나의 포트폴리오</b></div><div><span>02</span><Layers/><b>팀 프로젝트</b></div><div><span>03</span><Globe2/><b>첫 웹 서비스</b></div></div><div className={styles.sceneFoot}><span>FRONTEND ↔ API ↔ DATABASE</span><span>화면 예시</span></div></div>;
 if(id==='cloud')return <div className={styles.cloudScene}><div className={styles.cloudTitle}><Cloud size={31}/><span>Ready for the world.<small>내 프로젝트가 세상과 만나는 순간</small></span></div><div className={styles.pipeline}>{[{Icon:Code2,name:'CODE',sub:'프로젝트 작성'},{Icon:GitBranch,name:'BUILD',sub:'검증하고 빌드'},{Icon:Cloud,name:'DEPLOY',sub:'클라우드 배포'}].map(({Icon,name,sub})=><div key={name}><span><Icon size={24}/></span><b>{name}</b><small>{sub}</small></div>)}</div><div className={styles.deployLine}><ShieldCheck size={17}/><span>나만의 서비스, 어디서든 접속 가능하게.</span><Check size={16}/></div><div className={styles.sceneFoot}><span>LOCAL IDEA → GLOBAL POSSIBILITY</span><span>배포 과정 예시</span></div></div>;
 return <div className={styles.computerScene}><div className={styles.terminalTitle}><Terminal size={18}/><span>나의 첫 번째 프로그램</span><span>PYTHON</span></div><div className={styles.editor}><div><span>01</span><code><em>idea</em> = "나만의 서비스"</code></div><div><span>02</span><code><em>skills</em> = ["코딩", "문제 해결"]</code></div><div><span>03</span><code><em>def</em> build_future():</code></div><div><span>04</span><code>　<em>return</em> "Hello, possibility!"</code></div><div><span>05</span><code>print(build_future())</code></div></div><div className={styles.terminalOutput}><span>❯</span> Hello, possibility!<i/></div><div className={styles.sceneFoot}><span>COMPUTER SCIENCE × CREATIVE THINKING</span><span>코드 예시</span></div></div>;
}

export default function TechPreview({world}:{world:{id:'ai'|'web'|'cloud'|'computer';file:string;code:string}}){return (<div className={styles.scene}>
 <svg className={styles.connections} viewBox="0 0 560 460" fill="none" aria-hidden="true"><path d="M90 56H220Q240 56 240 80V115M458 70V170H390M80 360H170V310M458 365V300H380"/><path className={styles.signal} d="M90 56H220Q240 56 240 80V115M458 70V170H390M80 360H170V310M458 365V300H380"/></svg>
 <div className={styles.floatAi} aria-hidden="true"><span><Sparkles size={21}/></span><div><b>AI</b><small>THINK SMARTER</small></div></div>
 <div className={styles.floatCloud} aria-hidden="true"><Cloud size={27}/><span>CLOUD</span><i/></div>
 <div className={styles.monitor}>
 <div className={styles.monitorTop}><div><i/><i/><i/></div><span><ShieldCheck size={11}/>{world.file}</span><Code2 size={14}/></div>
 <div  className={styles.screen} ><Preview key={world.id} id={world.id}/></div>
 <div className={styles.monitorBottom}><span><Monitor size={12}/> YOUR NEXT PROJECT</span><span><i/> PREVIEW</span></div>
 </div>
 <div className={styles.monitorStand} aria-hidden="true"/><div className={styles.monitorBase} aria-hidden="true"/>
 <div className={styles.floatCode} aria-hidden="true"><Code2 size={21}/><code>{world.code}</code></div>
 <div className={styles.floatChip} aria-hidden="true"><Cpu size={27}/><span>COMPUTER</span></div>
 </div>);}
