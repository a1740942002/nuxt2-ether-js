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
  injectSetupEthers,
} from '@/lib/context'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const {
      storage,
      isLogin,
      balance,
      account,
      chainId,
      errorMessages,
      setupEthers,
    } = useEthers({
      rpcUrl: 'https://rinkeby.infura.io/v3/e8f885e31d304914bb5401cf66ccd9df',
    })
    provide(injectStorage, storage)
    provide(injectAccount, account)
    provide(injectChainId, chainId)
    provide(injectIsLogin, isLogin)
    provide(injectBalance, balance)
    provide(injectSetupEthers, setupEthers)

    watch(
      errorMessages,
      () => {
        const length = errorMessages.value.length - 1
        console.log('notification', errorMessages.value[length])
      },
      { deep: true }
    )

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
