// app/page.tsx - Competition Pitch Homepage
// LifeCompass by Old Mutual - Technovation Hackathon Entry
// Human-first design with custom layouts and intuitive language

"use client";

import Link from "next/link";
import Image from "next/image";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { OMButton } from "@/components/atoms/brand";
import {
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  StarIcon,
  LockClosedIcon,
  EyeSlashIcon,
  KeyIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { HeroSection } from "@/components/templates/HeroSection";
import { Section, SectionHeader } from "@/components/molecules/Section";
import { ProblemCard } from "@/components/molecules/ProblemCard";
import { FeatureCard } from "@/components/molecules/FeatureCard";
import { MetricCard } from "@/components/molecules/MetricCard";
import { KnowledgeGraph } from "@/components/organisms/KnowledgeGraph";
// import { BriefcaseIcon, ClockIcon } from "@/components/atoms/icons";
import { BriefcaseIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation type="customer" />

      {/* Custom Hero Layout - Human-First Design */}
      <HeroSection
        badge={{
          icon: <RocketLaunchIcon className="w-5 h-5" />,
          text: "TECHNOVATION HACKATHON 2025",
        }}
        title="WHERE INNOVATION"
        titleHighlight="MEETS CUSTOMER EXPERIENCE"
        subtitle="LifeCompass by Old Mutual"
        description="An intuitive, AI-powered platform that makes financial wellbeing feel effortless—for everyone in Namibia."
        points={[
          {
            icon: <LightBulbIcon className="w-6 h-6" />,
            text: "AI assistant that knows your policies and history",
          },
          {
            icon: <UserGroupIcon className="w-6 h-6" />,
            text: "Instant access to real advisors when you need them",
          },
          {
            icon: <ShieldCheckIcon className="w-6 h-6" />,
            text: "Intuitive, secure, and built for real people",
          },
        ]}
      />

      {/* The Problem - Custom Asymmetric Layout */}
      <Section background="white" pattern>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHeader badge="The Challenge" title="What We're Solving" />

          {/* Problem Cards - Custom Layout */}
          <div className="space-y-6">
            <ProblemCard
              icon={
                <BriefcaseIcon className="w-7 h-7 text-om-heritage-green" />
              }
              iconBg="bg-om-heritage-green/10"
              gradientFrom="from-om-heritage-green/20"
              gradientTo="to-om-fresh-green/20"
            >
              <p className="text-base sm:text-lg md:text-xl text-om-grey-80 leading-relaxed">
                <strong className="text-om-heritage-green">
                  Namibians struggle
                </strong>{" "}
                with complex financial products, slow support, and a lack of
                trust in digital tools. They want answers quickly, in plain
                language, without the runaround.
              </p>
            </ProblemCard>

            <ProblemCard
              icon={<ClockIcon className="w-7 h-7 text-om-naartjie" />}
              iconBg="bg-om-naartjie/10"
              gradientFrom="from-om-naartjie/20"
              gradientTo="to-om-cerise/20"
              delay={0.1}
            >
              <p className="text-base sm:text-lg md:text-xl text-om-grey-80 leading-relaxed">
                <strong className="text-om-naartjie">
                  Advisors are overwhelmed
                </strong>{" "}
                with admin tasks—10 hours per week on paperwork. They want to
                focus on building relationships, not filling forms.
              </p>
            </ProblemCard>

            {/* Impact Callout - Custom Styling */}
            <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-om-cerise/10 via-om-naartjie/10 to-om-cerise/10 rounded-2xl border-l-4 border-om-cerise">
              <p className="text-sm sm:text-base text-om-grey-80 font-medium">
                <strong className="text-om-cerise">The result:</strong> New
                business profitability down 50%, value of new business margin at
                1.3% (below 2-3% target), poor customer experience (NPS 35), and
                advisors spending more time on admin than helping clients.
              </p>
              <p className="text-xs sm:text-sm text-om-grey-60 mt-3 italic">
                Source: Old Mutual Group Interim Results for the six months
                ended 30 June 2025
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Solution - Custom Feature Showcase */}
      <section className="bg-gradient-to-b from-om-grey-5 to-white py-12 sm:py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12 md:mb-16"
            >
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-om-fresh-green/10 text-om-fresh-green font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
                Our Approach
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-om-navy mb-4 sm:mb-6">
                How We Solve It
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-om-grey-80 max-w-3xl mx-auto leading-relaxed px-4">
                Three powerful innovations working together to transform
                financial services in Namibia.
              </p>
            </motion.div>

            {/* Features Grid - 3 Main Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              <FeatureCard
                icon={<UserGroupIcon className="w-14 h-14" />}
                title="Complete CRM System"
                description="Real-time access to customer profiles, policies, claims, and interactions. Everything advisors and customers need in one place, instantly accessible."
                iconColor="text-om-heritage-green"
                gradientFrom="from-om-heritage-green/10"
                gradientTo="to-om-heritage-green/5"
              />
              <FeatureCard
                icon={<StarIcon className="w-14 h-14" />}
                title="Intelligent Knowledge Graph"
                description="Maps relationships across financial products, processes, and regulations. Your AI assistant understands how everything connects, not just what's written."
                iconColor="text-om-fresh-green"
                gradientFrom="from-om-fresh-green/10"
                gradientTo="to-om-fresh-green/5"
                delay={0.1}
              />
              <FeatureCard
                icon={<ChatBubbleLeftRightIcon className="w-14 h-14" />}
                title="Smart AI Assistant"
                description="Answers questions instantly by searching documents, accessing your CRM data, performing calculations, and understanding context. Knows your policies, history, and needs."
                iconColor="text-om-future-green"
                gradientFrom="from-om-future-green/10"
                gradientTo="to-om-future-green/5"
                delay={0.2}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Knowledge Graph - Why LifeCompass Wins */}
      <section
        id="knowledge-graph"
        className="bg-gradient-to-br from-om-heritage-green via-om-fresh-green to-om-heritage-green text-white py-12 sm:py-16 md:py-24 relative overflow-hidden"
      >
        {/* Custom Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_2px,_transparent_2px)] bg-[length:60px_60px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Our Knowledge Graph Strategy
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-3 sm:mb-4 px-4">
                Transforming financial services through intelligent knowledge
                mapping
              </p>
              <div className="mb-6 sm:mb-8">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-xs sm:text-sm">
                  Powered by Knowledge Graphs
                </span>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Our knowledge graph technology creates an interconnected
                understanding of financial products, customer relationships, and
                regulatory requirements. By mapping how everything connects, our
                AI assistant can provide instant, accurate answers that
                understand context, not just keywords.
              </p>
            </motion.div>

            {/* Knowledge Graph Component - Innovation Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 border border-white/20 shadow-2xl"
            >
              <div className="mb-4 sm:mb-6 text-center">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
                  Interactive Knowledge Graph
                </h3>
                <p className="text-white/70 text-xs sm:text-sm px-2">
                  Explore connected entities, relationships, and facts extracted
                  from Old Mutual documentation
                </p>
              </div>
              <KnowledgeGraph />
            </motion.div>

            {/* Brand Logos - Custom Layout */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-8 sm:pt-12 mt-6 sm:mt-8 border-t border-white/20">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="relative">
                  <Image
                    src="/logos/OMU.JO.svg"
                    alt="Old Mutual Logo"
                    width={140}
                    height={140}
                    className="h-10 sm:h-14 w-auto filter brightness-0 invert drop-shadow-lg"
                  />
                </div>
                <div className="h-px sm:h-12 w-12 sm:w-px bg-white/30"></div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-xl sm:text-2xl mb-1">
                    LifeCompass
                  </p>
                  <p className="text-xs sm:text-sm text-white/80 font-medium">
                    by Old Mutual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security - PII Masking Trust Section */}
      <section
        id="privacy"
        className="bg-gradient-to-br from-om-navy via-om-navy/95 to-om-heritage-green/20 text-white py-12 sm:py-16 md:py-24 relative overflow-hidden"
      >
        {/* Custom Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,_white_2px,_transparent_2px)] bg-[length:80px_80px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="mb-4 sm:mb-6">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold text-xs sm:text-sm">
                  Privacy First
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Your Data, Protected
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto px-4">
                We take your privacy seriously. Every piece of personal
                information is automatically masked and protected, ensuring your
                data remains secure while you enjoy seamless financial services.
              </p>
            </motion.div>

            {/* Privacy Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
              {[
                {
                  icon: <LockClosedIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
                  title: "Email Protection",
                  description:
                    "Email addresses are automatically masked (e.g., j***@example.com)",
                  gradient: "from-blue-500/20 to-blue-600/10",
                },
                {
                  icon: <EyeSlashIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
                  title: "Phone Privacy",
                  description:
                    "Phone numbers show only last 4 digits (+264 *** *** 4567)",
                  gradient: "from-purple-500/20 to-purple-600/10",
                },
                {
                  icon: <KeyIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
                  title: "ID Protection",
                  description:
                    "National ID numbers are never exposed in any API response",
                  gradient: "from-red-500/20 to-red-600/10",
                },
                {
                  icon: (
                    <DocumentCheckIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                  ),
                  title: "GDPR/POPIA Compliant",
                  description:
                    "Built with compliance in mind, following international privacy standards",
                  gradient: "from-green-500/20 to-green-600/10",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10"
                >
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10"
            >
              <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center sm:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-om-fresh-green mb-2">
                    100%
                  </div>
                  <p className="text-sm sm:text-base text-white/80">
                    National IDs Protected
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Never exposed in any response
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-om-fresh-green mb-2">
                    4 Levels
                  </div>
                  <p className="text-sm sm:text-base text-white/80">
                    Context-Aware Masking
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Public, Advisor, Customer, Admin
                  </p>
                </div>
                <div className="text-center sm:text-left">
                  <div className="text-3xl sm:text-4xl font-bold text-om-fresh-green mb-2">
                    Compliant
                  </div>
                  <p className="text-sm sm:text-base text-white/80">
                    GDPR & POPIA Ready
                  </p>
                  <p className="text-xs sm:text-sm text-white/60 mt-1">
                    Built for international standards
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Closing Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center mt-8 sm:mt-12"
            >
              <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto px-4">
                Privacy isn't an afterthought—it's built into every interaction.
                Experience financial services with confidence, knowing your
                personal information is always protected.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Demo - Custom Step-by-Step Layout */}
      <Section id="demo" background="white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-om-sky/10 text-om-sky font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
              Try It Yourself
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-om-navy mb-4 sm:mb-6">
              See LifeCompass in Action
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-om-grey-80 max-w-2xl mx-auto px-4">
              Experience the platform through a simple, intuitive demo journey
            </p>
          </motion.div>

          {/* Custom Step Cards */}
          <div className="space-y-3 sm:space-y-4">
            {(
              [
                {
                  step: "1",
                  label: "Select Your Experience",
                  description:
                    "Choose Customer Experience to explore 10 realistic profiles, or Advisor Experience to access 5 specialized advisor dashboards",
                  action: "Choose Experience",
                  href: "/customer/select",
                  color: "from-om-heritage-green to-om-fresh-green",
                },
                {
                  step: "2",
                  label: "View Your Profile",
                  description:
                    "Access complete profiles with policies, claims, interactions, and CRM data—all seamlessly integrated and instantly available",
                  action: "View Profile",
                  href: "/customer/select", // Will redirect to profile if persona already selected
                  color: "from-om-fresh-green to-om-future-green",
                  onClick: () => {
                    // Check if persona is already selected
                    const selectedPersona = sessionStorage.getItem(
                      "selectedCustomerPersona",
                    );
                    if (selectedPersona) {
                      try {
                        const persona = JSON.parse(selectedPersona);
                        window.location.href = `/customer/profile/${persona.customerNumber || persona.id}`;
                      } catch {
                        window.location.href = "/customer/select";
                      }
                    } else {
                      window.location.href = "/customer/select";
                    }
                  },
                },
                {
                  step: "3",
                  label: "Chat with AI Assistant",
                  description:
                    "Ask questions naturally. Our assistant searches documents, accesses your data, performs calculations, and understands context—no technical jargon needed",
                  action: "Start Chat",
                  href: "/chat",
                  color: "from-om-future-green to-om-sky",
                },
                {
                  step: "4",
                  label: "Explore the Knowledge Graph",
                  description:
                    "You've already seen it above! This visual map shows how our AI understands relationships between products, processes, and regulations",
                  action: "Scroll Up",
                  href: "#knowledge-graph",
                  color: "from-om-sky to-om-heritage-green",
                },
              ] as Array<{
                step: string;
                label: string;
                description: string;
                action: string;
                href: string;
                color: string;
                onClick?: () => void;
              }>
            ).map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`}
                />
                <div className="relative bg-white p-4 sm:p-6 rounded-2xl border border-om-grey-15 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-lg sm:text-xl flex-shrink-0 shadow-lg mx-auto sm:mx-0`}
                    >
                      {step.step}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-lg sm:text-xl font-bold text-om-navy mb-2">
                        {step.label}
                      </h3>
                      <p className="text-sm sm:text-base text-om-grey-60 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      {step.onClick ? (
                        <OMButton
                          variant="outline"
                          size="sm"
                          className="rounded-full text-center w-full sm:w-auto"
                          onClick={step.onClick}
                        >
                          {step.action}
                        </OMButton>
                      ) : (
                        <Link href={step.href} className="inline-block">
                          <OMButton
                            variant="outline"
                            size="sm"
                            className="rounded-full text-center w-full sm:w-auto"
                          >
                            {step.action}
                          </OMButton>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="text-center mt-8 sm:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/customer/select"
              className="w-full sm:w-auto inline-flex"
            >
              <OMButton
                variant="primary"
                size="lg"
                className="px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg shadow-xl hover:shadow-2xl rounded-full w-full sm:w-auto justify-center"
              >
                Try Customer Experience
              </OMButton>
            </Link>
            <Link
              href="/advisor/select"
              className="w-full sm:w-auto inline-flex"
            >
              <OMButton
                variant="outline"
                size="lg"
                className="px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg shadow-xl hover:shadow-2xl rounded-full w-full sm:w-auto border-2 border-om-heritage-green justify-center"
              >
                Try Advisor Experience
              </OMButton>
            </Link>
          </div>
        </div>
      </Section>

      {/* Business Impact - Custom Metrics Layout */}
      <section className="bg-white py-12 sm:py-16 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <span className="inline-block px-3 sm:px-4 py-1.5 rounded-full bg-om-heritage-green/10 text-om-heritage-green font-semibold text-xs sm:text-sm mb-3 sm:mb-4">
                Expected Impact
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-om-navy mb-4 sm:mb-6">
                Numbers That Matter
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-om-grey-80 max-w-2xl mx-auto">
                Real metrics for real business outcomes
              </p>
            </div>

            {/* Custom Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard
                metric="25%"
                label="Increase in advisor-assisted sales"
                description="Contextual escalation transforms digital intent into sales"
                gradientFrom="from-om-heritage-green"
                gradientTo="to-om-fresh-green"
              />
              <MetricCard
                metric="40%"
                label="Reduction in resolution time"
                description="Autonomous assistant handles common questions instantly"
                gradientFrom="from-om-fresh-green"
                gradientTo="to-om-future-green"
                delay={0.1}
              />
              <MetricCard
                metric="+15"
                label="NPS improvement"
                description="From 35 to 50+ through intuitive self-service and human connection"
                gradientFrom="from-om-future-green"
                gradientTo="to-om-sky"
                delay={0.2}
              />
              <MetricCard
                metric="10 hrs"
                label="Time saved per advisor per week"
                description="Autonomous workflows free advisors for client relationships"
                gradientFrom="from-om-sky"
                gradientTo="to-om-heritage-green"
                delay={0.3}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
