<script setup lang="ts">
import { ref } from "vue";

interface Props {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxTilt: 10,
  perspective: 1000,
  scale: 1.02,
  glare: true,
  className: "",
});

const cardRef = ref<HTMLDivElement | null>(null);
const tiltX = ref(0);
const tiltY = ref(0);
const currentScale = ref(1);
const glareX = ref(50);
const glareY = ref(50);
const glareOpacity = ref(0);
const isHovered = ref(false);

function handleMouseMove(e: MouseEvent) {
  if (!cardRef.value) return;
  const rect = cardRef.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Calculate tilt percentages (-1 to 1)
  const percentX = (x - centerX) / centerX;
  const percentY = (y - centerY) / centerY;

  tiltX.value = -percentY * props.maxTilt;
  tiltY.value = percentX * props.maxTilt;
  currentScale.value = props.scale;

  // Glare position
  glareX.value = (x / rect.width) * 100;
  glareY.value = (y / rect.height) * 100;
  glareOpacity.value = 0.35;
  isHovered.value = true;
}

function handleMouseLeave() {
  tiltX.value = 0;
  tiltY.value = 0;
  currentScale.value = 1;
  glareOpacity.value = 0;
  isHovered.value = false;
}
</script>

<template>
  <div
    ref="cardRef"
    class="relative transform-gpu transition-all duration-300 ease-out will-change-transform"
    :class="className"
    :style="{
      transform: `perspective(${props.perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${currentScale}, ${currentScale}, ${currentScale})`,
      transformStyle: 'preserve-3d',
    }"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <slot />

    <!-- Dynamic Specular Glare Effect -->
    <div
      v-if="props.glare"
      class="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 overflow-hidden"
      :style="{
        opacity: glareOpacity,
        background: `radial-gradient(circle 320px at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.25), transparent 70%)`,
      }"
    ></div>
  </div>
</template>
