import { useQuery } from '@tanstack/react-query'

function App() {
  const { data, isLoading } = useQuery({
    queryKey: ['hello'],
    queryFn: () => Promise.resolve('Hello TanStack!'),
  })

  return (
    <div>
      <h1>SparkJoin</h1>
      {isLoading ? <p>Loading...</p> : <p>{data}</p>}
    </div>
  )
}

export default App
