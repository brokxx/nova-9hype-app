import{dE as Y,d8 as G,d9 as Z,db as ee,dd as l,df as u,dN as re,dA as F,da as t,dC as H,ec as te,dx as ae,dw as s}from"./app-CTtNhd43.js";import{n as ie}from"./OpenLink-DZHy38vr-2F6kUTwx.js";import{C as oe}from"./QrCode-BxAVhbx2-DkfceOVJ.js";import{$ as se}from"./ModalHeader-YbJk-YIQ-C-R6Kzll.js";import{r as ne}from"./LabelXs-oqZNqbm_-BjPDGxFB.js";import{a as le}from"./shouldProceedtoEmbeddedWalletCreationFlow-CBt9hKD6-BvNyMn9Z.js";import{n as ce}from"./ScreenLayout-Ce16-u0i-DP3S9NyN.js";import{l as $}from"./farcaster-DPlSjvF5-BUTB8Bpm.js";import{C as de}from"./check-BYw-8m5_.js";import{C as ue}from"./copy-GstfI-OL.js";/* empty css             */import"./dijkstra-D_NXgYpA.js";import"./Screen-CdOj1bUg-Bp4GXXi1.js";import"./index-Dq_xe9dz-wygDYjkW.js";import"./createLucideIcon-B5s-Qb40.js";let pe=s.div`
  width: 100%;
`,me=s.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  height: 56px;
  background: ${r=>r.$disabled?"var(--privy-color-background-2)":"var(--privy-color-background)"};
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);

  &:hover {
    border-color: ${r=>r.$disabled?"var(--privy-color-foreground-4)":"var(--privy-color-foreground-3)"};
  }
