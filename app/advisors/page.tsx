// app/advisors/page.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { StarIcon } from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

// Hardcoded advisors - fallback if API fails (matches database: 5 advisors)
// Note: This is a fallback only - the page fetches from /api/advisors which returns 5 advisors
const defaultAdvisors = [
  {
    id: "ADV-001",
    name: "Petrus van der Merwe",
    specialization: "Life Insurance Specialist",
    region: "Windhoek",
    experience: "15 years",
    languages: ["English", "Afrikaans"],
    rating: 4.6,
    clients: 120,
    specialties: ["Life Insurance", "Term Life", "Whole Life"],
    availability: "Available now",
    avatar: "/avatars/petrus_van_der_merwe.png",
  },
  {
    id: "ADV-002",
    name: "Andreas Fischer",
    specialization: "Investment Advisor",
    region: "Windhoek",
    experience: "12 years",
    languages: ["English", "German", "Afrikaans"],
    rating: 4.5,
    clients: 95,
    specialties: ["Unit Trusts", "Retirement Annuities", "Investment Planning"],
    availability: "Available today",
    avatar: "/avatars/andreas_fischer.png",
  },
  {
    id: "ADV-003",
    name: "Thomas Shikongo",
    specialization: "Informal Sector Specialist",
    region: "Windhoek",
    experience: "10 years",
    languages: ["English", "Oshiwambo", "Afrikaans"],
    rating: 4.7,
    clients: 130,
    specialties: ["Funeral Insurance", "Micro Insurance", "Savings Products"],
    availability: "Available now",
    avatar: "/avatars/thomas_shikongo.png",
  },
  {
    id: "ADV-004",
    name: "Esther Mwandingi",
    specialization: "Personal Financial Planning",
    region: "Windhoek",
    experience: "18 years",
    languages: ["English", "Oshiwambo"],
    rating: 4.7,
    clients: 85,
    specialties: ["Financial Planning", "Retirement Planning", "Estate Planning"],
    availability: "Available today",
    avatar: "/avatars/esther_mwandingi.png",
  },
  {
    id: "ADV-005",
    name: "Francois Coetzee",
    specialization: "Business Solutions",
    region: "Windhoek",
    experience: "10 years",
    languages: ["English", "Afrikaans"],
    rating: 4.5,
    clients: 110,
    specialties: ["Business Insurance", "Group Benefits", "Corporate Packages"],
    availability: "Available now",
    avatar: "/avatars/francois_coetzee.jpg",
  },
];

const specializations = [
  "All Specializations",
  "Investment & Retirement",
  "Informal Sector",
  "Agricultural & Rural",
  "Family & Education",
];

const regions = ["All Regions", "Windhoek", "Oshakati", "Tsumeb", "Swakopmund"];

