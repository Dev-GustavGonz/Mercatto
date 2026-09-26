import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export const SearchBar = ({ className = '' }) => {
  const [termino, setTermino] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (termino.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(termino.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className={`relative w-full flex ${className}`}>
      <input
        type="text"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        placeholder="Search for anything..."
        className="w-full pl-5 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-l-full text-sm focus:outline-none focus:bg-white text-slate-800 placeholder-slate-400 transition-colors"
      />
      <button 
        type="submit" 
        className="bg-mercatto-accent hover:bg-red-600 text-white px-6 rounded-r-full flex items-center justify-center transition-colors shadow-sm hover:shadow-md hover:shadow-gray-300"
      >
        <Search size={18} />
      </button>
    </form>
  )
}

export default SearchBar
