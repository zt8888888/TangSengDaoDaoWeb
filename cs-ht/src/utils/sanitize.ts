


import DOMPurify from 'dompurify'



const ALLOWED_TAGS = [

  'p', 'br', 'span', 'div',

  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

  'ul', 'ol', 'li',

  'strong', 'b', 'em', 'i', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup',

  'a', 'img',

  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',

  'blockquote', 'pre', 'code',

  'hr', 'input'
]



const ALLOWED_ATTR = [

  'class', 'style', 'id',

  'href', 'target', 'rel',

  'src', 'alt', 'width', 'height',

  'colspan', 'rowspan', 'border',

  'type', 'checked', 'disabled', 'readonly'
]



export function sanitizeHtml(html: string): string {
  if (!html) return ''

  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur']
    })
  } catch (error) {
    console.error('[sanitizeHtml] 消毒处理失败:', error)
    return ''
  }
}



export function hasDangerousContent(html: string): boolean {
  if (!html) return false

  const dangerousPatterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b[^>]*>/i,
    /<object\b[^>]*>/i,
    /<embed\b[^>]*>/i
  ]

  return dangerousPatterns.some(pattern => pattern.test(html))
}
