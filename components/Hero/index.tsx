/* eslint-disable react/no-unescaped-entities */
const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="relative z-10 overflow-hidden bg-white px-[30px] pt-[53px] text-[#000000] md:px-[90px]"
      >
        <div className="">
          <div className="text-[24px] font-medium -tracking-[2%] md:text-[33px] lg:!leading-[58px] xl:text-[38px] 2xl:text-[48px]">
            Openmesh Expert Community
          </div>
          <div className="mt-[21px] text-[10px] font-normal -tracking-[2%] text-[#959595] md:text-[14px] lg:!leading-[150%] xl:max-w-[1250px] xl:text-[16px] 2xl:text-[20px]">
            Discover and connect with leading Openmesh experts in our curated
            directory. Whether you're seeking solutions or expertise, this is
            your one-stop portal to the best in decentralized data technology.
            Dive in and shape your Web 3.0 journey with the pros.
          </div>
          <div className="mt-[21px]">
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/community/register`}
              className=" cursor-pointer text-[10px] font-bold -tracking-[2%] text-[#0354EC] hover:text-[#2d5092] md:text-[14px] lg:!leading-[150%] xl:text-[16px] 2xl:text-[20px]"
            >
              Join as an Openmesh Expert {'-->'}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Hero
