// utils -> extractMetaData
import { DOMParser } from 'linkedom'
import getHostname from './getHostname.js'

/**
 * @param html {string}
 * @param baseUrl {string}
 * @returns {{publisher: Object, author: Object[]}}
 */
export default (html, baseUrl) => {
  const articleAttrs = [
    'NewsArticle',
  ]

  const organizationAttrs = [
    'Organization',
    'NewsMediaOrganization',
    'WebSite',
  ]

  const buildAuthor = (context) => {
    if (!context) {
      return []
    }

    return (!context['@graph']
      ? context.length ? context : [context]
      : context['@graph']).map(({ name, image, url }) => ({
      name: name || '',
      image: image?.url ?? '',
      url: url || '',
    }))
  }

  const buildPublisher = ({ name, url, logo, sameAs }) => {
    return {
      name: name ?? '',
      url: url ?? getHostname(baseUrl),
      logo: logo?.url ?? '',
      sameAs: sameAs ?? [],
    }
  }

  const document = new DOMParser().parseFromString(html, 'text/html')
  let jsonData = []
  document.querySelectorAll('script[type="application/ld+json"]').forEach((sc) => {
    const lo = JSON.parse(sc.innerText)
    if (lo['@graph'] && lo['@graph'].length) {
      jsonData = jsonData.concat(lo['@graph'])
    } else {
      jsonData.push(lo)
    }
  })

  if (!jsonData.length) {
    return {
      author: [],
      publisher: null,
    }
  }

  const jsonObj = jsonData.reduce((o, i) => (o[i['@type']] = i, o), {})
  const articleAttr = articleAttrs.filter(a => !!jsonObj[a])[0]
  const article = jsonObj[articleAttr] ?? {}

  const organizationAttr = organizationAttrs.filter(a => !!jsonObj[a])[0]
  const organization = organizationAttr ? jsonObj[organizationAttr] : null

  return {
    author: buildAuthor(article.author),
    publisher: buildPublisher({ ...organization, ...article.publisher }),
  }
}
