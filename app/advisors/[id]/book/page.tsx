// app/advisors/[id]/book/page.tsx
// Book Consultation - Customer Self-Service Flow

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  CalendarDaysIcon,
  CpuChipIcon,
  PhoneIcon,
} from "@/components/atoms/icons";
import { ClockIcon } from "@heroicons/react/24/outline";
import { OMButton } from "@/components/atoms/brand";

// Generate available time slots for the next 7 days
function generateAvailableSlots() {
  const slots: Array<{
    id: string;
    date: string;
    time: string;
    type: string;
    available: boolean;
  }> = [];

  const today = new Date();
  const timeSlots = ["09:00", "10:30", "11:00", "14:00", "15:30", "16:00"];
  const types = ["In-Person", "Video Call", "Phone Call"];

  for (let day = 0; day < 7; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day);
    const dateStr = date.toISOString().split("T")[0];

    types.forEach((type) => {
      timeSlots.forEach((time) => {
        // Randomly make some slots unavailable (20% chance)
        const available = Math.random() > 0.2;
        slots.push({
          id: `SLOT-${dateStr}-${time}-${type.replace(/\s+/g, "-")}`,
          date: dateStr,
          time,
          type,
          available,
        });
      });
    });
  }

  return slots;
}

const consultationTypes = [
  {
    id: "in-person",
    name: "In-Person",
    icon: CalendarDaysIcon,
    description: "Meet at advisor's office",
  },
  {
    id: "video",
    name: "Video Call",
    icon: CpuChipIcon,
    description: "Video conference via Zoom",
  },
  {
    id: "phone",
    name: "Phone Call",
    icon: PhoneIcon,
    description: "Telephone consultation",
  },
];

