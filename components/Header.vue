<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from '#imports'

const store = useDefaultStore()
const route = useRoute()

const links = [
    { name: 'Dashboard', path: '/dashboard', hideOnDesktop: false },
    { name: 'Transactions', path: '/transactions', hideOnDesktop: false },
    { name: 'Analytics', path: '/analytics', hideOnDesktop: false },
    { name: 'Settings', path: '/settings', hideOnDesktop: true } // Mobile only
]

const navItems = ref([])
const indicatorStyle = ref({ width: '0px', transform: 'translateX(0px)', opacity: 0 })

const updateIndicator = async () => {
    await nextTick()
    // Small delay to ensure DOM is fully painted, especially with Nuxt client hydration
    setTimeout(() => {
        const activeIndex = links.findIndex(link => route.path.startsWith(link.path))
        
        if (activeIndex !== -1 && navItems.value[activeIndex]) {
            // NuxtLink ref usually gives the component instance and $el gives the DOM node
            const el = navItems.value[activeIndex]?.$el || navItems.value[activeIndex]
            if (el && el.offsetWidth) {
                // Compensate for the container's padding (p-1 which is 4px)
                // Left offset is relative to the container
                indicatorStyle.value = {
                    width: `${el.offsetWidth}px`,
                    transform: `translateX(${el.offsetLeft}px)`,
                    opacity: 1
                }
            }
        } else {
            // Hide if not matched
            indicatorStyle.value = { ...indicatorStyle.value, opacity: 0 }
        }
    }, 50)
}

onMounted(() => {
    updateIndicator()
    window.addEventListener('resize', updateIndicator)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateIndicator)
})

watch(() => route.path, () => {
    updateIndicator()
})
</script>

<template>
    <header class="flex flex-col sm:flex-row items-center w-full container mx-auto justify-between my-8 px-4 sm:px-0 gap-4 sm:gap-0">
        <NuxtLink to="/">
            <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FTracker</h1>
        </NuxtLink>

        <!-- Navigation Links with Sliding Indicator -->
        <nav v-if="store.isAuth" class="relative flex items-center bg-gray-100 dark:bg-gray-800/50 rounded-full p-1" style="isolation: isolate;">
            <!-- Floating Pill Background -->
            <div 
                class="absolute top-1 bottom-1 bg-white dark:bg-gray-700 shadow rounded-full transition-all duration-300 ease-out"
                :style="indicatorStyle"
            ></div>

            <NuxtLink 
                v-for="(item, index) in links" 
                :key="item.path" 
                :to="item.path" 
                ref="navItems"
                class="relative z-10 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300"
                :class="[
                    item.hideOnDesktop ? 'sm:hidden block' : '',
                    route.path.startsWith(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                ]"
            >
                {{ item.name }}
            </NuxtLink>
        </nav>

        <div class="flex space-x-3 items-center hidden sm:flex">
            <template v-if="store.isAuth">
                <NuxtLink to="/settings">
                    <UButton
                        icon="i-heroicons-cog-8-tooth"
                        color="gray"
                        variant="ghost"
                        size="md"
                        square
                        title="Settings"
                    />
                </NuxtLink>
                <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Avatar" />
            </template>
            <slot />
        </div>
    </header>
</template>
