import { useEffect, useRef, useState } from 'react';
import { FaHeart, FaUserTie } from "react-icons/fa";
import { GiCardQueenSpades, GiFishing, GiGroundbreaker, GiLuckyFisherman } from "react-icons/gi";
import { IoDiamondOutline } from "react-icons/io5";
import { MdOutlineSportsCricket } from "react-icons/md";
import { PiJoystick } from 'react-icons/pi';
import { RiGalleryView2 } from "react-icons/ri";
import { useLanguage } from '../../../contexts/LanguageContext';

export const CategoryCards = ({ onCategorySelect, selectedCategory }) => {
  const { t } = useLanguage();
  
  const categories = [
    { title: t('favourite'), titleKey: 'favourite', image: <FaHeart size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "favourite" },
    { title: t('sports'), titleKey: 'sports', image: <MdOutlineSportsCricket size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "sports" },
    { title: t('live'), titleKey: 'live', image: <FaUserTie size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "live" },
    { title: t('table'), titleKey: 'table', image: <GiCardQueenSpades size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "table" },
    { title: t('slot'), titleKey: 'slot', image: <IoDiamondOutline size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "slot" },
    { title: t('crash'), titleKey: 'crash', image: <GiGroundbreaker size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "crash" },
    { title: t('gameProviders'), titleKey: 'all', image: <RiGalleryView2 size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "allgames" },
    { title: t('fishing'), titleKey: 'fishing', image: <GiFishing  size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "fishing" },
    { title: t('lottery'), titleKey: 'lottery', image: <GiLuckyFisherman size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: "Lottery" },
    { title: t('arcade'), titleKey: 'arcade', image: <PiJoystick size={40} className="group-hover:text-[#facc15] transition-all duration-300 text-gray-300" />, value: 'arcade' },
    
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const categoryContainerRef = useRef(null);
  const cardRefs = useRef([]);
  const highlightRef = useRef(null);

  const updateHighlightPosition = (index) => {
    if (!cardRefs.current[index] || !categoryContainerRef.current || !highlightRef.current) return;

    const container = categoryContainerRef.current;
    const card = cardRefs.current[index];
    
    const containerRect = container.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    
    const offsetLeft = (cardRect.left - containerRect.left + container.scrollLeft) - 10;
    
    highlightRef.current.style.transform = `translateX(${offsetLeft}px)`;
    setHighlightIndex(index);
  };

  const handleHover = (index) => {
    updateHighlightPosition(index);
  };

  const handleScroll = () => {
    updateHighlightPosition(highlightIndex);
    
    const container = categoryContainerRef.current;
    if (!container) return;
    
    const scrollWidth = container.scrollWidth - container.clientWidth;
    const dots = Math.ceil(scrollWidth / container.clientWidth);
    setCurrentPage(Math.round((container.scrollLeft / scrollWidth) * dots));
  };

  useEffect(() => {
    const container = categoryContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [highlightIndex]);

  useEffect(() => {
    if (cardRefs.current[0]) {
      updateHighlightPosition(0);
    }
  }, []);

  const scrollToPage = (page) => {
    const container = categoryContainerRef.current;
    const pageWidth = container.clientWidth;
    container.scrollTo({ left: page * pageWidth, behavior: "smooth" });
    setCurrentPage(page);
  };

  const scrollToCategory = (index) => {
    const container = categoryContainerRef.current;
    const card = cardRefs.current[index];
    
    if (container && card) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      
      const targetScrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (category, index) => {
    onCategorySelect(category);
    updateHighlightPosition(index);
    scrollToCategory(index);
  };

  return (
    <div className="relative">
      <div
        ref={categoryContainerRef}
        className="flex px-2 pt-6 pb-8 gap-4 w-full overflow-x-auto h-auto bg-[#1a1f24] backdrop-blur-xl scroll-smooth shadow-inner items-center"
      >
        <div
          ref={highlightRef}
          className="absolute w-20 h-20  bg-[#facc15] opacity-20 rounded-lg z-8 pointer-events-none transition-transform duration-300 ease-in-out top-6"
        ></div>

        {categories.map((category, index) => (
          <button
            key={category.value}
            onClick={() => handleCategoryClick(category, index)}
            onMouseEnter={() => handleHover(index)}
            ref={el => cardRefs.current[index] = el}
            className={`relative w-20 h-20 flex flex-col items-center justify-center p-2 rounded-[8px] group z-10 transition-all active:scale-95`}
          >
            <span className={`relative text-sm font-semibold text-center tracking-wide group-hover:text-[#facc15] text-white`}>
              {category.title}
            </span>
            <div className="relative w-14 h-14 flex items-center justify-center shadow-inner mt-[5px]">
              {category.image}
            </div>
          </button>
        ))}
      </div>

             <div className="flex justify-center p-2 absolute w-full bottom-0 bg-[#1a1f24]">
        {Array.from({
          length: Math.ceil(
            (categoryContainerRef.current?.scrollWidth || 0) / 
            (categoryContainerRef.current?.clientWidth || 1)
          ) || 1,
        }).map((_, index) => (
          <button
            key={index}
            className={`h-2 mx-1 rounded-full ${
              currentPage === index
                ? "bg-[#facc15] w-6"
                : "bg-gray-500 w-2"
            }`}
            onClick={() => scrollToPage(index)}
          ></button>
        ))}
      </div>
    </div>
  );
}; 