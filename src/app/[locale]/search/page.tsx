import AdvancedSearch from "@/components/search/AdvancedSearch";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-black text-gray-900 mb-1">Search</h1>
        <p className="text-sm text-gray-500 mb-6">Find hotels, tours, and activities</p>
        <AdvancedSearch />
      </div>
    </div>
  );
}
