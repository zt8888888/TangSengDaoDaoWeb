<template>
  <div class="p-4">
    <div class="mb-4 bg-box p-4 rounded-lg shadow-sm">
      <div class="flex justify-between items-center">
        <el-form :inline="true" :model="searchForm" class="flex-1">
          <el-form-item label="标题">
            <el-input v-model="searchForm.title" placeholder="活动标题" clearable style="width: 150px" />
          </el-form-item>
          <el-form-item label="活动分类">
            <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 120px">
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="活动类型">
            <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px">
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 100px">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            搜索
            </el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        
        <el-button type="primary" @click="handleAdd">
          <template #icon><ArtSvgIcon icon="ri:add-line" /></template>
            添加活动
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
        <el-table-column label="封面图" width="120" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.banner" 
              :src="row.banner" 
              class="h-12 w-20 object-cover rounded bg-hover-color" 
              :preview-src-list="[row.banner]"
              preview-teleported
            />
            <span v-else class="text-g-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip />
        <el-table-column label="活动分类" width="120" align="center">
          <template #default="{ row }">
            {{ getCategoryNames(row.category) }}
          </template>
        </el-table-column>
        <el-table-column label="活动类型" width="120" align="center">
          <template #default="{ row }">
            {{ getTypeName(row.type_code || row.type) }}
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="200" align="center">
          <template #default="{ row }">
            <div class="text-xs">
              <div>{{ row.start_date }}</div>
              <div class="text-g-400">至</div>
              <div>{{ row.end_date }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(row, val as number)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              plain
              @click="handleEdit(row)"
            >编辑</el-button>
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

    
    <el-drawer
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加活动' : '编辑活动'"
      size="750px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        label-position="left"
      >
        
        <el-tabs v-model="activeTab" class="drawer-tabs">
          
          <el-tab-pane label="基本信息" name="basic">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入活动标题" />
            </el-form-item>
            
            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="分类" prop="category">
                <el-select v-model="form.category" placeholder="选择分类" class="w-full" multiple collapse-tags collapse-tags-tooltip @change="onCategoryChange">
                  <el-option
                    v-for="item in categoryOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="类型" prop="type_code">
                <el-select v-model="form.type_code" placeholder="选择类型" class="w-full">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </div>

            <el-form-item label="适用平台">
              <el-checkbox-group v-model="form.platforms" v-if="filteredPlatforms.length > 0">
                <el-checkbox v-for="p in filteredPlatforms" :key="p.code" :value="p.code">{{ p.name }}</el-checkbox>
              </el-checkbox-group>
              <el-text v-else type="info" size="small">请先选择活动分类</el-text>
              <div class="text-xs text-gray-400 mt-1">不选择则统计所有平台</div>
            </el-form-item>

            <el-form-item label="时间" required>
              <el-date-picker
                v-model="dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                class="!w-full"
              />
            </el-form-item>

            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="排序">
                <el-input-number v-model="form.sort" :min="0" controls-position="right" class="w-full" />
              </el-form-item>
              <el-form-item label="状态">
                <el-switch v-model="form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="禁用" />
              </el-form-item>
            </div>

            
            <el-divider content-position="left">点击跳转设置</el-divider>
            <el-form-item label="跳转方式">
              <el-radio-group v-model="form.jump_type">
                <el-radio :value="0">默认详情页</el-radio>
                <el-radio :value="1">签到弹窗</el-radio>
                <el-radio :value="2">自定义URL</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="跳转地址" v-if="form.jump_type === 2">
              <el-input v-model="form.jump_url" placeholder="请输入跳转URL，如: https://example.com 或 /page/path" />
            </el-form-item>
            <el-alert v-if="form.jump_type === 1" type="info" :closable="false" class="!mt-[-10px]">
              点击此活动封面将直接弹出签到窗口
            </el-alert>
          </el-tab-pane>

          
          <el-tab-pane label="活动内容" name="content">
            <el-form-item label="封面图" prop="banner">
              <div class="w-full">
                <div class="flex gap-2">
                  <el-input v-model="form.banner" placeholder="图片URL" class="flex-1" />
                  <el-button type="primary" @click="triggerUpload">上传</el-button>
                </div>
                <div v-if="form.banner" class="mt-2 h-28 bg-hover-color rounded flex items-center justify-center border border-dashed border-g-300 overflow-hidden">
                  <img :src="form.banner" class="h-full object-contain" />
                </div>
              </div>
            </el-form-item>

            
            <input type="file" ref="fileInputRef" style="display: none" accept="image/*" @change="handleFileChange" />

            <el-form-item label="简介">
              <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="活动简介（可选）" />
            </el-form-item>

            <el-form-item label="活动说明" class="editor-item">
              <div style="border: 1px solid #dcdfe6; border-radius: 4px; width: 100%;">
                <Toolbar
                  style="border-bottom: 1px solid #dcdfe6"
                  :editor="editorRef"
                  :defaultConfig="toolbarConfig"
                  mode="simple"
                />
                <Editor
                  style="height: 350px; overflow-y: hidden;"
                  v-model="form.content"
                  :defaultConfig="editorConfig"
                  mode="simple"
                  @onCreated="handleCreated"
                />
              </div>
            </el-form-item>

            <el-form-item label="条款及细则">
              <el-input 
                v-model="form.terms" 
                type="textarea" 
                :rows="6" 
                placeholder="请输入条款及细则（可选，支持换行）" 
              />
            </el-form-item>
          </el-tab-pane>

          
          <el-tab-pane label="奖励配置" name="reward" v-if="needsRewardConfig">
            
            <el-alert class="!mb-4" :closable="false" show-icon>
              <template #title>
                <span v-if="form.type_code === 'checkin'">签到活动：连续签到可领取对应天数的奖励，中断后从第一天重新开始</span>
                <span v-else-if="form.type_code === 'lucky_order'">幸运注单：注单尾号匹配即可获得 投注金额×倍数 的奖励（不超过上限）</span>
                <span v-else-if="form.type_code === 'pg_betting_king'">PG打码王：每日累计投注达标可领取奖励，只能领取最高一档</span>
                <span v-else-if="form.type_code === 'loss_rescue'">亏损救援：昨日亏损达到阈值可领取对应救援金</span>
                <span v-else-if="form.type_code === 'weekly_salary'">周俸禄：每周累计投注达标可领取奖励，每档都可领取</span>
                <span v-else-if="form.type_code === 'monthly_salary'">月俸禄：每月累计投注达标可领取奖励，每档都可领取</span>
                <span v-else-if="form.type_code === 'first_deposit'">首存彩金：新用户首次充值达到指定金额可领取对应彩金，每人限领一次</span>
                <span v-else-if="form.type_code === 'deposit_bonus'">充值活动：每次充值达到指定金额可领取对应奖励，可配置每日/永久限制</span>
              </template>
            </el-alert>

            
            <div class="mb-4 p-3 bg-gray-50 rounded" v-if="form.type_code === 'checkin'">
              <div class="text-sm font-medium mb-2">签到条件设置</div>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="所需充值" label-width="70px" class="!mb-0">
                    <el-input-number v-model="form.required_deposit" :min="0" controls-position="right" class="w-full" placeholder="每日充值达到此金额" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所需投注" label-width="70px" class="!mb-0">
                    <el-input-number v-model="form.required_bet" :min="0" controls-position="right" class="w-full" placeholder="每日投注达到此金额" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="mb-4 p-3 bg-gray-50 rounded" v-if="form.type_code === 'deposit_bonus'">
              <div class="text-sm font-medium mb-2">充值计算方式</div>
              <el-row :gutter="20" align="middle">
                <el-col :span="12">
                  <el-radio-group v-model="form.calc_mode">
                    <el-radio value="single">单笔充值</el-radio>
                    <el-radio value="cumulative">累计充值</el-radio>
                  </el-radio-group>
                </el-col>
                <el-col :span="12" v-if="form.calc_mode === 'cumulative'">
                  <el-form-item label="累计时间" label-width="70px" class="!mb-0">
                    <el-input-number v-model="form.calc_hours" :min="1" :max="720" controls-position="right" class="w-28" />
                    <span class="ml-2 text-gray-500">小时内</span>
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="text-xs text-gray-400 mt-2">
                <span v-if="form.calc_mode === 'single'">每笔充值单独判断是否达标</span>
                <span v-else>{{ form.calc_hours }}小时内累计充值判断是否达标，超时重新计算</span>
              </div>
            </div>

            
            <div class="mb-4 p-3 bg-gray-50 rounded">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-600">领取限制</span>
                <el-switch v-model="form.enableLimit" :active-value="1" :inactive-value="0" active-text="开启" inactive-text="关闭" />
              </div>
              <el-row :gutter="20" v-if="form.enableLimit">
                <el-col :span="8">
                  <el-form-item label="限制周期" label-width="70px" class="!mb-0">
                    <el-select v-model="form.limitPeriod" class="w-full">
                      <el-option label="每日" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                      <el-option label="永久" value="once" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="限制次数" label-width="70px" class="!mb-0">
                    <el-input-number v-model="form.limitTimes" :min="1" controls-position="right" class="w-full" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="需要申请" label-width="70px" class="!mb-0">
                    <el-switch v-model="form.needApply" :active-value="1" :inactive-value="0" />
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="text-xs text-gray-400 mt-2" v-if="!form.enableLimit">不限制领取次数</div>
            </div>

            
            <div class="flex items-center justify-between mb-3">
              <span class="font-medium">奖励档位</span>
              <el-button type="primary" size="small" @click="handleAddTier">
                <el-icon><Plus /></el-icon>
                添加档位
              </el-button>
            </div>

            <el-alert
              title="请至少配置一个奖励档位"
              type="warning"
              :closable="false"
              show-icon
              class="!mb-3"
              v-if="form.tiers.length === 0"
            />

            
            <el-table :data="form.tiers" border v-if="form.tiers.length > 0" class="tier-table">
              <el-table-column label="档位" width="80" align="center">
                <template #default="{ $index }">
                  <el-tag>{{ $index + 1 }}</el-tag>
                </template>
              </el-table-column>
              
              
              <template v-if="form.type_code === 'lucky_order'">
                <el-table-column label="注单尾号" min-width="120">
                  <template #default="{ row }">
                    <el-input v-model="row.conditionValue" placeholder="如：888" />
                  </template>
                </el-table-column>
                <el-table-column label="奖金倍数" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.levelName" placeholder="如：有效投注金额1倍" />
                  </template>
                </el-table-column>
                <el-table-column label="实际倍数" width="100">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardRate" :min="0" :precision="0" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="奖金上限" width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
              </template>

              
              <template v-else-if="form.type_code === 'loss_rescue'">
                <el-table-column label="亏损阈值 (≥)" min-width="150">
                  <template #default="{ row }">
                    <el-input-number v-model="row.conditionMin" :min="0" :precision="0" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="救援金" min-width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
              </template>

              
              <template v-else-if="form.type_code === 'checkin'">
                <el-table-column label="签到天数" min-width="100">
                  <template #default="{ row }">
                    <el-input v-model="row.levelName" placeholder="如：第1天" />
                  </template>
                </el-table-column>
                <el-table-column label="奖励金额" min-width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
              </template>

              
              <template v-else-if="form.type_code === 'first_deposit'">
                <el-table-column label="首存金额 (≥)" min-width="150">
                  <template #default="{ row }">
                    <el-input-number v-model="row.conditionMin" :min="0" :precision="0" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="档位名称" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.levelName" placeholder="如：首存100送18" />
                  </template>
                </el-table-column>
                <el-table-column label="彩金金额" min-width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
              </template>

              <template v-else-if="form.type_code === 'deposit_bonus'">
                <el-table-column label="充值金额 (≥)" min-width="150">
                  <template #default="{ row }">
                    <el-input-number v-model="row.conditionMin" :min="0" :precision="0" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="档位名称" min-width="150">
                  <template #default="{ row }">
                    <el-input v-model="row.levelName" placeholder="如：充值100送5" />
                  </template>
                </el-table-column>
                <el-table-column label="奖励金额" min-width="100">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="奖励比例(%)" width="100">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardRate" :min="0" :max="100" :precision="1" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
              </template>

              <template v-else>
                <el-table-column label="累计投注 (≥)" min-width="150">
                  <template #default="{ row }">
                    <el-input-number v-model="row.conditionMin" :min="0" :precision="0" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="奖励金额" min-width="120">
                  <template #default="{ row }">
                    <el-input-number v-model="row.rewardAmount" :min="0" :precision="2" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="领取次数" width="100" v-if="['weekly_salary', 'monthly_salary'].includes(form.type_code)">
                  <template #default="{ row }">
                    <el-input-number v-model="row.limitTimes" :min="1" :max="99" controls-position="right" class="w-full" />
                  </template>
                </el-table-column>
                <el-table-column label="启用" width="70" align="center" v-if="['weekly_salary', 'monthly_salary'].includes(form.type_code)">
                  <template #default="{ row }">
                    <el-switch v-model="row.status" :active-value="1" :inactive-value="0" />
                  </template>
                </el-table-column>
              </template>

              <el-table-column label="操作" width="80" align="center">
                <template #default="{ $index }">
                  <el-button type="danger" size="small" text @click="handleRemoveTier($index)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, shallowRef, onBeforeUnmount, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import {
  fetchActivityList,
  createActivity,
  updateActivity,
  deleteActivity,
  updateActivityStatus,
  fetchActivityTypeOptions,
  type Activity,
  type ActivityTypeOption
} from '@/api/activity'
import {
  fetchActivityCategoryOptions,
  fetchActivityPlatforms
} from '@/api/activity-category'
import {
  fetchRewardList,
  createReward,
  updateReward,
  deleteReward
} from '@/api/activity-reward'

