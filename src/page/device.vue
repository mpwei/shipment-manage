<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { ref } from 'vue'

export default {
  name: 'HelloWorld',
  setup () {
    const UserID = ref('')
    const ShipmentID = ref('')
    return {
      UserID,
      ShipmentID
    }
  }
}
</script>
