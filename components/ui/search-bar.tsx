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
      <div className="relative flex-1">
        <Input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 h-10 rounded-full border border-border/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all shadow-xs bg-card text-sm"
        />
      </div>
      <Button
        type="submit"
        size="icon"
        aria-label="Search"
        className="h-10 w-10 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        <Search className="w-4 h-4" />
      </Button>
    </form>
  )
} 