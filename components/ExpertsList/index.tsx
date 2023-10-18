import { useEffect, useState } from 'react'
import SingleCard from './SingleCard'
import { getPosts } from '@/lib/contentful'

const ExpertsList = () => {
  const [testimonial, setTestimonial] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewAll, setViewAll] = useState(false)
  const [selected, setSelected] = useState<any>(null)

  async function getData() {
    const data = await getPosts()
    setTestimonial(data as any)
  }

  //   async function getData() {
  //     const response = await fetch(
  //       `https://cdn.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/master/entries?access_token=${process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN}`,
  //       {
  //         method: 'GET',
  //         next: {
  //           revalidate: 3600,
  //         },
  //       },
  //     )

  //     if (response.ok) {
  //       const data = await response.json()
  //       console.log('Fetched')
  //       const final = data.items.map((item) => item.fields)
  //       console.log(final)
  //       setTestimonial(final as any)
  //     } else {
  //       console.log(
  //         `Failed to fetch data: ${response.status} ${response.statusText}`,
  //       )
  //     }
  //   }

  useEffect(() => {
    getData()
  }, [])

  const filteredTestimonials = testimonial.filter((t) => {
    const matchesSelectedCategory =
      selected === null
        ? true
        : selected === 'Companies'
        ? t.isCompany
        : !t.isCompany
    return (
      matchesSelectedCategory &&
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.year.toString().includes(searchTerm))
    )
  })
  const testimonialsToShow = viewAll
    ? filteredTestimonials
    : filteredTestimonials.slice(0, 6)
  return (
    <section className="bg-white pl-[30px] pr-[30px] pt-[46px] pb-[50px] text-[#000] md:pl-[90px] md:pr-[130px]">
      {testimonial.length > 0 && (
        <div className="flex gap-x-[50px]">
          <div className="mb-[25px] flex h-[32px] min-w-[350px] max-w-[500px] rounded-[5px] border border-[#D9D9D9] bg-white py-[11px] px-[15px] md:h-[42px]">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/hero/search.svg`}
              alt="image"
              className={`mr-[10px] w-[18px]`}
            />
            <input
              type="text"
              placeholder="Search here"
              className=" w-full bg-white text-[10px] font-medium text-[#000000] placeholder-[#575757] outline-none md:text-[14px] 2xl:text-[16px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="mb-[10px] flex items-center text-[8px] md:mb-[20px] md:text-[12px]  xl:text-[14px]">
            <span
              className={`cursor-pointer ${
                selected === 'Individuals' ? 'text-[#0354EC] underline' : ''
              }`}
              onClick={() => setSelected('Individuals')}
            >
              Individuals
            </span>
            <span className="mx-4">|</span>
            <span
              className={`cursor-pointer ${
                selected === 'Companies' ? 'text-[#0354EC] underline' : ''
              }`}
              onClick={() => setSelected('Companies')}
            >
              Companies
            </span>
          </div>
        </div>
      )}

      {testimonial.length > 0 && (
        <div
          id="experts"
          className="text-[10px] font-bold -tracking-[2%] md:text-[12px] lg:text-[14px] lg:!leading-[150%] 2xl:text-[20px]"
        >
          Openmesh Experts
        </div>
      )}
      <div className="mt-[25px] grid max-h-[2500px] grid-cols-1 gap-x-[40px] gap-y-[40px] overflow-y-auto lg:grid-cols-2 xl:grid-cols-3">
        {testimonialsToShow.map((testimonial, index) => (
          <div key={index}>
            <SingleCard
              title={testimonial.title}
              tags={testimonial.tags}
              description={testimonial.description}
              website={testimonial.website}
              logo={testimonial.logo?.fields.file.url}
              location={testimonial.location}
              year={testimonial.year}
              calendly={testimonial.calendly}
              isCompany={testimonial.isCompany}
            />
          </div>
        ))}
      </div>
      {testimonial.length > 0 && (
        <div
          onClick={() => {
            if (viewAll) {
              const element = document.getElementById('experts')
              element.scrollIntoView({ behavior: 'smooth' })
            }
            setViewAll(!viewAll)
          }}
          className="mt-[31px] flex  cursor-pointer justify-end text-[10px] font-bold -tracking-[2%] text-[#0354EC] hover:text-[#2d5092] md:text-[14px] lg:!leading-[150%] xl:text-[16px] 2xl:text-[20px]"
        >
          {viewAll ? 'View Less' : 'View All'} {'-->'}
        </div>
      )}
    </section>
  )
}

export default ExpertsList
