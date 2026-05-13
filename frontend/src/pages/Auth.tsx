import { createClient } from '../lib/supabase/client'

const supabase = createClient()

export default function Auth() {
  async function login(provider: 'github' | 'google') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // After OAuth the user lands here; AuthCallback picks up the session
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      alert('Error while signing in')
      console.error(error)
    }
  }

  return (
    <div>
      <button className='bg-blue-300 border-2 rounded-2xl p-1' onClick={() => login('google')}>
        Login with Google
      </button>

      <button className='bg-amber-300 border-2 rounded-2xl p-1' onClick={() => login('github')}>
        Login with GitHub
      </button>
    </div>
  )
}