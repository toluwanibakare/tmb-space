import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub, FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

const XIcon = ({ size = 20 }: { size?: number }) => (
  <img
    src="https://cdn.simpleicons.org/x/000000"
    alt="X"
    style={{ width: size, height: size }}
    className="dark:invert"
  />
);

const socials = [
  {
    name: 'Facebook',
    icon: FaFacebook,
    url: 'https://www.facebook.com/share/1aBZC5KPBt/?mibextid=wwXIfr',
    color: 'bg-blue-600'
  },
  { 
    name: 'Instagram', 
    icon: FaInstagram, 
    url: 'https://instagram.com/official.tmb01',
    color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400'
  },
  { 
    name: 'X', 
    icon: XIcon, 
    url: 'https://x.com/0xtmb',
    color: 'bg-white text-black dark:bg-black dark:text-white'
  },
  { 
    name: 'LinkedIn', 
    icon: FaLinkedin, 
    url: 'https://linkedin.com/in/toluwani-bakare-49910324a',
    color: 'bg-blue-600'
  },
  { 
    name: 'GitHub', 
    icon: FaGithub, 
    url: 'https://github.com/toluwanibakare',
    color: 'bg-gray-800 dark:bg-gray-700'
  },
  { 
    name: 'WhatsApp', 
    icon: FaWhatsapp, 
    url: 'https://wa.me/2348026322742',
    color: 'bg-green-500'
  },
];

export const SocialFollowPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const location = useLocation();

  // Reset popup state on route change so it can show once per page
  useEffect(() => {
    setIsVisible(false);
    setHasShown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      // Show popup after scrolling 10%
      if (scrollPercentage > 10 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 z-50 glass-effect rounded-2xl p-6 shadow-2xl max-w-sm border border-primary/20"
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleClose}
          >
            <X size={18} />
          </Button>

          <div className="text-center mb-4">
            <h3 className="font-heading font-bold text-lg mb-1">Follow Me</h3>
            <p className="text-sm text-muted-foreground">Stay connected on social media</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {socials.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${social.color} p-3 rounded-full text-white hover:scale-110 transition-transform`}
                title={social.name}
              >
                <social.icon size={20} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
