import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2 text-foreground">Page Not Found</h2>
      <p className="text-muted-foreground mb-6">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold shadow-md transition">Go to Home</Link>
    </div>
  )
} 