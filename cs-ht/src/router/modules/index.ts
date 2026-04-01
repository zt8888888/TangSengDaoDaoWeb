import { AppRouteRecord } from '@/types/router'
import { lotteryManageRoutes } from './lottery-manage'
import { dashboardRoutes } from './dashboard'
import { templateRoutes } from './template'
import { widgetsRoutes } from './widgets'
import { examplesRoutes } from './examples'
import { systemRoutes } from './system'
import { articleRoutes } from './article'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { helpRoutes } from './help'

import { memberRoutes } from './member'
import { financeRoutes } from './finance'
import { activityRoutes } from './activity'
import { liveRoutes } from './live'
import { yebaoRoutes } from './yebao'
import { robotRoutes } from './robot'
import { maintenanceRoutes } from './maintenance'
import { chat28Routes } from './chat28'
import { imRoutes } from './im'

export const routeModules: AppRouteRecord[] = [
  ...lotteryManageRoutes,
  dashboardRoutes,
  memberRoutes,
  financeRoutes,
  activityRoutes,
  liveRoutes,
  yebaoRoutes,
  robotRoutes,
  chat28Routes,
  imRoutes,
  maintenanceRoutes,
  templateRoutes,
  widgetsRoutes,
  examplesRoutes,
  systemRoutes,
  articleRoutes,
  resultRoutes,
  exceptionRoutes,
  ...helpRoutes
]
