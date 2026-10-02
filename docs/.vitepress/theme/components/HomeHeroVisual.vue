<script setup lang="ts">
import { useData } from 'vitepress'

const { localeIndex } = useData()
const shotSrc = '/readme/home.webp'
</script>

<template>
  <div class="hero-visual" aria-hidden="false">
    <div class="hero-visual__glow"></div>
    <img
      class="hero-visual__shot"
      :src="shotSrc"
      :alt="localeIndex === 'zh-CN' ? '上游 PI-Desktop 历史界面截图' : 'Archived upstream PI-Desktop workspace'"
      width="2560"
      height="1440"
      decoding="async"
      fetchpriority="high"
    />
    <p class="hero-visual__caption">
      {{ localeIndex === 'zh-CN' ? '上游历史截图 · WcSdAi 截图待重新采集' : 'Upstream archive · WcSdAi captures pending' }}
    </p>
  </div>
</template>
