import React from 'react'
import { Sparklines, SparklinesLine } from 'react-sparklines'

const TokenCard = ({
  icon,
  name,
  symbol,
  price,
  priceChange,
  priceArray = [5, 10, 5, 20, 25, 18, 12, 5, 1, 20, 30, 50, 10, 15, 20],
}) => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border-primary bg-[#592a7f22] p-4">
      {/* Radial blur effect */}
      <div
        className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle at center, rgba(147, 51, 234, 0.35) 0%, rgba(147, 51, 234, 0) 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div className="relative items-start">
        {/* Left side with token info */}
        <div className="flex items-center gap-1">
          <div className="bg-purple-500/30 rounded-full p-2 backdrop-blur-sm">
            {icon ? (
              <img src={icon} alt={name} className="h-[30px] w-[30px]" />
            ) : (
              <div className="bg-purple-400 h-8 w-8 rounded-full" />
            )}
            {/* <img
              alt="ethereum avatar"
              src="/images/blockchain/arrow-left.svg"
              className="w-[20px] h-[20px]"
            ></img> */}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{symbol}</h3>
            <p className="text-gray-400 text-[10px]">{name}</p>
          </div>
        </div>

        {/* Right side with sparkline */}
        <div className="w-full pt-2">
          <Sparklines data={priceArray} width={100} height={30}>
            <SparklinesLine
              style={{
                strokeWidth: 2,
                stroke: priceChange >= 0 ? '#22c55e' : '#ef4444',
                fill: 'none',
              }}
            />
          </Sparklines>
        </div>
      </div>

      {/* Price information */}
      <div className="mt-4 flex items-end justify-between gap-x-6">
        <div className="text-lg font-bold text-white">
          ${typeof price === 'number' ? price.toLocaleString() : price}
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            priceChange >= 0 ? 'text-green' : 'text-red'
          }`}
        >
          <span>{priceChange >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(priceChange)}%</span>
        </div>
      </div>
    </div>
  )
}

export default TokenCard
