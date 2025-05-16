import { signInWithMagicLink } from '@/app/login/actions'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <h1 className="text-2xl font-bold">Sign in to your account</h1>
      <form className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border px-3 py-2"
            placeholder="you@example.com"
          />
        </div>
        <button
          formAction={signInWithMagicLink}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Send Magic Link
        </button>
        <p className="text-center text-sm text-gray-500">
          We'll email you a magic link for a password-free sign in.
        </p>
      </form>
    </div>
  )
}