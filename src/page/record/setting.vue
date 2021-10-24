<template>
  <main class="q-py-lg">
    <div class="container-xs">
      <q-input stack-label v-model="Data.EntryTag" label="站點標籤" placeholder="請設定站點標籤" hint="站點標籤只會儲存在設定過的裝置內，用於區分各站點的裝置名稱作為上傳影片的歸類依據。" @update:model-value="UpdateEntryTag" />
    </div>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
export default {
  name: 'Setting',
  setup () {
    const Data = ref({
      EntryTag: ''
    })
    onMounted(() => {
      if (localStorage.getItem('EntryTag')) {
        Data.value.EntryTag = localStorage.getItem('EntryTag')
      }
    })
    const TempValue = ref('')
    const UpdateEntryTag = (value) => {
      TempValue.value = value
      setTimeout(() => {
        if (TempValue.value === value) {
          localStorage.setItem('EntryTag', value)
        }
      }, 500)
    }
    return {
      Data,
      UpdateEntryTag
    }
  }
}
</script>
