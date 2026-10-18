'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ArrowUpRight,ArrowDown,ArrowRight,Play,Pause,Globe2,Cloud,Cpu,Sparkles,MousePointer2} from 'lucide-react';
import styles from './TechHero.module.css';
import TechPreview from './TechPreview';

const worlds = [
 {id:'ai',label:'AI',Icon:Sparkles,title:'질문을 이해하는 나만의 AI',description:'데이터와 AI를 연결해, 일상 속 문제에 답하는 서비스를 상상해보세요.',file:'campus-assistant.ai',tag:'AI ASSISTANT',code:'connect(model, yourIdea)',color:'#c5f783'},
 {id:'web',label:'Web',Icon:Globe2,title:'클릭하고 싶은 나만의 웹',description:'프런트엔드와 백엔드를 연결해, 아이디어를 실제로 사용할 수 있는 화면으로.',file:'my-first-service.web',tag:'FULL-STACK WEB',code:'build(frontend, backend)',color:'#86dfea'},
 {id:'cloud',label:'Cloud',Icon:Cloud,title:'어디서나 연결되는 서비스',description:'내 컴퓨터에서 시작한 프로젝트를 클라우드로. 배포와 운영까지 넓어지는 경험.',file:'launch-to-cloud.dev',tag:'CLOUD DEPLOYMENT',code:'deploy(idea, everywhere)',color:'#c5bbff'},
 {id:'computer',label:'Computer',Icon:Cpu,title:'모든 기술의 시작, 컴퓨터',description:'코드가 움직이는 원리를 이해하고, 프로그래밍과 컴퓨팅의 기초를 쌓아보세요.',file:'hello-future.py',tag:'COMPUTING BASICS',code:'learn → code → create',color:'#ffc98b'},
] as const;

export default function TechHero(){
 const [selected,setSelected]=useState(0),[paused,setPaused]=useState(false);
 const [showPreview,setShowPreview]=useState(false);
 const world=worlds[selected];
 const selectWorld=(index:number)=>{setSelected(index);setShowPreview(true);};
 return <section className={styles.hero+' '+(paused?styles.paused:'')} aria-labelledby="tech-hero-title" style={{'--tech-accent':world.color} as React.CSSProperties}>
 <div className={styles.ambient} aria-hidden="true"/><div className={styles.grid} aria-hidden="true"/>
 <div className={styles.layout}>
 <div className={styles.copy}>
 <div className={styles.eyebrow}><span/> SMART SOFTWARE · DAEJEON</div>
 <div className={styles.kicker}>한국폴리텍대학 대전캠퍼스 · 스마트소프트웨어과</div>
 <h1 id="tech-hero-title">AI부터 웹까지,<br/><span>직접 만드는 미래.</span></h1>
 <p className={styles.intro}>매일 쓰던 기술을, 이제 내가 만드는 기술로.<br/>컴퓨터의 기초부터 AI·웹·클라우드까지,<br/>당신의 아이디어를 연결해보세요.</p>
 <div className={styles.actions}><Link href="/explore/department/" className={styles.primary}>스마트소프트웨어과 알아보기 <ArrowUpRight size={19}/></Link><a href="#curriculum" className={styles.secondary}>배움의 로드맵 <ArrowRight size={16}/></a></div>
 <div className={styles.exploreLabel}><MousePointer2 size={13}/> 관심 있는 기술을 눌러보세요</div>
 <div className={styles.switches} role="group" aria-label="히어로 기술 탐색">{worlds.map(({id,label,Icon},i)=><button key={id} type="button" aria-pressed={selected===i} aria-controls="tech-preview" onClick={()=>selectWorld(i)} className={selected===i?styles.selected:''}><Icon size={18}/>{label}<span>0{i+1}</span></button>)}</div>
 </div>
 <div className={styles.visual}>
 <div className={styles.visualHeader}><span><i/> YOUR DIGITAL UNIVERSE</span><div className={styles.visualControls}>{showPreview&&<button type="button" className={styles.motion} onClick={()=>{setShowPreview(false);setSelected(0);}}>전체 그림</button>}<button type="button" className={styles.motion} onClick={()=>setPaused(!paused)} aria-label={paused?'히어로 애니메이션 재생':'히어로 애니메이션 일시정지'}>{paused?<Play size={13}/>:<Pause size={13}/>}<span>{paused?'재생':'일시정지'}</span></button></div></div>
 <div id="tech-preview" className={styles.artStage+(showPreview?" "+styles.detailStage:"")}>
 {showPreview?<TechPreview world={world}/>:<>
 <div className={styles.artMotion}>
 <img className={styles.artwork} src="/images/digital-universe-v1.webp" width={1448} height={1086} fetchPriority="high" alt="빛나는 회로 위 노트북과 AI 신경망, 웹을 상징하는 지구본, 클라우드, 컴퓨터 반도체가 연결된 미래형 디지털 세계" draggable={false}/>
 {worlds.map(({id,label,Icon},i)=><button key={id} type="button" aria-label={label+' 영역 살펴보기'} aria-pressed={selected===i} aria-controls="tech-description" onClick={()=>selectWorld(i)} className={styles.hotspot+' '+styles['spot_'+id]+' '+(selected===i?styles.activeSpot:'')}><Icon size={14}/><span>{label}</span></button>)}
 </div>
 </>}
 </div>
 <div id="tech-description" className={styles.caption} aria-live="polite"><span>{world.tag}</span><h2>{world.title}</h2><p>{world.description}</p></div>
 </div>
 </div>
 <div className={styles.bottom}><span><b>LEARN.</b> BUILD. CONNECT.</span><span className={styles.bottomNote}>하나의 아이디어, 무한한 가능성</span><a href="#discover">우리의 다음을 만나보세요 <ArrowDown size={15}/></a></div>
 </section>;
}
