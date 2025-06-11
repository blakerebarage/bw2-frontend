import useAxiosSecure from "@/Hook/useAxiosSecure";
import useMedia from "@/Hook/useMedia";
import { useEffect, useRef, useState } from "react";
import { FaFacebookMessenger, FaHeadset, FaLink, FaTelegram, FaTimes, FaWhatsapp } from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";
import { SiViber } from "react-icons/si";
import { useToasts } from "react-toast-notifications";

const iconForProvider = (providerName) => {
  if (!providerName) return <FaLink className="text-gray-400" size={20} />;
  const name = providerName.toLowerCase();
  if (name.includes("whatsapp")) return <FaWhatsapp className="text-green-500" size={20} />;
  if (name.includes("telegram")) return <FaTelegram className="text-[#229ED9]" size={20} />;
  if (name.includes("signal")) return <FaSignalMessenger className="text-blue-700" size={20} />;
  if (name.includes("messenger")) return <FaFacebookMessenger className="text-blue-700" size={20} />;
  if (name.includes("imo")) return <SiViber className="text-sky-500" size={20} />;
  return <FaLink className="text-gray-400" size={20} />;
};

const ContactWidget = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [supportContact, setSupportContact] = useState([]);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mouseOverPanel, setMouseOverPanel] = useState(false);
  const [mouseOverButton, setMouseOverButton] = useState(false);
  const [panelDirection, setPanelDirection] = useState({ vertical: 'up', horizontal: 'left' });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const dragRef = useRef(null);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const { refreshMedia,logo} = useMedia();

  useEffect(() => { refreshMedia(); }, [axiosSecure]);

  useEffect(() => {
    const fetchSupportContact = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/system-setting/get-general');
        if (res.data.success && res.data.data) {
          setSupportContact(res.data.data.supportContact || []);
        }
      } catch (err) {
        addToast("Failed to fetch support contacts", { appearance: "error", autoDismiss: true });
      } finally {
        setLoading(false);
      }
    };
    fetchSupportContact();
  }, [axiosSecure]);

  useEffect(() => {
    const handleResize = () => {
      const widgetWidth = 64;
      const widgetHeight = 64;
      const padding = 16;
      setPosition({
        x: window.innerWidth - widgetWidth - padding,
        y: window.innerHeight - widgetHeight - padding,
      });
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const clampPosition = (x, y) => {
    const widgetWidth = 64;
    const widgetHeight = 64;
    return {
      x: Math.max(8, Math.min(x, window.innerWidth - widgetWidth - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - widgetHeight - 8)),
    };
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y,
    });
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    if (!isDragging) {
      document.body.style.userSelect = '';
      return;
    }
    const handlePointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      setPosition(clampPosition(newX, newY));
    };
    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (!mouseOverPanel && !mouseOverButton && !isDragging) {
      setDrawerOpen(false);
      setHoveredIdx(null);
    }
  }, [mouseOverPanel, mouseOverButton, isDragging]);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handlePanelOpen = () => {
    const panelWidth = 320;
    const panelHeight = 400;
    const padding = 16;
    const vertical = window.innerHeight - (position.y + 60) > panelHeight + padding ? 'down' : 'up';
    const horizontal = position.x > panelWidth + padding ? 'left' : 'right';
    setPanelDirection({ vertical, horizontal });
    setDrawerOpen(true);
  };

  const groupedContacts = supportContact.reduce((acc, contact) => {
    const key = (contact.providerName || '').toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(contact);
    return acc;
  }, {});

  return (
    <>
      {/* Overlay for focus on mobile */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setDrawerOpen(false)}
        />
      )}
      <div
        ref={dragRef}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 50,
          cursor: isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'box-shadow 0.2s',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        <div className="relative">
          {!drawerOpen && (
            <button
              className="shadow-2xl w-16 h-16 flex cursor-pointer items-center justify-center border-4 border-[#1b1f23] hover:scale-110 transition-transform bg-[#1b1f23] rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
              onClick={handlePanelOpen}
              style={{ outline: 'none' }}
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              aria-label="Open support contacts"
            >
              <FaHeadset className="text-white" size={28} />
            </button>
          )}
          {drawerOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ minHeight: 280, maxHeight: '80vh' }}
              onMouseEnter={() => setMouseOverPanel(true)}
              onMouseLeave={() => setMouseOverPanel(false)}
            >
              <div className="w-[90vw] max-w-xs bg-gradient-to-br bg-[#1b1f23] shadow-2xl text-white p-0 flex flex-col items-center rounded-2xl">
                {/* Sticky header for mobile */}
                <div className="flex flex-col items-center p-3 sm:p-4 border-b border-white/10 bg-gray-900/80 rounded-t-2xl w-full sticky top-0 z-10">
                  <div className="w-full flex justify-between items-center mb-2">
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="text-white hover:text-red-500 transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                      aria-label="Close support contacts"
                    >
                      <FaTimes size={22} />
                    </button>
                  </div>
                  {logo && (
                    <img
                      src={`${import.meta.env.VITE_BASE_API_URL}${logo.url}`}
                      alt="baji"
                      className="w-24 sm:w-32 mb-2 drop-shadow-lg"
                    />
                  )}
                  <div className="font-bold text-base sm:text-lg tracking-wide text-white">24/7 Support</div>
                </div>
                <div className="w-full bg-gray-800/80 rounded-b-xl p-2 sm:p-3 flex flex-col gap-2 sm:gap-3 shadow-inner overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
                  {Object.keys(groupedContacts).length === 0 && (
                    <div className="text-gray-400 text-center py-8">No support contacts available.</div>
                  )}
                  {Object.entries(groupedContacts).map(([provider, contacts], idx) => (
                    <div
                      key={`support-${idx}`}
                      className={`flex flex-col rounded-xl cursor-pointer relative transition-all duration-300 group
                        ${hoveredIdx === idx
                          ? "bg-white/95 text-gray-900 shadow-2xl border-2 border-green-400 scale-[1.02]"
                          : "bg-white/10 hover:bg-white/20 hover:scale-[1.01]"}
                      `}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                        <div className={`p-2 rounded-lg ${hoveredIdx === idx ? 'bg-gray-100' : 'bg-white/10'} transition-colors duration-300`}>
                          {iconForProvider(provider)}
                        </div>
                        <span className="flex-1 font-semibold tracking-wide text-sm sm:text-base">{contacts[0].providerName}</span>
                        <span className={`text-xs px-2 py-1 rounded-full transition-all duration-300
                          ${hoveredIdx === idx
                            ? 'bg-green-100 text-green-800'
                            : 'bg-white/10 text-white/60 group-hover:bg-white/20'}
                        `}>
                          Contact
                        </span>
                      </div>
                      <div
                        className={`transition-all duration-300 overflow-hidden
                          ${hoveredIdx === idx ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}
                          bg-white rounded-b-xl shadow-2xl border-t border-green-400`}
                        style={{ zIndex: 10 }}
                      >
                        <div className="flex flex-col items-center pt-3 pb-3 px-4">
                          {contacts.map((contact, cidx) => (
                            <div key={cidx} className="w-full mb-3 last:mb-0">
                              {contact.phoneNumber && (
                                <a
                                  href={`tel:${contact.phoneNumber}`}
                                  className="flex items-center gap-2 text-sm text-gray-800 hover:text-blue-600 transition-colors group"
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  <span className="font-bold">Support {cidx + 1}:</span>
                                  <span className="group-hover:underline">{contact.phoneNumber}</span>
                                </a>
                              )}
                              {contact.link && (
                                <a
                                  href={contact.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-green-700 font-bold hover:text-green-900 transition-colors group mt-1"
                                  style={{ wordBreak: 'break-all' }}
                                >
                                  <span className="group-hover:underline">{contact.link}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContactWidget; 