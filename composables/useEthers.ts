import { ethers } from 'ethers'
import FKT_ABI from '@/lib/contracts/abi/FKT.json'
import {
  Web3Provider,
  JsonRpcProvider,
  Network,
} from '@ethersproject/providers'
import { TransactionResponse } from '@ethersproject/abstract-provider'

interface BlockData {
  account: string
  blockNumber: number
  balance: string | null
  tax: TransactionResponse | null
  name: string
  gasPrice: string
  network: Network | null
  chainId: number | null
}

const { formatEther, parseEther } = ethers.utils

export default function useEthers() {
  const data = reactive<BlockData>({
    account: '',
    blockNumber: 0,
    balance: '',
    tax: null,
    name: '',
    gasPrice: '',
    network: null,
    chainId: null,
  })

  let provider: Web3Provider | JsonRpcProvider
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    provider.send('eth_requestAccounts', [])
  } else {
    const url = 'https://rinkeby.infura.io/v3/e8f885e31d304914bb5401cf66ccd9df'
    provider = new ethers.providers.JsonRpcProvider(url)
  }
  const signer = provider.getSigner()

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
    data.balance = formatEther(balance)
  }

  const fetchGasPrice = async () => {
    const gasPrice = await provider.getGasPrice()
    data.gasPrice = formatEther(gasPrice)
  }

  const fetchNetwork = async () => {
    const network = await provider.getNetwork()
    data.network = network
    data.chainId = network.chainId
  }

  const sendTransaction = async (to: string, amount: string) => {
    data.tax = await signer.sendTransaction({
      to,
      value: parseEther(amount),
    })
  }

  const fetchFKTToken = async () => {
    const abi = FKT_ABI
    const address = '0x9394a0686827895d15DEe84aAa9465097907A380'
    const FKTContract = new ethers.Contract(address, abi, provider)
    data.name = await FKTContract.name()
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

  const handleAccountsChanged = (accounts: Array<string>) => {
    data.account = accounts[0]
  }

  const handleChainChanged = (chainId: string) => {
    data.chainId = parseInt(chainId)
  }

  if (window.ethereum) {
    onMounted(async () => {
      await fetchAccount()
      await fetchAllData(data.account)
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
    })

    onBeforeUnmount(() => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    })
  }

  return {
    // Data
    data,
    ...toRefs(data),

    // Computed
    isLogin,

    // Fetch Block Data
    fetchAllData,
    fetchAccount,
    fetchBlock,
    fetchBalance,
    fetchGasPrice,
    fetchNetwork,

    // Set Block Data
    sendTransaction,

    // TBA
    fetchFKTToken,
  }
}
