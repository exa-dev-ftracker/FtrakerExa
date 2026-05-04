<script setup lang="ts">
const store = useDefaultStore()
const router = useRouter()
const cookie = ref<string | null>('')


useAsyncData('jwt', async () => {
    const jwt = useCookie('jwt')
    if (!jwt.value && !store.isAuth) {
        return router.push('/login')
    } else if (jwt.value) {
        return cookie.value = jwt.value
    } else {
        return cookie.value = store.jwt
    }
})

// onMounted(() => {
//     useAsyncData('jwt', async () => {
//         return cookie.value = useCookie<{ value: string }>('jwt').value
//     })
// })


if (cookie.value) {
    store.login(cookie.value)
}

const handleLogout = () => {
    $fetch('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ token: store.jwt }),
    }).then((res: any) => {
        if (res.statusCode === 200) {
            store.logout()
            return router.push('/login')
        } else {
            return alert("An error occurred while trying to sign out")
        }
    }).catch((err: any) => {
        console.error(err)
    })
}

</script>

<template>
    <section class="container mx-auto">

        <Header>
            <div v-if="!store.isAuth">
                <NuxtLink to="/login">
                    <UButton label="Login" />
                </NuxtLink>
                <NuxtLink to="/register">
                    <UButton color="gray" label="Register" />
                </NuxtLink>
            </div>
            <div v-else>
                <UButton @click="handleLogout" color="gray" label="Logout" />
            </div>
        </Header>
        <!-- <header class="flex pt-4 justify-between container mx-auto">
            <h1 class="">My Nuxt App</h1>
            <nav class="flex gap-3 items-center">

                <NuxtLink to="/">Home</NuxtLink>
                <NuxtLink to="/about">About</NuxtLink>
            </nav>
        </header> -->
        <main class="grow">
            <slot />
        </main>
        <PWAInstallPrompt />
        <OfflineBanner />
    </section>
</template>

<style>
/* Tambahkan gaya CSS sesuai kebutuhan */
</style>