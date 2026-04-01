




const ALLOWED_TAGS = [
  'a', 'abbr', 'address', 'article', 'aside', 'b', 'bdi', 'bdo', 'blockquote',
  'br', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'dd', 'del',
  'details', 'dfn', 'div', 'dl', 'dt', 'em', 'figcaption', 'figure', 'footer',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'i', 'img', 'ins',
  'kbd', 'li', 'main', 'mark', 'nav', 'ol', 'p', 'pre', 'q', 'rp', 'rt',
  'ruby', 's', 'samp', 'section', 'small', 'span', 'strong', 'sub', 'summary',
  'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'time', 'tr', 'u',
  'ul', 'var', 'wbr'
]


const ALLOWED_ATTRS = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'style', 'target', 'rel',
  'width', 'height', 'colspan', 'rowspan', 'datetime', 'cite'
]


const DANGEROUS_ATTR_PATTERNS = [
  /^on\w+/i,
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i
]


const DANGEROUS_CSS_PATTERNS = [
  /expression\s*\(/i,
  /javascript\s*:/i,
  /behavior\s*:/i,
  /-moz-binding/i
]



function isAttrValueSafe(attrName: string, attrValue: string): boolean {
  const lowerValue = attrValue.toLowerCase().trim()


  if (attrName === 'href' || attrName === 'src') {
    if (lowerValue.startsWith('javascript:') || lowerValue.startsWith('vbscript:')) {
      return false
    }

    if (lowerValue.startsWith('data:') && attrName === 'src') {
      return lowerValue.startsWith('data:image/')
    }
  }


  if (attrName === 'style') {
    return !DANGEROUS_CSS_PATTERNS.some(pattern => pattern.test(attrValue))
  }

  return true
}



export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return ''

  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  return str.replace(/[&<>"'/]/g, char => escapeMap[char])
}



export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''


  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html


  sanitizeNode(tempDiv)

  return tempDiv.innerHTML
}



function sanitizeNode(node: Element): void {
  const childNodes = Array.from(node.childNodes)

  for (const child of childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element
      const tagName = element.tagName.toLowerCase()


      if (!ALLOWED_TAGS.includes(tagName)) {

        if (['script', 'style', 'iframe', 'object', 'embed', 'form'].includes(tagName)) {
          element.remove()
        } else {

          const textContent = element.textContent || ''
          const textNode = document.createTextNode(textContent)
          element.replaceWith(textNode)
        }
        continue
      }


      const attrs = Array.from(element.attributes)
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase()


        const isDangerous = DANGEROUS_ATTR_PATTERNS.some(pattern => pattern.test(attrName))


        if (isDangerous || !ALLOWED_ATTRS.includes(attrName) || !isAttrValueSafe(attrName, attr.value)) {
          element.removeAttribute(attr.name)
        }
      }


      sanitizeNode(element)
    }
  }
}



export function createSafeHtml(html: string): string {
  return sanitizeHtml(html)
}
