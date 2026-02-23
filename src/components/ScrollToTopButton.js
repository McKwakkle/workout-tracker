import { useState, useEffect } from 'react';
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
    className={`scroll-to-top ${visible  ? ' visible' : ''}`}
    onClick={scrollToTop}
    aria-label="Scroll to top"
    >
    <i className='fa-solid fa-chevron-up'></i>
    </button>
  );
}

export default ScrollToTopButton;