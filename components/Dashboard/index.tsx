'use client'
import { useEffect, useState } from 'react'
import { parseCookies } from 'nookies'
import { toast } from 'react-toastify'
import { SmileySad } from 'phosphor-react'
import { callAxiosBackend } from '@/utils/general-api'
import { TelegramAppProps, TelegramAppType } from '@/types/telegram'

const Dashboard = () => {
  const [isCreatingNewWorkspace, setIsCreatingNewWorkspace] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [apps, setApps] = useState<TelegramAppProps[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [queryInput, setQueryInput] = useState<string>('') // Estado do input
  const [debouncedQuery, setDebouncedQuery] = useState<string>('') // Estado do debounce

  const categoryToList = {
    Web3: TelegramAppType.WEB3,
    Games: TelegramAppType.GAME,
    Utilities: TelegramAppType.UTILITY,
  }

  // Atualiza o valor de debounce após um atraso
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(queryInput)
    }, 500) // Atraso de 500ms

    return () => {
      clearTimeout(handler)
    }
  }, [queryInput])

  // Busca os dados quando o valor de debounce ou categoria muda
  useEffect(() => {
    const fetchData = async () => {
      if (!debouncedQuery && !selectedCategory) return // Evita buscas desnecessárias
      const { userSessionToken } = parseCookies()
      setIsLoading(true)

      try {
        const res = await callAxiosBackend(
          'get',
          `/telegram/apps?chain=CROSSFI${
            selectedCategory ? `&category=${selectedCategory}` : ''
          }${debouncedQuery ? `&search=${debouncedQuery}` : ''}`,
          userSessionToken,
        )
        setApps(res)
      } catch (err) {
        console.error(err)
        toast.error(
          `Error: ${err.response?.data?.message || 'Failed to fetch data'}`,
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [debouncedQuery, selectedCategory])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true) // Inicia o loading imediatamente
    setQueryInput(e.target.value)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  function NoWorkspaces() {
    return (
      <div className="mx-auto w-fit items-center justify-center">
        <SmileySad size={32} className="text-blue-500 mx-auto  mb-2" />
        <span>No Apps found</span>
      </div>
    )
  }

  return (
    <section className="relative z-10 overflow-hidden px-[5px] pb-16 text-[16px] md:pb-20 lg:pb-28 lg:pt-[40px]">
      <div className="container text-[#fff]">
        <div className="mb-4 flex gap-4">
          {Object.keys(categoryToList).map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(categoryToList[category])}
              className={`rounded px-1 py-2 ${
                selectedCategory === categoryToList[category]
                  ? 'bg-blue-500'
                  : 'bg-gray-700'
              } text-white`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="relative">
  <img
    alt="search"
    src="/images/telegram/search.svg"
    className="absolute left-3 top-1/2 w-[20px] -translate-y-1/2 text-gray-400"
  />
  <input
    type="text"
    id="workspaceName"
    name="workspaceName"
    maxLength={100}
    placeholder="Search apps"
    value={queryInput}
    onChange={handleInputChange}
    className="w-full rounded-md border border-transparent pl-10 pr-4 py-2 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
  />
</div>
        <div className="mb-3 mt-[50px] font-semibold">Community choices</div>
        <div className="overflow-x-auto whitespace-nowrap">
          {apps.map((app, index) => (
            <a key={index} href={app.telegramUrl} className="inline-block">
              <div className="relative inline-block cursor-pointer rounded-[5px] px-3 text-center text-xs text-[#fff] hover:bg-[#13132c]">
                <img
                  src={app.logoUrl}
                  alt="image"
                  className="h-[60px] w-[60px] rounded-lg"
                />
                <div
                  title={app.name}
                  className="mt-1 max-w-[60px] overflow-hidden truncate text-ellipsis whitespace-nowrap"
                >
                  {app.name}
                </div>
              </div>
            </a>
          ))}
        </div>
        {isLoading && (
          <div className="flex w-full justify-between gap-x-[30px]">
            <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
            <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
            <div className="h-40 w-full animate-pulse rounded-[5px] bg-[#1d2144b0]"></div>
          </div>
        )}
        {apps?.length === 0 && !isLoading && <NoWorkspaces />}
      </div>
    </section>
  )
}

export default Dashboard
