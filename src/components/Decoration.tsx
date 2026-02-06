import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Cloud, Music } from 'lucide-react';

export default function Decoration() {
  // Static positions for simplicity, or random?
  // Let's put some fixed decorative elements in corners/edges
  
  const stickers = [
    { Icon: Star, color: 'text-yellow-300', top: '10%', left: '5%', delay: 0 },
    { Icon: Heart, color: 'text-red-300', top: '15%', right: '8%', delay: 1 },
    { Icon: Cloud, color: 'text-blue-200', bottom: '10%', left: '3%', delay: 2 },
    { Icon: Music, color: 'text-purple-300', bottom: '20%', right: '5%', delay: 1.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stickers.map((sticker, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${sticker.color}`}
          style={{ 
              top: sticker.top, 
              left: sticker.left, 
              right: sticker.right, 
              bottom: sticker.bottom 
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
              opacity: 0.6, 
              scale: 1,
              y: [0, -10, 0],
              rotate: [0, 10, -10, 0]
          }}
          transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatType: 'reverse',
              delay: sticker.delay 
          }}
        >
          <sticker.Icon className="h-12 w-12 sm:h-16 sm:w-16 opacity-80" />
        </motion.div>
      ))}
    </div>
  );
}