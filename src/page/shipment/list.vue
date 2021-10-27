<template>
  <main class="q-py-lg">
    <div class="container-sm">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-md-6 col-lg-4 col-12">
          <q-input filled stack-label v-model="Filter.ShipmentNo" label="貨件號碼" placeholder="輸入貨件號碼可篩選出單一貨件" @update:model-value="GetList" />
        </div>
        <div class="col-md-6 col-lg-4 col-12">
          <q-input filled stack-label v-model="Filter.Location" label="到貨站" placeholder="輸入到貨站可篩選出該到貨站的所有貨件" @update:model-value="GetList" />
        </div>
        <div class="col-md-6 col-lg-4 col-12">
          <q-btn-group spread unelevated class="text-center full-width">
            <q-btn stack icon="publish" color="grey-3" text-color="grey-7" label="匯入" @click="OpenUploadModal()" />
            <q-btn stack icon="archive" color="grey-3" text-color="grey-7" label="匯出" @click="OpenExportModal()" />
            <q-btn
                stack
                text-color="grey-7"
                icon="download"
                color="grey-3"
                label="下載範例"
                type="a"
                href="https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/example%2F%E8%B2%A8%E4%BB%B6%E5%88%97%E8%A1%A8-%E5%8C%AF%E5%85%A5%E7%AF%84%E4%BE%8B.csv?alt=media&token=1a978397-1bac-4e70-95fc-5bae5e454bdf"
            />
          </q-btn-group>
        </div>
      </div>
      <q-table
          :loading="Loading"
          :rows="Data"
          :columns="Columns"
          row-key="ShipmentNo"
          v-model:pagination="Pagination"
          :rows-per-page-options="[10, 20]"
          @request="GetList"
      >
      </q-table>
    </div>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-uploader url="/api/shipment/import" field-name="upload" :headers="UploadHeader" @uploaded="HandleUploadMessage" @failed="HandleUploadMessage" />
    </q-dialog>
    <q-dialog ref="ExportDialog" @hide="onDialogHide">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">匯出貨件列表</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input filled v-model="ExportDate" mask="date" label="選擇日期" :rules="['date']">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                  <q-date v-model="ExportDate" minimal />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions>
          <q-btn color="primary" class="full-width" label="執行匯出" @click="Export()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAuth, getIdToken } from 'firebase/auth'
import { useQuasar, useDialogPluginComponent } from 'quasar'
import dayjs from 'dayjs'
import { InnerServerRequest } from '@/plugins/request'
import ErrorCode from "../../locales/error"

