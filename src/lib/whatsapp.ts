export const isValidWhatsAppNumber = (number: string) => /^628\d{7,12}$/.test(number)

export const whatsAppUrl = (number: string, message: string) => {
  if (!isValidWhatsAppNumber(number)) return null
  const text = message.trim()
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
