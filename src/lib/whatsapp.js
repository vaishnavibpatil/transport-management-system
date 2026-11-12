// WHATSAPP INTEGRATION — NOT YET CONNECTED
// These are placeholders. Once AiSensy is set up, we'll replace the inside
// of these two functions only — nothing else in the app needs to change.

export async function sendWhatsAppMessage(to, message) {
  console.log('[WhatsApp - not yet connected] Would send text to', to, ':', message)
  return true
}

export async function sendWhatsAppImage(to, file, caption) {
  // 'file' is the raw image File object straight from the camera/file input —
  // never touches our database or storage, just passes through to WhatsApp.
  console.log('[WhatsApp - not yet connected] Would send image to', to, 'caption:', caption, 'file:', file.name, file.size, 'bytes')
  return true
}