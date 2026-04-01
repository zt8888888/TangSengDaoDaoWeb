export const PLAY_TYPES: Record<string, { label: string; value: string }[]> = {
  ssc: [
    { label: '两面', value: 'liangmian' },
    { label: '第一球', value: 'no1' },
    { label: '第二球', value: 'no2' },
    { label: '第三球', value: 'no3' },
    { label: '第四球', value: 'no4' },
    { label: '第五球', value: 'no5' },
    { label: '龙虎', value: 'longhu' },
    { label: '前三', value: 'qiansan' },
    { label: '中三', value: 'zhongsan' },
    { label: '后三', value: 'housan' }
  ],
  k3: [
    { label: '和值', value: 'he' },
    { label: '三同号', value: 'santong' },
    { label: '三不同', value: 'sanbutong' },
    { label: '二同号', value: 'ertong' },
    { label: '二不同', value: 'erbutong' }
  ],
  keno: [
    { label: '总和', value: 'zonghe' },
    { label: '五行', value: 'wuxing' },
    { label: '奇偶', value: 'jiou' }
  ],
  pk10: [
    { label: '冠亚和', value: 'guanyahe' },
    { label: '冠军', value: 'no1' },
    { label: '亚军', value: 'no2' },
    { label: '第三名', value: 'no3' },
    { label: '第四名', value: 'no4' },
    { label: '第五名', value: 'no5' },
    { label: '第六名', value: 'no6' },
    { label: '第七名', value: 'no7' },
    { label: '第八名', value: 'no8' },
    { label: '第九名', value: 'no9' },
    { label: '第十名', value: 'no10' }
  ],
  lhc: [
    { label: '特码', value: 'tm' },
    { label: '正码', value: 'zm' },
    { label: '正特', value: 'zt' },
    { label: '连码', value: 'lm' },
    { label: '半波', value: 'bb' },
    { label: '生肖', value: 'sx' }
  ],
  xy28: [
    { label: '特码', value: 'tm' }
  ]

}
