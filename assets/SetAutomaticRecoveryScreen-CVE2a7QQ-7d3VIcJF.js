import{dE as U,db as A,d8 as I,dd as u,da as e,e8 as v,es as j,dA as P,dw as W}from"./app-Dvg1b3kT.js";import{F as M}from"./ExclamationTriangleIcon-CwhcV9aN.js";import{F as V}from"./LockClosedIcon-BWnJLWAp.js";import{T as S,k as b,u as k}from"./ModalHeader-YbJk-YIQ-CbtQ1oj-.js";import{r as H}from"./Subtitle-CV-2yKE4-dIpbtrRF.js";import{e as $}from"./Title-BnzYV3Is-Bf_i8V__.js";/* empty css             */const D=W.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${i=>i.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,G={component:()=>{var p;let{user:i}=U(),{client:T,walletProxy:m,refreshSessionAndUser:E,closePrivyModal:l}=A(),s=I(),{entropyId:f,entropyIdVerifier:C}=((p=s.data)==null?void 0:p.recoverWallet)??{},[n,h]=u.useState(!1),[d,F]=u.useState(null),[c,g]=u.useState(null);function y(){var r,o,t,a;if(!n){if(c)return(o=(r=s.data)==null?void 0:r.setWalletPassword)==null||o.onFailure(c),void l();if(!d)return(a=(t=s.data)==null?void 0:t.setWalletPassword)==null||a.onFailure(Error("User exited set recovery flow")),void l()}}s.onUserCloseViaDialogOrKeybindRef.current=y;let R=!(!n&&!d);return e.jsxs(e.Fragment,c?{children:[e.jsx(S,{onClose:y},"header"),e.jsx(D,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:e.jsx(M,{height:38,width:38,stroke:"var(--privy-color-error)"})}),e.jsx($,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),e.jsx(v,{style:{minHeight:"2rem"}}),e.jsx(b,{onClick:()=>g(null),children:"Try again"}),e.jsx(k,{})]}:{children:[e.jsx(S,{onClose:y},"header"),e.jsx(V,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),e.jsx($,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),e.jsx(H,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),e.jsx(v,{style:{minHeight:"2rem"}}),e.jsx(b,{loading:n,disabled:R,onClick:()=>async function(){h(!0);try{let r=await T.getAccessToken(),o=j(i,f);if(!r||!m||!o)return;if(!(await m.setRecovery({accessToken:r,entropyId:f,entropyIdVerifier:C,existingRecoveryMethod:o.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let t=await E();if(!t)throw Error("Unable to set recovery on wallet");let a=j(t,o.address);if(!a)throw Error("Unabled to set recovery on wallet");F(!!t),setTimeout(()=>{var w,x;(x=(w=s.data)==null?void 0:w.setWalletPassword)==null||x.onSuccess(a),l()},P)}catch(r){g(r)}finally{h(!1)}}(),children:d?"Success":"Confirm"}),e.jsx(k,{})]})}};export{G as SetAutomaticRecoveryScreen,G as default};
