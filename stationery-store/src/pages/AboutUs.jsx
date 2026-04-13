import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminStore } from '../store'

export default function AboutUs() {
  const { siteConfig } = useAdminStore()
  const [showAll, setShowAll] = useState(false)
  const team = siteConfig.teamMembers || []
  const visibleTeam = showAll ? team : team.slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary), #c2307a)', padding: '60px 16px', textAlign: 'center', color: '#fff' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
          {siteConfig.aboutHeroTitle || 'About Us'}
        </h1>
        <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, margin: '0 auto' }}>
          {siteConfig.aboutHeroSubtitle || 'Your trusted partner for stationery, gifts and more'}
        </p>
      </div>

      <div className="container" style={{ padding: '48px 16px' }}>
        {/* Story */}
        <section style={{ maxWidth: 800, margin: '0 auto 56px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16 }}>
            {siteConfig.aboutStoryTitle || 'Our Story'}
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {siteConfig.aboutUs || 'We are a leading stationery and gift store offering premium quality products at affordable prices. Founded with a passion for quality stationery and a commitment to excellent service, we serve thousands of customers across India.'}
          </p>
        </section>

        {/* Stats */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 56 }}>
          {(siteConfig.aboutStats || [
            { icon: '🛍️', number: '10,000+', label: 'Happy Customers' },
            { icon: '📦', number: '500+', label: 'Products' },
            { icon: '🏆', number: '5+ Years', label: 'Experience' },
            { icon: '⭐', number: '4.8/5', label: 'Average Rating' },
          ]).map((s, i) => (
            <div key={i} style={{ textAlign: 'center', background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 20px' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>{s.number}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </section>

        {/* Mission / Vision */}
        {(siteConfig.aboutMission || siteConfig.aboutVision) && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 56 }}>
            {siteConfig.aboutMission && (
              <div style={{ background: 'var(--primary-light)', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Our Mission</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{siteConfig.aboutMission}</p>
              </div>
            )}
            {siteConfig.aboutVision && (
              <div style={{ background: '#fff7ed', borderRadius: 16, padding: 28 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🌟</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Our Vision</h3>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{siteConfig.aboutVision}</p>
              </div>
            )}
          </section>
        )}

        {/* Team Members - dynamic CMS driven */}
        {team.length > 0 && (
          <section style={{ marginBottom: 56 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>Meet Our Team</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>
              The people behind your favourite stationery store
            </p>

            {/* Max 2 cards per row, auto-adjust */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: team.length === 1 ? '1fr' : 'repeat(2, minmax(0, 480px))',
              gap: 24,
              justifyContent: 'center',
              maxWidth: team.length === 1 ? 480 : 980,
              margin: '0 auto'
            }}>
              {visibleTeam.map((member, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', gap: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: 120, flexShrink: 0, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {member.image ? (
                      <img src={member.image} alt={member.name} style={{ width: 120, height: '100%', objectFit: 'cover', minHeight: 140 }} />
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>
                        {member.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '20px 24px', flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{member.name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>{member.designation}</p>
                    {member.description && (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{member.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {team.length > 4 && (
              <div style={{ textAlign: 'center', marginTop: 28 }}>
                <button onClick={() => setShowAll(!showAll)} className="btn btn-outline">
                  {showAll ? 'Show Less ↑' : `Load More (${team.length - 4} more) ↓`}
                </button>
              </div>
            )}
          </section>
        )}

        {/* Contact CTA */}
        <section style={{ textAlign: 'center', background: 'linear-gradient(135deg, var(--primary-light), #fff)', borderRadius: 16, padding: '40px 20px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Get in Touch</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20, fontSize: 15 }}>
            We'd love to hear from you — whether it's a bulk order, feedback, or just a hello!
          </p>
          <Link to="/contact" className="btn btn-primary">Contact Us →</Link>
        </section>
      </div>
    </div>
  )
}
