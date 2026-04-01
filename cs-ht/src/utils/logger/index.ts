



type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {

  enabled: boolean

  minLevel: LogLevel

  showTimestamp: boolean

  prefix: string
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}


const defaultConfig: LoggerConfig = {
  enabled: import.meta.env.DEV,
  minLevel: import.meta.env.DEV ? 'debug' : 'error',
  showTimestamp: true,
  prefix: '[App]'
}

class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = []

    if (this.config.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    parts.push(this.config.prefix)
    parts.push(`[${level.toUpperCase()}]`)
    parts.push(message)

    return parts.join(' ')
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }
  }



  createChild(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix}${prefix}`
    })
  }
}


export const logger = new Logger()


export { Logger }
export type { LoggerConfig, LogLevel }
