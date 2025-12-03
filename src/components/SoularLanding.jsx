import { motion } from 'framer-motion'
import {
  ChevronDown,
  Code,
  Lightbulb,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import NET from 'vanta/dist/vanta.net.min'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '#product', label: 'サービス' },
    { href: '#services', label: '提供内容' },
    { href: '#company', label: '会社情報' },
  ]

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '5rem',
          }}
        >
          <a
            href="#"
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              textDecoration: 'none',
              letterSpacing: '0.05em',
            }}
          >
            soular<span style={{ color: '#f97316' }}>.</span>
          </a>

          {/* Desktop Nav */}
          <div
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '2rem',
            }}
            className="md-flex"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: '#4b5563',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'color 0.2s',
                }}
                onMouseOver={(e) => (e.target.style.color = '#f97316')}
                onMouseOut={(e) => (e.target.style.color = '#4b5563')}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              style={{
                background: 'linear-gradient(to right, #ea580c, #f97316)',
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}
              onMouseOver={(e) => (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => (e.target.style.opacity = '1')}
            >
              お問い合わせ
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'block',
              background: 'none',
              border: 'none',
              color: '#111827',
              cursor: 'pointer',
              padding: '0.5rem',
            }}
            className="md-hidden"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div
            style={{
              padding: '1rem 0',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            }}
            className="md-hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: '0.75rem 0',
                  color: '#4b5563',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'block',
                marginTop: '0.75rem',
                background: 'linear-gradient(to right, #ea580c, #f97316)',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              お問い合わせ
            </a>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-flex { display: flex !important; }
          .md-hidden { display: none !important; }
        }
      `}</style>
    </nav>
  )
}

function HeroSection() {
  const vantaRef = useRef(null)
  const [vantaEffect, setVantaEffect] = useState(null)

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xf97316,
          backgroundColor: 0xfffbf5,
          points: 12.0,
          maxDistance: 20.0,
          spacing: 18.0,
        })
      )
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <header
      ref={vantaRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          textAlign: 'center',
          padding: '0 1.5rem',
          maxWidth: '56rem',
          margin: '0 auto',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <p
          style={{
            color: '#ea580c',
            fontWeight: 700,
            letterSpacing: '0.2em',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
          }}
        >
          Digital Innovation
        </p>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            fontWeight: 700,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            color: '#111827',
          }}
        >
          株式会社soular
        </h1>
        <h2
          style={{
            fontSize: 'clamp(1.25rem, 4vw, 2.25rem)',
            fontWeight: 300,
            marginBottom: '2.5rem',
            color: '#4b5563',
          }}
        >
          細部に
          <span className="text-gradient" style={{ fontWeight: 700 }}>
            魂
          </span>
          は宿る。
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <a href="#contact" className="btn-primary">
            お問い合わせ
          </a>
          <a href="#product" className="btn-secondary">
            事業内容を見る
          </a>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <ChevronDown
          size={32}
          style={{
            color: '#9ca3af',
            animation: 'bounce 2s infinite',
          }}
        />
      </motion.div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}</style>
    </header>
  )
}

function ProductSection() {
  return (
    <section
      id="product"
      style={{
        padding: '6rem 0',
        background: '#fffbf5',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '50%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div className="section-container" style={{ position: 'relative', zIndex: 10 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 className="section-title">Our Product</h2>
          <div className="section-divider" />
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  background: 'linear-gradient(to right, #22c55e, #f97316)',
                  borderRadius: '1rem',
                  filter: 'blur(12px)',
                  opacity: 0.3,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  borderRadius: '1rem',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                  <MessageCircle size={64} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                  <p>Service Interface Image</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <span
              style={{
                color: '#22c55e',
                fontWeight: 700,
                letterSpacing: '0.1em',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
              }}
            >
              Official LINE Management
            </span>
            <h3
              style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1.5rem',
                color: '#111827',
                lineHeight: 1.3,
              }}
            >
              公式ライン管理サービス
              <br />
              「ラインメイドリピちゃん」
            </h3>
            <p
              style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
                lineHeight: 1.8,
              }}
            >
              顧客管理、自動応答、物販、スタッフの勤怠管理などさまざまな機能をこれひとつで。
              一度来院した患者様がまた来たくなる仕組みを、LINE公式アカウントで実現します。
            </p>
            <ul style={{ listStyle: 'none', marginBottom: '2rem' }}>
              {['リッチメニュー管理', '予約リマインド配信', '24時間365日の自動対応', '物販管理'].map(
                (item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#374151',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <CheckCircle
                      size={20}
                      style={{ color: '#22c55e', marginRight: '0.75rem', flexShrink: 0 }}
                    />
                    {item}
                  </li>
                )
              )}
            </ul>
            <button
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: '#22c55e',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.2s',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              }}
              onMouseOver={(e) => (e.target.style.background = '#16a34a')}
              onMouseOut={(e) => (e.target.style.background = '#22c55e')}
            >
              詳細を見る
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ServicesSection() {
  const services = [
    {
      icon: Code,
      bgColor: 'rgba(249, 115, 22, 0.1)',
      iconColor: '#f97316',
      title: 'System Development',
      description:
        'Webアプリケーションから業務システムまで、スケーラブルで堅牢なシステムを構築します。モダンな技術選定で、将来性のある開発を行います。',
    },
    {
      icon: Lightbulb,
      bgColor: 'rgba(251, 146, 60, 0.1)',
      iconColor: '#fb923c',
      title: 'DX Consulting',
      description:
        '単なるデジタル化ではなく、ビジネスモデルの変革を支援。現状の課題を分析し、最適なデジタルソリューションを提案・導入します。',
    },
    {
      icon: TrendingUp,
      bgColor: 'rgba(234, 88, 12, 0.1)',
      iconColor: '#ea580c',
      title: 'Marketing Support',
      description:
        'LINEを活用したCRM施策を中心に、Web広告運用からSNS戦略まで、売上向上に直結するマーケティング施策を実行支援します。',
    },
  ]

  return (
    <section
      id="services"
      style={{
        padding: '6rem 0',
        background: '#ffffff',
      }}
    >
      <div className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <h2 className="section-title">Services</h2>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            テクノロジーの力でビジネスを加速させる、包括的なソリューション。
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerChildren}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '2rem',
          }}
        >
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                style={{
                  padding: '2rem',
                  borderRadius: '1rem',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                whileHover={{
                  y: -5,
                  boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '3.5rem',
                    height: '3.5rem',
                    background: service.bgColor,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}
                >
                  <IconComponent size={28} style={{ color: service.iconColor }} />
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    color: '#111827',
                  }}
                >
                  {service.title}
                </h3>
                <p
                  style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                  }}
                >
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginTop: '4rem' }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
            }}
          >
            Achievements
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1rem 2rem',
              borderRadius: '9999px',
              color: '#6b7280',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
            }}
          >
            <Clock size={16} style={{ marginRight: '0.5rem' }} />
            導入事例・実績は随時更新予定
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function CompanySection() {
  const companyInfo = [
    { label: '会社名', value: '株式会社soular' },
    { label: '設立', value: '2025年 X月' },
    { label: '代表者', value: '代表取締役 浜田颯流' },
    {
      label: '事業内容',
      value: (
        <>
          LINE公式アカウント運用ツールの開発・販売
          <br />
          Webシステム開発・DX支援
          <br />
          デジタルマーケティング支援
        </>
      ),
    },
    { label: '所在地', value: '〒000-0000 東京都...' },
  ]

  return (
    <section
      id="company"
      style={{
        padding: '6rem 0',
        background: '#fffbf5',
      }}
    >
      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 className="section-title">Company</h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{
            borderRadius: '1rem',
            overflow: 'hidden',
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.08)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {companyInfo.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom:
                      index < companyInfo.length - 1 ? '1px solid #e5e7eb' : 'none',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = '#fffbf5')
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      width: '30%',
                      background: '#fff7ed',
                      color: '#374151',
                      verticalAlign: 'top',
                    }}
                  >
                    {item.label}
                  </th>
                  <td
                    style={{
                      padding: '1rem 1.5rem',
                      color: '#1f2937',
                    }}
                  >
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section
      id="contact"
      style={{
        padding: '6rem 0',
        background: '#ffffff',
      }}
    >
      <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 className="section-title">Contact</h2>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            お仕事のご依頼、ご相談などお気軽にお問い合わせください。
          </p>
        </motion.div>

        <motion.form
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
          style={{
            padding: '2.5rem',
            borderRadius: '1rem',
            background: '#fffbf5',
            border: '1px solid #fed7aa',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                お名前
              </label>
              <input
                type="text"
                placeholder="山田 太郎"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  color: '#1f2937',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f97316'
                  e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                メールアドレス
              </label>
              <input
                type="email"
                placeholder="example@soular.co.jp"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  color: '#1f2937',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f97316'
                  e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              件名
            </label>
            <input
              type="text"
              placeholder="サービス導入について"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                color: '#1f2937',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316'
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              お問い合わせ内容
            </label>
            <textarea
              rows={5}
              placeholder="お問い合わせ内容をご記入ください"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                color: '#1f2937',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f97316'
                e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(to right, #ea580c, #f97316)',
                color: 'white',
                fontWeight: 700,
                padding: '1rem 3rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 10px 25px -5px rgba(234, 88, 12, 0.3)',
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.05)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)'
              }}
            >
              送信する
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer
      style={{
        background: '#fffbf5',
        padding: '2rem 0',
        borderTop: '1px solid #fed7aa',
      }}
    >
      <div
        className="section-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#111827',
          }}
        >
          soular<span style={{ color: '#f97316' }}>.</span>
        </span>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          &copy; 2024 soular Inc. All rights reserved.
        </p>
      </div>

      <style>{`
        @media (min-width: 768px) {
          footer .section-container {
            flex-direction: row !important;
            justify-content: space-between !important;
          }
        }
      `}</style>
    </footer>
  )
}

export default function SoularLanding() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <ProductSection />
      <ServicesSection />
      <CompanySection />
      <ContactSection />
      <Footer />
    </>
  )
}
