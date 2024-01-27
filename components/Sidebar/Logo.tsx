export const Logo = ({ name, workspaceUrl, tamanho }) => {
  if (!name || name.length === 0) return null
  const firstLetter = name.charAt(0).toUpperCase()

  // Função para gerar um número baseado no nome
  const stringToColor = (str) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Definindo o range de cores (por exemplo, para tons pastel)
    const saturation = 60 // Saturação (0 a 100)
    const lightness = 85 // Luminosidade (0 a 100)

    const hue = hash % 360 // Matiz (0 a 360)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  // Gerar cor a partir do nome
  const backgroundColor = stringToColor(name)

  if (workspaceUrl) {
    return (
      <img
        alt="ethereum avatar"
        src={workspaceUrl}
        className={`w-${tamanho} rounded-full`}
      ></img>
    )
  }
  return (
    <div
      className={`flex h-${tamanho} w-${tamanho} items-center justify-center rounded-full font-normal text-black`}
      style={{ backgroundColor }}
    >
      {firstLetter}
    </div>
  )
}
