import Calendar from './components/Calendar';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            心情日曆
          </h1>
          <p className="text-gray-600 text-lg">
            記錄每一天的心情，了解自己的情緒變化
          </p>
        </header>
        <Calendar />
      </div>
    </div>
  );
}

export default App;
