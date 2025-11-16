export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            6 7
          </h1>
          <h2 className="text-2xl font-semibold mb-2 text-zinc-300">
            Backend API
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Talk the Alpha, Walk the Alpha • Transform your messages into Gen Alpha slang
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-8 mb-8 border border-zinc-700">
            <h3 className="text-xl font-semibold mb-4 text-orange-400">🚀 API Status</h3>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-zinc-300">All systems operational</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-3 text-orange-400">🔐 Authentication</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Secure JWT-based authentication for user management and API access.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method:</span>
                  <span className="text-zinc-300">JWT Bearer Token</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Provider:</span>
                  <span className="text-zinc-300">Google OAuth</span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
              <h3 className="text-lg font-semibold mb-3 text-orange-400">💳 Subscriptions</h3>
              <p className="text-zinc-400 text-sm mb-4">
                Stripe-powered subscription management with multiple tiers.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Provider:</span>
                  <span className="text-zinc-300">Stripe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Plans:</span>
                  <span className="text-zinc-300">Monthly & Yearly</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4 text-orange-400">📋 API Endpoints</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <div>
                  <span className="text-zinc-300 font-medium">GET</span>
                  <span className="text-zinc-400 ml-2">/api/user/me</span>
                </div>
                <span className="text-xs text-zinc-500">Get user profile</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <div>
                  <span className="text-orange-400 font-medium">PATCH</span>
                  <span className="text-zinc-400 ml-2">/api/user/me</span>
                </div>
                <span className="text-xs text-zinc-500">Update user profile</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <div>
                  <span className="text-red-400 font-medium">DELETE</span>
                  <span className="text-zinc-400 ml-2">/api/user/me</span>
                </div>
                <span className="text-xs text-zinc-500">Delete user account</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <div>
                  <span className="text-green-400 font-medium">POST</span>
                  <span className="text-zinc-400 ml-2">/api/auth/google</span>
                </div>
                <span className="text-xs text-zinc-500">Google OAuth login</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="text-blue-400 font-medium">POST</span>
                  <span className="text-zinc-400 ml-2">/api/stripe/webhook</span>
                </div>
                <span className="text-xs text-zinc-500">Stripe webhook handler</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col gap-4 items-center">
              <a
                href="/api/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                📚 View API Documentation
              </a>
              <p className="text-zinc-500 text-sm">
                © 2025 Six Seven • Built with Next.js, Prisma & PostgreSQL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
