// app/tools/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";

export default function ToolsPage() {
  const router = useRouter();
  const [premiumAmount, setPremiumAmount] = useState(500);
  const [coverageAmount, setCoverageAmount] = useState(500000);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentAge, setCurrentAge] = useState(35);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);

  const calculateRetirement = () => {
    const years = retirementAge - currentAge;
    const months = years * 12;
    const rate = 0.072 / 12; // 7.2% annual return based on Old Mutual Income Fund performance
    const futureValue =
      monthlyContribution * (((1 + rate) ** months - 1) / rate) * (1 + rate);
    return futureValue;
  };

  return (
    <CorporateLayout
      heroTitle="Financial Tools"
      heroSubtitle="Calculate premiums, retirement savings, and more"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Tools", href: "/tools" },
      ]}
    >
      {/* Tools Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Premium Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="card-title text-om-navy mb-4">
                <svg
                  className="w-6 h-6 text-om-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Life Insurance Premium Calculator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Desired Coverage Amount</span>
                    <span className="label-text-alt font-bold text-om-green">
                      N${coverageAmount.toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={coverageAmount}
                    onChange={(e) => setCoverageAmount(Number(e.target.value))}
                    className="range range-primary"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Your Age</span>
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div className="bg-om-green/10 rounded-lg p-6 text-center">
                  <div className="text-sm text-om-grey mb-2">
                    Estimated Monthly Premium
                  </div>
                  <div className="text-4xl font-bold text-om-green">
                    N${Math.round((coverageAmount / 10000) * 1.2 + 40)}
                  </div>
                  <div className="text-xs text-om-grey mt-2">
                    Based on OMP Severe Illness Cover (N$40 base +
                    coverage-based premium)
                  </div>
                </div>

                <Link href="/products" className="btn btn-om-primary w-full">
                  Get Accurate Quote
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Retirement Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="card-title text-om-navy mb-4">
                <svg
                  className="w-6 h-6 text-om-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Retirement Savings Calculator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Current Age</span>
                  </label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Retirement Age</span>
                  </label>
                  <input
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Monthly Contribution</span>
                    <span className="label-text-alt font-bold text-om-green">
                      N${monthlyContribution.toLocaleString()}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={monthlyContribution}
                    onChange={(e) =>
                      setMonthlyContribution(Number(e.target.value))
                    }
                    className="range range-primary"
                  />
                  <div className="text-xs text-om-grey mt-1">
                    Minimum: N$100/month (Old Mutual Unit Trusts)
                  </div>
                </div>

                <div className="bg-om-navy/10 rounded-lg p-6 text-center">
                  <div className="text-sm text-om-grey mb-2">
                    Projected Retirement Savings
                  </div>
                  <div className="text-4xl font-bold text-om-navy">
                    N${Math.round(calculateRetirement()).toLocaleString()}
                  </div>
                  <div className="text-xs text-om-grey mt-2">
                    Based on Old Mutual Income Fund returns (7.2% annual) over{" "}
                    {retirementAge - currentAge} years
                  </div>
                </div>

                <Link href="/products" className="btn btn-om-primary w-full">
                  Create Retirement Plan
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Savings Goal Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="card-title text-om-navy mb-4">
                <svg
                  className="w-6 h-6 text-om-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                Education Savings Calculator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Child&apos;s Current Age</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Target Education Cost</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={200000}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Years Until University</span>
                  </label>
                  <input
                    type="number"
                    defaultValue={13}
                    className="input input-bordered w-full input-om"
                  />
                </div>

                <div className="bg-om-gold/10 rounded-lg p-6 text-center">
                  <div className="text-sm text-om-grey mb-2">
                    Required Monthly Savings
                  </div>
                  <div className="text-4xl font-bold text-om-gold">N$850</div>
                  <div className="text-xs text-om-grey mt-2">
                    To reach N$200,000 in 13 years
                  </div>
                </div>

                <Link href="/products" className="btn btn-om-primary w-full">
                  Start Education Plan
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Funeral Insurance Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="card-title text-om-navy mb-4">
                <svg
                  className="w-6 h-6 text-om-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Funeral Insurance Calculator
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Coverage Plan</span>
                  </label>
                  <select className="select select-bordered w-full input-om">
                    <option>Funeral Care Plan (N$40/month)</option>
                    <option>Standard Plan (N$60/month)</option>
                    <option>Comprehensive+ Plan (N$80/month)</option>
                  </select>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Coverage Amount</span>
                  </label>
                  <select className="select select-bordered w-full input-om">
                    <option>N$20,000 (Standard)</option>
                    <option>N$50,000 (Comprehensive+)</option>
                  </select>
                </div>

                <div className="bg-om-heritage-green/10 rounded-lg p-6 text-center">
                  <div className="text-sm text-om-grey mb-2">
                    Monthly Premium
                  </div>
                  <div className="text-4xl font-bold text-om-heritage-green">
                    N$40 - N$80
                  </div>
                  <div className="text-xs text-om-grey mt-2">
                    Based on OMP Funeral Care Range - Claims paid within 48
                    hours
                  </div>
                </div>

                <Link href="/products" className="btn btn-om-primary w-full">
                  Get Funeral Quote
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Risk Assessment */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="card-title text-om-navy mb-4">
                <svg
                  className="w-6 h-6 text-om-green"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Investment Risk Profile
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-om-grey mb-3">
                    Answer a few questions to determine your investment risk
                    profile
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="label">
                        <span className="label-text">
                          Investment Time Horizon
                        </span>
                      </label>
                      <select className="select select-bordered w-full input-om">
                        <option>Less than 3 years</option>
                        <option>3-5 years</option>
                        <option>5-10 years</option>
                        <option>More than 10 years</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">
                          How would you react to a 20% market drop?
                        </span>
                      </label>
                      <select className="select select-bordered w-full input-om">
                        <option>Sell everything immediately</option>
                        <option>Sell some investments</option>
                        <option>Hold and wait</option>
                        <option>Buy more at lower prices</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text">
                          Investment Experience
                        </span>
                      </label>
                      <select className="select select-bordered w-full input-om">
                        <option>No experience</option>
                        <option>Some experience</option>
                        <option>Experienced investor</option>
                        <option>Very experienced</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-om-primary w-full"
                  onClick={() => {
                    alert(
                      "Your risk profile has been calculated! Based on your answers, you are classified as a 'Moderate' risk investor. This means you're comfortable with some market volatility in exchange for potentially higher returns over the long term.",
                    );
                  }}
                >
                  Calculate Risk Profile
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-om-light-grey py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-om-navy mb-4">
            Ready to Take the Next Step?
          </h2>
          <p className="text-om-grey text-lg mb-8 max-w-2xl mx-auto">
            Connect with a financial advisor to create a personalized plan based
            on your calculations
          </p>
          <Link href="/advisors" className="btn-om-primary btn-lg">
            Schedule Consultation
          </Link>
        </div>
      </section>
    </CorporateLayout>
  );
}
