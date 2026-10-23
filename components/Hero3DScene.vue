<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isFlipped = ref(false);
const isAutoOrbit = ref(true);
const isHovered = ref(false);
const isDragging = ref(false);

const cardContainer = ref<HTMLDivElement | null>(null);

// Continuous Physics Engine State
let animFrameId: number;
let time = 0;

// Rotation angles (degrees)
let rotX = 0;
let rotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let velX = 0;
let velY = 0;

// Mouse parallax tracking
let mouseX = 0;
let mouseY = 0;
let lastPointerX = 0;
let lastPointerY = 0;

// Reactive values exposed to template
const displayTransform = ref("");
const glareStyle = ref({});
const coin1Transform = ref("");
const coin2Transform = ref("");
const coin3Transform = ref("");

function handlePointerDown(e: MouseEvent | TouchEvent) {
  isDragging.value = true;
  isAutoOrbit.value = false;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  lastPointerX = clientX;
  lastPointerY = clientY;
  velX = 0;
  velY = 0;
}

function handlePointerMove(e: MouseEvent | TouchEvent) {
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

  if (isDragging.value) {
    const deltaX = clientX - lastPointerX;
    const deltaY = clientY - lastPointerY;

    // Direct, highly responsive angular dragging
    velY = deltaX * 0.45;
    velX = -deltaY * 0.45;

    targetRotY += velY;
    targetRotX += velX;

    lastPointerX = clientX;
    lastPointerY = clientY;
  } else if (cardContainer.value) {
    // Smooth fluid cursor parallax
    const rect = cardContainer.value.getBoundingClientRect();
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    mouseX = x / (rect.width / 2);
    mouseY = y / (rect.height / 2);
  }
}

function handlePointerUp() {
  isDragging.value = false;
}

function toggleFlip() {
  isFlipped.value = !isFlipped.value;
  isAutoOrbit.value = false;
}

function toggleAutoOrbit() {
  isAutoOrbit.value = !isAutoOrbit.value;
}

function resetPosition() {
  targetRotX = 0;
  targetRotY = isFlipped.value ? 180 : 0;
  velX = 0;
  velY = 0;
  isAutoOrbit.value = true;
}

