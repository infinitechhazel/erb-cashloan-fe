"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Phone, Loader2, MapPin } from "lucide-react"
import { Button } from "../ui/button"
import { toast } from "sonner"

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  profileImageUrl: string
  address?: string
}

interface PersonalInformationProps {
  profileData: ProfileData
  onUpdate: (data: ProfileData) => void
  onError: (error: string) => void
  onSuccess: (message: string) => void
}

export default function PersonalInformation({ profileData, onUpdate, onError, onSuccess }: PersonalInformationProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [tempProfileData, setTempProfileData] = useState<ProfileData>(profileData)

  // Update tempProfileData when profileData changes
  useEffect(() => {
    setTempProfileData(profileData)
  }, [profileData])

  const handleSaveProfile = async () => {
    if (!tempProfileData.firstName.trim() || !tempProfileData.lastName.trim()) {
      toast.error("First name and last name are required")
      return
    }

    // Prevent duplicate saves
    if (isSaving) return

    try {
      setIsSaving(true)

      const formData = new FormData()
      formData.append("first_name", tempProfileData.firstName)
      formData.append("last_name", tempProfileData.lastName)
      formData.append("address", tempProfileData.address || "")
      formData.append("_method", "PUT")

      // Update profile
      const profileResponse = await fetch("/api/settings/update-profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      })

      if (!profileResponse.ok) {
        const error = await profileResponse.json()
        throw new Error(error.message || "Failed to update profile")
      }

      // Update contact info if changed
      if (
        tempProfileData.email !== profileData.email ||
        tempProfileData.phone !== profileData.phone ||
        tempProfileData.address !== profileData.address
      ) {
        if (!tempProfileData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          throw new Error("Please enter a valid email address")
        }

        if (!tempProfileData.phone.match(/^[0-9]{11}$/)) {
          throw new Error("Phone number must be exactly 11 digits")
        }

        const contactResponse = await fetch("/api/settings/update-contact", {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: tempProfileData.firstName,
            last_name: tempProfileData.lastName,
            email: tempProfileData.email,
            phone: tempProfileData.phone,
            address: tempProfileData.address,
          }),
        })

        if (!contactResponse.ok) {
          const error = await contactResponse.json()
          throw new Error(error.message || "Failed to update contact info")
        }
      }

      onUpdate({ ...tempProfileData, profileImageUrl: profileData.profileImageUrl })

      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save when user stops typing (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        (tempProfileData.firstName !== profileData.firstName ||
          tempProfileData.lastName !== profileData.lastName ||
          tempProfileData.email !== profileData.email ||
          tempProfileData.phone !== profileData.phone ||
          tempProfileData.address !== profileData.address) &&
        tempProfileData.firstName.trim() &&
        tempProfileData.lastName.trim()
      ) {
        handleSaveProfile()
      }
    }, 1500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempProfileData])

  return (
    <div className="space-y-6">
      {/* Auto-save indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Changes are saved automatically</p>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              First Name
            </Label>
            <Input
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.firstName}
              onChange={(e) => setTempProfileData({ ...tempProfileData, firstName: e.target.value })}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Last Name
            </Label>
            <Input
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.lastName}
              onChange={(e) => setTempProfileData({ ...tempProfileData, lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              Email Address
            </Label>
            <Input
              type="email"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.email}
              onChange={(e) => setTempProfileData({ ...tempProfileData, email: e.target.value })}
              disabled
              readOnly
              placeholder="john.doe@example.com"
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-500" />
              Phone Number
            </Label>
            <Input
              type="tel"
              className="border-slate-300 focus:border-primary focus:ring-primary bg-white h-11"
              value={tempProfileData.phone}
              onChange={(e) => setTempProfileData({ ...tempProfileData, phone: e.target.value.replace(/\D/g, "") })}
              placeholder="09123456789"
              maxLength={11}
            />
            <p className="text-xs text-slate-500">11-digit mobile number</p>
          </div>
        </div>

        {/* Address Field */}
        <div className="grid md:grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              Address
            </Label>
            <textarea
              name="address"
              id="address"
              className="w-full border-2 border-slate-300 focus:border-primary focus:ring-primary bg-white h-24 w-full p-2 rounded-md"
              value={tempProfileData.address}
              onChange={(e) => setTempProfileData({ ...tempProfileData, address: e.target.value })}
              placeholder="Enter your full address"
            />
          </div>
        </div>

        <Button onClick={handleSaveProfile} disabled={isSaving} className="w-fit">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  )
}
