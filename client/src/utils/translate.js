export async function translateText(text, targetLang, sourceLang = 'auto') {
  if (!text) { return '' }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  const data = await res.json()
  return data[0].map(item => item[0]).join('')
}
