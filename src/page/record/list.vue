<template>
  <main class="q-py-lg">
    <div class="container-sm">
      <div class="row q-col-gutter-md">
        <div class="col-md-6 col-12">
          <q-input filled stack-label v-model="Filter.Date" placeholder="請選擇日期" mask="date" label="選擇日期" :rules="['date']" @update:model-value="GetList">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="Filter.Date" :options="LimitOptions" minimal @update:model-value="GetList" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-md-6 col-12">
          <q-input filled stack-label v-model="Filter.EntryTag" label="站點標籤" placeholder="可快速篩選特定站點內的資料" @update:model-value="GetList" />
        </div>
      </div>
      <q-table
          :loading="Loading"
          :rows="Data"
          :columns="Columns"
          :pagination="{rowsPerPage: 10}"
          row-key="Name"
      >
        <template v-slot:body-cell-Action="props">
          <q-td :props="props">
            <q-btn
                flat
                round
                icon="download"
                color="positive"
                type="a"
                size="sm"
                :href="props.row.PublicURL"
                target="_blank"
            />
          </q-td>
        </template>
      </q-table>
    </div>
  </main>
</template>

<script>
import { useQuasar } from 'quasar'
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import { getAuth, getIdToken } from 'firebase/auth'
import { InnerServerRequest } from '@/plugins/request'

export default {
  name: 'VideoRecord',
  setup () {
    const $q = useQuasar()
    const Data = ref([])
    const Filter = ref({
      Date: dayjs().format('YYYY/MM/DD'),
      EntryTag: ''
    })
    const Loading = ref(false)
    const GetList = async () => {
      Loading.value = true
      const Auth = getAuth()
      const Token = await getIdToken(Auth.currentUser)
      return InnerServerRequest.post('/record/list', {
        SelectDate: dayjs(Filter.value.Date).format('YYYY-MM-DD'),
        EntryTag: Filter.value.EntryTag
      }, {
        headers: {
          'xx-csrf-token': Token
        }
      }).then(({ data }) => {
        $q.loadingBar.stop()
        Loading.value = false
        Data.value = data.Data
      }).catch((error) => {
        $q.loadingBar.stop()
        Loading.value = false
        throw error
      })
    }

    const Columns = [
      { name: 'Name', align: 'left', label: '檔案名稱', field: 'Name' },
      { name: 'Size', align: 'left', label: '檔案大小 (Bytes)', field: 'Size' },
      { name: 'CreateTime', align: 'left', label: '建立時間', field: 'CreateTime' },
      { name: 'Action', align: 'right', label: '', field: '' }
    ]

    $q.loadingBar.start()
    onMounted(() => {
      setTimeout(() => {
        $q.loadingBar.increment(33)
        GetList()
      }, 1200)
    })

    return {
      Columns,
      Data,
      Filter,
      Loading,
      GetList,
      LimitOptions (date) {
        return date <= dayjs().format('YYYY/MM/DD')
      }
    }
  }
}
</script>

<style scoped>

</style>

<style>
/* change player background color */
#myVideo {
  background-color: #95DDF5;
}
</style>
