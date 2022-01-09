import { ComputedRef, Ref, InjectionKey } from '@nuxtjs/composition-api'
import { RemovableRef } from '@vueuse/core'
import { StroageType } from '@/composables/useEthers'

export const injectIsLogin: InjectionKey<ComputedRef<boolean>> = Symbol()
export const injectAccount: InjectionKey<Ref<string | null>> = Symbol()
export const injectBalance: InjectionKey<Ref<string | null>> = Symbol()
export const injectChainId: InjectionKey<Ref<number | null>> = Symbol()
export const injectStorage: InjectionKey<RemovableRef<StroageType>> = Symbol()
export const injectSetupEthers: InjectionKey<() => Promise<void>> = Symbol()
export const injectResetEthers: InjectionKey<() => Promise<void>> = Symbol()
