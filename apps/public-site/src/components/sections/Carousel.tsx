'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { CarouselItem } from '@/lib/types'
import { useSiteHeaderOffset } from '@/hooks/useSiteHeaderOffset'
import ContentImage from '@/components/ui/ContentImage'
import { enabledOnly } from '@/lib/content/enabled'
import styles from './Carousel.module.css'

interface CarouselProps {
  items: CarouselItem[]
}

const AUTOPLAY_DELAY = 3000

export default function Carousel({ items }: CarouselProps) {
  const slides = enabledOnly(items)
  const headerOffset = useSiteHeaderOffset()
  const hasMultiple = slides.length > 1
  const autoplayPlugin = useMemo(
    () =>
      Autoplay({
        delay: AUTOPLAY_DELAY,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    []
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: hasMultiple, align: 'start' },
    hasMultiple ? [autoplayPlugin] : []
  )

  useEffect(() => {
    if (!hasMultiple) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoplayPlugin.stop()
    }
  }, [autoplayPlugin, hasMultiple])

  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  )

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  if (!items || items.length === 0) return null

  const wrapperStyle = headerOffset
    ? ({
        marginTop: headerOffset,
        ['--site-header-offset' as string]: `${headerOffset}px`,
      } as CSSProperties)
    : undefined

  return (
    <div className={`container-fluid p-0 mb-5 ${styles.wrapper}`} style={wrapperStyle}>
      <section
        className={styles.heroCarousel}
        aria-roledescription="carousel"
        aria-label="Home highlights"
      >
        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
            {slides.map((item, idx) => (
              <div
                key={idx}
                className={styles.slide}
                role="group"
                aria-roledescription="slide"
                aria-label={`${idx + 1} of ${slides.length}`}
                aria-hidden={idx !== selectedIndex}
              >
                <div className={styles.slideMedia}>
                  <ContentImage
                    src={item.image}
                    alt={item.alt}
                    width={1920}
                    height={800}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
                <div className={styles.overlay} aria-hidden="true" />
                <div className={styles.caption}>
                  <div className={styles.captionInner}>
                    {/* h2: the page-level h1 lives in the home hero heading */}
                    <h2 className="animated slideInDown">{item.title}</h2>
                    <div className="mb-4">
                      <p className={`${styles.quote} animated slideInDown`}>
                        {item.quote.text}
                      </p>
                      <span className={styles.author}>{item.quote.author}</span>
                    </div>
                    {item.buttons && enabledOnly(item.buttons).length > 0 && (
                      <div className={styles.buttons}>
                        {enabledOnly(item.buttons).map((btn, btnIdx) => (
                          <a
                            key={btnIdx}
                            href={btn.url}
                            className={`btn ${btn.primary ? 'btn-primary' : 'btn-outline-light'}`}
                          >
                            {btn.icon && <i className={`${btn.icon} me-2`} aria-hidden="true" />}
                            {btn.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              className={styles.controlPrev}
              onClick={scrollPrev}
              aria-label="Previous slide"
            >
              <span className={styles.controlIcon} aria-hidden="true">
                ‹
              </span>
            </button>
            <button
              type="button"
              className={styles.controlNext}
              onClick={scrollNext}
              aria-label="Next slide"
            >
              <span className={styles.controlIcon} aria-hidden="true">
                ›
              </span>
            </button>

            <ul className={styles.indicators} role="tablist" aria-label="Slide navigation">
              {slides.map((_, idx) => (
                <li key={idx} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    className={`${styles.dot} ${idx === selectedIndex ? styles.dotActive : ''}`}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-selected={idx === selectedIndex}
                    onClick={() => scrollTo(idx)}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  )
}
