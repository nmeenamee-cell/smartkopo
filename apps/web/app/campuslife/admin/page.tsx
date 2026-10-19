'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {api,ApiError} from '../../../lib/api';
import styles from './page.module.css';

type Member={id:string;username:string;name:string;role:'user'|'admin';createdAt?:string};
type Directory={users:Member[];page:number;pageSize:number;totalUsers:number;totalProjects:number};

export default function AdminPage(){
 const [page,setPage]=useState(1);
 const [reload,setReload]=useState(0);
 const [data,setData]=useState<Directory|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [denied,setDenied]=useState(false);
 useEffect(()=>{
  let active=true;
  setLoading(true);setData(null);setError('');setDenied(false);
  api('/admin/users?page='+page).then(result=>{if(active)setData(result)}).catch(e=>{
   if(!active)return;
   setDenied(e instanceof ApiError&&(e.status===401||e.status===403));
   setError(e instanceof Error?e.message:'사용자 목록을 불러오지 못했습니다.');
  }).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[page,reload]);
 const pages=data?Math.max(1,Math.ceil(data.totalUsers/data.pageSize)):1;
 return <main id="main" className="portal">
  <div className="portal-title"><div><span className="micro">CAMPUS ADMIN</span><h1>사용자 관리</h1><p>가입한 사용자와 서비스 현황을 확인하세요.</p></div><Link href="/campuslife/" className="button outline">나의 캠퍼스로</Link></div>
  {loading?<p className="portal-loading" role="status">사용자 목록을 불러오고 있어요…</p>:error?<section className="empty-state"><p role="alert">{error}</p>{denied?<Link href="/campuslife/" className="button dark">계정 확인 / 로그인</Link>:<button className="button dark" onClick={()=>setReload(n=>n+1)}>다시 불러오기</button>}</section>:data&&<>
   <div className="dashboard-stats"><div className="stat"><span>전체 사용자</span><strong>{data.totalUsers}</strong></div><div className="stat"><span>전체 프로젝트</span><strong>{data.totalProjects}</strong></div><div className="stat"><span>현재 목록</span><strong>{data.users.length}</strong></div></div>
   <section className={styles.directory} aria-label="등록 사용자 목록">
    <div className={styles.heading}><h2>등록 사용자</h2><button className="button outline" onClick={()=>setReload(n=>n+1)}>새로고침</button></div>
    <div className={styles.scroll} role="region" aria-label="사용자 표" tabIndex={0}><table className={styles.table}><caption>아이디, 이름, 권한 및 가입일</caption><thead><tr><th scope="col">아이디</th><th scope="col">이름</th><th scope="col">권한</th><th scope="col">가입일</th></tr></thead><tbody>{data.users.map(user=><tr key={user.id}><td>{user.username}</td><td>{user.name}</td><td><span className={user.role==='admin'?styles.admin:styles.member}>{user.role==='admin'?'관리자':'일반 사용자'}</span></td><td>{user.createdAt?new Date(user.createdAt).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'}):'—'}</td></tr>)}</tbody></table></div>
    {data.users.length===0&&<p className={styles.empty}>이 페이지에 등록된 사용자가 없습니다.</p>}
    <nav className={styles.pagination} aria-label="사용자 목록 페이지"><button className="button outline" disabled={page===1} onClick={()=>setPage(n=>n-1)}>이전</button><span aria-live="polite">{page} / {pages} 페이지</span><button className="button outline" disabled={page>=pages} onClick={()=>setPage(n=>n+1)}>다음</button></nav>
   </section>
  </>}
 </main>;
}
