"use client"

import { useState } from "react"
import { ArrowLeft, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Link from "next/link"

export default function OptionalInputPage() {
  const [preferences, setPreferences] = useState({
    newsletter: false,
    notifications: false,
    marketing: false,
    priority: "medium",
    budget: "",
    timeline: "",
    additionalNotes: "",
  })

  const handleSwitchChange = (field: string, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field: string, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Optional Details</h1>
          <p className="text-slate-300 text-lg">These fields are optional but help us provide better results</p>
        </div>

        {/* Form Container */}
        <div className="max-w-3xl mx-auto">
          <div className="backdrop-blur-xl bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <form className="space-y-8">
              {/* Communication Preferences */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Communication Preferences</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                    <div className="space-y-1">
                      <Label className="text-slate-200 font-medium">Newsletter Subscription</Label>
                      <p className="text-sm text-slate-400">Receive our weekly newsletter with updates and tips</p>
                    </div>
                    <Switch
                      checked={preferences.newsletter}
                      onCheckedChange={(value) => handleSwitchChange("newsletter", value)}
                      className="data-[state=checked]:bg-violet-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                    <div className="space-y-1">
                      <Label className="text-slate-200 font-medium">Push Notifications</Label>
                      <p className="text-sm text-slate-400">Get notified about important updates</p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(value) => handleSwitchChange("notifications", value)}
                      className="data-[state=checked]:bg-violet-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
                    <div className="space-y-1">
                      <Label className="text-slate-200 font-medium">Marketing Communications</Label>
                      <p className="text-sm text-slate-400">Receive promotional offers and product updates</p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(value) => handleSwitchChange("marketing", value)}
                      className="data-[state=checked]:bg-violet-500"
                    />
                  </div>
                </div>
              </div>

              {/* Project Priority */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">Project Priority</h3>
                <RadioGroup
                  value={preferences.priority}
                  onValueChange={(value) => handleInputChange("priority", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <RadioGroupItem value="low" id="low" className="border-slate-500 text-violet-500" />
                    <Label htmlFor="low" className="text-slate-200 font-medium">
                      Low Priority
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <RadioGroupItem value="medium" id="medium" className="border-slate-500 text-violet-500" />
                    <Label htmlFor="medium" className="text-slate-200 font-medium">
                      Medium Priority
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                    <RadioGroupItem value="high" id="high" className="border-slate-500 text-violet-500" />
                    <Label htmlFor="high" className="text-slate-200 font-medium">
                      High Priority
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Budget & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-slate-200">
                    Budget Range
                  </Label>
                  <Input
                    id="budget"
                    value={preferences.budget}
                    onChange={(e) => handleInputChange("budget", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="e.g., $5,000 - $10,000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-slate-200">
                    Project Timeline
                  </Label>
                  <Input
                    id="timeline"
                    value={preferences.timeline}
                    onChange={(e) => handleInputChange("timeline", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200"
                    placeholder="e.g., 2-3 months"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="additionalNotes" className="text-slate-200">
                  Additional Notes
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={preferences.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-violet-400 focus:ring-violet-400/20 transition-all duration-200 min-h-[120px]"
                  placeholder="Any additional information or special requirements..."
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link href="/form" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-slate-500 transition-all duration-200"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                  </Button>
                </Link>
                <Link href="/result" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/25">
                    <Mail size={18} className="mr-2" />
                    Generate Email
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
