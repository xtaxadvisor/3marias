{`import React from 'react';
import { ShoppingCart as CartIcon } from 'lucide-react';
import { useMediaQuery } from '../../utils/hooks';

export function ShoppingCart() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={
      \`fixed z-50 \${isMobile ? 'bottom-4 right-4' : 'top-4 right-4'} 
      bg-white rounded-lg shadow-lg p-4 transition-all duration-300\`
    }>
      <div className="relative">
        <CartIcon className="h-6 w-6 text-gray-600" />
        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          0
        </span>
      </div>
    </div>
  );
}`}