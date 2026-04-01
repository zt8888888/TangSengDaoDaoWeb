<template>
  <div class="app-container">
    
    <el-row :gutter="16" class="stats-row">
      <el-col :span="12">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">登录IP重复</div>
              <div class="stat-numbers">
                <span class="stat-value">{{ stats.login_ip.duplicate_ip_count }}</span>
                <span class="stat-label">个IP</span>
                <span class="stat-divider">|</span>
                <span class="stat-value">{{ stats.login_ip.affected_user_count }}</span>
                <span class="stat-label">个用户</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card" shadow="never">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">注册IP重复</div>
              <div class="stat-numbers">
                <span class="stat-value">{{ stats.reg_ip.duplicate_ip_count }}</span>
                <span class="stat-label">个IP</span>
                <span class="stat-divider">|</span>
                <span class="stat-value">{{ stats.reg_ip.affected_user_count }}</span>
                <span class="stat-label">个用户</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchParams" ref="queryFormRef">
        <el-form-item label="检测类型">
          <el-radio-group v-model="searchParams.type" @change="handleTypeChange">
            <el-radio-button value="login">登录IP</el-radio-button>
            <el-radio-button value="reg">注册IP</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input
            v-model="searchParams.ip"
            placeholder="请输入IP地址"
            clearable
            @keyup.enter="handleSearch"
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="searchParams.username"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleSearch"
            style="width: 140px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <template #icon><ArtSvgIcon icon="ri:search-line" /></template>
            搜索
          </el-button>
          <el-button @click="resetQuery">
            <template #icon><ArtSvgIcon icon="ri:refresh-line" /></template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        row-key="loginip"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="loginip" :label="searchParams.type === 'reg' ? '注册IP' : '登录IP'" width="150" align="center">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="showMembersDialog(row)">
              {{ row.loginip }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="usernames" label="会员账号" min-width="300">
          <template #default="{ row }">
            <div class="usernames-cell">
              <el-tag
                v-for="(username, idx) in getUsernameList(row.usernames).slice(0, 5)"
                :key="idx"
                size="small"
                class="username-tag"
                @click="viewMember(username)"
              >
                {{ username }}
              </el-tag>
              <el-tag v-if="getUsernameList(row.usernames).length > 5" size="small" type="info">
                ...等{{ getUsernameList(row.usernames).length - 5 }}个
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="count" label="相同IP会员数" width="140" align="center" sortable>
          <template #default="{ row }">
            <el-tag :type="getCountTagType(row.count)" effect="dark" round>
              {{ row.count }} 个账号
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="last_login_time" :label="searchParams.type === 'reg' ? '最后注册时间' : '最后登录时间'" width="180" align="center" sortable />
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showMembersDialog(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          :page-sizes="[20, 50, 100, 200]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    
    <el-dialog
      v-model="membersDialogVisible"
      :title="`IP [${currentIp}] 的会员列表`"
      width="900px"
      destroy-on-close
    >
      <el-table :data="ipMembers" border stripe v-loading="membersLoading">
        <el-table-column prop="username" label="用户名" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" @click="viewMemberDetail(row.id)">{{ row.username }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120" align="center" />
        <el-table-column prop="userbankname" label="真实姓名" width="100" align="center" />
        <el-table-column prop="balance" label="余额" width="100" align="center">
          <template #default="{ row }">
            <span class="text-primary">{{ Number(row.balance || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="loginip" label="登录IP" width="130" align="center" />
        <el-table-column prop="regip" label="注册IP" width="130" align="center" />
        <el-table-column prop="logintime" label="最后登录" width="160" align="center" />
        <el-table-column prop="islock" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.islock === 0 ? 'success' : 'danger'" size="small">
              {{ row.islock === 0 ? '正常' : '锁定' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/utils/http'
import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

defineOptions({ name: 'IpCheck' })

interface IpCheckItem {
  loginip: string
  usernames: string
  user_ids: string
  count: number
  last_login_time: string
}

interface IpMember {
  id: number
  username: string
  nickname: string
  userbankname: string
  balance: number
  logintime: string
  regtime: string
  loginip: string
  regip: string
  islock: number
}

const router = useRouter()
const loading = ref(false)
const tableData = ref<IpCheckItem[]>([])
const queryFormRef = ref()


const stats = reactive({
  login_ip: { duplicate_ip_count: 0, affected_user_count: 0 },
  reg_ip: { duplicate_ip_count: 0, affected_user_count: 0 }
})

const pagination = reactive({
  page: 1,
  limit: 20,
  total: 0
})

const searchParams = reactive({
  type: 'login',
  ip: '',
  username: ''
})


const membersDialogVisible = ref(false)
const membersLoading = ref(false)
const currentIp = ref('')
const ipMembers = ref<IpMember[]>([])


const fetchStats = async () => {
  try {
    const res = await request.get<any>({
      url: '/app/admin/member/ip-check-stats'
    })
    if (res.code === 0 && res.data) {
      stats.login_ip = res.data.login_ip || { duplicate_ip_count: 0, affected_user_count: 0 }
      stats.reg_ip = res.data.reg_ip || { duplicate_ip_count: 0, affected_user_count: 0 }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}


const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get<any>({
      url: '/app/admin/member/ip-check-data',
      params: {
        page: pagination.page,
        limit: pagination.limit,
        type: searchParams.type,
        ip: searchParams.ip,
        username: searchParams.username
      }
    })

    tableData.value = res.data || []
    pagination.total = res.count || 0

  } catch (error) {
    console.error('获取同IP会员数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}


const fetchMembersByIp = async (ip: string) => {
  membersLoading.value = true
  try {
    const res = await request.get<any>({
      url: '/app/admin/member/ip-check-members',
      params: {
        ip,
        type: searchParams.type
      }
    })
    ipMembers.value = res.data || []
  } catch (error) {
    console.error('获取IP会员列表失败:', error)
    ElMessage.error('获取会员列表失败')
  } finally {
    membersLoading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleTypeChange = () => {
  pagination.page = 1
  fetchData()
}

const resetQuery = () => {
  searchParams.ip = ''
  searchParams.username = ''
  pagination.page = 1
  fetchData()
}

const handleSizeChange = (val: number) => {
  pagination.limit = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.page = val
  fetchData()
}


const getUsernameList = (usernames: string) => {
  return usernames ? usernames.split(',') : []
}


const getCountTagType = (count: number) => {
  if (count >= 10) return 'danger'
  if (count >= 5) return 'warning'
  return 'primary'
}


const showMembersDialog = (row: IpCheckItem) => {
  currentIp.value = row.loginip
  membersDialogVisible.value = true
  fetchMembersByIp(row.loginip)
}


const viewMember = (username: string) => {
  router.push({
    path: '/member/list',
    query: { username }
  })
}


const viewMemberDetail = (id: number) => {
  router.push({
    path: '/member/list',
    query: { id: String(id) }
  })
}

onMounted(() => {
  fetchStats()
  fetchData()
})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 16px;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-info {
  .stat-title {
    font-size: 14px;
    color: #909399;
    margin-bottom: 8px;
  }
  
  .stat-numbers {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  
  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
  }
  
  .stat-label {
    font-size: 14px;
    color: #606266;
  }
  
  .stat-divider {
    margin: 0 8px;
    color: #dcdfe6;
  }
}

.search-card {
  margin-bottom: 16px;
}

.usernames-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.username-tag {
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.text-primary {
  color: var(--el-color-primary);
  font-weight: 500;
}
</style>
