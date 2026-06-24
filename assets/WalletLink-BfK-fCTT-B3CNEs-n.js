import{b$ as $,da as n,dk as j,dw as l}from"./app-Dvg1b3kT.js";import{i as g,m as c,o as d,c as h}from"./ethers-BwspWcmN-Dfr-c7eD.js";import{C as k}from"./getFormattedUsdFromLamports-B6EqSEho-C-HCdwKa.js";import{t as y}from"./transaction-CnfuREWo-nROljJQP.js";const O=({weiQuantities:e,tokenPrice:i,tokenSymbol:s})=>{let r=c(e),t=i?d(r,i):void 0,o=h(r,s);return n.jsx(a,{children:t||o})},P=({weiQuantities:e,tokenPrice:i,tokenSymbol:s})=>{let r=c(e),t=i?d(r,i):void 0,o=h(r,s);return n.jsx(a,{children:t?n.jsxs(n.Fragment,{children:[n.jsx(S,{children:"USD"}),t==="<$0.01"?n.jsxs(x,{children:[n.jsx(p,{children:"<"}),"$0.01"]}):t]}):o})},D=({quantities:e,tokenPrice:i,tokenSymbol:s="SOL",tokenDecimals:r=9})=>{let t=e.reduce((u,f)=>u+f,0n),o=i&&s==="SOL"&&r===9?k(t,i):void 0,m=s==="SOL"&&r===9?y(t):`${$(t,r)} ${s}`;return n.jsx(a,{children:o?n.jsx(n.Fragment,{children:o==="<$0.01"?n.jsxs(x,{children:[n.jsx(p,{children:"<"}),"$0.01"]}):o}):m})};let a=l.span`
  font-size: 14px;
  line-height: 140%;
  display: flex;
  gap: 4px;
  align-items: center;
`,S=l.span`
  font-size: 12px;
  line-height: 12px;
  color: var(--privy-color-foreground-3);
`,p=l.span`
  font-size: 10px;
`,x=l.span`
  display: flex;
  align-items: center;
`;function v(e,i){return`https://explorer.solana.com/account/${e}?chain=${i}`}const F=e=>n.jsx(w,{href:e.chainType==="ethereum"?g(e.chainId,e.walletAddress):v(e.walletAddress,e.chainId),target:"_blank",children:j(e.walletAddress)});let w=l.a`
  &:hover {
    text-decoration: underline;
  }
`;export{F as S,D as f,P as h,O as p};
