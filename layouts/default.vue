<template lang="pug">
  Nuxt
</template>

<script lang="ts">
import useEthers from '@/composables/useEthers'
import {
  injectIsLogin,
  injectAccount,
  injectChainId,
  injectStorage,
  injectBalance,
} from '@/lib/context'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { storage, isLogin, balance, account, chainId } = useEthers()
    provide(injectStorage, storage)
    provide(injectAccount, account)
    provide(injectChainId, chainId)
    provide(injectIsLogin, isLogin)
    provide(injectBalance, balance)

    return {}
  },
})
</script>
