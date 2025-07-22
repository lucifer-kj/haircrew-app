import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from './input'
import { Button } from './button'
import { Search } from 'lucide-react'

interface SearchBarProps {
  initialQuery?: string
  placeholder?: string
  className?: string
}

export default function SearchBar({ initialQuery = '', placeholder = 'Search products...', className = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <Input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all shadow-sm outline-none bg-white text-base"
      />
      <Button type="submit" className="bg-secondary text-white rounded-full px-4 py-2 font-semibold shadow-md hover:bg-secondary/90 transition">
        <Search className="w-5 h-5" />
      </Button>
    </form>
  )
} 