// Main Physics & Render Loop
function updatePhysics() {
  time += 0.02;

  // Inertia decay when dragging ends
  if (!isDragging.value) {
    velX *= 0.88;
    velY *= 0.88;
    targetRotX += velX;
    targetRotY += velY;

    if (isAutoOrbit.value) {
      // Gentle, continuous floating & breathing oscillation
      const idleTiltX = Math.sin(time * 0.9) * 8;
      const idleTiltY = Math.cos(time * 0.7) * 14;
      targetRotX = idleTiltX - mouseY * 15;
      targetRotY = (isFlipped.value ? 180 : 0) + idleTiltY + mouseX * 22;
    } else {
      // Freeform with mouse parallax spring
      const baseFlip = isFlipped.value ? 180 : 0;
      targetRotX = Math.max(-65, Math.min(65, targetRotX));
    }
  }

  // Butter-smooth spring interpolation (lerp)
  rotX += (targetRotX - rotX) * 0.12;
  rotY += (targetRotY - rotY) * 0.12;

  // Floating elevation offset
  const floatZ = isHovered.value || isDragging.value ? 30 : Math.sin(time * 1.5) * 8;

  // Update card transform with full 3D spatial depth
  displayTransform.value = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${floatZ.toFixed(1)}px)`;

  // Dynamic light refraction (specular glare follows rotation and cursor)
  const normRotY = ((rotY % 360) + 360) % 360;
  const glarePosX = ((normRotY / 180) * 100 + mouseX * 30 + 50) % 100;
  const glarePosY = (-rotX * 2 - mouseY * 30 + 50);

  glareStyle.value = {
    background: `radial-gradient(circle 380px at ${glarePosX}% ${glarePosY}%, rgba(255, 255, 255, 0.45) 0%, rgba(59, 130, 246, 0.25) 35%, transparent 70%)`,
    opacity: isDragging.value || isHovered.value ? 0.8 : 0.45,
  };

  // Parallax Multi-Plane Floating Coins
  // Coin 1 ($): Deep foreground parallax
  const c1X = Math.sin(time * 1.2) * 12 + mouseX * 18;
  const c1Y = Math.cos(time * 1.4) * 10 + mouseY * 18;
  coin1Transform.value = `translate3d(${c1X.toFixed(1)}px, ${c1Y.toFixed(1)}px, 80px) rotateY(${(-rotY * 0.4).toFixed(1)}deg) rotateX(${(rotX * 0.3).toFixed(1)}deg)`;

  // Coin 2 (€): Midground parallax
  const c2X = Math.cos(time * 1.1) * 10 - mouseX * 14;
  const c2Y = Math.sin(time * 1.3) * 12 - mouseY * 14;
  coin2Transform.value = `translate3d(${c2X.toFixed(1)}px, ${c2Y.toFixed(1)}px, 50px) rotateY(${(rotY * 0.3).toFixed(1)}deg) rotateX(${(-rotX * 0.2).toFixed(1)}deg)`;

  // Coin 3 (£): Background layer parallax
  const c3X = Math.sin(time * 0.8 + 2) * 8 + mouseX * 10;
  const c3Y = Math.cos(time * 0.9 + 1) * 8 + mouseY * 10;
  coin3Transform.value = `translate3d(${c3X.toFixed(1)}px, ${c3Y.toFixed(1)}px, -30px) rotateY(${(rotY * 0.2).toFixed(1)}deg)`;

  animFrameId = requestAnimationFrame(updatePhysics);
}

onMounted(() => {
  animFrameId = requestAnimationFrame(updatePhysics);
  window.addEventListener("mouseup", handlePointerUp);
  window.addEventListener("touchend", handlePointerUp);
});

onUnmounted(() => {
  cancelAnimationFrame(animFrameId);
  window.removeEventListener("mouseup", handlePointerUp);
  window.removeEventListener("touchend", handlePointerUp);
});
</script>

<template>
  <div class="relative w-full flex flex-col items-center justify-center select-none py-6">
    <!-- Fluid Radial Glow -->
    <div
      class="absolute inset-0 bg-radial from-blue-600/25 via-purple-600/15 to-transparent blur-3xl pointer-events-none"
    ></div>

    <!-- 3D Perspective Stage -->
    <div
      ref="cardContainer"
      class="relative w-full max-w-[420px] sm:max-w-[490px] h-[310px] sm:h-[350px] flex items-center justify-center touch-none cursor-grab active:cursor-grabbing [perspective:1200px]"
      @mousedown="handlePointerDown"
      @touchstart="handlePointerDown"
      @mousemove="handlePointerMove"
      @touchmove="handlePointerMove"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false; mouseX = 0; mouseY = 0"
    >
      <!-- ================= MULTI-PLANE FLOATING 3D GOLD COINS ================= -->
      <!-- Coin 1: Gold Dollar ($) (Foreground Left) -->
      <div
        class="absolute -top-3 -left-4 sm:-left-8 z-30 pointer-events-none will-change-transform"
        :style="{ transform: coin1Transform }"
      >
        <div
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-[3px] shadow-2xl shadow-amber-500/40"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-2 border-yellow-200/70 shadow-inner"
          >
            <span class="text-xl sm:text-2xl font-black text-amber-950 font-mono drop-shadow">$</span>
          </div>
        </div>
      </div>

      <!-- Coin 2: Gold Euro (€) (Foreground Right) -->
      <div
        class="absolute -bottom-3 -right-4 sm:-right-8 z-30 pointer-events-none will-change-transform"
        :style="{ transform: coin2Transform }"
      >
        <div
          class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-[2.5px] shadow-2xl shadow-amber-500/40"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center border-2 border-yellow-200/70 shadow-inner"
          >
            <span class="text-lg sm:text-xl font-black text-amber-950 font-mono drop-shadow">€</span>
          </div>
        </div>
      </div>

      <!-- Coin 3: Subtle Background Coin (£) -->
      <div
        class="absolute -top-2 right-8 z-10 pointer-events-none opacity-85 will-change-transform"
        :style="{ transform: coin3Transform }"
      >
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-400 p-[2px] shadow-lg shadow-amber-500/20"
        >
          <div
            class="w-full h-full rounded-full bg-gradient-to-br from-amber-600 to-yellow-500 flex items-center justify-center border border-yellow-200/50"
          >
            <span class="text-sm font-black text-amber-950 font-mono">£</span>
          </div>
        </div>
      </div>

      <!-- ================= THE PHYSICAL 3D ROTATING WEALTH CARD ================= -->
      <div
        class="relative w-[340px] sm:w-[430px] aspect-[1.586/1] rounded-[1.8rem] [transform-style:preserve-3d] will-change-transform shadow-[0_25px_60px_-15px_rgba(15,23,42,0.6)]"
        :style="{ transform: displayTransform }"
      >
        <!-- ================= CARD FRONT FACE ================= -->
        <div
          class="absolute inset-0 w-full h-full rounded-[1.8rem] p-6 sm:p-7 flex flex-col justify-between overflow-hidden [backface-visibility:hidden] [transform:rotateY(0deg)] border border-blue-400/30 bg-gradient-to-br from-[#0B0F19] via-[#111C38] to-[#1E1B4B] text-white shadow-2xl"
        >
          <!-- Signature Radial Blue/Purple Glow inside Card -->
          <div
            class="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-blue-500/50 via-purple-600/35 to-transparent rounded-full blur-2xl pointer-events-none"
          ></div>
          <div
            class="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-indigo-600/35 via-blue-600/25 to-transparent rounded-full blur-2xl pointer-events-none"
          ></div>

          <!-- Crisp Geometric Micro-Grid Mesh -->
          <div
            class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:22px_22px] pointer-events-none"
          ></div>

          <!-- Dynamic Holographic Specular Glare (Continuous physics refraction) -->
          <div
            class="absolute inset-0 pointer-events-none rounded-[1.8rem] overflow-hidden mix-blend-overlay transition-opacity duration-200"
            :style="glareStyle"
          ></div>

          <!-- Header: Brand Logo & Contactless Symbol -->
          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
              >
                <UIcon name="i-heroicons-bolt" class="w-6 h-6 text-white" />
              </div>
              <div class="flex flex-col -space-y-1">
                <span class="text-xl sm:text-2xl font-black tracking-tight text-white">
                  FTraker<span class="text-blue-400">.</span>
                </span>
                <span class="text-[9px] font-mono tracking-widest uppercase text-blue-300 font-bold">
                  Wealth Pass
                </span>
              </div>
            </div>

            <!-- Contactless Wi-Fi Waves -->
            <div class="flex items-center gap-1.5 opacity-90">
              <UIcon name="i-heroicons-signal" class="w-6 h-6 text-blue-200 rotate-90" />
            </div>
          </div>

          <!-- Middle: Photorealistic Golden EMV Microchip -->
          <div class="relative z-10 flex items-center gap-4 my-auto">
            <div
              class="w-12 h-9 sm:w-14 sm:h-10 rounded-lg bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 p-[1.5px] shadow-md shadow-amber-500/25"
            >
              <div
                class="w-full h-full rounded-[6px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 relative overflow-hidden border border-amber-600/30 flex items-center justify-center"
              >
                <div class="absolute inset-x-0 h-[1px] bg-amber-700/50"></div>
                <div class="absolute inset-y-0 w-[1px] bg-amber-700/50"></div>
                <div class="w-5 h-4 border border-amber-700/40 rounded-sm"></div>
              </div>
            </div>

            <div class="text-[10px] font-mono uppercase tracking-wider text-blue-200/80 font-bold hidden sm:block">
              Priority Vault Node
            </div>
          </div>

          <!-- Embossed Card Number -->
          <div class="relative z-10">
            <div
              class="font-mono text-lg sm:text-2xl font-bold tracking-[0.22em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
            >
              4532 &nbsp;8834 &nbsp;9012 &nbsp;4829
            </div>
          </div>

          <!-- Bottom: Cardholder Name, Expiry & Master Seal -->
          <div class="relative z-10 flex items-end justify-between pt-1">
            <div class="space-y-0.5">
              <div class="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Cardholder
              </div>
              <div class="text-xs sm:text-sm font-black tracking-wider text-white uppercase">
                Alex Morgan
              </div>
            </div>

            <div class="space-y-0.5">
              <div class="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                Expires
              </div>
              <div class="text-xs sm:text-sm font-bold tracking-widest text-white font-mono">
                10 / 29
              </div>
            </div>

            <!-- Interlocking Hologram Seal -->
            <div class="flex items-center -space-x-3 opacity-95">
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500/80 shadow-md"></div>
              <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-500/80 shadow-md"></div>
            </div>
          </div>
        </div>

        <!-- ================= CARD BACK FACE ================= -->
        <div
          class="absolute inset-0 w-full h-full rounded-[1.8rem] flex flex-col justify-between overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] border border-slate-700 bg-gradient-to-br from-[#070A12] via-[#0D1322] to-[#080C16] text-white shadow-2xl py-6"
        >
          <!-- Magnetic Stripe -->
          <div class="w-full h-11 sm:h-12 bg-black shadow-inner border-y border-white/5"></div>

          <!-- Signature Strip & CVV -->
          <div class="px-6 sm:px-7 space-y-2">
            <div class="flex items-center gap-3">
              <!-- Signature Bar -->
              <div
                class="flex-1 h-9 sm:h-10 bg-slate-100 rounded-md flex items-center px-4 overflow-hidden relative shadow-inner"
              >
                <div class="text-slate-800 font-serif italic text-sm font-bold tracking-wide">
                  Alex Morgan
                </div>
                <div
                  class="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(0,0,0,0.06)_6px,rgba(0,0,0,0.06)_12px)] pointer-events-none"
                ></div>
              </div>

              <!-- CVV Badge -->
              <div
                class="w-16 h-9 sm:h-10 rounded-md bg-slate-800 border border-slate-700 flex flex-col items-center justify-center shadow-inner"
              >
                <span class="text-[8px] font-mono uppercase text-slate-400 leading-none">CVV</span>
                <span class="text-sm font-mono font-black text-cyan-400 tracking-wider">839</span>
              </div>
            </div>
          </div>

          <!-- Fine Print -->
          <div class="px-6 sm:px-7 space-y-1 text-[9px] sm:text-[10px] text-slate-400 leading-relaxed font-sans">
            <p>
              This card is authorized for F-Tracker Autonomous Wealth System. Zero-knowledge encrypted.
            </p>
            <p class="text-slate-500 font-mono">
              24/7 Concierge Support • cloud.eka-dev.f-tracker • Priority Node
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fluid Interactive Controls Bar -->
    <div
      class="relative z-20 flex flex-wrap items-center justify-center gap-2.5 mt-3 px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg"
    >
      <!-- Flip Button -->
      <button
        type="button"
        class="px-4 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-1.5"
        @click="toggleFlip"
      >
        <UIcon name="i-heroicons-arrow-path-rounded-square" class="w-4 h-4" />
        <span>{{ isFlipped ? "Flip to Front" : "Flip to Back" }}</span>
      </button>

      <!-- Auto Orbit Toggle -->
      <button
        type="button"
        class="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1.5"
        @click="toggleAutoOrbit"
      >
        <UIcon :name="isAutoOrbit ? 'i-heroicons-pause' : 'i-heroicons-play'" class="w-3.5 h-3.5 text-blue-500" />
        <span>{{ isAutoOrbit ? "Pause Motion" : "Float Live" }}</span>
      </button>

      <!-- Reset Angle Button -->
      <button
        type="button"
        class="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center gap-1"
        @click="resetPosition"
      >
        <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 text-slate-400" />
        <span>Reset</span>
      </button>

      <div class="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>

      <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
        Drag freely to spin 360°
      </span>
    </div>
  </div>
</template>
