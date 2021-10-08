<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md">
      <div class="q-gutter-y-md column" style="max-width: 400px">
        <q-input stack-label v-model="UserID" label="員工代碼" placeholder="輸入員工代碼" hint="請輸入員工代碼或掃描條碼" />
        <q-input stack-label v-model="ShipmentID" label="揀貨單號" placeholder="輸入揀貨單號" hint="請輸入揀貨單號或掃描揀貨單上條碼" />
        <q-field label="開始錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img alt="Vue logo" src="../assets/start.svg">
            </div>
          </template>
        </q-field>
        <q-field label="停止錄影" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline q-mt-md" tabindex="0">
              <img alt="Vue logo" src="../assets/end.svg">
            </div>
          </template>
        </q-field>
      </div>
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
