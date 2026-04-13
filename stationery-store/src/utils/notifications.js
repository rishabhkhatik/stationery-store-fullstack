// ── Free Order Notification Methods ──────────────────────────
// 1. WhatsApp via wa.me  — 100% free, no account, no API key
// 2. EmailJS free tier   — 200 emails/month, no backend needed

export const sendOrderNotification = async (order, siteConfig) => {
  const { notifyWhatsapp, notifyEmail, whatsappNumber } = siteConfig

  if (notifyWhatsapp && whatsappNumber) {
    sendWhatsAppNotification(order, whatsappNumber)
  }

  if (notifyEmail) {
    await sendEmailNotification(order, siteConfig)
  }
}

export const sendWhatsAppNotification = (order, whatsappNumber) => {
  const items = order.items
    .map(i => `• ${i.name} ×${i.qty} = ₹${i.price * i.qty}`)
    .join('\n')

  const msg =
    `🛒 *New Order: ${order.id}*\n\n` +
    `👤 *Customer:* ${order.customer.name}\n` +
    `📞 *Phone:* ${order.customer.phone}\n` +
    `📧 *Email:* ${order.customer.email}\n` +
    `🏠 *Address:* ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}\n\n` +
    `📦 *Items:*\n${items}\n\n` +
    `💰 *Total: ₹${order.total}*\n` +
    `🗓️ *Date:* ${new Date(order.createdAt).toLocaleString('en-IN')}`

  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
  window.open(url, '_blank')
}

export const sendEmailNotification = async (order, siteConfig) => {
  const { emailjsServiceId, emailjsTemplateId, emailjsPublicKey, contactEmail } = siteConfig
  if (!emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) return

  try {
    // emailjs is loaded via CDN in index.html as window.emailjs
    if (typeof window.emailjs === 'undefined') return

    const items = order.items
      .map(i => `${i.name} ×${i.qty} = ₹${i.price * i.qty}`)
      .join(', ')

    await window.emailjs.send(
      emailjsServiceId,
      emailjsTemplateId,
      {
        to_email:         contactEmail,
        order_id:         order.id,
        customer_name:    order.customer.name,
        customer_email:   order.customer.email,
        customer_phone:   order.customer.phone,
        customer_address: `${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}`,
        order_items:      items,
        order_total:      `₹${order.total}`,
        order_date:       new Date(order.createdAt).toLocaleString('en-IN'),
      },
      emailjsPublicKey
    )
  } catch (err) {
    console.warn('EmailJS notification failed:', err.message || err)
  }
}
