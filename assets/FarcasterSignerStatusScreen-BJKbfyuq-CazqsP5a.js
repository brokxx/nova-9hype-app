import{d8 as F,d9 as T,db as I,dd as d,dA as y,da as t,dC as k,ec as O,dx as _,dw as n}from"./app-CwJb03Z2.js";import{h as q}from"./CopyToClipboard-DSTf_eKU-StFtsg9S.js";import{n as B}from"./OpenLink-DZHy38vr-K7131cXt.js";import{C as A}from"./QrCode-BxAVhbx2-BpF8NLHg.js";import{n as E}from"./ScreenLayout-Ce16-u0i-Oz2LMhlx.js";import{l as x}from"./farcaster-DPlSjvF5-CC1a90tZ.js";/* empty css             */import"./dijkstra-D_NXgYpA.js";import"./ModalHeader-YbJk-YIQ-CN8g-7MN.js";import"./Screen-CdOj1bUg-CKI2Dcou.js";import"./index-Dq_xe9dz-Civvq37c.js";let S="#8a63d2";const M=({appName:u,loading:m,success:i,errorMessage:e,connectUri:r,onBack:s,onClose:c,onOpenFarcaster:o})=>t.jsx(E,k||m?O?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,icon:x,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},primaryCta:r&&o?{label:"Open Farcaster app",onClick:o}:void 0,onBack:s,onClose:c,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:x,iconVariant:"loading",iconLoadingStatus:{success:i,fail:!!e},onBack:s,onClose:c,watermark:!0,children:r&&k&&t.jsx(P,{children:t.jsx(B,{text:"Take me to Farcaster",url:r,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,onBack:s,onClose:c,watermark:!0,children:t.jsxs(R,{children:[t.jsx(L,{children:r?t.jsx(A,{url:r,size:275,squareLogoElement:x}):t.jsx(z,{children:t.jsx(_,{})})}),t.jsxs(N,{children:[t.jsx(V,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&t.jsx(q,{text:r,itemName:"link",color:S})]})]})});let P=n.div`
  margin-top: 24px;
`,R=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,L=n.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,N=n.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,V=n.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,z=n.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const $={component:()=>{let{lastScreen:u,navigateBack:m,data:i}=F(),e=T(),{requestFarcasterSignerStatus:r,closePrivyModal:s}=I(),[c,o]=d.useState(void 0),[j,h]=d.useState(!1),[w,v]=d.useState(!1),g=d.useRef([]),a=i==null?void 0:i.farcasterSigner;d.useEffect(()=>{let C=Date.now(),l=setInterval(async()=>{if(!(a!=null&&a.public_key))return clearInterval(l),void o({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});a.status==="approved"&&(clearInterval(l),h(!1),v(!0),g.current.push(setTimeout(()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0}),y)));let p=await r(a==null?void 0:a.public_key),b=Date.now()-C;p.status==="approved"?(clearInterval(l),h(!1),v(!0),g.current.push(setTimeout(()=>s({shouldCallAuthOnSuccess:!1,isSuccess:!0}),y))):b>3e5?(clearInterval(l),o({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):p.status==="revoked"&&(clearInterval(l),o({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))},2e3);return()=>{clearInterval(l),g.current.forEach(p=>clearTimeout(p))}},[]);let f=(a==null?void 0:a.status)==="pending_approval"?a.signer_approval_url:void 0;return t.jsx(M,{appName:e.name,loading:j,success:w,errorMessage:c,connectUri:f,onBack:u?m:void 0,onClose:s,onOpenFarcaster:()=>{f&&(window.location.href=f)}})}};export{$ as FarcasterSignerStatusScreen,M as FarcasterSignerStatusView,$ as default};
