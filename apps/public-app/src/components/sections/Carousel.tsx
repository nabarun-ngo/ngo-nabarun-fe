'use client'

import { useState, useEffect, useRef } from 'react'
import { Carousel as BootstrapCarousel } from 'bootstrap'
import { CarouselItem } from '@/lib/types'
import ContentImage from '@/components/ui/ContentImage'
import { enabledOnly } from '@/lib/content/enabled'

interface CarouselProps {
  items: CarouselItem[]
}

export default function Carousel({ items }: CarouselProps) {
  const slides = enabledOnly(items)
  const [mounted, setMounted] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !carouselRef.current) return

    const carousel = new BootstrapCarousel(carouselRef.current, {
      interval: 7000,
      ride: 'carousel',
      wrap: true,
    })

    return () => carousel.dispose()
  }, [mounted])

  if (!slides || slides.length === 0) return null

  if (!mounted) {
    return (
      <div suppressHydrationWarning className="container-fluid p-0 mb-5">
        <div id="header-carousel" className="carousel slide">
          <div className="carousel-inner">
            <div className="carousel-item active">
              <ContentImage
                className="w-100 carousel-slide-img"
                src={slides[0].image}
                alt={slides[0].alt}
                width={1920}
                height={800}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div suppressHydrationWarning className="container-fluid p-0 mb-5">
      <div ref={carouselRef} id="header-carousel" className="carousel slide carousel-fade" data-bs-ride="carousel">
        {/* Indicators */}
        <div className="carousel-indicators">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              data-bs-target="#header-carousel"
              data-bs-slide-to={idx}
              className={idx === 0 ? 'active' : ''}
              aria-current={idx === 0 ? 'true' : 'false'}
              aria-label={`Slide ${idx + 1}`}
            ></button>
          ))}
        </div>

        {/* Slides */}
        <div className="carousel-inner">
          {slides.map((item, idx) => (
            <div key={idx} className={`carousel-item ${idx === 0 ? 'active' : ''}`}>
              <ContentImage
                className="w-100 carousel-slide-img"
                src={item.image}
                alt={item.alt}
                width={1920}
                height={800}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
              <div className="carousel-caption">
                <div className="container">
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      {/* h2: the page-level h1 lives in the home hero heading */}
                      <h2 className="animated slideInDown">{item.title}</h2>
                      <div className="mb-4">
                        <p className="fs-5 animated slideInDown">{item.quote.text}</p>
                        <span className="text-primary">{item.quote.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <button className="carousel-control-prev" type="button" data-bs-target="#header-carousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#header-carousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </div>
  )
}
