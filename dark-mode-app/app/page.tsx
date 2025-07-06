"use client"

import { useState } from "react"
import { Eye, EyeOff, Facebook, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Login #10</h1>
              <p className="text-slate-300">Have an account?</p>
            </div>

            {/* Form */}
            <form className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-200">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="border-slate-600 data-[state=checked]:bg-violet-500" />
                  <Label htmlFor="remember" className="text-slate-300 text-sm">
                    Remember Me
                  </Label>
                </div>
                <Link href="#" className="text-violet-400 hover:text-violet-300 text-sm transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Link href="/form">
                <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25">
                  SIGN IN
                </Button>
              </Link>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-slate-600"></div>
              <span className="px-4 text-slate-400 text-sm">Or Sign In With</span>
              <div className="flex-1 border-t border-slate-600"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="bg-blue-600/20 border-blue-500/50 text-blue-300 hover:bg-blue-600/30 hover:border-blue-400 transition-all duration-200"
              >
                <Facebook size={18} className="mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="bg-sky-600/20 border-sky-500/50 text-sky-300 hover:bg-sky-600/30 hover:border-sky-400 transition-all duration-200"
              >
                <Twitter size={18} className="mr-2" />
                Twitter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
