import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Youtube, MessageCircle, Mail, Phone, MapPin } from 'lucide-react'
import { useAdminStore } from '../../store'

export default function Footer() {
  const siteConfig = useAdminStore(state => state.siteConfig)
  const categories = useAdminStore(state => state.categories)

  return (
    <footer style={{ background: '#1a1a1a', color: '#ccc', marginTop: 60 }}>
      <div className="container" style={{ padding: '48px 16px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            {siteConfig.logo ? (
              <img src={siteConfig.logo} alt={siteConfig.storeName} style={{ height: 48, marginBottom: 12, filter: 'brightness(0) invert(1)' }} />
            ) : (
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{siteConfig.storeName}</div>
            )}
            <p style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{siteConfig.aboutUs}</p>
            <div style={{ display: 'flex', gap: 12 }}>
              {siteConfig.social?.whatsapp && (
                <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer"
                  style={{ width: 36, height: 36, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={16} color="#fff" />
                </a>
              )}
              {siteConfig.social?.instagram && (
                <a href={siteConfig.social.instagram} target="_blank" rel="noreferrer"
                  style={{ width: 36, height: 36, background: '#e1306c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Instagram size={16} color="#fff" />
                </a>
              )}
              {siteConfig.social?.facebook && (
                <a href={siteConfig.social.facebook} target="_blank" rel="noreferrer"
                  style={{ width: 36, height: 36, background: '#1877f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Facebook size={16} color="#fff" />
                </a>
              )}
              {siteConfig.social?.youtube && (
                <a href={siteConfig.social.youtube} target="_blank" rel="noreferrer"
                  style={{ width: 36, height: 36, background: '#ff0000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Youtube size={16} color="#fff" />
                </a>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Categories</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {categories.slice(0, 10).map(cat => (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  style={{ fontSize: 13, color: '#aaa', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#aaa'}>
                  {cat.name}
                </Link>
              ))}
              <Link to="/categories" style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 500 }}>View All →</Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Terms & Conditions', to: '/terms' },
                { label: 'Privacy Policy', to: '/privacy' },
                { label: 'Return & Refund Policy', to: '/refund' },
                { label: 'Shipping Policy', to: '/shipping' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  style={{ fontSize: 13, color: '#aaa', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = '#aaa'}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 16, fontSize: 15 }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <MapPin size={14} style={{ marginTop: 3, flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{siteConfig.address}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Phone size={14} />
                <a href={`tel:${siteConfig.contactPhone}`} style={{ fontSize: 13, color: '#aaa' }}>{siteConfig.contactPhone}</a>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <Mail size={14} />
                <a href={`mailto:${siteConfig.contactEmail}`} style={{ fontSize: 13, color: '#aaa' }}>{siteConfig.contactEmail}</a>
              </div>
              <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25d366', color: '#fff', padding: '8px 16px', borderRadius: 30, fontSize: 13, fontWeight: 500, marginTop: 4 }}>
                <MessageCircle size={14} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: '#888' }}>© {new Date().getFullYear()} {siteConfig.storeName}. All rights reserved.</p>
          <p style={{ fontSize: 12, color: '#888' }}>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  )
}
