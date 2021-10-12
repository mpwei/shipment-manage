<template>
  <main class="q-py-lg">
    <div class="container-sm">
      <q-btn-group spread class="desktop-hide q-mb-md text-center full-width">
        <q-btn color="primary" label="匯入" @click="OpenUploadModal()" />
        <q-btn color="negative" label="匯出" @click="Export" />
        <q-btn
            color="secondary"
            label="下載範例"
            type="a"
            href="https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/example%2F%E8%B2%A8%E4%BB%B6%E5%88%97%E8%A1%A8-%E5%8C%AF%E5%85%A5%E7%AF%84%E4%BE%8B.csv?alt=media&token=1a978397-1bac-4e70-95fc-5bae5e454bdf"
        />
      </q-btn-group>
      <q-table
          :rows="Data"
          :columns="Columns"
          row-key="name"
          :pagination="{rowsPerPage: 10, rowsNumber: 10}"
          :rows-per-page-options="[10, 20]"
      >
        <template v-slot:top-right>
          <div class="mobile-hide">
            <q-btn
                color="primary"
                label="匯入"
                icon="publish"
                no-caps
                class="q-mr-sm"
                @click="OpenUploadModal()"
            />
            <q-btn
                color="negative"
                icon-right="archive"
                label="匯出"
                no-caps
                class="q-mr-sm"
                @click="Export"
            />
            <q-btn
                type="a"
                href="https://firebasestorage.googleapis.com/v0/b/mpwei-logistics-system.appspot.com/o/example%2F%E8%B2%A8%E4%BB%B6%E5%88%97%E8%A1%A8-%E5%8C%AF%E5%85%A5%E7%AF%84%E4%BE%8B.csv?alt=media&token=1a978397-1bac-4e70-95fc-5bae5e454bdf"
                color="secondary"
                label="下載範例"
                icon="download"
                no-caps
            />
          </div>
        </template>
      </q-table>
    </div>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
      <q-uploader url="/api/shipment/import" field-name="upload" :headers="UploadHeader" />
    </q-dialog>
  </main>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getAuth, getIdToken } from 'firebase/auth'
import { useQuasar, exportFile, useDialogPluginComponent } from 'quasar'
import dayjs from 'dayjs'
import { InnerServerRequest } from '@/plugins/request'
import ErrorCode from "../../locales/error"

function wrapCsvValue (val, formatFn) {
  let formatted = formatFn !== void 0
      ? formatFn(val)
      : val

  formatted = formatted === void 0 || formatted === null
      ? ''
      : String(formatted)

  formatted = formatted.split('"').join('""')
  /**
   * Excel accepts \n and \r in strings, but some other CSV parsers do not
   * Uncomment the next two lines to escape new lines
   */
  // .split('\n').join('\\n')
  // .split('\r').join('\\r')

  return `"${formatted}"`
}

export default {
  name: 'ShipmentList',
  setup () {
    const $q = useQuasar()
    const Filter = (value, type) => {
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
      { name: 'CreateTime', align: 'left', label: '匯入時間', field: 'CreateTime', format: val => Filter(val, 'CreateTime') },
      { name: 'ShipmentNo', align: 'left', label: '貨件號碼', field: 'ShipmentNo', format: val => Filter(val, 'ShipmentNo') },
      { name: 'Location', align: 'left', label: '到貨站', field: 'Location', format: val => Filter(val, 'Location') },
      { name: 'Operator', align: 'left', label: '作業人員', field: 'Operator', format: val => Filter(val, 'Operator') },
      { name: 'UpdateTime', align: 'left', label: '最後作業時間', field: 'UpdateTime', format: val => Filter(val, 'CreateTime') },
    ]
    const Data = ref([])

    $q.loadingBar.start()
    onMounted(() => {
      setTimeout(async () => {
        $q.loadingBar.increment(33)
        const Auth = getAuth()
        const Token = await getIdToken(Auth.currentUser)
        return InnerServerRequest.post('/shipment/list', {}, {
          headers: {
            'xx-csrf-token': Token
          }
        }).then(({ data }) => {
          $q.loadingBar.stop()
          Data.value = data.Data
        }).catch((error) => {
          $q.loadingBar.stop()
          $q.notify({
            type: 'negative',
            message: '錯誤',
            caption: error.Message || ErrorCode[error.code]
          })
        })
      }, 2000)
    })

    let IdToken = ''
    const { dialogRef, onDialogHide } = useDialogPluginComponent()

    return {
      Columns,
      Data,
      async OpenUploadModal () {
        const Auth = getAuth()
        IdToken = await getIdToken(Auth.currentUser)
        dialogRef.value.show()
      },
      UploadHeader () {
        return [
          {
            name: 'xx-csrf-token',
            value: IdToken
          }
        ]
      },
      Export () {
        // naive encoding to csv format
        const content = [Columns.map(col => wrapCsvValue(col.label))].concat(
            Data.value.map(row => Columns.map(col => wrapCsvValue(
                typeof col.field === 'function'
                    ? col.field(row)
                    : row[ col.field === void 0 ? col.name : col.field ],
                col.format
            )).join(','))
        ).join('\r\n')

        const status = exportFile(
            `貨件列表-${dayjs().format('YYYYMMDDHHmmss')}.csv`,
            content,
            'text/csv'
        )

        if (status !== true) {
          $q.notify({
            message: '當前瀏覽器不支援下載檔案',
            color: 'negative',
            icon: 'warning'
          })
        }
      },
      dialogRef,
      onDialogHide
    }
  }
}
</script>

<style scoped>

</style>