import { useUserStore } from '@/store/modules/user'
import { uploadImage } from '@/api/common'

const userStore = useUserStore()
const editorRef = shallowRef()
const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/app/admin/upload/image',
      fieldName: 'file',
      headers: {
        Authorization: 'Bearer ' + userStore.accessToken
      },
      customInsert(res: any, insertFn: any) {
        if (res.code === 0 || res.code === 200) {
          const url = res.data?.url || res.url || res.data
          insertFn(url)
        } else {
          ElMessage.error(res.msg || '上传失败')
        }
      }
    }
  }
}

const fileInputRef = ref<HTMLInputElement>()
const triggerUpload = () => {
  fileInputRef.value?.click()
}

const handleFileChange = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  try {
    const res = await uploadImage(files[0])
    const url = res.url || (res as any).data?.url
    form.banner = url
    ElMessage.success('上传成功')
  } catch (error) {
    console.error(error)
  } finally {
    if (fileInputRef.value) fileInputRef.value.value = ''
  }
}

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

const loading = ref(false)
const tableData = ref<Activity[]>([])
const typeOptions = ref<ActivityTypeOption[]>([])
const categoryOptions = ref<Array<{value: string, label: string}>>([])
const allPlatforms = ref<Array<{code: string, name: string, type: string, categories?: string[]}>>([])

