const origin=process.env.NEXT_PUBLIC_API_URL||'';
export const staticWithoutApi=process.env.NEXT_PUBLIC_STATIC_PREVIEW==='1'&&!origin;
export class ApiError extends Error {constructor(message:string,public status:number){super(message)}}
export async function api(path:string,options:RequestInit={}){
 if(staticWithoutApi)throw new ApiError('온라인 홍보 미리보기에는 인증 서버가 연결되어 있지 않습니다. 전체 프로젝트를 실행하면 개인 공간을 사용할 수 있습니다.',503);
 let response:Response;
 try{response=await fetch(origin+'/api'+path,{...options,credentials:'include',headers:{'Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(12000)});}catch{throw new ApiError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',503);}
 const data=await response.json().catch(()=>null);
 if(!response.ok){let message=typeof data?.message==='string'?data.message:'요청을 처리하지 못했습니다.';if(response.status===429)message='요청이 많습니다. 1분 뒤 다시 시도해주세요.';if(response.status===400&&Array.isArray(data?.message))message='입력 형식을 확인해주세요. 아이디는 영문 소문자·숫자·밑줄 4~32자, 비밀번호는 12~128자입니다.';throw new ApiError(message,response.status);}
 if(!data)throw new ApiError('서버 응답을 확인할 수 없습니다.',503);return data;
}
