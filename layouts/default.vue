<template lang="pug">
  .nuxt-container
    h1.error Error: {{errorMessages}}
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
    const { storage, isLogin, balance, account, chainId, errorMessages } =
      useEthers()
    provide(injectStorage, storage)
    provide(injectAccount, account)
    provide(injectChainId, chainId)
    provide(injectIsLogin, isLogin)
    provide(injectBalance, balance)

    return {
      errorMessages,
    }
  },
})
</script>

<style lang="sass" scoped>
.error
  @apply bg-red-500
</style>
