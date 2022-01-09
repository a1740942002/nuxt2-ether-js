<template lang="pug">
  .some-container
    .logout-container(v-if="isLogin") {{account}} | {{chainId}}
      h1 balance: {{balance}}
      button(@click="logout") Logout
    button(
      v-else
      @click="login"
    ) Login

</template>

<script lang="ts">
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
    const isLogin = inject(injectIsLogin)!
    const account = inject(injectAccount)!
    const chainId = inject(injectChainId)!
    const storage = inject(injectStorage)!
    const balance = inject(injectBalance)!

    const login = async () => {
      storage.value.isConnected = true
    }
    const logout = async () => {
      storage.value.isConnected = false
    }

    return {
      account,
      balance,
      chainId,
      isLogin,
      login,
      logout,
    }
  },
})
</script>

<style lang="sass" scoped>
.some-container
  @apply bg-cyan-900

  button
    @apply block
</style>