const filteredPlatforms = computed(() => {
  if (form.category.length === 0) {
    return allPlatforms.value
  }
  return allPlatforms.value.filter(p => {
    const cats = p.categories || [p.type]
    return cats.some(c => form.category.includes(c))
  })
})

const onCategoryChange = () => {
  const validPlatformCodes = filteredPlatforms.value.map(p => p.code)
  form.platforms = form.platforms.filter(code => validPlatformCodes.includes(code))
}
const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchForm = reactive({
  title: '',
  category: '',
  type: '',
  status: undefined as number | undefined
})

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const activeTab = ref('basic')
const dateRange = ref<[string, string] | null>(null)
const form = reactive({
  id: 0,
  title: '',
  category: [] as string[],
  platforms: [] as string[],
  type: '',
  type_code: '',
  desc: '',
  content: '',
  terms: '',
  banner: '',
  start_date: '',
  end_date: '',
  sort: 0,
  status: 1,

  jump_type: 0,
  jump_url: '',

  required_deposit: 0,
  required_bet: 0,

  tiers: [] as any[],
  conditionType: 'amount',
  needApply: 0,
  enableLimit: 0,
  limitTimes: 1,
  limitPeriod: 'daily',
  calc_mode: 'single',
  calc_hours: 24
})

const rewardActivityTypes = ['checkin', 'weekly_salary', 'lucky_order', 'loss_rescue', 'pg_betting_king', 'monthly_salary', 'first_deposit', 'deposit_bonus']
const needsRewardConfig = computed(() => rewardActivityTypes.includes(form.type_code))

