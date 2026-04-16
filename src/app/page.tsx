'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  Stethoscope, 
  HeartPulse, 
  Award,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-ink-tech font-sans selection:bg-primary-ocean selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-line-tech">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-primary-ocean flex items-center justify-center text-white">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight">Radiant Hospital</span>
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold">Training Institute (RHTI)</span>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10">
            <nav className="flex items-center gap-8 text-[10px] uppercase tracking-widest font-bold">
              <a href="#about" className="hover:text-primary-ocean transition-colors">About</a>
              <a href="#programmes" className="hover:text-primary-ocean transition-colors">Programmes</a>
              <a href="#gallery" className="hover:text-primary-ocean transition-colors">Campus</a>
              <a href="#contact" className="hover:text-primary-ocean transition-colors">Contact</a>
            </nav>
            <div className="h-6 w-px bg-line-tech"></div>
            <Link href="/login">
              <Button variant="outline" className="rounded-none border-primary-ocean text-primary-ocean hover:bg-primary-ocean hover:text-white text-[10px] uppercase tracking-widest px-6 font-bold transition-all">
                Student Portal
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-line-tech bg-bg-tech/30">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary-ocean/20 bg-primary-ocean/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-ocean animate-pulse"></div>
              <span className="text-[9px] uppercase tracking-widest font-bold text-primary-ocean">Monthly Intakes Available</span>
            </div>
            <h1 className="text-6xl lg:text-[90px] leading-[0.9] font-bold tracking-tighter mb-10 text-ink-tech">
              ENHANCING <br /> 
              <span className="text-primary-ocean">PARAMOUNT</span> <br />
              CARE-TEAM.
            </h1>
            <p className="text-lg lg:text-xl text-gray-500 max-w-lg mb-12 leading-relaxed">
              Radiant Hospital Training Institute (RHTI) is dedicated to equipping students with the knowledge and practical experience to excel in healthcare.
            </p>
            <div className="flex flex-wrap gap-6">
              <Button size="lg" className="rounded-none h-16 px-10 bg-primary-ocean text-white hover:bg-primary-ocean/90 text-[11px] uppercase tracking-[0.2em] font-bold shadow-lg shadow-primary-ocean/20">
                Apply for Intake <ArrowRight className="ml-3 w-4 h-4" />
              </Button>
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-16 h-16 border border-line-tech flex items-center justify-center group-hover:bg-primary-ocean group-hover:text-white transition-all group-hover:border-primary-ocean">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold border-b border-primary-ocean pb-1 text-primary-ocean">0712 588 588</span>
              </div>
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="aspect-[4/5] bg-gray-100 relative overflow-hidden border border-line-tech shadow-2xl"
            >
              <img 
                src="https://picsum.photos/seed/kenya-medical-graduation/1200/1500" 
                alt="RHTI Graduation" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-primary-ocean/10"></div>
            </motion.div>
            {/* Motto Badge */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute -bottom-10 -left-10 bg-white p-8 border border-line-tech shadow-2xl hidden lg:block max-w-[280px]"
            >
              <p className="text-[9px] uppercase tracking-widest font-bold opacity-40 mb-2 text-primary-ocean">Our Motto</p>
              <p className="text-xl font-bold leading-tight tracking-tight">"ENHANCING PARAMOUNT CARE-TEAM"</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 bg-white border-b border-line-tech">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-24 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary-ocean mb-4">About RHTI</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-8">PREMIER HEALTHCARE TRAINING IN KENYA</h2>
              <div className="space-y-6 text-gray-600 text-sm leading-relaxed">
                <p>
                  Established in January 2023, RHTI stands out for its commitment to delivering well-rounded education through a blend of modern theoretical instruction and hands-on, consultative, and interactive training methods.
                </p>
                <p>
                  Our institute is supported by a team of qualified and certified trainers, state-of-the-art facilities, including a modern library and technology center, and comprehensive after-school programs.
                </p>
              </div>
              
              <div className="mt-16 grid grid-cols-2 gap-8">
                <div className="p-6 border border-line-tech bg-bg-tech/20">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 border-b border-primary-ocean pb-2 text-primary-ocean">Vision</h4>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">To be a leading academic health center by producing highly skilled and competent graduates who will drive excellence in the healthcare industry.</p>
                </div>
                <div className="p-6 border border-line-tech bg-bg-tech/20">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold mb-4 border-b border-primary-ocean pb-2 text-primary-ocean">Mission</h4>
                  <p className="text-xs text-gray-500 font-bold leading-relaxed">To cultivate a culture of learning among our students by imparting the knowledge, skills, and qualities essential for delivering quality patient care.</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-bg-tech/30 p-12 border border-line-tech"
            >
              <h3 className="text-[10px] uppercase tracking-widest font-bold mb-8 text-primary-ocean">Our Core Values</h3>
              <div className="space-y-4">
                {['Communication', 'Efficiency and Effectiveness', 'Teamwork', 'Professionalism', 'Integrity'].map((value, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-white border border-line-tech hover:border-primary-ocean transition-colors group"
                  >
                    <div className="w-8 h-8 bg-primary-ocean text-white flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <span className="text-xs uppercase tracking-widest font-bold group-hover:text-primary-ocean transition-colors">{value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programmes Section */}
      <section id="programmes" className="py-32 bg-bg-tech/20 border-b border-line-tech">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary-ocean mb-4">Academic Catalog</p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">CURRENT PROGRAMS</h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <ProgramCard 
              title="Certificate in Certified Nursing Assistant (CNA)"
              duration="4 Months"
              requirement="KCSE Mean Grade of D (plain) and Above"
              description="Equips students with foundational skills to provide basic patient care under supervision. Covers hygiene, vital signs, and communication."
              delay={0.1}
            />
            <ProgramCard 
              title="Certificate in Health Records & IT (HRIT)"
              duration="18 Months"
              requirement="KCSE Mean Grade of C- and Above"
              description="Focuses on management of health records and IT in healthcare. Skills in medical coding, data management, and EHR systems."
              delay={0.2}
            />
            <ProgramCard 
              title="Certificate in Dental Assistant"
              duration="9 Months"
              requirement="KCSE Mean Grade of D Plain and Above"
              description="Essential knowledge and practical skills to support dentists. Chairside assisting, infection control, and dental procedures."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Why Study With Us */}
      <section className="py-32 bg-white border-b border-line-tech">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <img 
                src="https://picsum.photos/seed/kenya-medical-teaching/1000/1000" 
                alt="Teaching at RHTI" 
                className="w-full aspect-square object-cover grayscale border border-line-tech shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary-ocean mb-4">The RHTI Advantage</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-12">WHY STUDY WITH US?</h2>
              
              <div className="space-y-12">
                <AdvantageItem 
                  title="Flexible Fee Payment"
                  description="We offer flexible payment plans to make education accessible to all students."
                  index={1}
                />
                <AdvantageItem 
                  title="Hospital Attachment Placement"
                  description="Students are guaranteed practical training through hospital attachments at Radiant Group of Hospitals."
                  index={2}
                />
                <AdvantageItem 
                  title="Affordable Accommodation"
                  description="On-campus or nearby accommodation is available for students (not included in course fee)."
                  index={3}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-32 bg-bg-tech/10 border-b border-line-tech">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
          >
            <div className="max-w-xl">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary-ocean mb-4">Campus Life</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">OUR FACILITIES</h2>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <GalleryItem 
              span="md:col-span-8" 
              src="https://picsum.photos/seed/rhti-library/1200/800" 
              title="Modern Library" 
              category="Research"
              delay={0.1}
            />
            <GalleryItem 
              span="md:col-span-4" 
              src="https://picsum.photos/seed/rhti-tech/600/800" 
              title="Technology Center" 
              category="Innovation"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-white border-t border-line-tech pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary-ocean flex items-center justify-center text-white">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">Radiant Hospital Training Institute</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mb-12 font-bold">
                Empowering graduates to make a meaningful impact in the healthcare industry through innovative programs and student-centered training.
              </p>
              <div className="flex gap-4">
                <SocialIcon icon={<Facebook className="w-4 h-4" />} />
                <SocialIcon icon={<Twitter className="w-4 h-4" />} />
                <SocialIcon icon={<Instagram className="w-4 h-4" />} />
                <SocialIcon icon={<Linkedin className="w-4 h-4" />} />
              </div>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-8 text-primary-ocean">Contact Details</h4>
                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <MapPin className="w-4 h-4 text-primary-ocean shrink-0" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                      Radiant Hospital – Kasarani Sportsview Branch, <br />
                      P.O Box 63683 – 00607, <br />
                      Nairobi, Kenya
                    </p>
                  </li>
                  <li className="flex gap-4">
                    <Phone className="w-4 h-4 text-primary-ocean shrink-0" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">0712 588 588</p>
                  </li>
                  <li className="flex gap-4">
                    <Mail className="w-4 h-4 text-primary-ocean shrink-0" />
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">radianthospitaltraininginstltd@gmail.com</p>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-8 text-primary-ocean">Quick Links</h4>
                <ul className="space-y-4 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  <li><a href="#" className="hover:text-primary-ocean transition-colors">Apply Online</a></li>
                  <li><a href="#" className="hover:text-primary-ocean transition-colors">Student Portal</a></li>
                  <li><a href="#" className="hover:text-primary-ocean transition-colors">Fee Structure</a></li>
                  <li><a href="#" className="hover:text-primary-ocean transition-colors">Radiant Group</a></li>
                </ul>
              </motion.div>
            </div>
          </div>

          <div className="pt-12 border-t border-line-tech flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold">
              &copy; 2026 Radiant Hospital Training Institute. All Rights Reserved.
            </p>
            <div className="flex gap-10 text-[9px] uppercase tracking-widest opacity-40 font-bold">
              <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProgramCard({ title, duration, requirement, description, delay = 0 }: { title: string, duration: string, requirement: string, description: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="bg-white p-12 space-y-6 hover:shadow-2xl hover:shadow-primary-ocean/5 transition-all border border-line-tech group"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold tracking-tight max-w-[200px] group-hover:text-primary-ocean transition-colors">{title}</h3>
        <span className="text-[9px] uppercase tracking-widest bg-primary-ocean text-white px-2 py-1 font-bold">{duration}</span>
      </div>
      <div className="space-y-4">
        <p className="text-[10px] uppercase tracking-widest font-bold text-primary-ocean/60">Requirement: {requirement}</p>
        <p className="text-xs text-gray-500 leading-relaxed font-bold">{description}</p>
      </div>
      <div className="pt-4">
        <Button variant="link" className="p-0 h-auto text-[10px] uppercase tracking-widest font-bold text-primary-ocean group-hover:translate-x-2 transition-transform">
          Full Details &rarr;
        </Button>
      </div>
    </motion.div>
  );
}

function AdvantageItem({ title, description, index }: { title: string, description: string, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="flex gap-6 group"
    >
      <div className="w-px h-12 bg-primary-ocean shrink-0 group-hover:h-16 transition-all duration-300"></div>
      <div>
        <h4 className="text-lg font-bold tracking-tight mb-2 group-hover:text-primary-ocean transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 leading-relaxed font-bold">{description}</p>
      </div>
    </motion.div>
  );
}

function GalleryItem({ span, src, title, category, delay = 0 }: { span: string, src: string, title: string, category: string, delay?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5 }}
      className={`${span} relative aspect-video md:aspect-auto overflow-hidden group border border-line-tech shadow-xl`}
    >
      <img 
        src={src} 
        alt={title} 
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-primary-ocean/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
        <p className="text-[9px] uppercase tracking-widest text-white mb-1 font-bold">{category}</p>
        <h4 className="text-xl font-bold text-white tracking-tight">{title}</h4>
      </div>
    </motion.div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -3, backgroundColor: '#0683C1', color: '#ffffff', borderColor: '#0683C1' }}
      className="w-8 h-8 border border-line-tech flex items-center justify-center transition-all cursor-pointer text-gray-400"
    >
      {icon}
    </motion.div>
  );
}
