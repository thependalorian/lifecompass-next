// app/advisors/[id]/page.tsx
// Advisor Profile - Customer Self-Service Flow

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { StarIcon, CheckCircleIcon } from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

// Mock advisor data - in production, fetch from API using [id]
// Note: [id] parameter should be advisor_number (e.g., "ADV-001")
const advisorData = {
  id: "ADV-003", // Default to Thomas Shikongo - will be fetched from API using advisorId param
  name: "Thomas Shikongo",
  specialization: "Informal Sector Specialist",
  region: "Windhoek",
  experience: "12 years",
  languages: ["English", "Afrikaans", "Oshiwambo"],
  rating: 4.9,
  clients: 150,
  specialties: ["Funeral Insurance", "Business Insurance", "Savings Products"],
  availability: "Available now",
  avatar: "/avatars/thomas_shikongo.png",
  bio: "With over 12 years of experience in the financial services industry, Thomas specializes in helping informal sector workers and small business owners find the right insurance and savings solutions. He understands the unique challenges faced by Namibian entrepreneurs and provides personalized advice tailored to each client's situation.",
  education: [
    "Bachelor of Commerce in Financial Planning",
    "Certified Financial Planner (CFP)",
    "Life Insurance License",
  ],
  achievements: [
    "Top Performer 2023",
    "Client Satisfaction Award 2022",
    "150+ Active Clients",
  ],
  reviews: [
    {
      id: "REV001",
      client: "Maria S.",
      rating: 5,
      comment:
        "Thomas helped me understand my insurance options and found the perfect funeral cover for my family. Very patient and professional!",
      date: "2024-09-15",
    },
    {
      id: "REV002",
      client: "John K.",
      rating: 5,
      comment:
        "Excellent service. Thomas explained everything clearly and made sure I got the best coverage for my business. Highly recommend!",
      date: "2024-08-20",
    },
  ],
};

export default function AdvisorProfilePage() {
  const params = useParams();
  const advisorId = params.id as string;

  return (
    <CorporateLayout
      heroTitle={advisorData.name}
      heroSubtitle={advisorData.specialization}
      pageType="customer"
    >
      {/* Profile Overview */}
      <section className="py-8 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-om p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-om-heritage-green/20">
                    <img
                      src={advisorData.avatar}
                      alt={advisorData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <div
                      className={`badge ${
                        advisorData.availability.includes("now")
                          ? "badge-om-active"
                          : "badge-om-pending"
                      }`}
                    >
                      {advisorData.availability}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-3xl font-bold text-om-navy text-om-heading">
                      {advisorData.name}
                    </h2>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-om-naartjie fill-current" />
                      <span className="font-semibold text-om-navy text-om-body">
                        {advisorData.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-lg text-om-heritage-green font-semibold mb-4">
                    {advisorData.specialization}
                  </p>
                  <p className="text-om-body mb-6">{advisorData.bio}</p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-sm text-om-grey">Experience</div>
                      <div className="font-semibold text-om-navy text-om-body">
                        {advisorData.experience}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey">Active Clients</div>
                      <div className="font-semibold text-om-navy text-om-body">
                        {advisorData.clients}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey">Region</div>
                      <div className="font-semibold text-om-navy text-om-body">
                        {advisorData.region}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey">Languages</div>
                      <div className="font-semibold text-om-navy text-om-body">
                        {advisorData.languages.join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href={`/advisors/${advisorId}/book`} className="flex-1">
                      <OMButton variant="primary" className="w-full">
                        Book Consultation
                      </OMButton>
                    </Link>
                    <Link href="/chat">
                      <OMButton variant="outline">Chat with AI</OMButton>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
              Specialties
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {advisorData.specialties.map((specialty, idx) => (
                <div key={idx} className="card-om p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-om-heritage-green flex-shrink-0" />
                    <span className="font-semibold text-om-navy text-om-body">{specialty}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education & Achievements */}
      <section className="py-8 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Education & Qualifications
                </h2>
                <div className="card-om p-6">
                  <ul className="space-y-3">
                    {advisorData.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-om-body">
                        <CheckCircleIcon className="w-5 h-5 text-om-heritage-green flex-shrink-0 mt-0.5" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Achievements
                </h2>
                <div className="card-om p-6">
                  <ul className="space-y-3">
                    {advisorData.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-om-body">
                        <StarIcon className="w-5 h-5 text-om-naartjie fill-current flex-shrink-0 mt-0.5" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
              Client Reviews
            </h2>
            <div className="space-y-4">
              {advisorData.reviews.map((review) => (
                <div key={review.id} className="card-om p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="font-semibold text-om-navy text-om-body">{review.client}</div>
                      <div className="text-sm text-om-grey text-om-body">{review.date}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-om-naartjie fill-current"
                              : "text-om-grey-15"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-om-body">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

