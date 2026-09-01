'use client';
import { useState, useEffect } from 'react';
import { SYLLABUS_DATABASE, CadreSyllabus } from '@/lib/syllabusData';
import { BookOpen, Search, CheckCircle2, Sparkles, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './SyllabusModal.module.css';

interface SyllabusModalProps {
  productSlug: string;
  isOpen: boolean;
  onClose: () => void;
  initialCadreId?: string;
}

export default function SyllabusModal({
  productSlug,
  isOpen,
  onClose,
  initialCadreId
}: SyllabusModalProps): React.JSX.Element | null {
  const syllabusData = SYLLABUS_DATABASE[productSlug] || SYLLABUS_DATABASE['mts-postman-mg'];
  const cadres = syllabusData.cadres;

  const [activeCadreId, setActiveCadreId] = useState<string>(initialCadreId || cadres[0]?.id || 'mts');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showTags, setShowTags] = useState<boolean>(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (initialCadreId) {
      setActiveCadreId(initialCadreId);
    }
  }, [initialCadreId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentCadre: CadreSyllabus = cadres.find(c => c.id === activeCadreId) || cadres[0];

  const toggleSection = (idx: number) => {
    setCollapsedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.headerIconBox}>
              <BookOpen size={22} />
            </div>
            <div>
              <span className={styles.badgeTag}>Official India Post Syllabus</span>
              <h2 className={styles.title}>{syllabusData.productName}</h2>
              <p className={styles.subtitle}>Complete Topic-Wise Examination Syllabus Breakdown</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Cadre Navigation Tabs */}
        {cadres.length > 1 && (
          <div className={styles.tabsContainer}>
            {cadres.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveCadreId(c.id); setSearchTerm(''); setCollapsedSections({}); }}
                className={`${styles.tabBtn} ${activeCadreId === c.id ? styles.tabBtnActive : ''}`}
              >
                <span>{c.icon}</span>
                <span>{c.cadreName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.body}>
          {/* Focus Banner */}
          <div className={styles.focusBanner}>
            <span className={styles.focusIcon}>🎯</span>
            <div className={styles.focusText}>
              <strong>{currentCadre.cadreName} Focus Area:</strong> {currentCadre.focus}
            </div>
          </div>

          {/* Quick Search */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder={`Search topics in ${currentCadre.cadreName} syllabus...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Detailed Structured Syllabus Sections */}
          {currentCadre.sections.map((section, sIdx) => {
            const isCollapsed = collapsedSections[sIdx] === true;

            const filteredTopics = section.topics.map(t => ({
              ...t,
              items: t.items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
            })).filter(t => t.items.length > 0);

            if (searchTerm && filteredTopics.length === 0) return null;

            return (
              <div key={sIdx} className={styles.sectionCard}>
                <div className={styles.sectionHeader} onClick={() => toggleSection(sIdx)}>
                  <div className="flex items-center gap-2">
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)' }}>
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                    <div>
                      <h3 className={styles.sectionTitle}>{section.title}</h3>
                      {section.subtitle && <p className={styles.sectionSubtitle}>{section.subtitle}</p>}
                    </div>
                  </div>
                  {section.badge && (
                    <span className={styles.sectionBadge}>{section.badge}</span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className={styles.topicList}>
                    {filteredTopics.map((group, gIdx) => (
                      <div key={gIdx} className={styles.topicGroup}>
                        <h4 className={styles.topicGroupTitle}>
                          <Sparkles size={14} className="text-blue-500" />
                          {group.title}
                        </h4>
                        <ul className={styles.itemList}>
                          {group.items.map((item, iIdx) => (
                            <li key={iIdx} className={styles.itemCell}>
                              <span className={styles.checkMark}>✓</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Collapsible Quick Overview Tags (Placed at Bottom) */}
          <div className={styles.quickTagsWrap}>
            <div
              className={styles.quickTagsHeader}
              onClick={() => setShowTags(!showTags)}
            >
              <div className={styles.quickTagsTitle}>
                <span>📌 {currentCadre.shortTag} Overview ({currentCadre.tags.length} Key Topics)</span>
              </div>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                {showTags ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showTags && (
              <div className={styles.tagsCloud}>
                {currentCadre.tags.map((t, idx) => (
                  <span key={idx} className={styles.tagPill}>
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerNote}>
            💡 Aligned with latest Department of Posts syllabus guidelines.
          </div>
          <div className={styles.footerActions}>
            <button onClick={onClose} className={styles.dismissBtn}>
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
