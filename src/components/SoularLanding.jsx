import { motion } from 'framer-motion'
import {
  ChevronDown,
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
            soular<span style={{ color: '#1e88e5' }}>.</span>
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
                onMouseOver={(e) => (e.target.style.color = '#1e88e5')}
                onMouseOut={(e) => (e.target.style.color = '#4b5563')}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              style={{
                background: '#1e88e5',
                color: 'white',
                padding: '0.5rem 1.25rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
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
                background: '#1e88e5',
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
          color: 0x1e88e5,
          backgroundColor: 0xffffff,
          points: 14.0,
          maxDistance: 22.0,
          spacing: 16.0,
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
            color: '#1e88e5',
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
          <span className="text-gradient-blue" style={{ fontWeight: 700 }}>
            魂
          </span>
          を込め、尽くし、熱く挑む
        </h2>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
          }}
        >
          <a href="#contact" className="btn-primary-blue">
            お問い合わせ
          </a>
          <a href="#product" className="btn-secondary-blue">
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
        .text-gradient-blue {
          background: #1e88e5;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .btn-primary-blue {
          display: inline-flex;
          align-items: center;
          background: #1e88e5;
          color: white;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 10px 25px -5px rgba(30, 136, 229, 0.3);
        }
        .btn-primary-blue:hover {
          transform: scale(1.05);
        }
        .btn-secondary-blue {
          display: inline-flex;
          align-items: center;
          background: white;
          color: #374151;
          padding: 0.875rem 2rem;
          border-radius: 9999px;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid #d1d5db;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-secondary-blue:hover {
          border-color: #1e88e5;
          color: #1e88e5;
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
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)',
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
          background: 'radial-gradient(circle, rgba(30, 136, 229, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '40%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(67, 160, 71, 0.06) 0%, transparent 70%)',
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
          <h2 className="section-title-blue">Recent Work</h2>
          <div className="section-divider-blue" />
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
                  background: '#1e88e5',
                  borderRadius: '1rem',
                  filter: 'blur(12px)',
                  opacity: 0.3,
                }}
              />
              <img
                src="/linemade.png"
                alt="ラインメイドリピちゃん"
                style={{
                  position: 'relative',
                  borderRadius: '1rem',
                  width: '100%',
                  height: 'auto',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
                }}
              />
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
                color: '#1e88e5',
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
                      style={{ color: '#43a047', marginRight: '0.75rem', flexShrink: 0 }}
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
                background: '#1e88e5',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
              }}
              onMouseOver={(e) => (e.target.style.opacity = '0.9')}
              onMouseOut={(e) => (e.target.style.opacity = '1')}
            >
              詳細を見る
              <ArrowRight size={16} style={{ marginLeft: '0.5rem' }} />
            </button>
          </motion.div>
        </div>
      </div>

      <style>{`
        .section-title-blue {
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }
        .section-divider-blue {
          width: 3rem;
          height: 3px;
          background: #1e88e5;
          margin: 1rem auto 0;
          border-radius: 9999px;
        }
        .section-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
      `}</style>
    </section>
  )
}

function ServicesSection() {
  const services = [
    {
      title: '公式LINE管理サービス',
      description:
        'LINE公式アカウントの構築から運用まで一括サポート。顧客管理、自動応答、予約システム、物販機能を統合し、リピーター獲得と業務効率化を実現します。',
      image: '/service-1.png',
    },
    {
      title: 'RPO事業・人事コンサルティング',
      description:
        '採用目標から逆算した人員拡充を支援。採用設計から媒体運用、面接・見学対応、クロージング、研修まで一貫代行。紹介会社・人事経験を活かしたノウハウで、クリニック・福祉施設からスタートアップ、上場企業まで幅広く対応します。',
      image: '/service-2.png',
    },
    {
      title: '蓬（ヨモギ）農業推進・支援事業',
      description:
        '耕作放棄地や遊休農地を活用し、国産で高品質なヨモギを安定供給。生葉から乾燥粉末まで幅広い用途に対応し、飲食・美容・健康・アロマなど多業種へ原料を卸売りします。',
      image: '/service-3.png',
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
          <h2 className="section-title-blue">Services</h2>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            多角的な事業展開で、あなたのビジネスと地域社会に貢献します。
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
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              style={{
                borderRadius: '1rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '280px',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div style={{ padding: '2rem' }}>
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
              </div>
            </motion.div>
          ))}
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
              background: 'linear-gradient(135deg, rgba(30, 136, 229, 0.08), rgba(67, 160, 71, 0.08))',
              border: '1px solid rgba(30, 136, 229, 0.2)',
            }}
          >
            <Clock size={16} style={{ marginRight: '0.5rem' }} />
            導入事例・実績は随時更新予定
          </div>
        </motion.div>
      </div>

      <style>{`
        .section-title-blue {
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }
        .section-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
      `}</style>
    </section>
  )
}

function CompanySection() {
  const companyInfo = [
    { label: '会社名', value: '株式会社soular' },
    { label: '設立', value: '2025年 1月' },
    { label: '代表者', value: '代表取締役 浜田颯流' },
    {
      label: '事業内容',
      value: (
        <>
          LINE公式アカウント運用ツールの開発・販売・運用
          <br />
          人事・集客コンサルティング事業
          <br />
          農業推進・支援事業
        </>
      ),
    },
    { label: '所在地', value: '〒110-0005 東京都台東区上野1丁目17番6号広小路ビル8F-B' },
  ]

  return (
    <section
      id="company"
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)',
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
          <h2 className="section-title-blue">Company</h2>
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
                  }}
                >
                  <th
                    style={{
                      padding: '1rem 1.5rem',
                      fontWeight: 500,
                      textAlign: 'left',
                      width: '30%',
                      background: 'linear-gradient(135deg, rgba(30, 136, 229, 0.1), rgba(67, 160, 71, 0.1))',
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

      <style>{`
        .section-title-blue {
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }
      `}</style>
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
          <h2 className="section-title-blue">Contact</h2>
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
            background: 'linear-gradient(135deg, rgba(30, 136, 229, 0.05), rgba(67, 160, 71, 0.05))',
            border: '1px solid rgba(30, 136, 229, 0.2)',
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
                  e.target.style.borderColor = '#1e88e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)'
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
                  e.target.style.borderColor = '#1e88e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)'
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
                e.target.style.borderColor = '#1e88e5'
                e.target.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)'
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
                e.target.style.borderColor = '#1e88e5'
                e.target.style.boxShadow = '0 0 0 3px rgba(30, 136, 229, 0.1)'
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
                background: '#1e88e5',
                color: 'white',
                fontWeight: 700,
                padding: '1rem 3rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 10px 25px -5px rgba(30, 136, 229, 0.3)',
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

      <style>{`
        .section-title-blue {
          font-size: clamp(2rem, 5vw, 2.5rem);
          font-weight: 700;
          color: #111827;
        }
      `}</style>
    </section>
  )
}

function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%)',
        padding: '2rem 0',
        borderTop: '1px solid rgba(30, 136, 229, 0.2)',
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
          soular<span style={{ color: '#1e88e5' }}>.</span>
        </span>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          &copy; 2024 soular Inc. All rights reserved.
        </p>
      </div>

      <style>{`
        .section-container {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
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

export default function SoularLandingBlue() {
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
