<template lang="pug">
  .some-container
    h1(v-if="isLogin") {{account}} | {{chainId}}
    h1(v-else) not login

</template>

<script lang="ts">
import useEthers from '@/composables/useEthers'

export default defineComponent({
  components: {},
  props: {},
  setup() {
    const { isLogin, account, chainId, fetchAccount, fetchAllData } =
      useEthers()

    return {
      account,
      chainId,
      isLogin,
      fetchAllData,
    }
  },
})
</script>

<style lang="sass" scoped>
.some-container
  @apply h-[24px] bg-cyan-900

  button
    @apply block
</style>
