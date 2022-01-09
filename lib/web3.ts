import { ethers } from 'ethers'
import { Web3Provider, JsonRpcProvider } from '@ethersproject/providers'

export const createProvider = async (rpcUrl: string) => {
  let provider: Web3Provider | JsonRpcProvider

  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum)
    } catch (error) {
      return Promise.reject(error)
    }
  } else {
    provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  }

  return provider
}
