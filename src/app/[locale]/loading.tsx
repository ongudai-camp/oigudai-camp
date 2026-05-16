export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8 md:gap-12 animate-pulse">
          {/* Header */}
          <div className="space-y-4">
            <div className="h-10 w-64 bg-sky-100 rounded-2xl" />
            <div className="h-5 w-48 bg-sky-50 rounded-xl" />
          </div>

          {/* Filter skeleton */}
          <div className="bg-white/80 rounded-[2rem] border border-white/50 p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-sky-100 rounded-lg" />
                  <div className="h-12 bg-sky-50 rounded-xl" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-sky-50 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Cards grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2.5rem] overflow-hidden border border-sky-50">
                <div className="h-64 md:h-72 bg-sky-100" />
                <div className="p-8 md:p-10 space-y-5">
                  <div className="h-8 w-3/4 bg-sky-100 rounded-xl" />
                  <div className="h-4 w-1/2 bg-sky-50 rounded-lg" />
                  <div className="pt-6 border-t border-sky-50">
                    <div className="h-4 w-24 bg-sky-100 rounded-lg mb-2" />
                    <div className="h-8 w-32 bg-sky-100 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
