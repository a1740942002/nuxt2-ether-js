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
}

export interface StroageType {
  isConnected: boolean
}

export default function useEthers() {
  // Data
  const initialData: BlockDataType = {
    account: '',
    blockNumber: 0,
    balance: '',
    gasPrice: '',
    network: null,
    chainId: null,
  }

  const data = reactive<BlockDataType>({ ...initialData })
  const storage = useLocalStorage<StroageType>('__xy__', {
    isConnected: false,
  })

  // Computed
  const isLogin = computed(() => !!data.account)

  // Methods
  const fetchAccount = async () => {
    try {
      const provider = createProvider()
      const accounts = await provider.listAccounts()
      data.account = accounts[0]
    } catch (error) {
      console.log('FETCH_ACCOUNT_ERROR', error)
      return Promise.reject(error)
    }
  }

  const fetchBlock = async () => {
    try {
      const provider = createProvider()
      data.blockNumber = await provider.getBlockNumber()
    } catch (error) {
      console.log('FETCH_BLOCK_ERROR', error)
      return Promise.reject(error)
    }
  }

  const fetchBalance = async (address: string) => {
    try {
      const provider = createProvider()

      const balance = await provider.getBalance(address)
      data.balance = ethers.utils.formatEther(balance)
    } catch (error) {
      console.log('FETCH_BALANCE_ERROR', error)
      return Promise.reject(error)
    }
  }

  const fetchGasPrice = async () => {
    try {
      const provider = createProvider()
      const gasPrice = await provider.getGasPrice()
      data.gasPrice = ethers.utils.formatEther(gasPrice)
    } catch (error) {
      console.log('FETCH_GAS_PRICE_ERROR', error)
      return Promise.reject(error)
    }
  }

  const fetchNetwork = async () => {
    try {
      const provider = createProvider()
      const network = await provider.getNetwork()
      data.network = network
      data.chainId = network.chainId
    } catch (error) {
      console.log('FETCH_NETWORK_ERROR', error)
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
      console.log('FETCH_ALL_DATA_ERROR', error)
      return Promise.reject(error)
    }
  }

  // Watcher
  const handleAccountsChanged = async (accounts: Array<string>) => {
    data.account = accounts[0]
    await fetchAllData(data.account)
  }

  const handleChainChanged = async (chainId: string) => {
    await fetchAllData(data.account)
  }

  watchEffect(async () => {
    if (!storage.value.isConnected) {
      Object.assign(data, { ...initialData })
      return
    }
    if (!window.ethereum) return
    await fetchAccount()
    await fetchAllData(data.account)
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
  })

  onBeforeUnmount(() => {
    if (!window.ethereum) return
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    window.ethereum.removeListener('chainChanged', handleChainChanged)
  })

  return {
    // Data
    storage,
    ...toRefs(data),

    // Computed
    isLogin,
  }
}
