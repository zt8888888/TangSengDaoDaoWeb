<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <el-button type="primary" @click="handleAdd">
            <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加存款方式
          </el-button>
        </div>
        <el-button @click="loadData">
          <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
          刷新
        </el-button>
      </div>
    </div>

    <div class="bg-box p-4 rounded-lg shadow-sm">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" sortable />
        <el-table-column prop="paytype" label="标识" min-width="120" align="center" sortable />
        <el-table-column prop="paytypetitle" label="支付名称" min-width="150" align="center" sortable />
        <el-table-column prop="ftitle" label="副名称" min-width="150" align="center" />
        
        <el-table-column label="线上支付" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isonline === 1" type="danger">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.state"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStateChange(row, val as number)"
            />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="handleEdit(row)"
            >修改</el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加存款方式' : '修改存款方式'"
      width="650px"
      destroy-on-close
      top="5vh"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="标识" prop="paytype">
          <el-input v-model="form.paytype" placeholder="如: alipay, weixin, linepay, USDT" :disabled="dialogType === 'edit'" />
        </el-form-item>
        <el-form-item label="支付名称" prop="paytypetitle">
          <el-input v-model="form.paytypetitle" placeholder="请输入支付名称" />
        </el-form-item>
        <el-form-item label="副名称" prop="ftitle">
          <el-input v-model="form.ftitle" placeholder="请输入副名称" />
        </el-form-item>
        <el-form-item label="最低金额">
          <el-input-number v-model="form.minmoney" :min="1" :max="999999" />
        </el-form-item>
        <el-form-item label="最高金额">
          <el-input-number v-model="form.maxmoney" :min="1" :max="999999" />
        </el-form-item>
        <el-form-item label="线上支付" prop="isonline">
          <el-radio-group v-model="form.isonline">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
          <div class="text-xs text-gray-400 mt-1">线上支付为第三方支付，否则为人工充值</div>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-radio-group v-model="form.state">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        
        <el-divider content-position="left">收款配置</el-divider>
        
        
        <template v-if="['alipay', 'weixin'].includes(form.paytype)">
          <el-form-item label="收款二维码">
            <div class="w-full">
              <div class="flex gap-2 mb-2">
                <el-input v-model="form.configs_data.ewmurl" placeholder="二维码图片地址" class="flex-1" />
                <el-button type="primary" @click="triggerUpload">
                  <ArtSvgIcon icon="ri:upload-line" class="mr-1" />上传
                </el-button>
              </div>
              <div v-if="form.configs_data.ewmurl" class="h-32 w-32 bg-gray-50 rounded flex items-center justify-center border border-gray-300 overflow-hidden">
                <img :src="form.configs_data.ewmurl" class="h-full object-contain" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="收款账号">
            <el-input v-model="form.configs_data.account" placeholder="收款账号/手机号" />
          </el-form-item>
          <el-form-item label="收款人姓名">
            <el-input v-model="form.configs_data.accountname" placeholder="收款人姓名" />
          </el-form-item>
        </template>
        
        
        <template v-if="form.paytype === 'linepay'">
          <el-form-item label="银行名称">
            <el-input v-model="form.configs_data.bankname" placeholder="如: 招商银行" />
          </el-form-item>
          <el-form-item label="开户行">
            <el-input v-model="form.configs_data.bankbranch" placeholder="如: 深圳分行" />
          </el-form-item>
          <el-form-item label="银行卡号">
            <el-input v-model="form.configs_data.bankcode" placeholder="收款银行卡号" />
          </el-form-item>
          <el-form-item label="收款户名">
            <el-input v-model="form.configs_data.accountname" placeholder="收款人真实姓名" />
          </el-form-item>
        </template>
        
        
        <template v-if="form.paytype === 'USDT'">
          <el-form-item label="汇率">
            <el-input-number v-model="form.configs_data.rate" :precision="2" :min="1" :max="20" />
            <span class="ml-2 text-gray-400">1 USDT = ? CNY</span>
          </el-form-item>
          <el-form-item label="TRC20地址">
            <el-input v-model="form.configs_data.trc20" placeholder="TRC20钱包地址" />
          </el-form-item>
          <el-form-item label="ERC20地址">
            <el-input v-model="form.configs_data.erc20" placeholder="ERC20钱包地址（可选）" />
          </el-form-item>
        </template>
        
        <el-form-item label="备注说明">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="充值说明，将显示在前端" />
        </el-form-item>
      </el-form>
      <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="handleFileChange" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import {
  fetchPaySetList,
  createPaySet,
  updatePaySet,
  deletePaySet,
  setPaySetState,
  type PaySet
} from '@/api/finance-payset'
import { uploadImage } from '@/api/common'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

const loading = ref(false)
const tableData = ref<PaySet[]>([])
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})


const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const fileInputRef = ref<HTMLInputElement>()
const form = reactive({
  id: 0,
  paytype: '',
  paytypetitle: '',
  ftitle: '',
  minmoney: 100,
  maxmoney: 50000,
  isonline: 0,
  state: 1,
  remark: '',
  configs_data: {} as Record<string, any>
})

const rules = {
  paytype: [{ required: true, message: '请输入支付标识', trigger: 'blur' }],
  paytypetitle: [{ required: true, message: '请输入支付名称', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchPaySetList({
      page: pagination.page,
      limit: pagination.limit
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleStateChange = async (row: PaySet, val: number) => {
  try {
    await setPaySetState(row.id, val)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.state = val === 1 ? 0 : 1
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.id = 0
  form.paytype = ''
  form.paytypetitle = ''
  form.ftitle = ''
  form.minmoney = 100
  form.maxmoney = 50000
  form.isonline = 0
  form.state = 1
  form.remark = ''
  form.configs_data = {}
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.id = row.id
  form.paytype = row.paytype
  form.paytypetitle = row.paytypetitle
  form.ftitle = row.ftitle || ''
  form.minmoney = row.minmoney || 100
  form.maxmoney = row.maxmoney || 50000
  form.isonline = row.isonline
  form.state = row.state
  form.remark = row.remark || ''
  form.configs_data = row.configs_data || {}
  dialogVisible.value = true
}

const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  try {
    ElMessage.info('上传中...')
    const res = await uploadImage(files[0])
    form.configs_data.ewmurl = res.url
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('上传失败')
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

const handleDelete = (row: PaySet) => {
  ElMessageBox.confirm(`确定要删除 ${row.paytypetitle} 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deletePaySet(row.id)
    loadData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await createPaySet(form)
        } else {
          await updatePaySet(form)
        }
        dialogVisible.value = false
        loadData()
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>
