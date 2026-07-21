'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from 'use-debounce'

export default function DashboardTableControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialSearch = searchParams.get('search') || ''
  const initialStatus = searchParams.get('status') || 'All'
  
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch] = useDebounce(search, 500)
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value
    const params = new URLSearchParams(searchParams)
    if (status && status !== 'All') {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`?${params.toString()}`)
  }

  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    } else {
      params.delete('search')
    }
    router.push(`?${params.toString()}`)
  }, [debouncedSearch, router])

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={14} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search meetings..."
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-48 md:w-64 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <select 
        className="pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 bg-white cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239CA3AF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.6rem] bg-[position:right_0.75rem_center] bg-no-repeat"
        onChange={handleStatusChange}
        defaultValue={initialStatus}
      >
        <option value="All">Status: All</option>
        <option value="draft">Draft</option>
        <option value="exported">Exported</option>
      </select>
    </div>
  )
}
