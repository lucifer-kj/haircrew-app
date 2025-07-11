"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  // Placeholder: implement real search logic as needed
  return (
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6 text-center">Search</h1>
      <form className="flex items-center gap-2 mb-6" onSubmit={e => { e.preventDefault(); /* search logic */ }}>
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:border-secondary focus:ring-2 focus:ring-secondary/30 transition-all shadow-sm outline-none bg-white text-base"
        />
        <Button type="submit" className="bg-secondary text-white rounded-full px-4 py-3 font-semibold shadow-md hover:bg-secondary/90 transition">
          <Search className="w-5 h-5" />
        </Button>
      </form>
      {/* Placeholder for recent searches or results */}
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <Search className="w-16 h-16 mb-4" />
        <p className="text-center">Start typing to search for products.</p>
      </div>
    </div>
  );
} 