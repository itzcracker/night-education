'use client'

import { FormEvent, useState } from 'react'

export default function SignUpPage() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(nickname.trim() && password.length >= 8 ? 'Registration is ready for the connected account service.' : 'Enter a nickname and a password of at least 8 characters.')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060911] px-5 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1522] p-7 shadow-2xl">
        <a href="/" className="text-sm text-[#bba9ff]">← Back to Nightfall</a>
        <h1 className="mt-8 text-3xl font-semibold">Sign Up</h1>
        <p className="mt-2 text-sm text-[#9aa4b8]">Create your account with a unique nickname and password.</p>
        <label className="mt-7 block text-sm text-[#cbd1df]">Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-[#bba9ff]" autoComplete="username" required /></label>
        <label className="mt-4 block text-sm text-[#cbd1df]">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-[#bba9ff]" autoComplete="new-password" minLength={8} required /></label>
        <button type="submit" className="mt-6 w-full rounded-xl bg-[#bba9ff] px-4 py-3 font-medium text-[#161126]">Sign Up</button>
        {message && <p role="status" className="mt-4 text-sm text-[#b8ffde]">{message}</p>}
      </form>
    </main>
  )
}
