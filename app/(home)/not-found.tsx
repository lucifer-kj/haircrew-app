import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-5xl font-bold text-secondary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="text-gray-600 mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="bg-secondary text-white px-6 py-2 rounded font-bold hover:bg-secondary/90 transition">Go to Home</Link>
    </div>
  )
} 