`,he=s.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`,Q=s.span`
  display: block;
  font-size: 16px;
  line-height: 24px;
  color: ${r=>r.$disabled?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  overflow: hidden;
  text-overflow: ellipsis;
  /* Use single-line truncation without nowrap to respect container width */
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  word-break: break-all;

  @media (min-width: 441px) {
    font-size: 14px;
    line-height: 20px;
  }
`,fe=s(Q)`
  color: var(--privy-color-foreground-3);
  font-style: italic;
`,ge=s(ne)`
  margin-bottom: 0.5rem;
`,ve=s(se)`
  && {
    gap: 0.375rem;
    font-size: 14px;
    flex-shrink: 0;
  }
`;const xe=({value:r,title:p,placeholder:c,className:a,showCopyButton:d=!0,truncate:o,maxLength:m=40,disabled:h=!1})=>{let[n,x]=l.useState(!1),E=o&&r?((i,S,f)=>{if((i=i.startsWith("https://")?i.slice(8):i).length<=f)return i;if(S==="middle"){let y=Math.ceil(f/2)-2,C=Math.floor(f/2)-1;return`${i.slice(0,y)}...${i.slice(-C)}`}return`${i.slice(0,f-3)}...`})(r,o,m):r;return l.useEffect(()=>{if(n){let i=setTimeout(()=>x(!1),3e3);return()=>clearTimeout(i)}},[n]),t.jsxs(pe,{className:a,children:[p&&t.jsx(ge,{children:p}),t.jsxs(me,{$disabled:h,children:[t.jsx(he,{children:r?t.jsx(Q,{$disabled:h,title:r,children:E}):t.jsx(fe,{$disabled:h,children:c||"No value"})}),d&&r&&t.jsx(ve,{onClick:function(i){i.stopPropagation(),navigator.clipboard.writeText(r).then(()=>x(!0)).catch(console.error)},size:"sm",children:t.jsxs(t.Fragment,n?{children:["Copied",t.jsx(de,{size:14})]}:{children:["Copy",t.jsx(ue,{size:14})]})})]})]})},ye=({connectUri:r,loading:p,success:c,errorMessage:a,onBack:d,onClose:o,onOpenFarcaster:m})=>t.jsx(ce,H||p?te?{title:a?a.message:"Sign in with Farcaster",subtitle:a?a.detail:"To sign in with Farcaster, please open the Farcaster app.",icon:$,iconVariant:"loading",iconLoadingStatus:{success:c,fail:!!a},primaryCta:r&&m?{label:"Open Farcaster app",onClick:m}:void 0,onBack:d,onClose:o,watermark:!0}:{title:a?a.message:"Signing in with Farcaster",subtitle:a?a.detail:"This should only take a moment",icon:$,iconVariant:"loading",iconLoadingStatus:{success:c,fail:!!a},onBack:d,onClose:o,watermark:!0,children:r&&H&&t.jsx(be,{children:t.jsx(ie,{text:"Take me to Farcaster",url:r,color:"#8a63d2"})})}:{title:"Sign in with Farcaster",subtitle:"Scan with your phone's camera to continue.",onBack:d,onClose:o,watermark:!0,children:t.jsxs(we,{children:[t.jsx(Ee,{children:r?t.jsx(oe,{url:r,size:275,squareLogoElement:$}):t.jsx(Te,{children:t.jsx(ae,{})})}),t.jsxs(Se,{children:[t.jsx(Ce,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),r&&t.jsx(xe,{value:r,truncate:"end",maxLength:30,showCopyButton:!0,disabled:!0})]})]})}),We={component:()=>{let{authenticated:r,logout:p,ready:c,user:a}=Y(),{lastScreen:d,navigate:o,navigateBack:m,setModalData:h}=G(),n=Z(),{getAuthFlow:x,loginWithFarcaster:E,closePrivyModal:i,createAnalyticsEvent:S}=ee(),[f,y]=l.useState(void 0),[C,J]=l.useState(!1),[b,K]=l.useState(!1),T=l.useRef([]),w=x(),k=w==null?void 0:w.meta.connectUri;return l.useEffect(()=>{let g=Date.now(),j=setInterval(async()=>{var _,O,R,N,I,L,U,D,M,z,W,B,q,P,V;let A=await w.pollForReady.execute(),X=Date.now()-g;if(A){clearInterval(j),J(!0);try{await E(),K(!0)}catch(e){let v={retryable:!1,message:"Authentication failed"};if((e==null?void 0:e.privyErrorCode)===u.ALLOWLIST_REJECTED)return void o("AllowlistRejectionScreen");if((e==null?void 0:e.privyErrorCode)===u.USER_LIMIT_REACHED)return console.error(new re(e).toString()),void o("UserLimitReachedScreen");if((e==null?void 0:e.privyErrorCode)===u.USER_DOES_NOT_EXIST)return void o("AccountNotFoundScreen");if((e==null?void 0:e.privyErrorCode)===u.LINKED_TO_ANOTHER_USER)v.detail=e.message??"This account has already been linked to another user.";else{if((e==null?void 0:e.privyErrorCode)===u.ACCOUNT_TRANSFER_REQUIRED&&((O=(_=e.data)==null?void 0:_.data)!=null&&O.nonce))return h({accountTransfer:{nonce:(N=(R=e.data)==null?void 0:R.data)==null?void 0:N.nonce,account:(L=(I=e.data)==null?void 0:I.data)==null?void 0:L.subject,displayName:(M=(D=(U=e.data)==null?void 0:U.data)==null?void 0:D.account)==null?void 0:M.displayName,linkMethod:"farcaster",embeddedWalletAddress:(B=(W=(z=e.data)==null?void 0:z.data)==null?void 0:W.otherUser)==null?void 0:B.embeddedWalletAddress,farcasterEmbeddedAddress:(V=(P=(q=e.data)==null?void 0:q.data)==null?void 0:P.otherUser)==null?void 0:V.farcasterEmbeddedAddress}}),void o("LinkConflictScreen");(e==null?void 0:e.privyErrorCode)===u.INVALID_CREDENTIALS?(v.retryable=!0,v.detail="Something went wrong. Try again."):(e==null?void 0:e.privyErrorCode)===u.TOO_MANY_REQUESTS&&(v.detail="Too many requests. Please wait before trying again.")}y(v)}}else X>12e4&&(clearInterval(j),y({retryable:!0,message:"Authentication failed",detail:"The request timed out. Try again."}))},2e3);return()=>{clearInterval(j),T.current.forEach(A=>clearTimeout(A))}},[]),l.useEffect(()=>{if(c&&r&&b&&a){if(n!=null&&n.legal.requireUsersAcceptTerms&&!a.hasAcceptedTerms){let g=setTimeout(()=>{o("AffirmativeConsentScreen")},F);return()=>clearTimeout(g)}b&&(le(a,n.embeddedWallets)?T.current.push(setTimeout(()=>{h({createWallet:{onSuccess:()=>{},onFailure:g=>{console.error(g),S({eventName:"embedded_wallet_creation_failure_logout",payload:{error:g,screen:"FarcasterConnectStatusScreen"}}),p()},callAuthOnSuccessOnClose:!0}}),o("EmbeddedWalletOnAccountCreateScreen")},F)):T.current.push(setTimeout(()=>i({shouldCallAuthOnSuccess:!0,isSuccess:!0}),F)))}},[b,c,r,a]),t.jsx(ye,{connectUri:k,loading:C,success:b,errorMessage:f,onBack:d?m:void 0,onClose:i,onOpenFarcaster:()=>{k&&(window.location.href=k)}})}};let be=s.div`
  margin-top: 24px;
`,we=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,Ee=s.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,Se=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,Ce=s.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,Te=s.div`
  position: relative;
  width: 82px;
  height: 82px;
`;export{We as FarcasterConnectStatusScreen,ye as FarcasterConnectStatusView,We as default};
