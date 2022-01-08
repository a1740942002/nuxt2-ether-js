import { ethers } from 'ethers'
import { Network } from '@ethersproject/providers'
import { useLocalStorage } from '@vueuse/core'
import web3 from '@/lib/web3'

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

const { provider } = web3

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
    const accounts = await provider.listAccounts()
    data.account = accounts[0]
  }

  const fetchBlock = async () => {
    data.blockNumber = await provider.getBlockNumber()
  }

  const fetchBalance = async (address: string) => {
    const balance = await provider.getBalance(address)
    data.balance = ethers.utils.formatEther(balance)
  }

  const fetchGasPrice = async () => {
    const gasPrice = await provider.getGasPrice()
    data.gasPrice = ethers.utils.formatEther(gasPrice)
  }

  const fetchNetwork = async () => {
    const network = await provider.getNetwork()
    data.network = network
    data.chainId = network.chainId
  }

  const fetchAllData = async (address: string) => {
    await Promise.all([
      fetchAccount(),
      fetchBlock(),
      fetchBalance(address),
      fetchGasPrice(),
      fetchNetwork(),
    ])
  }

  // Watcher
  const handleAccountsChanged = (accounts: Array<string>) => {
    data.account = accounts[0]
  }

  const handleChainChanged = (chainId: string) => {
    data.chainId = parseInt(chainId)
  }

  if (window.ethereum) {
    watchEffect(async () => {
      if (!storage.value.isConnected) {
        Object.assign(data, { ...initialData })
        return
      }
      await fetchAccount()
      await fetchAllData(data.account)
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    })

    onBeforeUnmount(() => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    })
  }

  return {
    // Data
    storage,
    ...toRefs(data),

    // Computed
    isLogin,
  }
}