export default function BookConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const advisorId = params.id as string;
  const [selectedType, setSelectedType] = useState<string>("in-person");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [customerPersona, setCustomerPersona] = useState<any>(null);
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState(
    generateAvailableSlots(),
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch advisor data and customer information
  useEffect(() => {
    if (!advisorId) return;

    setLoading(true);

    // Fetch advisor data
    fetch(`/api/advisors/${advisorId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch advisor");
        }
        return response.json();
      })
      .then((advisor) => {
        setAdvisorData({
          id: advisor.id || advisorId,
          name: advisor.name || "Advisor",
          specialization: advisor.specialization || "Financial Advisor",
          region: advisor.region || "Namibia",
        });
      })
      .catch((err) => {
        console.error("Error fetching advisor:", err);
        // Fallback to basic data
        setAdvisorData({
          id: advisorId,
          name: "Advisor",
          specialization: "Financial Advisor",
          region: "Namibia",
        });
      })
      .finally(() => setLoading(false));

    // Auto-populate customer information from selected persona
    if (typeof window !== "undefined") {
      const selectedCustomerId = sessionStorage.getItem(
        "selectedCustomerPersona",
      );
      if (selectedCustomerId) {
        // Fetch customer from API
        fetch(`/api/customers?number=${selectedCustomerId}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch customer");
            }
            return response.json();
          })
          .then((persona) => {
            if (persona && persona.type === "customer") {
              setCustomerPersona(persona);
              // Auto-populate contact details
              setContactDetails({
                name: persona.name || "",
                email: persona.email || "",
                phone: persona.phone || "",
                notes: "",
              });
            }
          })
          .catch((err) => {
            console.error("Error fetching customer:", err);
            // Fallback to sessionStorage data if API fails
            const storedData = sessionStorage.getItem("customerPersonaData");
            if (storedData) {
              try {
                const persona = JSON.parse(storedData);
                setCustomerPersona(persona);
                setContactDetails({
                  name: persona.name || "",
                  email: persona.email || "",
                  phone: persona.phone || "",
                  notes: "",
                });
              } catch (parseErr) {
                console.error("Error parsing stored customer data:", parseErr);
              }
            }
          });
      }
    }
  }, [advisorId]);

  const handleSubmit = async () => {
    if (
      !selectedSlot ||
      !contactDetails.name ||
      !contactDetails.email ||
      !contactDetails.phone
    ) {
      return;
    }

    setSubmitting(true);

    try {
      // Get selected slot details
      const slot = availableSlots.find((s) => s.id === selectedSlot);

      // In production, submit booking to API
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store booking confirmation
      const bookingData = {
        advisorId: advisorData?.id || advisorId,
        advisorName: advisorData?.name || "Advisor",
        slot: slot,
        contactDetails,
        timestamp: new Date().toISOString(),
      };

      sessionStorage.setItem("lastBooking", JSON.stringify(bookingData));

      // Redirect to advisor profile with success message
      router.push(`/advisors/${advisorId}?booked=true`);
    } catch (error) {
      console.error("Error submitting booking:", error);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = consultationTypes.find((t) => t.id === type);
    return typeData?.icon || CalendarDaysIcon;
  };

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Book Consultation"
        heroSubtitle="Loading..."
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Advisors", href: "/advisors" },
          { label: "Book", href: `/advisors/${advisorId}/book` },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle="Book Consultation"
      heroSubtitle={`Schedule a consultation with ${advisorData?.name || "Advisor"}`}
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Advisors", href: "/advisors" },
        {
          label: advisorData?.name || "Advisor",
          href: `/advisors/${advisorId}`,
        },
        { label: "Book", href: `/advisors/${advisorId}/book` },
      ]}
    >
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Consultation Type Selection */}
            <div className="card-om p-8 mb-8">
              <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                Consultation Type
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {consultationTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`card-om p-6 text-left transition-all ${
                        selectedType === type.id
                          ? "ring-2 ring-om-heritage-green bg-om-heritage-green/5"
                          : "hover:shadow-md"
                      }`}
                    >
                      <Icon className="w-8 h-8 text-om-heritage-green mb-3" />
                      <h3 className="font-bold text-om-navy mb-2 text-om-heading">
                        {type.name}
                      </h3>
                      <p className="text-sm text-om-grey text-om-body">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="card-om p-8 mb-8">
              <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                Available Time Slots
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {availableSlots
                  .filter((slot) => {
                    // Map selectedType to slot type
                    const typeMap: Record<string, string> = {
                      "in-person": "In-Person",
                      video: "Video Call",
                      phone: "Phone Call",
                    };
                    return slot.type === typeMap[selectedType];
                  })
                  .map((slot) => {
                    const Icon = getTypeIcon(selectedType);
                    return (
                      <button
                        key={slot.id}
                        onClick={() =>
                          slot.available && setSelectedSlot(slot.id)
                        }
                        disabled={!slot.available}
                        className={`card-om p-4 text-left transition-all ${
                          selectedSlot === slot.id
                            ? "ring-2 ring-om-heritage-green bg-om-heritage-green/5"
                            : slot.available
                              ? "hover:shadow-md"
                              : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="w-6 h-6 text-om-heritage-green" />
                            <div>
                              <div className="font-semibold text-om-navy text-om-body">
                                {new Date(slot.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </div>
                              <div className="text-sm text-om-grey text-om-body">
                                <ClockIcon className="w-4 h-4 inline mr-1" />
                                {slot.time}
                              </div>
                            </div>
                          </div>
                          {!slot.available && (
                            <div className="badge badge-om-inactive">
                              Unavailable
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Contact Details */}
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-om p-8 mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-om-navy text-om-heading">
                    Your Contact Details
                  </h2>
                  {customerPersona && (
                    <div className="badge badge-om-active">
                      Auto-filled from {customerPersona.name}'s profile
                    </div>
                  )}
                </div>
                {customerPersona && (
                  <div className="alert alert-info mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="stroke-current shrink-0 w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span>
                      Your information has been automatically populated from
                      your profile. Feel free to update any fields if needed.
                    </span>
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full input-om"
                      placeholder="Enter your full name"
                      value={contactDetails.name}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      className="input input-bordered w-full input-om"
                      placeholder="your.email@example.com"
                      value={contactDetails.email}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Phone Number
                      </span>
                    </label>
                    <input
                      type="tel"
                      className="input input-bordered w-full input-om"
                      placeholder="+264 81 123 4567"
                      value={contactDetails.phone}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Additional Notes (Optional)
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full input-om"
                      rows={4}
                      placeholder="Any specific topics you'd like to discuss?"
                      value={contactDetails.notes}
                      onChange={(e) =>
                        setContactDetails({
                          ...contactDetails,
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Link href={`/advisors/${advisorId}`}>
                <OMButton variant="outline">Cancel</OMButton>
              </Link>
              <OMButton
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  !selectedSlot ||
                  !contactDetails.name ||
                  !contactDetails.email ||
                  !contactDetails.phone ||
                  submitting
                }
              >
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Submitting...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </OMButton>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
