"use client"

import { useState } from "react"
import { ArrowRight, SkipBackIcon as Skip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export default function FormInputPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    position: "",
    industry: "",
    experience: "",
    description: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Enter Required Information</h1>
          <p className="text-slate-300 text-lg">Please fill in the required details to continue</p>
        </div>

        {/* Form Container */}
        <div className="max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <form className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-200">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-200">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-slate-200">
                    Company *
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="Enter your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-slate-200">
                    Position *
                  </Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="Enter your job title"
                  />
                </div>
              </div>

              {/* Industry & Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-200">Industry *</Label>
                  <Select onValueChange={(value) => handleInputChange("industry", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-violet-400 focus:ring-violet-400/20">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-200">Years of Experience *</Label>
                  <Select onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white focus:border-violet-400 focus:ring-violet-400/20">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="15+">15+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200">
                  Brief Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200 min-h-[120px]"
                  placeholder="Tell us about your project or requirements..."
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/optional" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25">
                    <ArrowRight size={18} className="mr-2" />
                    Next
                  </Button>
                </Link>
                <Link href="/result" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-200"
                  >
                    <Skip size={18} className="mr-2" />
                    Skip to Results
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
