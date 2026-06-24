import{dE as A,db as N,d8 as k,dd as o,fa as O,dK as E,eD as b,eE as w,da as a,dA as $,dw as p,cl as z,ci as I,fb as q}from"./app-Dvg1b3kT.js";import{h as P}from"./CopyToClipboard-DSTf_eKU-f_dWAb1q.js";import{a as F}from"./Layouts-BlFm53ED-B7XIah0r.js";import{a as V,i as H}from"./JsonTree-aPaJmPx7-Ba-R0ka_.js";import{n as J}from"./ScreenLayout-Ce16-u0i-BXRDQ_r7.js";import{c as K}from"./createLucideIcon-XoLrVJqI.js";/* empty css             */import"./ModalHeader-YbJk-YIQ-CbtQ1oj-.js";import"./Screen-CdOj1bUg-0_23yI7A.js";import"./index-Dq_xe9dz-BCT8ZzsY.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],W=K("square-pen",Q),B=p.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let G=e=>{if(!z(e))return e;try{let s=I(e);return s.includes("�")?e:s}catch{return e}},X=e=>{try{let s=q.decode(e),i=new TextDecoder().decode(s);return i.includes("�")?e:i}catch{return e}},Y=e=>{let{types:s,primaryType:i,...l}=e.typedData;return a.jsxs(a.Fragment,{children:[a.jsx(te,{data:l}),a.jsx(P,{text:(r=e.typedData,JSON.stringify(r,null,2)),itemName:"full payload to clipboard"})," "]});var r};const Z=({method:e,messageData:s,copy:i,iconUrl:l,isLoading:r,success:g,walletProxyIsLoading:m,errorMessage:x,isCancellable:d,onSign:c,onCancel:y,onClose:u})=>a.jsx(J,{title:i.title,subtitle:i.description,showClose:!0,onClose:u,icon:W,iconVariant:"subtle",helpText:x?a.jsx(ee,{children:x}):void 0,primaryCta:{label:i.buttonText,onClick:c,disabled:r||g||m,loading:r},secondaryCta:d?{label:"Not now",onClick:y,disabled:r||g||m}:void 0,watermark:!0,children:a.jsxs(F,{children:[l?a.jsx(B,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,a.jsxs(M,{children:[e==="personal_sign"&&a.jsx(T,{children:G(s)}),e==="eth_signTypedData_v4"&&a.jsx(Y,{typedData:s}),e==="solana_signMessage"&&a.jsx(T,{children:X(s)})]})]})}),pe={component:()=>{let{authenticated:e}=A(),{initializeWalletProxy:s,closePrivyModal:i}=N(),{navigate:l,data:r,onUserCloseViaDialogOrKeybindRef:g}=k(),[m,x]=o.useState(!0),[d,c]=o.useState(""),[y,u]=o.useState(),[f,C]=o.useState(null),[_,S]=o.useState(!1);o.useEffect(()=>{e||l("LandingScreen")},[e]),o.useEffect(()=>{s(O).then(n=>{x(!1),n||(c("An error has occurred, please try again."),u(new E(new b(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))})},[]);let{method:R,data:j,confirmAndSign:v,onSuccess:D,onFailure:L,uiOptions:t}=r.signMessage,U={title:(t==null?void 0:t.title)||"Sign message",description:(t==null?void 0:t.description)||"Signing this message will not cost you any fees.",buttonText:(t==null?void 0:t.buttonText)||"Sign and continue"},h=n=>{n?D(n):L(y||new E(new b("The user rejected the request.",w.E4001_USER_REJECTED_REQUEST.eipCode))),i({shouldCallAuthOnSuccess:!1}),setTimeout(()=>{C(null),c(""),u(void 0)},200)};return g.current=()=>{h(f)},a.jsx(Z,{method:R,messageData:j,copy:U,iconUrl:t!=null&&t.iconUrl&&typeof t.iconUrl=="string"?t.iconUrl:void 0,isLoading:_,success:f!==null,walletProxyIsLoading:m,errorMessage:d,isCancellable:t==null?void 0:t.isCancellable,onSign:async()=>{S(!0),c("");try{let n=await v();C(n),S(!1),setTimeout(()=>{h(n)},$)}catch(n){console.error(n),c("An error has occurred, please try again."),u(new E(new b(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),S(!1)}},onCancel:()=>h(null),onClose:()=>h(f)})}};let M=p.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ee=p.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,te=p(V)`
  margin-top: 0;
`,T=p(H)`
  margin-top: 0;
`;export{pe as SignRequestScreen,Z as SignRequestView,pe as default};
