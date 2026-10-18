import type {Metadata} from 'next';
import {Header,Footer} from '../components/Shell';
import './globals.css';
export const metadata:Metadata={title:{default:'KOPO NEXT · 당신의 가능성을 코드로',template:'%s | KOPO NEXT'},description:'한국폴리텍대학 대전캠퍼스 스마트소프트웨어과 홍보 콘셉트. 풀스택 개발자의 미래를 탐색하고 나만의 프로젝트를 시작하세요.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ko"><body id="top"><Header/>{children}<Footer/></body></html>}
