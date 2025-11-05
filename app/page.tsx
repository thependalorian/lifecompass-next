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
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            badge="The Challenge"
            title="What We're Solving"
          />

          {/* Problem Cards - Custom Layout */}
          <div className="space-y-6">
            <ProblemCard
              icon={<BriefcaseIcon className="w-7 h-7 text-om-heritage-green" />}
              iconBg="bg-om-heritage-green/10"
              gradientFrom="from-om-heritage-green/20"
              gradientTo="to-om-fresh-green/20"
            >
              <p className="text-lg md:text-xl text-om-grey-80 leading-relaxed">
                <strong className="text-om-heritage-green">Namibians struggle</strong> with complex financial products, slow support, and a lack of trust in digital tools. They want answers quickly, in plain language, without the runaround.
              </p>
            </ProblemCard>

            <ProblemCard
              icon={<ClockIcon className="w-7 h-7 text-om-naartjie" />}
              iconBg="bg-om-naartjie/10"
              gradientFrom="from-om-naartjie/20"
              gradientTo="to-om-cerise/20"
              delay={0.1}
            >
              <p className="text-lg md:text-xl text-om-grey-80 leading-relaxed">
                <strong className="text-om-naartjie">Advisors are overwhelmed</strong> with admin tasks—10 hours per week on paperwork. They want to focus on building relationships, not filling forms.
              </p>
            </ProblemCard>

            {/* Impact Callout - Custom Styling */}
            <div className="mt-8 p-6 bg-gradient-to-r from-om-cerise/10 via-om-naartjie/10 to-om-cerise/10 rounded-2xl border-l-4 border-om-cerise">
              <p className="text-om-grey-80 font-medium">
                <strong className="text-om-cerise">The result:</strong> New business profitability down 50%, value of new business margin at 1.3% (below 2-3% target), poor customer experience (NPS 35), and advisors spending more time on admin than helping clients.
              </p>
              <p className="text-sm text-om-grey-60 mt-3 italic">
                Source: Old Mutual Group Interim Results for the six months ended 30 June 2025
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Solution - Custom Feature Showcase */}
      <section className="bg-gradient-to-b from-om-grey-5 to-white py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-om-fresh-green/10 text-om-fresh-green font-semibold text-sm mb-4">
                Our Approach
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-om-navy mb-6">
                How We Solve It
              </h2>
              <p className="text-xl text-om-grey-80 max-w-3xl mx-auto leading-relaxed">
                Three powerful innovations working together to transform financial services in Namibia.
              </p>
            </motion.div>

            {/* Features Grid - 3 Main Highlights */}
            <div className="grid md:grid-cols-3 gap-8">
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
      <section id="knowledge-graph" className="bg-gradient-to-br from-om-heritage-green via-om-fresh-green to-om-heritage-green text-white py-24 relative overflow-hidden">
        {/* Custom Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_2px,_transparent_2px)] bg-[length:60px_60px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our Knowledge Graph Strategy
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-4">
                Transforming financial services through intelligent knowledge mapping
              </p>
              <div className="mb-8">
                <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold text-sm">
                  Powered by Knowledge Graphs
                </span>
              </div>
              <p className="text-lg text-white/80 max-w-3xl mx-auto mb-8">
                Our knowledge graph technology creates an interconnected understanding of financial products, 
                customer relationships, and regulatory requirements. By mapping how everything connects, 
                our AI assistant can provide instant, accurate answers that understand context, not just keywords.
              </p>
            </motion.div>
            
            {/* Knowledge Graph Component - Innovation Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl"
            >
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Interactive Knowledge Graph
                </h3>
                <p className="text-white/70 text-sm">
                  Explore connected entities, relationships, and facts extracted from Old Mutual documentation
                </p>
              </div>
              <KnowledgeGraph />
            </motion.div>

            {/* Brand Logos - Custom Layout */}
            <div className="flex items-center justify-center gap-8 pt-12 mt-8 border-t border-white/20">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Image
                    src="/logos/OMU.JO.svg"
                    alt="Old Mutual Logo"
                    width={140}
                    height={140}
                    className="h-14 w-auto filter brightness-0 invert drop-shadow-lg"
                  />
                </div>
                <div className="h-12 w-px bg-white/30"></div>
                <div>
                  <p className="font-bold text-2xl mb-1">LifeCompass</p>
                  <p className="text-sm text-white/80 font-medium">by Old Mutual</p>
                </div>
              </div>
            </div>
            </div>
          </div>
      </section>

      {/* Interactive Demo - Custom Step-by-Step Layout */}
      <Section id="demo" background="white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-om-sky/10 text-om-sky font-semibold text-sm mb-4">
              Try It Yourself
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-om-navy mb-6">
              See LifeCompass in Action
            </h2>
            <p className="text-lg text-om-grey-80 max-w-2xl mx-auto">
              Experience the platform through a simple, intuitive demo journey
            </p>
          </motion.div>
          
          {/* Custom Step Cards */}
          <div className="space-y-4">
            {[
              {
                step: "1",
                label: "Select Your Experience",
                description: "Choose Customer Experience to explore 100 realistic profiles, or Advisor Experience to access 20 specialized advisor dashboards",
                action: "Choose Experience",
                href: "/customer/select",
                color: "from-om-heritage-green to-om-fresh-green"
              },
              {
                step: "2",
                label: "View Your Profile",
                description: "Access complete profiles with policies, claims, interactions, and CRM data—all seamlessly integrated and instantly available",
                action: "View Profile",
                href: "/customer/select",
                color: "from-om-fresh-green to-om-future-green"
              },
              {
                step: "3",
                label: "Chat with AI Assistant",
                description: "Ask questions naturally. Our assistant searches documents, accesses your data, performs calculations, and understands context—no technical jargon needed",
                action: "Start Chat",
                href: "/chat",
                color: "from-om-future-green to-om-sky"
              },
              {
                step: "4",
                label: "Explore the Knowledge Graph",
                description: "You've already seen it above! This visual map shows how our AI understands relationships between products, processes, and regulations",
                action: "Scroll Up",
                href: "#knowledge-graph",
                color: "from-om-sky to-om-heritage-green"
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative"
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${step.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />
                <div className="relative bg-white p-6 rounded-2xl border border-om-grey-15 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-lg`}>
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-om-navy mb-2">
                        {step.label}
                      </h3>
                      <p className="text-om-grey-60 mb-4 leading-relaxed">
                        {step.description}
                      </p>
                      <Link href={step.href}>
                        <OMButton variant="outline" size="sm" className="rounded-full text-center">
                          {step.action}
                        </OMButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="text-center mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customer/select" className="inline-flex">
              <OMButton variant="primary" size="lg" className="px-10 py-5 text-lg shadow-xl hover:shadow-2xl rounded-full w-full sm:w-auto justify-center">
                Try Customer Experience
              </OMButton>
            </Link>
            <Link href="/advisor/select" className="inline-flex">
              <OMButton variant="outline" size="lg" className="px-10 py-5 text-lg shadow-xl hover:shadow-2xl rounded-full w-full sm:w-auto border-2 border-om-heritage-green justify-center">
                Try Advisor Experience
              </OMButton>
            </Link>
          </div>
        </div>
      </Section>

      {/* Business Impact - Custom Metrics Layout */}
      <section className="bg-white py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-om-heritage-green/10 text-om-heritage-green font-semibold text-sm mb-4">
                Expected Impact
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-om-navy mb-6">
                Numbers That Matter
              </h2>
              <p className="text-lg text-om-grey-80 max-w-2xl mx-auto">
                Real metrics for real business outcomes
              </p>
            </div>

            {/* Custom Metrics Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
