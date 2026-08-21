'use client';
import { useState } from 'react';
import {
  WHATSAPP_CHAT_URL,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_NUMBER
} from '@/lib/data';
import { MessageSquare, BookOpen, Truck, Compass, CheckCircle2, X } from 'lucide-react';
import styles from './FloatingSupport.module.css';

export default function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);

  const createWhatsAppLink = (customText: string) => {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customText)}`;
  };

  const supportOptions = [
    {
      title: 'Chat on WhatsApp',
      desc: 'Start a direct conversation with us',
      href: WHATSAPP_CHAT_URL,
      isExternal: true,
      highlight: true,
      Icon: MessageSquare
    },
    {
      title: 'Book Enquiry',
      desc: 'Availability, editions & prices',
      href: createWhatsAppLink('Hello Tenali Exams Publishers, I have an enquiry about book availability, editions, and pricing.'),
      isExternal: true,
      Icon: BookOpen
    },
    {
      title: 'Order Support',
      desc: 'Help with orders, delivery & tracking',
      href: createWhatsAppLink('Hello Tenali Exams Publishers, I need support regarding my existing order/delivery/tracking.'),
      isExternal: true,
      Icon: Truck
    },
    {
      title: 'Book Recommendations',
      desc: 'Get assistance choosing right books',
      href: createWhatsAppLink('Hello Tenali Exams Publishers, can you please recommend the best preparation books for my target exam?'),
      isExternal: true,
      Icon: Compass
    },
    {
      title: 'Join WhatsApp Channel',
      desc: 'Updates & new book announcements',
      href: WHATSAPP_CHANNEL_URL,
      isExternal: true,
      badge: 'Official',
      Icon: CheckCircle2
    }
  ];

  return (
    <div className={styles.wrapper}>
      {/* Expanded Support Card */}
      {isOpen && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleWrap}>
              <div>
                <h3 className={styles.panelTitle}>Need Help?</h3>
                <p className={styles.panelSubtitle}>Tenali Exams Publishers Support</p>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close support panel"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.optionsList}>
            {supportOptions.map((opt, idx) => {
              const OptIcon = opt.Icon;
              return (
                <a
                  key={idx}
                  href={opt.href}
                  target={opt.isExternal ? '_blank' : undefined}
                  rel={opt.isExternal ? 'noopener noreferrer' : undefined}
                  className={`${styles.optionCard} ${opt.highlight ? styles.highlightedOption : ''}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: opt.highlight ? '#25D366' : 'var(--color-pastel-blue-light)',
                      color: opt.highlight ? '#FFFFFF' : 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <OptIcon size={16} />
                    </div>
                    <div className={styles.optionContent}>
                      <div className={styles.optionHeader}>
                        <span className={styles.optionTitle}>{opt.title}</span>
                        {opt.badge && <span className={styles.optionBadge}>{opt.badge}</span>}
                      </div>
                      <span className={styles.optionDesc}>{opt.desc}</span>
                    </div>
                  </div>
                  <span className={styles.chevron}>›</span>
                </a>
              );
            })}
          </div>

          <div className={styles.panelFooter}>
            <span>Quick response during publisher business hours</span>
          </div>
        </div>
      )}

      {/* Official WhatsApp Floating Action Button */}
      <div className={styles.toggleRow}>
        <button
          className={`${styles.floatingBtn} ${isOpen ? styles.active : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close customer support" : "Open WhatsApp customer support"}
          title="Chat with Us on WhatsApp"
          style={{
            background: isOpen ? '#1A2B4C' : '#25D366',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
          }}
        >
          {isOpen ? (
            <X size={24} color="#FFFFFF" />
          ) : (
            <img
              src="/images/whatsapp.png"
              alt="WhatsApp Support"
              width={30}
              height={30}
              style={{ objectFit: 'contain' }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
