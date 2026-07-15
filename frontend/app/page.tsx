// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Trippier</h1>
      <p className="text-lg text-gray-500">Plan your next adventure.</p>
      <p className="max-w-md text-sm text-gray-400">
        The full web experience is coming in v2. In the meantime, grab the mobile app to explore.
      </p>
    </main>
  );
}
