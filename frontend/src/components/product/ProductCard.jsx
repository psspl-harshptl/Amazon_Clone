import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  if (!product) return null;
  const { id, name, price, mrp, imageUrl, rating, reviewCount, badge } = product;

  return (
    <div className="bg-white p-4 flex flex-col h-full border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow relative group cursor-pointer">
      {badge && (
        <span className="absolute top-2 left-0 bg-amazon-red text-white text-xs px-2 py-1 rounded-r-sm z-10">
          {badge}
        </span>
      )}
      
      <Link to={`/products/${id}`} className="flex justify-center mb-4 h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300" 
        />
      </Link>

      <Link to={`/products/${id}`} className="text-sm font-medium line-clamp-2 hover:text-amazon-primary mb-2 min-h-[40px]">
        {name}
      </Link>

      <div className="flex items-center mb-2">
        <div className="flex text-amazon-primary">
          {[...Array(5)].map((_, i) => (
            <svg 
              key={i} 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <span className="text-xs text-amazon-link ml-2 font-medium">{reviewCount}</span>
      </div>

      <div className="mt-auto">
        <div className="flex items-baseline mb-2">
          <span className="text-xs align-top pt-1 font-bold">₹</span>
          <span className="text-2xl font-bold">{Number(price).toLocaleString('en-IN')}</span>
          {mrp > price && (
            <span className="ml-2 text-xs text-gray-500 line-through">M.R.P: ₹{Number(mrp).toLocaleString('en-IN')}</span>
          )}
        </div>
        
        <p className="text-xs text-gray-600 mb-4">
          FREE delivery <span className="font-bold">Tomorrow</span>. Order within 10 hrs 20 mins.
        </p>

        <button className="amazon-button w-full text-xs py-1.5">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
