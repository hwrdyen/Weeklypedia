"use client"

import { useState, useEffect } from "react"
import { Copy, Edit, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ResultPage() {
  const [copied, setCopied] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const emailContent = `Subject: Partnership Proposal - Innovative Solutions for Your Business

Dear [Recipient Name],

I hope this email finds you well. My name is John Doe, and I'm reaching out from TechCorp Solutions, where I serve as Senior Business Development Manager.

After researching your company's recent initiatives in the technology sector, I believe there's a tremendous opportunity for collaboration between our organizations. With over 8 years of experience in the industry, I've had the privilege of helping companies like yours streamline their operations and achieve remarkable growth.

Our team specializes in:
• Custom software development solutions
• Digital transformation consulting  
• Cloud infrastructure optimization
• Data analytics and business intelligence

What sets us apart is our commitment to understanding each client's unique challenges and delivering tailored solutions that drive real results. We've successfully partnered with over 200 companies, helping them increase efficiency by an average of 35% while reducing operational costs.

I would love the opportunity to discuss how we can support your upcoming projects and contribute to your continued success. Would you be available for a brief 15-minute call next week to explore potential synergies?

Thank you for your time and consideration. I look forward to the possibility of working together.

Best regards,

John Doe
Senior Business Development Manager
TechCorp Solutions
john.doe@techcorp.com
(555) 123-4567

P.S. I've attached our latest case study showcasing how we helped a similar company in your industry achieve a 40% increase in productivity. I think you'll find it quite relevant to your current objectives.`

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < emailContent.length) {
        setDisplayedText(emailContent.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 20)

    return () => clearInterval(timer)
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(emailContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Your AI-Generated Email</h1>
          <p className="text-slate-300 text-lg">Here's your personalized email based on the information provided</p>
        </div>

        {/* Email Container */}
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Email Header */}
            <div className="bg-slate-700/50 border-b border-slate-600/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-slate-300 text-sm font-mono">AI Email Generator</div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-8">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600/30 font-mono text-sm leading-relaxed max-h-96 overflow-y-auto custom-scrollbar">
                <pre className="text-slate-200 whitespace-pre-wrap">
                  {displayedText}
                  {isTyping && <span className="animate-pulse bg-violet-400 w-2 h-5 inline-block ml-1"></span>}
                </pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/25"
                  disabled={isTyping}
                >
                  {copied ? (
                    <>
                      <CheckCircle size={18} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} className="mr-2" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>

                <Link href="/form" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-200 py-3"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Again
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-600/50">
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-violet-400">{emailContent.split(" ").length}</div>
                  <div className="text-slate-300 text-sm">Words</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-sky-400">{emailContent.length}</div>
                  <div className="text-slate-300 text-sm">Characters</div>
                </div>
                <div className="text-center p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-2xl font-bold text-amber-400">~2 min</div>
                  <div className="text-slate-300 text-sm">Read Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
