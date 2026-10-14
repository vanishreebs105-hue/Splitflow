import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F8F5]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}