watch(() => form.type_code, (newType) => {

  if (newType === 'checkin') {
    form.conditionType = 'checkin'
    form.limitPeriod = 'daily'
    form.limitTimes = 1

    if (form.tiers.length === 0) {
      const defaultAmounts = [1, 3, 5, 8, 12, 18, 28]
      form.tiers = defaultAmounts.map((amount, i) => ({
        levelName: `第${i + 1}天`,
        conditionMin: i + 1,
        rewardAmount: amount,
        sort: i + 1,
        status: 1
      }))
    }
  } else if (newType === 'lucky_order') {
    form.conditionType = 'order_tail'
    form.limitPeriod = 'daily'
    form.limitTimes = 3
  } else if (newType === 'loss_rescue') {
    form.conditionType = 'amount'
    form.limitPeriod = 'daily'
    form.limitTimes = 1
  } else if (newType === 'weekly_salary') {
    form.conditionType = 'amount'
    form.limitPeriod = 'weekly'
    form.limitTimes = 1
  } else if (newType === 'monthly_salary') {
    form.conditionType = 'amount'
    form.limitPeriod = 'monthly'
    form.limitTimes = 1
  } else if (newType === 'pg_betting_king') {
    form.conditionType = 'amount'
    form.limitPeriod = 'daily'
    form.limitTimes = 1
  } else if (newType === 'first_deposit') {
    form.conditionType = 'first_deposit'
    form.limitPeriod = 'once'
    form.limitTimes = 1
    if (form.tiers.length === 0) {
      form.tiers = [
        { levelName: '首存100送18', conditionMin: 100, rewardAmount: 18, rewardRate: 0, sort: 1, status: 1 },
        { levelName: '首存500送58', conditionMin: 500, rewardAmount: 58, rewardRate: 0, sort: 2, status: 1 },
        { levelName: '首存1000送128', conditionMin: 1000, rewardAmount: 128, rewardRate: 0, sort: 3, status: 1 }
      ]
    }
  } else if (newType === 'deposit_bonus') {
    form.conditionType = 'deposit'
    form.limitPeriod = 'daily'
    form.limitTimes = 1
    if (form.tiers.length === 0) {
      form.tiers = [
        { levelName: '充值100送5', conditionMin: 100, rewardAmount: 5, rewardRate: 5, sort: 1, status: 1 },
        { levelName: '充值500送30', conditionMin: 500, rewardAmount: 30, rewardRate: 6, sort: 2, status: 1 },
        { levelName: '充值1000送80', conditionMin: 1000, rewardAmount: 80, rewardRate: 8, sort: 3, status: 1 }
      ]
    }
  }

  if (needsRewardConfig.value && form.tiers.length === 0) {
    handleAddTier()
  }
})

