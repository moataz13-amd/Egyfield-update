import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './TestimonialSlider.css';

const testimonials = [
  {
    name: 'Ahmed Hassan',
    company: 'Dubai Foods Trading',
    country: 'UAE',
    text: 'Delta Harvest has been our trusted supplier for over 3 years. Their pickled products are consistently high quality and always delivered on time.',
    textAr: 'دلتا هارفست شريكنا الموثوق لأكثر من 3 سنوات. منتجاتهم المخللة عالية الجودة باستمرار وتُسلم دائماً في الوقت المحدد.',
  },
  {
    name: 'Maria Schmidt',
    company: 'EuroFresh GmbH',
    country: 'Germany',
    text: 'The quality of Egyptian fresh produce from Delta Harvest is exceptional. Their strawberries and oranges are always top-grade.',
    textAr: 'جودة المنتجات الطازجة المصرية من دلتا هارفست استثنائية. فراولتهم وبرتقالهم دائماً من الدرجة الأولى.',
  },
  {
    name: 'James Chen',
    company: 'Asian Import Co.',
    country: 'Singapore',
    text: 'Professional team, excellent communication, and the best frozen products we have sourced from Egypt. Highly recommended!',
    textAr: 'فريق محترف، تواصل ممتاز، وأفضل منتجات مجمدة حصلنا عليها من مصر. نوصي بهم بشدة!',
  },
  {
    name: 'Fatima Al-Sayed',
    company: 'Gulf Agricultural Trading',
    country: 'Saudi Arabia',
    text: 'Delta Harvest provides premium grains and legumes with all necessary certifications. A reliable partner for bulk orders.',
    textAr: 'دلتا هارفست توفر حبوباً وبقوليات فاخرة مع جميع الشهادات اللازمة. شريك موثوق للطلبات الكبيرة.',
  },
];

const TestimonialSlider = ({ language = 'en' }) => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const testimonial = testimonials[current];

  return (
    <div className="testimonial-slider">
      <div className="testimonial-card" key={current}>
        <div className="testimonial-quote-icon">
          <Quote size={32} />
        </div>
        <p className="testimonial-text">
          {language === 'ar' ? testimonial.textAr : testimonial.text}
        </p>
        <div className="testimonial-author">
          <div className="testimonial-avatar">
            {testimonial.name.charAt(0)}
          </div>
          <div>
            <h4 className="testimonial-name">{testimonial.name}</h4>
            <p className="testimonial-company">{testimonial.company} — {testimonial.country}</p>
          </div>
        </div>
      </div>

      <div className="testimonial-controls">
        <button className="testimonial-arrow" onClick={prev} aria-label="Previous">
          <ChevronLeft size={20} />
        </button>
        <div className="testimonial-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonial-dot ${i === current ? 'testimonial-dot-active' : ''}`}
              onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button className="testimonial-arrow" onClick={next} aria-label="Next">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TestimonialSlider;
