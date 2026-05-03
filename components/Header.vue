<template>
    <header class="flex items-center w-full container mx-auto justify-between my-10">
        <NuxtLink to="/">
            <h1 class="text-2xl font-bold">FTracker</h1>
        </NuxtLink>
        <div class="flex space-x-3 items-center">
            <NuxtLink to="/settings">
                <UButton
                    icon="i-material-symbols-settings-outline-rounded"
                    color="gray"
                    variant="ghost"
                    size="md"
                    square
                    title="Settings"
                />
            </NuxtLink>
            <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Avatar" />
            <slot />
        </div>
    </header>
</template>