watch(dateRange, (val) => {
  if (val && val.length === 2) {
    form.start_date = val[0]
    form.end_date = val[1]
  } else {
    form.start_date = ''
    form.end_date = ''
  }
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  type_code: [{ required: true, message: '请选择类型', trigger: 'change' }],
  banner: [{ required: true, message: '请输入封面图', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchActivityList({
      page: pagination.page,
      limit: pagination.limit,
      title: searchForm.title,
      category: searchForm.category,
      type: searchForm.type,
      status: searchForm.status
    })
    tableData.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const res = await fetchActivityCategoryOptions()
    categoryOptions.value = res
  } catch (error) {
    console.error('加载活动分类失败:', error)
    categoryOptions.value = []
  }
}

const loadPlatforms = async () => {
  try {
    const res = await fetchActivityPlatforms()
    allPlatforms.value = res
  } catch (error) {
    console.error('加载平台列表失败:', error)
    allPlatforms.value = []
  }
}

const defaultTypeOptions = [
  { value: 'checkin', label: '签到活动' },
  { value: 'weekly_salary', label: '周薪活动' },
  { value: 'monthly_salary', label: '月薪活动' },
  { value: 'lucky_order', label: '幸运注单' },
  { value: 'loss_rescue', label: '亏损救援' },
  { value: 'pg_betting_king', label: '投注王活动' },
  { value: 'first_deposit', label: '首存彩金' },
  { value: 'deposit_bonus', label: '充值活动' },
  { value: 'deposit', label: '充值活动(旧)' },
  { value: 'rebate', label: '返水活动' },
  { value: 'bonus', label: '彩金活动' },
  { value: 'vip', label: 'VIP活动' },
  { value: 'other', label: '其他活动' }
]

const loadTypes = async () => {
  try {
    const res = await fetchActivityTypeOptions()
    if (Array.isArray(res) && res.length > 0) {
      typeOptions.value = res
    } else {
      typeOptions.value = defaultTypeOptions
    }
  } catch (error) {
    typeOptions.value = defaultTypeOptions
  }
}

const getCategoryName = (code: string) => {
  const option = categoryOptions.value.find(opt => opt.value === code)
  return option ? option.label : code
}

const getCategoryNames = (category: string | string[]) => {
  let cats: string[] = []
  if (Array.isArray(category)) {
    cats = category
  } else if (typeof category === 'string' && category) {
    try {
      const parsed = JSON.parse(category)
      cats = Array.isArray(parsed) ? parsed : [category]
    } catch {
      cats = [category]
    }
  }
  return cats.map(c => getCategoryName(c)).join(', ') || '-'
}

const getTypeName = (value: string) => {
  const option = typeOptions.value.find(opt => opt.value === value)
  return option ? option.label : value
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const resetSearch = () => {
  searchForm.title = ''
  searchForm.category = ''
  searchForm.type = ''
  searchForm.status = undefined
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  loadData()
}

const handleStatusChange = async (row: Activity, val: number) => {
  try {
    await updateActivityStatus(row.id, val)
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = val === 1 ? 0 : 1
  }
}

const handleAddTier = () => {
  const index = form.tiers.length + 1
  const tier: any = {
    levelName: '',
    conditionMin: 0,
    conditionMax: 0,
    conditionValue: '',
    rewardAmount: 0,
    rewardRate: 0,
    sort: index,
    status: 1,
    limitTimes: 1
  }

  if (form.type_code === 'checkin') {
    const defaultAmounts = [1, 3, 5, 8, 12, 18, 28]
    tier.levelName = `第${index}天`
    tier.conditionMin = index
    tier.rewardAmount = defaultAmounts[index - 1] || index * 5
  } else if (form.type_code === 'lucky_order') {
    tier.conditionValue = '888'
    tier.levelName = `有效投注金额${index}倍`
    tier.rewardRate = index
    tier.rewardAmount = 888 * index
  } else if (form.type_code === 'loss_rescue') {
    const thresholds = [1000, 5000, 10000, 50000, 100000]
    tier.conditionMin = thresholds[index - 1] || thresholds[0] * index
    tier.rewardAmount = tier.conditionMin * 0.01
  } else if (form.type_code === 'first_deposit') {
    const thresholds = [100, 300, 500, 1000, 3000, 5000, 10000]
    const rewards = [18, 38, 58, 128, 388, 588, 1288]
    tier.conditionMin = thresholds[index - 1] || 100 * index
    tier.rewardAmount = rewards[index - 1] || tier.conditionMin * 0.1
    tier.levelName = `首存${tier.conditionMin}送${tier.rewardAmount}`
  } else if (form.type_code === 'deposit_bonus') {
    const thresholds = [100, 300, 500, 1000, 3000, 5000]
    const rewards = [5, 18, 38, 88, 288, 588]
    const rates = [5, 6, 7.5, 8.8, 9.6, 11.7]
    tier.conditionMin = thresholds[index - 1] || 100 * index
    tier.rewardAmount = rewards[index - 1] || tier.conditionMin * 0.05
    tier.rewardRate = rates[index - 1] || 5
    tier.levelName = `充值${tier.conditionMin}送${tier.rewardAmount}`
  } else {
    const thresholds = [5000, 50000, 100000, 500000, 1000000, 3000000, 5000000, 10000000]
    tier.conditionMin = thresholds[index - 1] || 10000 * index
    tier.rewardAmount = 8 * index
  }

  form.tiers.push(tier)
}

const handleRemoveTier = (index: number) => {
  form.tiers.splice(index, 1)

  form.tiers.forEach((tier, idx) => {
    tier.sort = idx + 1
  })
}

const handleAdd = () => {
  dialogType.value = 'add'
  activeTab.value = 'basic'
  form.id = 0
  form.title = ''
  form.category = []
  form.platforms = []
  form.type = ''
  form.type_code = ''
  form.desc = ''
  form.content = ''
  form.terms = ''
  form.banner = ''
  form.start_date = ''
  form.end_date = ''
  form.sort = 0
  form.status = 1
  form.jump_type = 0
  form.jump_url = ''
  form.required_deposit = 0
  form.required_bet = 0
  form.tiers = []
  form.conditionType = 'amount'
  form.needApply = 0
  form.enableLimit = 0
  form.limitTimes = 1
  form.limitPeriod = 'daily'
  dateRange.value = null
  dialogVisible.value = true
}

const handleEdit = async (row: Activity) => {
  dialogType.value = 'edit'
  activeTab.value = 'basic'
  form.id = row.id
  form.title = row.title

  const cat = (row as any).category
  if (Array.isArray(cat)) {
    form.category = cat
  } else if (typeof cat === 'string' && cat) {
    try {
      const parsed = JSON.parse(cat)
      form.category = Array.isArray(parsed) ? parsed : [cat]
    } catch {
      form.category = [cat]
    }
  } else {
    form.category = []
  }
  const plat = (row as any).platforms
  if (plat) {
    try {
      const parsed = JSON.parse(plat)
      form.platforms = Array.isArray(parsed) ? parsed : plat.split(',').map((s: string) => s.trim())
    } catch {
      form.platforms = plat.split(',').map((s: string) => s.trim())
    }
  } else {
    form.platforms = []
  }
  form.type = row.type
  form.type_code = (row as any).type_code || row.type
  form.desc = row.desc
  form.content = row.content
  form.terms = (row as any).terms || ''
  form.banner = row.banner
  form.start_date = row.start_date
  form.end_date = row.end_date
  form.sort = row.sort
  form.status = row.status
  form.jump_type = (row as any).jump_type || 0
  form.jump_url = (row as any).jump_url || ''
  form.required_deposit = (row as any).required_deposit || 0
  form.required_bet = (row as any).required_bet || 0

  if (row.start_date && row.end_date) {
    dateRange.value = [row.start_date, row.end_date]
  } else {
    dateRange.value = null
  }

  form.tiers = []
  if (rewardActivityTypes.includes(form.type_code)) {
    try {
      const res = await fetchRewardList({ activity_id: row.id })
      if (res.list && res.list.length > 0) {
        const firstReward = res.list[0]
        form.conditionType = firstReward.conditionType || 'amount'
        form.needApply = firstReward.needApply || 0
        form.limitTimes = firstReward.limitTimes || 1
        form.limitPeriod = firstReward.limitPeriod || 'daily'
        form.enableLimit = firstReward.limitTimes > 0 ? 1 : 0

        form.tiers = res.list.map((item: any) => ({
          id: item.id,
          levelName: item.levelName,
          conditionMin: item.conditionMin,
          conditionMax: item.conditionMax,
          conditionValue: item.conditionValue,
          rewardAmount: item.rewardAmount,
          rewardRate: item.rewardRate,
          sort: item.sort,
          status: item.status,
          limitTimes: item.limitTimes || 1
        }))
      }
    } catch (error) {
      console.error('加载档位配置失败:', error)
    }
  }

  dialogVisible.value = true
}

const handleDelete = (row: Activity) => {
  ElMessageBox.confirm(`确定要删除活动 "${row.title}" 吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteActivity(row.id)
    loadData()
  })
}

const handleSubmit = async () => {
  if (!formRef.value) return

  if (needsRewardConfig.value && form.tiers.length === 0) {
    ElMessage.warning('请至少配置一个奖励档位')
    return
  }

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        let activityId = form.id

        if (dialogType.value === 'add') {
          const res = await createActivity(form) as any
          activityId = res.id || res.data?.id
          ElMessage.success('活动创建成功')
        } else {
          await updateActivity(form)
          ElMessage.success('活动更新成功')
        }

        if (needsRewardConfig.value && activityId) {

          if (dialogType.value === 'edit') {
            try {
              const oldRewards = await fetchRewardList({ activity_id: activityId })
              if (oldRewards.list && oldRewards.list.length > 0) {
                await Promise.all(oldRewards.list.map((r: any) => deleteReward(r.id)))
              }
            } catch (error) {
              console.error('删除旧档位失败:', error)
            }
          }

          const actualLimitTimes = form.enableLimit ? form.limitTimes : 0
          await Promise.all(form.tiers.map(tier => {
            const tierLimitTimes = ['weekly_salary', 'monthly_salary'].includes(form.type_code)
              ? (tier.limitTimes || 1)
              : actualLimitTimes
            return createReward({
              activity_id: activityId,
              reward_type: form.type_code,
              level_name: tier.levelName || `档位${tier.sort}`,
              condition_min: tier.conditionMin || 0,
              condition_max: tier.conditionMax || 0,
              condition_value: tier.conditionValue || '',
              reward_amount: tier.rewardAmount || 0,
              reward_rate: tier.rewardRate || 0,
              condition_type: form.conditionType,
              need_apply: form.needApply,
              limit_times: tierLimitTimes,
              limit_period: form.limitPeriod,
              sort: tier.sort,
              status: tier.status ?? 1
            } as any)
          }))

          ElMessage.success(`档位配置已保存（共${form.tiers.length}个档位）`)
        }

        dialogVisible.value = false
        loadData()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadCategories()
  loadPlatforms()
  loadTypes()
  loadData()
})
</script>
