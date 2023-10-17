export interface SingleCardProps {
  title: string
  description: string
  tags: string[]
  website: string
  logo: string
  location: string
  year: string
  calendly: string
}

const SingleCard = ({
  title,
  description,
  tags,
  logo,
  location,
  year,
  website,
  calendly,
}: SingleCardProps) => {
  return (
    <div className="relative  justify-start rounded-[8px] border border-[#E4E4E4] p-[15px] text-start text-[#000000] md:h-[480px] xl:p-[25px]">
      <div className=" flex text-[7px] font-normal md:text-[10px] xl:text-[11px] 2xl:text-[14px]">
        {logo ? (
          <img
            src={`${logo}`}
            alt="image"
            className={`2xlmd:h-[100px] 2xlmd:w-[100px] h-[70px] w-[70px] rounded-[8px] border  border-[#D9D9D9] md:h-[70px] md:w-[70px]`}
          />
        ) : (
          <div
            className={`2xlmd:h-[100px] 2xlmd:w-[100px] h-[70px] w-[70px] rounded-[8px] border  border-[#D9D9D9] md:h-[70px] md:w-[70px]`}
          />
        )}
        <div className="ml-auto ">
          <div className="mt-[10px] flex">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/www.svg`}
              alt="image"
              className={`mr-[5px] ml-[3px] w-[13px]`}
            />
            <a href={website} target="_blank" rel="nofollow noreferrer">
              <div className="flex items-center">{website}</div>
            </a>
          </div>
          <div className="mt-[10px] flex">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/gps.svg`}
              alt="image"
              className={`mr-[5px]`}
            />
            <div className="flex items-center">{location}</div>
          </div>
          <div className="mt-[10px] flex">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/building.svg`}
              alt="image"
              className={`mr-[5px]`}
            />
            <div className="flex items-center">{year}</div>
          </div>
        </div>
      </div>
      <div>
        <div className="mt-[15px] text-[10px] font-bold md:mt-[25px] md:text-[12px] lg:text-[14px] lg:!leading-[150%] xl:text-[16px] 2xl:text-[20px]">
          {title}
        </div>
        <div className="mt-[15px] flex flex-wrap  2xl:mt-[25px]">
          {tags &&
            tags.map((tag, index) => (
              <div
                className={`${
                  index !== 0 ? 'ml-1' : ''
                } mb-1 border-b border-[#000000] pb-0 text-[8px] font-normal -tracking-[2%] md:text-[12px] lg:!leading-[19px] xl:text-[13px] 2xl:text-[16px]`}
                key={index}
              >
                {tag}
                {index !== tags.length - 1 && ', '}
              </div>
            ))}
        </div>
        <div
          title={description}
          className="mt-[15px] h-[60px] overflow-hidden text-[8px] font-normal -tracking-[2%]  text-[#959595] line-clamp-5 md:text-[10px] lg:h-[100px] lg:text-[12px] lg:!leading-[150%] xl:text-[13px] 2xl:mt-[25px] 2xl:text-[16px]"
        >
          {description}
        </div>
      </div>
      <div className="bottom-10 mt-[15px] flex justify-start text-center md:absolute 2xl:mt-[25px]">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={calendly}
          className="cursor-pointer rounded-[5px] border border-[#D5D8DB] bg-[#F5F8FA] px-[16px] py-[8px] text-[7px] font-bold text-[#505050] hover:bg-[#d3d5d6] md:text-[10px] lg:!leading-[19px] xl:text-[11px]  2xl:px-[21px] 2xl:py-[12.5px] 2xl:text-[12px]"
        >
          Schedule a Call
        </a>
      </div>
    </div>
  )
}

export default SingleCard