export default function AdvisorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    "All Specializations",
  );
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch advisors from API
  useEffect(() => {
    const fetchAdvisors = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/advisors");
        if (!response.ok) throw new Error("Failed to fetch advisors");
        const data = await response.json();

        // Transform API data to match expected format
        const transformedAdvisors = data.map((advisor: any) => ({
          id: advisor.id || advisor.advisorNumber,
          name: advisor.name,
          specialization: advisor.specialization,
          region: advisor.location || advisor.region || "Namibia",
          experience:
            advisor.experience || `${advisor.experienceYears || 0} years`,
          languages: [], // Not in API response, can be added later
          rating: advisor.satisfactionScore
            ? parseFloat((advisor.satisfactionScore / 20).toFixed(1))
            : 4.5, // Convert 0-100 to 0-5 scale
          clients: advisor.clients || 0,
          specialties: advisor.specialization ? [advisor.specialization] : [],
          availability: "Available now", // Can be calculated from schedule
          avatar:
            advisor.avatarUrl ||
            `/avatars/${advisor.name.toLowerCase().replace(/\s+/g, "_")}.png`,
        }));

        setAdvisors(transformedAdvisors);
      } catch (err) {
        console.error("Error fetching advisors:", err);
        setError("Failed to load advisors");
        // Fallback to default advisors if API fails
        setAdvisors(defaultAdvisors);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes("now")) return "text-om-green";
    if (availability.includes("today")) return "text-om-gold";
    return "text-om-grey";
  };

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch =
      advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      advisor.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization =
      selectedSpecialization === "All Specializations" ||
      advisor.specialization === selectedSpecialization;
    const matchesRegion =
      selectedRegion === "All Regions" || advisor.region === selectedRegion;

    return matchesSearch && matchesSpecialization && matchesRegion;
  });

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Find Your Perfect Advisor"
        heroSubtitle="Loading..."
        heroBackground="/id3Zh06DHT_1762296722528.jpeg"
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Advisors", href: "/advisors" },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error && advisors.length === 0) {
    return (
      <CorporateLayout
        heroTitle="Find Your Perfect Advisor"
        heroSubtitle="Error"
        heroBackground="/id3Zh06DHT_1762296722528.jpeg"
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Advisors", href: "/advisors" },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">{error}</div>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle="Find Your Perfect Advisor"
      heroSubtitle="Connect with experienced financial advisors who understand Namibia's unique financial landscape"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Advisors", href: "/advisors" },
      ]}
    >
      {/* Search & Filters */}
      <section className="py-8 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search advisors by name, specialization, or region..."
                className="input input-bordered w-full input-om"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="select select-bordered input-om"
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered input-om"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Advisors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-om-navy">
              {filteredAdvisors.length} Advisors Found
            </h2>
            <div className="text-sm text-om-grey">
              Showing {filteredAdvisors.length} of {advisors.length} advisors
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {filteredAdvisors.map((advisor, idx) => (
              <motion.div
                key={advisor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-om p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="avatar placeholder">
                    <div className="rounded-full w-16 h-16 overflow-hidden ring-2 ring-om-heritage-green/20 aspect-square">
                      <img
                        src={advisor.avatar}
                        alt={advisor.name}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-om-navy">
                          {advisor.name}
                        </h3>
                        <p className="text-om-green font-semibold">
                          {advisor.specialization}
                        </p>
                      </div>
                      <div
                        className={`badge ${getAvailabilityColor(advisor.availability)}`}
                      >
                        {advisor.availability}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-om-grey">Region:</span>
                        <div className="font-semibold text-om-navy">
                          {advisor.region}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Experience:</span>
                        <div className="font-semibold text-om-navy">
                          {advisor.experience}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Rating:</span>
                        <div className="font-semibold text-om-navy flex items-center">
                          <StarIcon className="w-4 h-4 text-om-naartjie mr-1" />
                          {advisor.rating} ({advisor.clients} clients)
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Languages:</span>
                        <div className="font-semibold text-om-navy">
                          {advisor.languages.join(", ")}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-om-navy mb-2">
                        Specialties:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {advisor.specialties.map(
                          (specialty: string, specialtyIdx: number) => (
                            <span
                              key={specialtyIdx}
                              className="badge badge-outline badge-sm"
                            >
                              {specialty}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/advisors/${advisor.id}/book`}
                        className="btn-om-primary btn-sm flex-1"
                      >
                        Book Consultation
                      </Link>
                      <Link
                        href={`/advisors/${advisor.id}`}
                        className="btn-om-outline btn-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredAdvisors.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 text-om-grey font-bold">
                NO ADVISORS FOUND
              </div>
              <h3 className="text-xl font-bold text-om-navy mb-2">
                No Advisors Found
              </h3>
              <p className="text-om-grey mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <button
                className="btn-om-primary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSpecialization("All Specializations");
                  setSelectedRegion("All Regions");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-om-navy mb-6">
              Not Sure Which Advisor is Right for You?
            </h2>
            <p className="text-xl text-om-grey mb-8">
              Our AI assistant can help match you with the perfect advisor based
              on your needs and preferences.
            </p>
            <Link href="/chat">
              <OMButton variant="primary" size="lg">
                Get AI Matching Assistance
              </OMButton>
            </Link>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
