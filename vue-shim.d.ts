declare module '*.json' {
  const value: any
  export default value
}

declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

interface Window {
  web3: any
  ethereum?: any
  BinanceChain: any
}
