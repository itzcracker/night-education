'use client'

import { FormEvent, useState } from 'react'

export default function SignInPage() {
  const [nickname, setNickname] = useState('')
  const [login, setLogin] = useState('')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(nickname.trim() && login.trim() ? 'Sign-in service is being connected.' : 'Enter your nickname and login.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060911] px-5 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1522] p-7 shadow-2xl">
        <a href="/" className="text-sm text-[#bba9ff]">← Back to Nightfall</a>
        <h1 className="mt-8 text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[#9aa4b8]">Use your nickname and login to continue.</p>
        <label className="mt-7 block text-sm text-[#cbd1df]">Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-[#bba9ff]" autoComplete="username" /></label>
        <label className="mt-4 block text-sm text-[#cbd1df]">Login<input value={login} onChange={(event) => setLogin(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-[#bba9ff]" autoComplete="current-password" /></label>
        <button type="submit" className="mt-6 w-full rounded-xl bg-[#bba9ff] px-4 py-3 font-medium text-[#161126]">Sign in</button>
        {message && <p role="status" className="mt-4 text-sm text-[#b8ffde]">{message}</p>}
      </form>
    </main>
  )
}
