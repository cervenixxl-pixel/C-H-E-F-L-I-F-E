
import React from 'react';

const SkeletonChefCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full relative animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="relative h-64 w-full bg-gray-200">
        <div className="absolute top-4 left-4 flex gap-2">
            <div className="h-6 w-20 bg-gray-300 rounded-lg"></div>
            <div className="h-6 w-16 bg-gray-300 rounded-lg"></div>
        </div>
        
        {/* Favorite Button Skeleton */}
        <div className="absolute top-4 right-4 h-10 w-10 bg-gray-300 rounded-full"></div>
        
        {/* Avatar Skeleton Overlap */}
        <div className="absolute -bottom-10 left-6 z-20">
             <div className="relative">
                <div className="absolute -inset-1 bg-white rounded-2xl shadow-sm"></div>
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gray-300"></div>
             </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="pt-14 px-6 pb-6 flex flex-col flex-grow">
        
        {/* Name and Rating */}
        <div className="flex flex-col mb-4">
          <div className="h-8 w-3/4 bg-gray-200 rounded-lg mb-2"></div>
          <div className="flex items-center space-x-3 mt-2">
             <div className="h-6 w-12 bg-gray-200 rounded-md"></div>
             <div className="h-4 w-24 bg-gray-200 rounded-md"></div>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-2">
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-5 w-16 bg-gray-200 rounded"></div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        {/* Stats Rows */}
        <div className="space-y-3 mt-auto">
            <div className="flex items-center">
                 <div className="w-6 mr-3 h-4 bg-gray-200 rounded"></div>
                 <div className="h-3 w-32 bg-gray-200 rounded"></div>
            </div>

             <div className="flex items-center justify-between">
                 <div className="flex items-center">
                    <div className="w-6 mr-3 h-4 bg-gray-200 rounded"></div>
                    <div className="flex flex-col space-y-1">
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                 </div>
                 {/* Button placeholder */}
                 <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonChefCard;
