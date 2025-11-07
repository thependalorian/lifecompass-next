// app/advisors/[id]/page.tsx
// Advisor Profile - Customer Self-Service Flow

"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { StarIcon, CheckCircleIcon } from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

export default function AdvisorProfilePage() {
  const params = useParams();
  const advisorId = params.id as string;
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch advisor data from API
  useEffect(() => {
    if (!advisorId) return;

    setLoading(true);
    fetch(`/api/advisors?number=${advisorId}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch advisor");
        return response.json();
      })
      .then((advisor) => {
        // Transform API data to match expected format
        setAdvisorData({
          id: advisor.id || advisor.advisorNumber,
          name: advisor.name,
          specialization: advisor.specialization,
          region: advisor.location || advisor.region || "Namibia",
          experience: advisor.experience || `${advisor.experienceYears || 0} years`,
          languages: [], // Not in API, can be added to database schema later
          rating: advisor.satisfactionScore ? parseFloat((advisor.satisfactionScore / 20).toFixed(1)) : 4.5,
          clients: advisor.clients || 0,
          specialties: advisor.specialization ? [advisor.specialization] : [],
          availability: "Available now", // Can be calculated from schedule
          avatar: advisor.avatarUrl || `/avatars/${advisor.name.toLowerCase().replace(/\s+/g, "_")}.png`,
          bio: advisor.description || `${advisor.specialization} with ${advisor.experienceYears || 0} years of experience serving clients in ${advisor.region || "Namibia"}.`,
          education: [], // Not in database schema, can be added later
          achievements: [], // Not in database schema, can be added later
          reviews: [], // Not in database schema, can be added later
        });
      })
      .catch((err) => {
        console.error("Error fetching advisor:", err);
        setError("Failed to load advisor data");
      })
      .finally(() => setLoading(false));
  }, [advisorId]);

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Advisor Profile"
        heroSubtitle="Loading..."
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Advisors", href: "/advisors" },
          { label: "Profile", href: `/advisors/${advisorId}` },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error || !advisorData) {
    return (
      <CorporateLayout
        heroTitle="Advisor Profile"
        heroSubtitle="Error"
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Advisors", href: "/advisors" },
          { label: "Profile", href: `/advisors/${advisorId}` },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">{error || "Advisor not found"}</div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle={advisorData.name}
      heroSubtitle={advisorData.specialization}
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Advisors", href: "/advisors" },
        { label: advisorData.name, href: `/advisors/${advisorId}` },
      ]}
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
                        {advisorData.languages && advisorData.languages.length > 0 
                          ? advisorData.languages.join(", ")
                          : "English"}
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
              {advisorData.specialties && advisorData.specialties.length > 0 ? (
                advisorData.specialties.map((specialty: string, idx: number) => (
                  <div key={idx} className="card-om p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-6 h-6 text-om-heritage-green flex-shrink-0" />
                      <span className="font-semibold text-om-navy text-om-body">{specialty}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-om p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-om-heritage-green flex-shrink-0" />
                    <span className="font-semibold text-om-navy text-om-body">{advisorData.specialization}</span>
                  </div>
                </div>
              )}
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
                  {advisorData.education && advisorData.education.length > 0 ? (
                    <ul className="space-y-3">
                      {advisorData.education.map((edu: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-om-body">
                          <CheckCircleIcon className="w-5 h-5 text-om-heritage-green flex-shrink-0 mt-0.5" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-om-grey text-om-body">Education information not available</p>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Achievements
                </h2>
                <div className="card-om p-6">
                  {advisorData.achievements && advisorData.achievements.length > 0 ? (
                    <ul className="space-y-3">
                      {advisorData.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3 text-om-body">
                          <StarIcon className="w-5 h-5 text-om-naartjie fill-current flex-shrink-0 mt-0.5" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-om-grey text-om-body">Achievements information not available</p>
                  )}
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
            {advisorData.reviews && advisorData.reviews.length > 0 ? (
              <div className="space-y-4">
                {advisorData.reviews.map((review: any) => (
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
            ) : (
              <div className="card-om p-6">
                <p className="text-om-grey text-om-body text-center">No reviews available yet</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

