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
    }, 300) // Atraso de 300ms

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
        <div className="relative mt-2">
          <img
            alt="search"
            src="/images/telegram/search.svg"
            className="text-gray-400 absolute left-3 top-1/2 w-[20px] -translate-y-1/2"
          />
          <input
            type="text"
            id="workspaceName"
            name="workspaceName"
            maxLength={100}
            placeholder="Search apps"
            value={queryInput}
            onChange={handleInputChange}
            className="w-full rounded-md border border-transparent py-2 pl-10 pr-4 text-base text-body-color placeholder-body-color shadow-one outline-none focus:border-primary focus-visible:shadow-none dark:bg-[#242B51] dark:shadow-signUp md:w-[400px]"
          />
        </div>
        {isLoading ? (
          <div className="mx-auto mt-16 w-fit">
            <svg
              aria-hidden="true"
              className="my-auto ml-2 h-10 w-10 animate-spin fill-primary text-[#242B51]"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        ) : (
          <div>
            <div className="mb-4 mt-2 flex gap-4">
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
            <div className="mb-3 mt-5 font-semibold">Community choices</div>
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
          </div>
        )}
        {apps?.length === 0 && queryInput?.length > 0 && !isLoading && (
          <NoWorkspaces />
        )}
      </div>
    </section>
  )
}

export default Dashboard
