import { ethers } from 'ethers'
import { Network } from '@ethersproject/providers'
import { useLocalStorage } from '@vueuse/core'
import { createProvider } from '@/lib/web3'

interface BlockDataType {
  account: string
  blockNumber: number
  balance: string | null
  gasPrice: string
  network: Network | null
  chainId: number | null
  errorMessages: string[]
}

export interface StroageType {
  isAutoConnected: boolean
  chainId: string | number
}

interface ProviderMessage {
  type: string
  data: unknown
}

interface ProviderRpcError extends Error {
  message: string
  code: number
  data?: unknown
}

interface ConnectInfo {
  chainId: string
}

interface MetaMaskError {
  code: number
  message: string
  stack?: string
}

interface Config {
  rpcUrl: string
}

export default function useEthers(config: Config) {
  const { rpcUrl } = config

  // Data
  const initialData: BlockDataType = {
    account: '',
    blockNumber: 0,
    balance: '',
    gasPrice: '',
    network: null,
    chainId: null,
    errorMessages: [],
  }

  const data = reactive<BlockDataType>({ ...initialData })
  const storage = useLocalStorage<StroageType>('__xy__', {
    isAutoConnected: false,
    chainId: '',
  })

  // Computed
  const isLogin = computed(() => !!data.account)

  // Methods
  const fetchAccount = async () => {
    try {
      const provider = await createProvider(rpcUrl)
      const accounts = await provider.listAccounts()
      data.account = accounts[0]
      return accounts[0]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fetchBlock = async () => {
    try {
      const provider = await createProvider(rpcUrl)
      data.blockNumber = await provider.getBlockNumber()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      const provider = await createProvider(rpcUrl)
      const balance = await provider.getBalance(address)
      data.balance = ethers.utils.formatEther(balance)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fetchGasPrice = async () => {
    try {
      const provider = await createProvider(rpcUrl)
      const gasPrice = await provider.getGasPrice()
      data.gasPrice = ethers.utils.formatEther(gasPrice)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fetchNetwork = async () => {
    try {
      const provider = await createProvider(rpcUrl)
      const network = await provider.getNetwork()
      data.network = network
      data.chainId = network.chainId
      storage.value.chainId = network.chainId
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const fetchAllData = async (address: string) => {
    try {
      await Promise.all([
        fetchAccount(),
        fetchBlock(),
        fetchBalance(address),
        fetchGasPrice(),
        fetchNetwork(),
      ])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const resetEthers = () => {
    Object.assign(data, { ...initialData })
  }

  // Watcher Methods
  const handleAccountsChanged = async (accounts: Array<string>) => {
    // 如果 user 取消 permission，就不去要資料
    if (accounts.length) {
      data.account = accounts[0]
      await fetchAllData(data.account)
    } else {
      resetEthers()
    }
  }

  const handleChainChanged = async (chainId: string) => {
    storage.value.chainId = chainId
    await fetchAllData(data.account)
  }

  const handleConnect = async (connectInfo: ConnectInfo) => {
    console.log('CONNECT', connectInfo)
  }

  const handleDisconnect = async (error: ProviderRpcError) => {
    console.log('DISCONNECT_ERROR', error)
  }

  const handleMessage = async (message: ProviderMessage) => {
    console.log('MESSAGE', message)
  }

  const requestPermissions = async (chainId = '0x4') => {
    if (!window.ethereum) return
    try {
      await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
    } catch (error) {
      return Promise.reject(error)
    }
  }

  const setupEthers = async () => {
    if (!window.ethereum) return
    try {
      if (!storage.value.isAutoConnected) {
        return resetEthers()
      }
      await requestPermissions()
      await fetchAccount()
      await fetchAllData(data.account)
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      window.ethereum.on('connect', handleConnect)
      window.ethereum.on('disconnect', handleDisconnect)
      window.ethereum.on('message', handleMessage)
    } catch (error) {
      data.errorMessages.push((error as MetaMaskError).message)
    }
  }

  // Watch Effect

  const stopEffect = watchEffect(setupEthers)
  onBeforeUnmount(() => {
    stopEffect()
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    window.ethereum.removeListener('chainChanged', handleChainChanged)
    window.ethereum.removeListener('connect', handleConnect)
    window.ethereum.removeListener('disconnect', handleDisconnect)
    window.ethereum.removeListener('message', handleMessage)
  })

  return {
    // Data
    storage,
    ...toRefs(data),

    // Computed
    isLogin,

    // methods
    setupEthers,
    resetEthers,
  }
}