export default {
  name: 'ShipmentList',
  setup () {
    const $q = useQuasar()
    const ColumnFilter = (value, type) => {
      if (typeof value === 'undefined') {
        return '--'
      }
      switch (type) {
        case 'CreateTime':
        case 'UpdateTime':
          return dayjs(value._seconds * 1000).format('YYYY-MM-DD HH:mm:ss')
        default:
          return value
      }
    }
    const Columns = [
      { name: 'ShipmentNo', align: 'left', label: '貨件號碼', field: 'ShipmentNo', format: val => ColumnFilter(val, 'ShipmentNo') },
      { name: 'Location', align: 'left', label: '到貨站', field: 'Location', format: val => ColumnFilter(val, 'Location') },
      { name: 'CreateTime', align: 'left', label: '匯入時間', field: 'CreateTime', format: val => ColumnFilter(val, 'CreateTime') },
      { name: 'Operator', align: 'left', label: '作業人員', field: 'Operator', format: val => ColumnFilter(val, 'Operator') },
      { name: 'UpdateTime', align: 'left', label: '最後作業時間', field: 'UpdateTime', format: val => ColumnFilter(val, 'CreateTime') },
    ]

    const Filter = ref({
      ShipmentNo: '',
      Location: ''
    })
    const Data = ref([])
    const Loading = ref(false)
    const Pagination = ref({
      sortBy: 'desc',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
    const NextCreateTime = ref(null)
    const GetList = async (props) => {
      Loading.value = true
      const Auth = getAuth()
      const Token = await getIdToken(Auth.currentUser)
      const Condition = {
        PerPage: Pagination.value.rowsPerPage
      }
      if (props) {
        if (props.pagination?.page < Pagination.value?.page) {
          Condition.Action = 'Prev'
          Condition.NextCreateTime = NextCreateTime.value
        }
        if (props.pagination?.page > Pagination.value?.page) {
          Condition.Action = 'Next'
          Condition.NextCreateTime = NextCreateTime.value
        }
      }
      const SendData = {
        ...Condition
      }
      Object.keys(Filter.value).forEach((key) => {
        if (Filter.value[key] !== '') {
          SendData[key] = Filter.value[key]
        }
      })
      return InnerServerRequest.post('/shipment/list', SendData, {
        headers: {
          'xx-csrf-token': Token
        }
      }).then(({ data }) => {
        $q.loadingBar.stop()
        Loading.value = false
        Data.value = data.Data
        NextCreateTime.value = data.NextCreateTime
        Pagination.value.rowsNumber = data.Counts
        if (props) {
          Pagination.value.page = props.pagination.page
        }
      }).catch((error) => {
        $q.loadingBar.stop()
        Loading.value = false
        throw error
      })
    }

    const ExportDialog = ref(null)
    const ExportDate = ref(dayjs().format('YYYY/MM/DD'))

    $q.loadingBar.start()
    onMounted(() => {
      setTimeout(async () => {
        $q.loadingBar.increment(33)
        return GetList().catch((error) => {
          $q.notify({
            type: 'negative',
            message: '錯誤',
            caption: error.Message || ErrorCode[error.code]
          })
        })
      }, 1200)
    })

    let IdToken = ''
    const { dialogRef, onDialogHide } = useDialogPluginComponent()

    return {
      Filter,
      Loading,
      Columns,
      Data,
      Pagination,
      dialogRef,
      ExportDialog,
      ExportDate,
      onDialogHide,
      GetList,
      async OpenUploadModal () {
        const Auth = getAuth()
        IdToken = await getIdToken(Auth.currentUser)
        dialogRef.value.show()
      },
      async OpenExportModal () {
        ExportDialog.value.show()
      },
      UploadHeader () {
        return [
          {
            name: 'xx-csrf-token',
            value: IdToken
          }
        ]
      },
      async Export () {
        const Auth = getAuth()
        const Token = await getIdToken(Auth.currentUser)
        return InnerServerRequest.post('/shipment/export', {
          StartTime: dayjs(ExportDate.value).format('YYYY-MM-DD HH:mm:ss'),
          EndTime: dayjs(ExportDate.value).format('YYYY-MM-DD 23:59:59'),
        }, {
          headers: {
            'xx-csrf-token': Token
          }
        }).then(({ data }) => {
          const BinaryString = window.atob(data.CsvData)
          const Bytes = new Uint8Array(BinaryString.length)
          for (let index = 0; index < BinaryString.length; index++) {
            Bytes[index] = BinaryString.charCodeAt(index)
          }
          const Data = new Blob([Bytes], {type: 'application/octet-stream'})
          const blobURL = URL.createObjectURL(Data)
          const tempLink = document.createElement('a')
          tempLink.style.display = 'none'
          tempLink.href = blobURL
          tempLink.setAttribute('download', `貨件列表-${dayjs().format('YYYYMMDDHHmm')}.csv`, '_blank')
          document.body.appendChild(tempLink)
          tempLink.click()
          document.body.removeChild(tempLink)
          window.URL.revokeObjectURL(blobURL)

          $q.notify({
            message: '成功',
            caption: '匯出成功',
            type: 'positive'
          })

          ExportDialog.value.hide()
        }).catch((error) => {
          $q.notify({
            message: '失敗',
            caption: error.Message,
            type: 'negative'
          })
        })
      },
      HandleUploadMessage (info) {
        const Response = JSON.parse(info.xhr.response)
        switch (info.xhr.status) {
          case 200:
            $q.notify({
              message: '成功',
              caption: '匯入檔案成功',
              type: 'positive'
            })
            GetList()
            break
          default:
            $q.notify({
              message: '失敗',
              caption: Response.Message,
              type: 'negative'
            })
            break
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
