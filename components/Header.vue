<script setup lang="ts">
const store = useDefaultStore()
const route = useRoute()
const colorMode = useColorMode()

const links = [
    { name: 'Home', path: '/dashboard', icon: 'i-heroicons-home' },
    { name: 'History', path: '/transactions', icon: 'i-heroicons-banknotes' },
    { name: 'Analytics', path: '/analytics', icon: 'i-heroicons-chart-pie' },
    { name: 'Settings', path: '/settings', icon: 'i-heroicons-cog-8-tooth' }
]

const navItems = ref<HTMLElement[]>([])
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)', opacity: 0 })

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const updateIndicator = async () => {
    await nextTick()
    setTimeout(() => {
        const activeIndex = links.findIndex(link => route.path.startsWith(link.path))
        if (activeIndex !== -1 && navItems.value[activeIndex]) {
            const el = (navItems.value[activeIndex] as any).$el || navItems.value[activeIndex]
            if (el && el.offsetWidth) {
                indicatorStyle.value = {
                    width: `${el.offsetWidth - 12}px`,
                    transform: `translateX(${el.offsetLeft }px)`,
                    opacity: 1
                }
            }
        } else {
            indicatorStyle.value.opacity = 0
        }
    }, 100)
}

onMounted(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
})

onUnmounted(() => window.removeEventListener('resize', updateIndicator))
watch(() => route.path, () => updateIndicator())
</script>

<template>
    <!-- Sticky Header -->
    <div class="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
        <header class="w-full py-6 sm:py-8 px-6 sm:px-10 flex items-center justify-between gap-8">
            <!-- Logo -->
            <Motion 
                :initial="{ opacity: 0, x: -20 }"
                :animate="{ opacity: 1, x: 0 }"
                :transition="{ duration: 0.8 }"
                class="logo-container"
            >
                <NuxtLink 
                    to="/" 
                    class="group flex items-center gap-3 shrink-0"
                >
                    <div class="w-11 h-11 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:rotate-12 transition-transform duration-500">
                        <UIcon name="i-heroicons-bolt" class="w-7 h-7 text-white" />
                    </div>
                    <div class="flex flex-col -space-y-1">
                        <span class="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">FTraker<span class="text-blue-600">.</span></span>
                        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/60 dark:text-blue-400/40">Finances</span>
                    </div>
                </NuxtLink>
            </Motion>

            <!-- Desktop Navigation -->
            <nav v-if="store.isAuth" class="hidden lg:flex relative items-center bg-gray-100 dark:bg-gray-800/50 backdrop-blur-xl p-1.5 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-inner">
                <div 
                    class="absolute h-[calc(100%-12px)] bg-white dark:bg-gray-700 shadow-xl shadow-gray-200/50 dark:shadow-none rounded-[1.5rem] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    :style="indicatorStyle"
                ></div>

                <NuxtLink 
                    v-for="item in links" 
                    :key="item.path" 
                    :to="item.path" 
                    ref="navItems"
                    class="relative z-10 px-6 py-2.5 rounded-full text-sm font-black transition-colors duration-300"
                    :class="route.path.startsWith(item.path) ? 'text-blue-600 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
                >
                    {{ item.name }}
                </NuxtLink>
            </nav>

            <!-- Actions -->
            <div class="flex items-center gap-3">
                <!-- Theme Toggle -->
                <ClientOnly>
                    <UButton
                        :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                        color="gray"
                        variant="ghost"
                        aria-label="Theme"
                        class="rounded-xl w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5"
                        @click="isDark = !isDark"
                    />
                </ClientOnly>

                <template v-if="store.isAuth">
                    <div class="flex items-center gap-3">
                        <NuxtLink to="/settings" class="hidden sm:block">
                            <UButton icon="i-heroicons-cog-8-tooth" color="gray" variant="ghost" class="rounded-xl w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/5" />
                        </NuxtLink>
                        <div class="h-11 w-11 rounded-2xl overflow-hidden ring-2 ring-gray-100 dark:ring-white/5 p-0.5 group cursor-pointer hover:ring-blue-500/30 transition-all">
                            <UAvatar 
                                :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${store.user?.name || 'Felix'}`" 
                                :alt="store.user?.name || 'User'" 
                                class="w-full h-full transform group-hover:scale-110 transition-transform" 
                            />
                        </div>
                    </div>
                </template>
                
                
                <slot />
            </div>
        </header>
    </div>

        <!-- Mobile Bottom Navigation -->
        <nav v-if="store.isAuth" class="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-40 flex items-center justify-between px-6">
            <!-- Left Side Links -->
            <div class="flex items-center gap-6">
                <NuxtLink 
                    v-for="item in links.slice(0, 2)" 
                    :key="item.path" 
                    :to="item.path" 
                    class="flex flex-col items-center justify-center gap-1 group transition-all duration-300"
                    :class="route.path.startsWith(item.path) ? 'text-blue-600 scale-110' : 'text-gray-400'"
                >
                    <UIcon :name="item.icon" class="w-6 h-6 transition-transform group-active:scale-90" />
                    <span class="text-[10px] font-black uppercase tracking-[0.2em]">{{ item.name }}</span>
                </NuxtLink>
            </div>

            <!-- Central Add Button -->
            <div class="relative -mt-12">
                <button 
                    @click="store.toggleTransactionModal(true)"
                    class="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 border-4 border-white dark:border-gray-900 transform active:scale-90 transition-all duration-300"
                >
                    <UIcon name="i-heroicons-plus" class="w-8 h-8 text-white" />
                </button>
            </div>

            <!-- Right Side Links -->
            <div class="flex items-center gap-6">
                <NuxtLink 
                    v-for="item in links.slice(2)" 
                    :key="item.path" 
                    :to="item.path" 
                    class="flex flex-col items-center justify-center gap-1 group transition-all duration-300"
                    :class="route.path.startsWith(item.path) ? 'text-blue-600 scale-110' : 'text-gray-400'"
                >
                    <UIcon :name="item.icon" class="w-6 h-6 transition-transform group-active:scale-90" />
                    <span class="text-[10px] font-black uppercase tracking-[0.2em]">{{ item.name }}</span>
                </NuxtLink>
            </div>
        </nav>
</template>
