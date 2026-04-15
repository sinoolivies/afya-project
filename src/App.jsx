export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text p-6">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-primary">
          MediAssist Test
        </h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
          Button  
        </button>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white">
          1
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300">
          2
        </div>
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300">
          3
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="w-12 h-12 bg-primary-light rounded-lg mb-4"></div>
          <h3 className="font-semibold">Hospital A</h3>
          <p className="text-sm text-gray-500">Test card</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="w-12 h-12 bg-primary-light rounded-lg mb-4"></div>
          <h3 className="font-semibold">Hospital B</h3>
          <p className="text-sm text-gray-500">Test card</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
          <div className="w-12 h-12 bg-primary-light rounded-lg mb-4"></div>
          <h3 className="font-semibold">Hospital C</h3>
          <p className="text-sm text-gray-500">Test card</p>
        </div>

      </div>

    </div>
  );
}