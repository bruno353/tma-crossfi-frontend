import React from 'react'

const TokenCarousel = ({ children }) => {
  return (
    <div className="relative w-full">
      {/* Carousel container */}
      <div
        className="no-scrollbar flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Wrap each child in a snap point container */}
        {React.Children.map(children, (child) => (
          <div className="shrink-0 snap-start first:ml-[10px] last:mr-[10px]">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}

// Adicione esses estilos ao seu arquivo global.css
// @layer utilities {
//   .no-scrollbar::-webkit-scrollbar {
//     display: none;
//   }
//   .no-scrollbar {
//     -ms-overflow-style: none;
//     scrollbar-width: none;
//   }
// }

export default TokenCarousel
