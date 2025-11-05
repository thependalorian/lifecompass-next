// app/advisors/page.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { StarIcon } from "@/components/atoms/icons";

const advisors = [
  {
    id: "ADV001",
    name: "Thomas Shikongo",
    specialization: "Informal Sector Specialist",
    region: "Windhoek",
    experience: "12 years",
    languages: ["English", "Afrikaans", "Oshiwambo"],
    rating: 4.9,
    clients: 150,
    specialties: [
      "Funeral Insurance",
      "Business Insurance",
      "Savings Products",
    ],
    availability: "Available now",
    avatar: "/avatars/thomas_shikongo.png",
  },
  {
    id: "ADV002",
    name: "Helvi Bezuidenhout",
    specialization: "Investment & Retirement Specialist",
    region: "Windhoek",
    experience: "15 years",
    languages: ["English", "Afrikaans"],
    rating: 4.8,
    clients: 200,
    specialties: ["Unit Trusts", "Retirement Annuities", "Tax Planning"],
    availability: "Available today",
    avatar: "/avatars/helvi_bezuidenhout.png",
  },
  {
    id: "ADV003",
    name: "David Ndjavera",
    specialization: "Agricultural & Rural Specialist",
    region: "Tsumeb",
    experience: "10 years",
    languages: ["English", "Oshiwambo", "Herero"],
    rating: 4.7,
    clients: 95,
    specialties: ["Crop Insurance", "Livestock Insurance", "Rural Savings"],
    availability: "Available tomorrow",
    avatar: "/avatars/david_ndjavera.png",
  },
  {
    id: "ADV004",
    name: "Fatima Isaacks",
    specialization: "Family & Education Specialist",
    region: "Oshakati",
    experience: "8 years",
    languages: ["English", "Oshiwambo", "Portuguese"],
    rating: 4.9,
    clients: 120,
    specialties: ["Education Savings", "Family Insurance", "Life Insurance"],
    availability: "Available now",
    avatar: "/avatars/fatima_isaacks.png",
  },
  {
    id: "ADV005",
    name: "John-Paul !Gaeb",
    specialization: "Maritime & Fisheries Specialist",
    region: "Swakopmund",
    experience: "9 years",
    languages: ["English", "Afrikaans", "Nama"],
    rating: 4.8,
    clients: 110,
    specialties: ["Marine Insurance", "Income Protection", "Savings Plans"],
    availability: "Available now",
    avatar: "/avatars/john_paul_gaeb.png",
  },
  {
    id: "ADV006",
    name: "Maria Shikongo",
    specialization: "Small Business Specialist",
    region: "Windhoek",
    experience: "11 years",
    languages: ["English", "Oshiwambo", "Afrikaans"],
    rating: 4.9,
    clients: 180,
    specialties: ["Business Insurance", "Key Person Insurance", "Group Benefits"],
    availability: "Available today",
    avatar: "/avatars/maria_shikongo.png",
  },
  {
    id: "ADV007",
    name: "Petrus van der Merwe",
    specialization: "Estate Planning Specialist",
    region: "Windhoek",
    experience: "18 years",
    languages: ["English", "Afrikaans"],
    rating: 4.9,
    clients: 250,
    specialties: ["Estate Planning", "Life Insurance", "Trust Services"],
    availability: "Available tomorrow",
    avatar: "/avatars/petrus_van_der_merwe.png",
  },
  {
    id: "ADV008",
    name: "Amina Nangombe",
    specialization: "Health & Wellness Specialist",
    region: "Oshakati",
    experience: "7 years",
    languages: ["English", "Oshiwambo", "Herero"],
    rating: 4.8,
    clients: 100,
    specialties: ["Health Insurance", "Disability Cover", "Critical Illness"],
    availability: "Available now",
    avatar: "/avatars/amina_nangombe.png",
  },
  {
    id: "ADV009",
    name: "Christoph Müller",
    specialization: "Expatriate Services Specialist",
    region: "Windhoek",
    experience: "13 years",
    languages: ["English", "German", "Afrikaans"],
    rating: 4.7,
    clients: 140,
    specialties: ["International Coverage", "Travel Insurance", "Expat Solutions"],
    availability: "Available today",
    avatar: "/avatars/christoph_muller.png",
  },
  {
    id: "ADV010",
    name: "Lydia Geingob",
    specialization: "Women's Financial Empowerment",
    region: "Windhoek",
    experience: "10 years",
    languages: ["English", "Oshiwambo", "Afrikaans"],
    rating: 4.9,
    clients: 160,
    specialties: ["Women's Insurance", "Education Planning", "Retirement Planning"],
    availability: "Available now",
    avatar: "/avatars/lydia_geingob.png",
  },
  {
    id: "ADV011",
    name: "Francois Coetzee",
    specialization: "High Net Worth Specialist",
    region: "Windhoek",
    experience: "20 years",
    languages: ["English", "Afrikaans"],
    rating: 5.0,
    clients: 300,
    specialties: ["Wealth Management", "Estate Planning", "Tax Optimization"],
    availability: "Available today",
    avatar: "/avatars/francois_coetzee.jpg",
  },
  {
    id: "ADV012",
    name: "Selma Katjijere",
    specialization: "Youth Financial Planning",
    region: "Oshakati",
    experience: "6 years",
    languages: ["English", "Oshiwambo", "Herero"],
    rating: 4.8,
    clients: 85,
    specialties: ["Education Savings", "First Job Benefits", "Young Professional Plans"],
    availability: "Available now",
    avatar: "/avatars/selma_katjijere.png",
  },
  {
    id: "ADV013",
    name: "Willem Botha",
    specialization: "Agricultural Finance Specialist",
    region: "Tsumeb",
    experience: "14 years",
    languages: ["English", "Afrikaans", "Oshiwambo"],
    rating: 4.8,
    clients: 170,
    specialties: ["Farm Insurance", "Agricultural Loans", "Crop Protection"],
    availability: "Available tomorrow",
    avatar: "/avatars/willem_botha.png",
  },
  {
    id: "ADV014",
    name: "Hilma Shikwambi",
    specialization: "Micro-Enterprise Specialist",
    region: "Windhoek",
    experience: "9 years",
    languages: ["English", "Oshiwambo", "Damara"],
    rating: 4.9,
    clients: 135,
    specialties: ["Micro Insurance", "Business Loans", "Group Schemes"],
    availability: "Available now",
    avatar: "/avatars/hilma_shikwambi.png",
  },
  {
    id: "ADV015",
    name: "Pieter Swart",
    specialization: "Retirement Planning Specialist",
    region: "Windhoek",
    experience: "16 years",
    languages: ["English", "Afrikaans"],
    rating: 4.9,
    clients: 220,
    specialties: ["Retirement Annuities", "Pension Plans", "Estate Planning"],
    availability: "Available today",
    avatar: "/avatars/pieter_swart.jpg",
  },
  {
    id: "ADV016",
    name: "Esther Mwandingi",
    specialization: "Family Protection Specialist",
    region: "Oshakati",
    experience: "8 years",
    languages: ["English", "Oshiwambo", "Herero"],
    rating: 4.8,
    clients: 125,
    specialties: ["Family Insurance", "Child Education", "Survivor Benefits"],
    availability: "Available now",
    avatar: "/avatars/esther_mwandingi.png",
  },
  {
    id: "ADV017",
    name: "Andreas Fischer",
    specialization: "Corporate Benefits Specialist",
    region: "Windhoek",
    experience: "12 years",
    languages: ["English", "German", "Afrikaans"],
    rating: 4.7,
    clients: 150,
    specialties: ["Group Life", "Employee Benefits", "Corporate Packages"],
    availability: "Available today",
    avatar: "/avatars/andreas_fischer.png",
  },
  {
    id: "ADV018",
    name: "Rebecca Katjimune",
    specialization: "Education Planning Specialist",
    region: "Windhoek",
    experience: "7 years",
    languages: ["English", "Oshiwambo", "Afrikaans"],
    rating: 4.9,
    clients: 105,
    specialties: ["Education Savings", "School Fees Planning", "University Funding"],
    availability: "Available now",
    avatar: "/avatars/rebecca_katjimune.png",
  },
  {
    id: "ADV019",
    name: "Stephanus Groenewaldt",
    specialization: "Property & Asset Protection",
    region: "Swakopmund",
    experience: "11 years",
    languages: ["English", "Afrikaans", "German"],
    rating: 4.8,
    clients: 145,
    specialties: ["Home Insurance", "Property Insurance", "Asset Protection"],
    availability: "Available tomorrow",
    avatar: "/avatars/stephanus_groenewaldt.png",
  },
  {
    id: "ADV020",
    name: "Joyce Nakale",
    specialization: "Comprehensive Financial Planning",
    region: "Windhoek",
    experience: "15 years",
    languages: ["English", "Oshiwambo", "Herero"],
    rating: 4.9,
    clients: 200,
    specialties: ["Full Financial Planning", "Portfolio Management", "Life Insurance"],
    availability: "Available now",
    avatar: "/avatars/joyce_nakale.png",
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

  return (
    <CorporateLayout
      heroTitle="Find Your Perfect Advisor"
      heroSubtitle="Connect with experienced financial advisors who understand Namibia's unique financial landscape"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
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
                    <div className="rounded-full w-16 h-16 overflow-hidden ring-2 ring-om-heritage-green/20">
                      <img
                        src={advisor.avatar}
                        alt={advisor.name}
                        className="w-full h-full object-cover"
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
                        {advisor.specialties.map((specialty, specialtyIdx) => (
                          <span
                            key={specialtyIdx}
                            className="badge badge-outline badge-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/advisors/${advisor.id}/book`} className="btn-om-primary btn-sm flex-1">
                        Book Consultation
                      </Link>
                      <Link href={`/advisors/${advisor.id}`} className="btn-om-outline btn-sm">
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
            <button className="btn-om-primary btn-lg">
              Get AI Matching Assistance
            </button>
          </div>
        </div>
      </section>

    </CorporateLayout>
  );
}
