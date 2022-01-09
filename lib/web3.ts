import { ethers } from 'ethers'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'

export const createProvider = () => {
  let provider: Web3Provider | JsonRpcProvider

  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send('eth_requestAccounts', [])
  } else {
    const url = 'https://rinkeby.infura.io/v3/e8f885e31d304914bb5401cf66ccd9df'
    provider = new ethers.providers.JsonRpcProvider(url)
  }

  return provider
}
