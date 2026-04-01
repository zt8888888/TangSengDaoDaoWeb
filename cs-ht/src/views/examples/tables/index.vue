

<template>
  <div class="flex flex-col gap-4 pb-5">
    
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <div class="flex-wrap gap-3 flex-cb">
          <h3 class="m-0">高级表格完整能力展示</h3>
          <div class="flex flex-wrap gap-2">
            <ElTag type="success" effect="light">智能缓存</ElTag>
            <ElTag type="primary" effect="light">防抖搜索</ElTag>
            <ElTag type="warning" effect="light">多种刷新</ElTag>
            <ElTag type="info" effect="light">错误处理</ElTag>
          </div>
        </div>
      </template>
      <div>
        <p class="m-0 mb-4 leading-[1.6] text-g-700">
          集成搜索、刷新、全屏、大小控制、列显示隐藏、拖拽排序、表格样式控制、并内置 useTable
          组合式函数，提供强大的组合式 API，集成数据获取、智能缓存（LRU算法）、
          多种刷新策略等核心功能，全面提升表格开发效率。
        </p>

        
        <div class="my-4" v-if="showDebugPanel">
          <ElCollapse v-model="debugActiveNames">
            <ElCollapseItem name="cache" title="缓存统计与演示">
              <div class="flex flex-col gap-2">
                <div class="flex-cb">
                  <span class="font-medium text-g-700">缓存状态：</span>
                  <ElTag type="success">已启用</ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">缓存条数：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.total }}</span>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">缓存大小：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.size }}</span>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">命中信息：</span>
                  <span class="font-semibold text-theme">{{ cacheInfo.hitRate }}</span>
                </div>

                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="handleClearCache">清空缓存</ElButton>
                  <ElButton size="small" @click="handleCleanExpiredCache">清理过期缓存</ElButton>
                  <ElButton size="small" @click="handleTestCache">测试缓存</ElButton>
                  <ElButton size="small" @click="forceRefreshCacheInfo">刷新缓存信息</ElButton>
                </div>
              </div>
            </ElCollapseItem>
            <ElCollapseItem name="logs" title="缓存日志">
              <div class="flex flex-col gap-2">
                <div class="max-h-50 overflow-y-auto">
                  <div v-if="cacheDebugLogs.length === 0" class="p-5 text-center">
                    <ElEmpty description="暂无缓存日志" :image-size="60" />
                  </div>
                  <div v-else class="flex flex-col gap-1">
                    <div
                      v-for="(log, index) in cacheDebugLogs"
                      :key="index"
                      class="p-1.5 px-2 text-xs leading-[1.4] bg-g-200 border-l-1 border-g-400 rounded"
                      :class="{
                        'bg-[rgba(103,194,58,0.1)] !border-l-success': log.includes('✅'),
                        'bg-[rgba(64,158,255,0.1)] !border-l-theme': log.includes('🎯'),
                        'bg-[rgba(245,108,108,0.1)] !border-l-danger': log.includes('❌')
                      }"
                    >
                      {{ log }}
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="cacheDebugLogs = []">清空日志</ElButton>
                </div>
              </div>
            </ElCollapseItem>
            <ElCollapseItem name="request" title="请求状态">
              <div class="flex flex-col gap-2">
                <div class="flex-cb">
                  <span class="font-medium text-g-700">加载状态：</span>
                  <ElTag :type="loading ? 'warning' : 'success'">
                    {{ loading ? '加载中' : '空闲' }}
                  </ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">数据状态：</span>
                  <ElTag :type="hasData ? 'success' : 'info'">
                    {{ hasData ? `${data.length} 条数据` : '无数据' }}
                  </ElTag>
                </div>
                <div class="flex-cb">
                  <span class="font-medium text-g-700">错误状态：</span>
                  <ElTag :type="error ? 'danger' : 'success'">
                    {{ error ? '有错误' : '正常' }}
                  </ElTag>
                </div>
                <div class="flex flex-col gap-2">
                  <span class="font-medium text-g-700">当前请求参数：</span>
                  <ElText
                    tag="pre"
                    class="max-h-50 p-2 overflow-y-auto text-xs bg-g-200 border border-g-400 rounded-md"
                    >{{ JSON.stringify(requestParams, null, 2) }}</ElText
                  >
                </div>
                <div class="flex gap-2 mt-2">
                  <ElButton size="small" @click="handleCancelRequest">取消请求</ElButton>
                  <ElButton size="small" @click="handleClearData">清空数据</ElButton>
                </div>
              </div>
            </ElCollapseItem>
          </ElCollapse>
        </div>

        
        <div class="flex flex-wrap gap-4 mt-4">
          <ElSwitch v-model="showDebugPanel" active-text="调试面板" />
          <ElText type="info" size="small"> 💡 缓存功能已启用，可通过调试面板查看详细信息 </ElText>
        </div>
      </div>
    </ElCard>

    
    <ArtSearchBar
      ref="searchBarRef"
      v-model="searchFormState"
      :items="searchItems"
      :rules="rules"
      :is-expand="false"
      :show-expand="true"
      :show-reset-button="true"
      :show-search-button="true"
      :disabled-search-button="false"
      @search="handleSearch"
      @reset="handleReset"
    />

    
    <ElCard class="flex-1 art-table-card" shadow="never" style="margin-top: 0">
      <template #header>
        <div class="flex-cb">
          <h4 class="m-0">用户数据表格</h4>
          <div class="flex gap-2">
            <ElTag v-if="error" type="danger">{{ error.message }}</ElTag>
            <ElTag v-else-if="loading" type="warning">加载中...</ElTag>
            <ElTag v-else type="success">{{ data.length }} 条数据</ElTag>
          </div>
        </div>
      </template>

      
      
      <ArtTableHeader
        v-model:columns="columnChecks"
        :loading="loading"
        @refresh="handleRefresh"
        layout="refresh,size,fullscreen,columns,settings"
        fullClass="art-table-card"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton type="primary" @click="handleAdd" v-ripple>
              <ElIcon>
                <Plus />
              </ElIcon>
              新增用户
            </ElButton>

            
            <ArtExcelExport
              :data="data as any"
              :columns="exportColumns as any"
              filename="用户数据"
              :auto-index="true"
              button-text="导出"
              @export-success="handleExportSuccess"
            />
            <ArtExcelImport
              @import-success="handleImportSuccess"
              @import-error="handleImportError"
              style="margin: 0 12px"
            />

            <ElButton @click="handleClearData" plain v-ripple> 清空数据 </ElButton>

            <ElButton @click="handleBatchDelete" :disabled="selectedRows.length === 0" v-ripple>
              <ElIcon>
                <Delete />
              </ElIcon>
              批量删除 ({{ selectedRows.length }})
            </ElButton>
            
            <ElDropdown @command="handleColumnCommand" style="margin-left: 10px">
              <ElButton type="primary" plain>
                动态更新表格列
                <ElIcon class="el-icon--right">
                  <ArrowDown />
                </ElIcon>
              </ElButton>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="addColumn">新增列（备注列）</ElDropdownItem>
                  <ElDropdownItem command="toggleColumn">显示隐藏（手机号列）</ElDropdownItem>
                  <ElDropdownItem command="removeColumn">删除列（状态列）</ElDropdownItem>
                  <ElDropdownItem command="reorderColumns"
                    >交换列位置（性别、手机号）</ElDropdownItem
                  >
                  <ElDropdownItem command="updateColumn">更新列（手机号列）</ElDropdownItem>
                  <ElDropdownItem command="batchUpdate">批量更新（性别、手机号）</ElDropdownItem>
                  <ElDropdownItem command="resetColumns" divided>重置所有列配置</ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        :loading="loading"
        :pagination="pagination"
        :data="data"
        :columns="columns"
        :height="computedTableHeight"
        empty-height="360px"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        @header-click="handleHeaderClick"
        @sort-change="handleSortChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        
        <template #avatar="{ row }">
          <div class="flex gap-3 user-info">
            <ElAvatar :src="row.avatar" :size="40" />
            <div class="flex-1 min-w-0">
              <p class="m-0 overflow-hidden font-medium text-ellipsis whitespace-nowrap">{{
                row.userName
              }}</p>
              <p
                class="m-0 mt-1 overflow-hidden text-xs text-g-700 text-ellipsis whitespace-nowrap"
                >{{ row.userEmail }}</p
              >
            </div>
          </div>
        </template>

        
        <template #avatar-header="{ column }">
          <div class="flex-c gap-1">
            <span>{{ column.label }}</span>
            <ElTooltip content="包含头像、姓名和邮箱" placement="top">
              <ElIcon>
                <QuestionFilled />
              </ElIcon>
            </ElTooltip>
          </div>
        </template>

        
        <template #status="{ row }">
          <ElTag :type="getUserStatusConfig(row.status).type" effect="light">
            {{ getUserStatusConfig(row.status).text }}
          </ElTag>
        </template>

        
        <template #score="{ row }">
          <ElRate v-model="row.score" disabled size="small" />
        </template>

        
        <template #operation="{ row }">
          <div class="flex">
            <ArtButtonTable type="view" :row="row" @click="handleView(row)" />
            <ArtButtonTable type="add" :row="row" @click="handleAdd()" />
            <ArtButtonTable type="edit" :row="row" @click="handleEdit(row)" />
            <ArtButtonTable type="delete" :row="row" @click="handleDelete(row)" />
          </div>
        </template>

        
        <template #userPhone-header="{ column }">
          <ElPopover placement="bottom" :width="200" trigger="hover">
            <template #reference>
              <div class="inline-block gap-1 text-theme c-p custom-header">
                <span>{{ column.label }}</span>
                <ElIcon>
                  <Search />
                </ElIcon>
              </div>
            </template>
            <ElInput
              v-model="phoneSearch"
              placeholder="搜索手机号"
              size="small"
              @input="handlePhoneSearch"
            >
              <template #prefix>
                <ElIcon>
                  <Search />
                </ElIcon>
              </template>
            </ElInput>
          </ElPopover>
        </template>
      </ArtTable>
    </ElCard>

    
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <h4 class="m-0">高级功能演示</h4>
      </template>
      <div class="flex flex-col gap-6">
        
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">事件监听演示</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElButton @click="toggleEventDemo" :type="eventDemoEnabled ? 'success' : 'primary'">
              {{ eventDemoEnabled ? '关闭' : '开启' }}事件监听
            </ElButton>
            <ElButton @click="clearEventLogs" v-if="eventDemoEnabled">清空日志</ElButton>
          </div>
          <div
            v-if="eventDemoEnabled && eventLogs.length > 0"
            class="p-3 mt-3 bg-g-200 border border-g-400 rounded-md"
          >
            <div class="flex-cb mb-2 font-medium text-g-700">
              <span>最近事件日志：</span>
              <ElTag size="small">{{ eventLogs.length }} 条</ElTag>
            </div>
            <div class="flex flex-col gap-1 max-h-50 overflow-y-auto">
              <div
                v-for="(log, index) in eventLogs.slice(0, 20)"
                :key="index"
                class="flex-c gap-2 p-1.5 px-2 text-xs bg-g-300 border-l-1 border-g-400 rounded"
              >
                <ElTag :type="getEventType(log.type)" size="small">{{ log.type }}</ElTag>
                <span class="flex-1 text-g-700">{{ log.message }}</span>
                <span class="text-xs text-g-600">{{ log.time }}</span>
              </div>
            </div>
          </div>
        </div>

        
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">表格配置演示</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElSwitch
              v-model="tableConfig.fixedHeight"
              active-text="固定高度 (500px)"
              inactive-text="自适应高度"
              class="ml-2"
            />
          </div>
        </div>

        
        <div class="p-4 bg-g-200 border-full-d rounded-lg">
          <h5 class="m-0 mb-4 text-sm font-semibold">自定义功能</h5>
          <div class="flex flex-wrap gap-2 mb-3 last:mb-0">
            <ElButton @click="handleScrollToTop">滚动到顶部</ElButton>
            <ElButton @click="handleScrollToPosition">滚动到指定位置</ElButton>
            <ElButton @click="handleToggleSelection">切换全选</ElButton>
            <ElButton @click="handleGetTableInfo">获取表格信息</ElButton>
          </div>
        </div>
      </div>
    </ElCard>

    
    <ElCard shadow="never" class="art-card-xs">
      <template #header>
        <h4 class="m-0">缓存刷新策略演示</h4>
      </template>
      <div class="flex flex-wrap gap-2 max-md:flex-col">
        <ElButton @click="refreshData" v-ripple>
          <ElIcon>
            <Refresh />
          </ElIcon>
          通用刷新
        </ElButton>
        <ElButton @click="refreshSoft" v-ripple>
          <ElIcon>
            <Refresh />
          </ElIcon>
          软刷新
        </ElButton>
        <ElButton @click="refreshCreate" v-ripple>
          <ElIcon>
            <Plus />
          </ElIcon>
          新增后刷新
        </ElButton>
        <ElButton @click="refreshUpdate" v-ripple>
          <ElIcon>
            <Edit />
          </ElIcon>
          编辑后刷新
        </ElButton>
        <ElButton @click="refreshRemove" v-ripple>
          <ElIcon>
            <Delete />
          </ElIcon>
          删除后刷新
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import {
    Plus,
    Delete,
    Edit,
    Search,
    Refresh,
    QuestionFilled,
    ArrowDown
  } from '@element-plus/icons-vue'
  import { ElMessageBox } from 'element-plus'
  import { useTable, CacheInvalidationStrategy } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
  import { getColumnKey } from '@/hooks/core/useTableColumns'

  defineOptions({ name: 'AdvancedTableDemo' })

  type UserListItem = Api.SystemManage.UserListItem

  const selectedRows = ref<UserListItem[]>([])

  const tableRef = ref()

  const showDebugPanel = ref(false)
  const debugActiveNames = ref(['cache', 'request', 'logs'])

  const cacheDebugLogs = ref<string[]>([])
  const requestParams = ref<any>({
    current: 1,
    size: 20,
    name: '',
    phone: '',
    status: '',
    department: '',
    daterange: undefined
  })

  const cacheKeys = ref<string[]>([])

  const phoneSearch = ref('')

  const eventDemoEnabled = ref(false)
  const eventLogs = ref<Array<{ type: string; message: string; time: string }>>([])

  const tableConfig = ref({
    height: '100%',
    fixedHeight: false
  })

  const computedTableHeight = computed(() => {
    return tableConfig.value.fixedHeight ? '500px' : ''
  })

  const searchBarRef = ref()

  const rules = {
    name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ]
  }

  const searchFormState = ref({
    name: '',
    phone: '',
    status: '1',
    department: '',
    daterange: ['2025-01-01', '2025-02-10']
  })

  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

  const searchItems = computed(() => [
    {
      key: 'name',
      label: '用户名',
      type: 'input',
      props: {
        placeholder: '请输入用户名'
      }
    },
    {
      key: 'phone',
      label: '手机号',
      type: 'input',
      props: {
        placeholder: '请输入手机号',
        maxlength: '11'
      }
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '在线', value: '1' },
        { label: '离线', value: '2' },
        { label: '异常', value: '3' },
        { label: '注销', value: '4' }
      ]
    },
    {
      key: 'department',
      label: '部门',
      type: 'select',
      options: [
        { label: '全部', value: '' },
        { label: '技术部', value: '技术部' },
        { label: '产品部', value: '产品部' },
        { label: '运营部', value: '运营部' },
        { label: '市场部', value: '市场部' },
        { label: '设计部', value: '设计部' }
      ]
    },
    {
      key: 'daterange',
      label: '日期范围',
      type: 'daterange',
      props: {
        type: 'daterange',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        valueFormat: 'YYYY-MM-DD'
      }
    }
  ])

  const exportColumns = computed(() => ({
    userName: { title: '用户名', width: 15 },
    userEmail: { title: '邮箱', width: 20 },
    userPhone: { title: '手机号', width: 15 },
    userGender: { title: '性别', width: 10 },
    department: { title: '部门', width: 15 },
    status: {
      title: '状态',
      width: 10,
      formatter: (value: string) => getUserStatusConfig(value).text
    }
  }))

  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {

    data,
    loading,
    error,
    hasData,

    pagination,

    handleSizeChange,
    handleCurrentChange,

    searchParams,
    resetSearchParams,

    getData,
    getDataDebounced,
    clearData,

    refreshData,
    refreshSoft,
    refreshCreate,
    refreshUpdate,
    refreshRemove,

    cacheInfo,
    clearCache,

    clearExpiredCache,

    cancelRequest,

    columns,
    columnChecks,
    addColumn,
    removeColumn,
    updateColumn,
    toggleColumn,
    resetColumns,
    batchUpdateColumns,
    reorderColumns,
    getColumnConfig,
    getAllColumns
  } = useTable({

    core: {
      apiFn: (params) => {

        const requestKey = JSON.stringify(params)
        console.log('🚀 API 请求参数:', params)
        addCacheLog(`🚀 API 请求: current=${params.current}, size=${params.size}`)
        addCacheLog(`🔑 请求键: ${requestKey.substring(0, 100)}...`)

        updateCacheKeys(requestKey)

        return fetchGetUserList(params)
      },
      apiParams: {
        current: 1,
        size: 20,
        ...searchFormState.value
      },

      excludeParams: ['daterange'],

      immediate: true,
      columnsFactory: () => [

        { type: 'selection', width: 50 },

        { type: 'globalIndex', width: 60, label: '序号' },
        {
          prop: 'avatar',
          label: '用户信息',
          minWidth: 200,
          useSlot: true,
          useHeaderSlot: true,
          sortable: false

        },
        {
          prop: 'userGender',
          label: '性别',
          sortable: true,
          formatter: (row) => row.userGender || '未知'
        },
        {
          prop: 'userPhone',
          label: '手机号',
          useHeaderSlot: true,
          sortable: true
        },
        {
          prop: 'department',
          label: '部门',
          sortable: true
        },
        {
          prop: 'score',
          label: '评分',
          useSlot: true,
          sortable: true
        },
        {
          prop: 'status',
          label: '状态',
          useSlot: true,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 190,
          useSlot: true,
          fixed: 'right'
        }
      ]
    },

    transform: {
      dataTransformer: (records) => {
        if (!Array.isArray(records)) return []

        return records.map((item, index: number) => ({
          ...item,
          avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar,
          department: ['技术部', '产品部', '运营部', '市场部', '设计部'][
            Math.floor(Math.random() * 5)
          ],
          score: Math.floor(Math.random() * 5) + 1,
          status: ['1', '2', '3', '4'][Math.floor(Math.random() * 4)]
        }))
      }

    },

    performance: {
      enableCache: true,
      cacheTime: 5 * 60 * 1000,
      debounceTime: 300,
      maxCacheSize: 100
    },

    hooks: {
      onSuccess: (data, response) => {
        console.log('📊 响应详情:', response)
        addCacheLog(`✅ 网络请求成功: ${data.length} 条数据`)
        addCacheLog(
          `📝 响应信息: total=${response.total}, current=${response.current}, size=${response.size}`
        )
      },
      onError: (error) => {
        console.error('❌ 数据加载失败:', error)
        addCacheLog(`❌ 请求失败: ${error.message}`)
        ElMessage.error(error.message)
      },
      onCacheHit: (data, response) => {
        console.log('🎯 缓存命中:', data.length, '条')
        console.log('🔑 缓存来源:', response)
        addCacheLog(
          `🎯 缓存命中: ${data.length} 条数据 (current=${response.current}, size=${response.size})`
        )
        ElMessage.info('数据来自缓存')
      },
      resetFormCallback: () => {
        console.log('🔄 表单已重置')
        addCacheLog('🔄 表单已重置')
      }
    },

    debug: {
      enableLog: true,
      logLevel: 'info'
    }
  })

  const handleSelectionChange = (selection: UserListItem[]) => {
    selectedRows.value = selection
    console.log('选择变更:', selection)
  }

  const handleRowClick = (row: UserListItem) => {
    console.log('行点击:', row)
    logEvent('行点击', `点击了用户: ${row.userName}`)
  }

  const handleHeaderClick = (column: { label: string; property: string }) => {
    console.log('表头点击:', column)
    logEvent('表头点击', `点击了 ${column.label} 列表头`)
  }

  interface SortInfo {
    prop: string
    order: 'ascending' | 'descending' | null
  }

  const handleSortChange = (sortInfo: SortInfo) => {
    console.log('排序事件:', sortInfo)
    console.log('排序字段:', sortInfo.prop)
    console.log('排序方向:', sortInfo.order)
    logEvent('排序变更', `字段: ${sortInfo.prop}, 方向: ${sortInfo.order}`)
  }

  const logEvent = (type: string, message: string) => {
    if (!eventDemoEnabled.value) return

    const time = new Date().toLocaleTimeString()
    eventLogs.value.unshift({ type, message, time })

    if (eventLogs.value.length > 20) {
      eventLogs.value = eventLogs.value.slice(0, 20)
    }
  }

  const getEventType = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const typeMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      行点击: 'primary',
      行双击: 'success',
      行右键: 'warning',
      单元格点击: 'info',
      单元格双击: 'success',
      表头点击: 'primary',
      选择变更: 'warning',
      排序变更: 'success'
    }
    return typeMap[type] || 'info'
  }

  const toggleEventDemo = () => {
    eventDemoEnabled.value = !eventDemoEnabled.value
    if (eventDemoEnabled.value) {
      ElMessage.success('事件监听已开启，请与表格交互查看效果')
    } else {
      ElMessage.info('事件监听已关闭')
    }
  }

  const clearEventLogs = () => {
    eventLogs.value = []
    ElMessage.info('事件日志已清空')
  }

  const handleScrollToTop = () => {
    tableRef.value?.scrollToTop()
  }

  const handleScrollToPosition = () => {
    tableRef.value?.elTableRef.setScrollTop(200)
  }

  const handleToggleSelection = () => {
    if (selectedRows.value.length === 0) {
      tableRef.value?.elTableRef.toggleAllSelection()
      ElMessage.info('已全选')
    } else {
      tableRef.value?.elTableRef.clearSelection()
      ElMessage.info('已取消全选')
    }
  }

  const handleGetTableInfo = () => {
    const info = {
      数据条数: data.value.length,
      选中条数: selectedRows.value.length,
      列数: columns?.value?.length ?? 0,
      当前页: pagination.current,
      每页大小: pagination.size,
      总条数: pagination.total
    }

    console.log('表格信息:', info)
    ElMessage.info(`表格信息已输出到控制台，当前 ${info.数据条数} 条数据`)
  }

  const handleSearch = async () => {
    await searchBarRef.value.validate()

    console.log('搜索参数:', searchFormState.value)
    const { daterange, ...filtersParams } = searchFormState.value
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    getData()
  }

  const handleReset = () => {
    addCacheLog('🔄 重置搜索')

    resetSearchParams()
  }

  const handlePhoneSearch = (value: string) => {
    searchFormState.value.phone = value
    searchParams.phone = value
    requestParams.value = { ...searchParams, phone: value }
    addCacheLog(`📱 手机号搜索: ${value}`)
    getDataDebounced()
  }

  const handleRefresh = () => {
    addCacheLog('🔄 手动刷新')
    refreshData()
  }

  const handleAdd = () => {
    ElMessage.success('新增用户成功')
    refreshCreate()
  }

  const handleEdit = (row: UserListItem) => {
    ElMessage.success(`编辑用户 ${row.userName} 成功`)
    setTimeout(() => {
      refreshUpdate()
    }, 1000)
  }

  const handleDelete = async (row: UserListItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除用户 ${row.userName} 吗？`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      ElMessage.success('删除成功')
      setTimeout(() => {
        refreshRemove()
      }, 1000)
    } catch {
      ElMessage.info('已取消删除')
    }
  }

  const handleView = (row: UserListItem) => {
    ElMessage.info(`查看用户 ${row.userName}`)
  }

  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个用户吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      ElMessage.success(`批量删除 ${selectedRows.value.length} 个用户成功`)
      selectedRows.value = []
      setTimeout(() => {
        refreshRemove()
      }, 1000)
    } catch {
      ElMessage.info('已取消删除')
    }
  }

  const handleExportSuccess = (filename: string, count: number) => {
    ElMessage.success(`导出 ${count} 条数据成功`)
  }

  const handleImportSuccess = (data: Record<string, any>[]) => {
    ElMessage.success(`导入 ${data.length} 条数据成功`)
    refreshCreate()
  }

  const handleImportError = (error: Error) => {
    ElMessage.error(`导入失败：${error.message}`)
  }

  const handleClearCache = () => {
    clearCache(CacheInvalidationStrategy.CLEAR_ALL, '手动清空')
    cacheKeys.value = []
    addCacheLog('🗑️ 手动清空所有缓存')
    ElMessage.success('缓存已清空')
  }

  const handleCleanExpiredCache = () => {
    const count = clearExpiredCache()
    addCacheLog(`🧹 清理了 ${count} 条过期缓存`)
    ElMessage.info(`清理了 ${count} 条过期缓存`)
  }

  const handleCancelRequest = () => {
    cancelRequest()
    addCacheLog('❌ 取消当前请求')
    ElMessage.info('请求已取消')
  }

  const handleClearData = () => {
    clearData()
    addCacheLog('🗑️ 清空所有数据')
    ElMessage.info('数据已清空')
  }

  const handleTestCache = () => {

    const testPages = [1, 2, 3, 2, 1]

    ElMessage.info('开始缓存测试...')
    addCacheLog('🧪 开始缓存测试')

    let index = 0
    const testInterval = setInterval(() => {
      if (index >= testPages.length) {
        clearInterval(testInterval)
        addCacheLog('✅ 缓存测试完成')
        ElMessage.success('缓存测试完成！观察缓存统计的变化')
        return
      }

      const page = testPages[index]
      addCacheLog(`📄 测试切换到第 ${page} 页`)

      requestParams.value = { ...requestParams.value, current: page }

      handleCurrentChange(page)
      index++
    }, 1000)
  }

  const addCacheLog = (message: string): void => {
    const timestamp = new Date().toLocaleTimeString()
    cacheDebugLogs.value.unshift(`[${timestamp}] ${message}`)
    if (cacheDebugLogs.value.length > 20) {
      cacheDebugLogs.value = cacheDebugLogs.value.slice(0, 20)
    }
  }

  const updateCacheKeys = (key: string, operation: 'add' | 'remove' = 'add'): void => {
    if (operation === 'add' && !cacheKeys.value.includes(key)) {
      cacheKeys.value.push(key)
      addCacheLog(`新增缓存键: ${getCacheKeySummary(key)}`)
    } else if (operation === 'remove') {
      const index = cacheKeys.value.indexOf(key)
      if (index > -1) {
        cacheKeys.value.splice(index, 1)
        addCacheLog(`移除缓存键: ${getCacheKeySummary(key)}`)
      }
    }
  }

  const getCacheKeySummary = (key: string): string => {
    try {
      const params = JSON.parse(key)
      return `页码: ${params.current || 1}, 大小: ${params.size || 20}${params.name ? ', 名称: ' + params.name : ''}${params.status ? ', 状态: ' + params.status : ''}`
    } catch {
      return '无效的缓存键'
    }
  }

  const forceRefreshCacheInfo = (): void => {
    const currentStats = cacheInfo.value
    addCacheLog(`缓存信息刷新: ${currentStats.total} 条缓存`)

    if (currentStats.total === 0) {
      cacheKeys.value = []
    }

    nextTick(() => {
      console.log('当前缓存统计:', cacheInfo.value)
    })
  }

  watch(
    () => [pagination.current, pagination.size, searchFormState.value],
    ([current, size, search]) => {
      requestParams.value = {
        ...(search as any),
        current,
        size
      }
    },
    { deep: true, immediate: true }
  )

  const handleColumnCommand = (command: string): void => {
    switch (command) {
      case 'addColumn': {

        addColumn?.({
          prop: 'remark',
          label: '备注',
          width: 150,
          formatter: () => h('span', { style: 'color: #999' }, '暂无备注')
        })
        ElMessage.success('已新增"备注"列')
        break
      }

      case 'toggleColumn': {

        if (getColumnConfig?.('userPhone')) {
          toggleColumn?.('userPhone')
        }
        break
      }

      case 'removeColumn': {

        removeColumn?.('status')

        break
      }

      case 'reorderColumns': {

        const allCols = getAllColumns?.()
        if (allCols) {
          const genderIndex = allCols.findIndex((col) => getColumnKey(col) === 'userGender')
          const phoneIndex = allCols.findIndex((col) => getColumnKey(col) === 'userPhone')

          if (genderIndex !== -1 && phoneIndex !== -1) {
            reorderColumns?.(genderIndex, phoneIndex)
            ElMessage.success('已交换性别和手机号列位置')
          }
        }
        break
      }

      case 'updateColumn': {

        updateColumn?.('userPhone', {
          label: '联系电话',
          width: 140
        })
        ElMessage.success('手机号列标题已更新为"联系电话"')
        break
      }

      case 'batchUpdate': {

        batchUpdateColumns?.([
          { prop: 'userGender', updates: { width: 200, label: '性别-update', sortable: false } },
          { prop: 'userPhone', updates: { width: 200, label: '手机号-update', sortable: false } }
        ])
        break
      }

      case 'resetColumns': {

        resetColumns?.()
        ElMessage.success('已重置所有列配置')
        break
      }

      default:
        console.warn('未知的列配置命令:', command)
    }
  }
</script>

<style scoped>
  .user-info .el-avatar {
    flex-shrink: 0;
    width: 40px !important;
    height: 40px !important;
  }

  .user-info .el-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .custom-header:hover {
    color: var(--el-color-primary-light-3);
  }

  .demo-group .config-toggles .el-switch {
    --el-switch-on-color: var(--el-color-primary);
  }

  .demo-group .performance-info .el-alert {
    --el-alert-padding: 12px;
  }
</style>
