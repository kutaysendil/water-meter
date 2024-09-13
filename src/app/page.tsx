import WaterMeterReader from "../components/WaterMeterReader";

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      <main className="min-h-screen py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Su Sayacı Okuyucu
        </h1>
        <WaterMeterReader />
      </main>

      <footer className="text-center py-8">
        <a
          href="https://vercel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          Powered by Vercel
        </a>
      </footer>
    </div>
  );
}
