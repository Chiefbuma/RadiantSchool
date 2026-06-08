"use client";

import { useState, useEffect, ReactNode } from 'react';
import { 
  Stethoscope, 
  Mail, 
  Clock, 
  Menu, 
  X, 
  Search, 
  Phone, 
  Heart, 
  Rocket, 
  ChevronRight, 
  Star,
  MapPin,
  Calendar,
  Users,
  FileText,
  Smile,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type BrandIconProps = {
  size?: number;
  className?: string;
};

const FacebookIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.761 0 2.072.15 2.608.298v3.325c-.283-.03-.775-.045-1.386-.045-1.967 0-2.728.745-2.728 2.683v1.297h3.92l-.673 3.667h-3.247v7.98z" />
  </svg>
);

const XIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const InstagramIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

const ThreadsIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.4 7.2c-1.2-2-3-3-5.4-3-4.1 0-7 3.1-7 7.8s2.9 7.8 7 7.8c4.2 0 7-2.6 7-6.1 0-3-2.1-4.8-5.5-4.8h-2.1" />
    <path d="M14.8 12.2c-.5-.5-1.3-.8-2.4-.8-1.7 0-2.8.8-2.8 2.1 0 1.2 1 2 2.6 2 1.8 0 2.9-1.1 2.9-2.6 0-3.5-2.2-5.3-5.1-4.4" />
  </svg>
);

const LinkedinIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.447-2.136 2.941v5.665H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM7.114 20.452H3.558V9h3.556v11.452Z" />
  </svg>
);

const TiktokIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M16.6 5.82a6.1 6.1 0 0 0 3.76 1.29v3.4a9.58 9.58 0 0 1-3.76-.78v6.98a6.3 6.3 0 1 1-6.3-6.3c.43 0 .85.04 1.25.13v3.55a2.83 2.83 0 1 0 1.65 2.57V2h3.4z" />
  </svg>
);

const YoutubeIcon = ({ size = 20, className = "" }: BrandIconProps) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M23.5 6.2a3.01 3.01 0 0 0-2.12-2.13C19.5 3.56 12 3.56 12 3.56s-7.5 0-9.38.51A3.01 3.01 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.01 3.01 0 0 0 2.12 2.13c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.01 3.01 0 0 0 2.12-2.13c.5-1.88.5-5.8.5-5.8s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12z" />
  </svg>
);

const socialLinks = [
  { name: "Facebook", href: "https://facebook.com/radianthospitaltraininginstitute/", Icon: FacebookIcon },
  { name: "X", href: "https://x.com/rhti_college", Icon: XIcon },
  { name: "Instagram", href: "https://instagram.com/rhti_college/", Icon: InstagramIcon },
  { name: "Threads", href: "https://threads.com/@rhti_college", Icon: ThreadsIcon },
  { name: "LinkedIn", href: "https://linkedin.com/company/rhticollege", Icon: LinkedinIcon },
  { name: "TikTok", href: "https://tiktok.com/@rhticollege", Icon: TiktokIcon },
  { name: "YouTube", href: "https://youtube.com/@rghinstitute", Icon: YoutubeIcon },
];

const NavLink = ({ href, children, active = false }: { href: string; children: ReactNode; active?: boolean }) => (
  <a 
    href={href} 
    className={`text-lg font-display uppercase tracking-wider transition-colors hover:text-primary ${active ? 'text-primary' : 'text-dark/80'}`}
  >
    {children}
  </a>
);

const SectionHeading = ({ subtitle, title, light = false }: { subtitle: string; title: string; light?: boolean }) => (
  <div className="text-center mb-4 md:mb-6 px-4">
    <motion.h4 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-primary font-display text-base md:text-lg lg:text-xl uppercase tracking-widest mb-2"
    >
      {subtitle}
    </motion.h4>
    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className={`text-3xl md:text-5xl lg:text-6xl font-display font-bold uppercase leading-tight md:leading-none tracking-tight ${light ? 'text-white' : 'text-dark'}`}
    >
      {title}
    </motion.h1>
  </div>
);

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formStep, setFormStep] = useState(1);
  const [showAllGallery, setShowAllGallery] = useState(false);

  const announcements = [
    {
      type: "Breaking News",
      title: "GUARANTEED HOSPITAL ATTACHMENT",
      description: "All students receive hands-on practical training through hospital attachments at the Radiant Group of Hospitals.",
      date: "NEW",
      category: "Practical Training"
    },
    {
      type: "Intake Update",
      title: "JUNE 2026 INTAKE NOW OPEN",
      description: "RHTI admits students in January, March, June, and September, while the CNA program admits new students every month.",
      date: "OPEN",
      category: "Admissions"
    },
    {
      type: "New Program",
      title: "HEALTH RECORDS & IT ENHANCED CURRICULUM",
      description: "The HRIT program prepares students for medical coding, patient data management, electronic health records, and health information ethics.",
      date: "UPCOMING",
      category: "Academics"
    }
  ];

  const heroSlides = [
    {
      src: "/images/web/hero-01.webp",
      caption: "Graduating healthcare students celebrating a new chapter at RHTI"
    },
    {
      src: "/images/web/hero-02.webp",
      caption: "RHTI graduation ceremony honoring clinical training excellence"
    },
    {
      src: "/images/web/hero-03.webp",
      caption: "Radiant Hospital Training Institute graduates ready to serve"
    }
  ];

  const heroHighlights = [
    {
      icon: <Stethoscope size={30} />,
      eyebrow: "CNA Program",
      title: "Monthly Intakes",
      note: "Apply now"
    },
    {
      icon: <Users size={30} />,
      eyebrow: "Clinical Training",
      title: "Hospital Attachment",
      note: "Hands-on practice"
    },
    {
      icon: <Calendar size={30} />,
      eyebrow: "2026 Admissions",
      title: "Jan, Mar, Jun & Sep",
      note: "Open intakes"
    },
    {
      icon: <FileText size={30} />,
      eyebrow: "Programs",
      title: "CNA, HRIT & Dental",
      note: "View details"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % announcements.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const programs = [
    { 
      id: "cna",
      title: "Certificate in Certified Nursing Assistant (CNA)", 
      duration: "Four (4) months",
      requirements: "KCSE Mean Grade of D (plain) and Above",
      tuition: "KSh. 58,000",
      overview: "Equips students with the foundational skills needed to provide compassionate basic patient care under supervision, including patient hygiene, vital signs monitoring, safe patient handling, and effective communication.",
      pdfUrl: "/more/NEW-CNA-FEE%20(1).pdf",
      icon: <Stethoscope size={32} />
    },
    { 
      id: "hrit",
      title: "Certificate in Health Records & IT (HRIT)", 
      duration: "Eighteen (18) Months",
      requirements: "KCSE Mean Grade of C- and Above",
      tuition: "KSh. 161,900",
      overview: "Prepares students to manage health information in modern healthcare environments, with skills in medical coding, patient data management, EHR systems, healthcare information laws, ethics, and data quality assurance.",
      pdfUrl: "/more/NEW-HEALTH-RECORDS---FEE.pdf",
      icon: <FileText size={32} />
    },
    { 
      id: "dental",
      title: "Certificate in Dental Assistant", 
      duration: "Nine (9) Months",
      requirements: "KCSE Mean Grade of D Plain and Above",
      tuition: "KSh. 95,000",
      overview: "Trains students to support dental professionals through chairside assisting, instrument sterilization and maintenance, dental radiography, oral health education, infection control, and basic dental office administration.",
      pdfUrl: "/more/NEW-DENTAL-ASSISTANT-FEE.pdf",
      icon: <Smile size={32} />
    }
  ];

  const coreValues = ["Communication", "Efficiency and Effectiveness", "Teamwork", "Professionalism", "Integrity"];

  return (
    <div className="min-h-screen font-sans bg-white selection:bg-primary selection:text-white">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "Radiant Hospital Training Institute",
            "url": "https://radianttraining.co.ke",
            "logo": "https://radianttraining.co.ke/images/web/schema-logo.webp",
            "slogan": "Educating Hearts and Minds for Health",
            "foundingDate": "2023-01",
            "description": "Premier healthcare training institution offering CNA, Dental Assistant, and Health Records & IT certificate programs with guaranteed hospital attachments.",
            "sameAs": socialLinks.map(({ href }) => href),
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Radiant Hospital - Kasarani Sportsview Branch",
              "addressLocality": "Nairobi",
              "addressCountry": "KE"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+254-712-588-588",
              "email": "rhti@radianthospitals.org",
              "contactType": "admissions",
              "areaServed": "KE",
              "availableLanguage": "English"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Medical Training Programs",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Certificate in Certified Nursing Assistant (CNA)",
                    "description": "Four months foundational patient care training."
                  },
                  "price": "58000",
                  "priceCurrency": "KES"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Certificate in Health Records & IT (HRIT)",
                    "description": "Eighteen months training in health record management and IT."
                  },
                  "price": "161900",
                  "priceCurrency": "KES"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Certificate in Dental Assistant",
                    "description": "Nine months training in dental chairside assisting."
                  },
                  "price": "95000",
                  "priceCurrency": "KES"
                }
              ]
            }
          })
        }}
      />
      {/* Premium Header Layout from Snippet */}
      <header className="container-fluid p-0 fixed top-0 left-0 right-0 z-[90]">
        {/* Topbar Logic */}
        <div className="bg-dark relative overflow-hidden group">
          {/* nav-shaps-2 equivalent */}
          <div className="absolute top-0 right-0 w-[12%] h-full bg-dark z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 xl:px-6 flex items-center h-[50px] md:h-[60px]">

            {/* Topbar Content */}
            <div className="flex-1 h-full">
              <div className="hidden lg:flex justify-between items-center h-full text-xs xl:text-sm">
                <div className="flex min-w-0 gap-4 xl:gap-6 items-center">
                  <span className="flex items-center gap-2 text-white/60 font-medium tracking-tight whitespace-nowrap">
                    <Mail size={14} className="text-primary"/> rhti@radianthospitals.org
                  </span>
                  <span className="flex items-center gap-2 text-white/60 font-medium tracking-tight whitespace-nowrap">
                    <Clock size={14} className="text-primary"/> Mon - Sat: 8.00 am - 5.00 pm
                  </span>
                </div>
                <div className="flex items-center gap-3 xl:gap-4">
                  <a href="tel:+254712588588" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 xl:px-4 py-2 text-white/80 hover:text-white hover:border-primary/60 hover:bg-primary/20 transition-colors whitespace-nowrap">
                    <Phone size={14} className="text-primary" />
                    <span className="font-display text-base font-black uppercase tracking-widest leading-none">0712 588 588</span>
                  </a>
                  <div className="flex gap-2 xl:gap-3 border-r border-white/10 pr-3 xl:pr-4">
                    {socialLinks.map(({ name, href, Icon }) => (
                      <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`RHTI on ${name}`} className="text-white/40 hover:text-primary transition-colors">
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                     <a href="/login" className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:text-white transition-colors">
                        <Users size={14}/> Login
                     </a>
                     <div className="w-[1px] h-4 bg-primary/30 skew-x-12"></div>
                     <a href="#apply" className="text-white/90 font-black uppercase tracking-widest text-[10px] hover:text-primary transition-colors whitespace-nowrap">Apply Now</a>
                  </div>
                </div>
              </div>

              {/* Mobile Contact trigger */}
              <div className="lg:hidden flex-1 flex justify-between items-center gap-3 relative z-[101]">
                 <a href="#home" className="flex items-center" aria-label="Radiant Hospital Training Institute home">
                    <img
                      src="/logo/rhti-logo.png"
                      alt="Radiant Hospital Training Institute"
                      className="h-9 w-auto max-w-[170px] object-contain"
                    />
                 </a>
                 <div className="flex items-center gap-3">
                 <a href="tel:+254712588588" className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-2 text-white hover:text-primary transition-colors" aria-label="Call RHTI admissions">
                    <Phone size={16} className="text-primary" />
                    <span className="hidden sm:inline font-display text-base font-black uppercase tracking-widest leading-none">0712 588 588</span>
                 </a>
                 <button className="text-white hover:text-primary transition-colors p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle Menu">
                    {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
                 </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <nav className={`bg-white transition-all duration-500 overflow-hidden hidden lg:block ${isScrolled ? 'h-16 md:h-20 shadow-2xl' : 'h-20 md:h-24'}`}>
          <div className="max-w-7xl mx-auto px-4 xl:px-6 h-full flex items-center relative gap-4 xl:gap-6">
            <a href="#home" className="shrink-0 flex items-center" aria-label="Radiant Hospital Training Institute home">
              <img
                src="/logo/rhti-logo.png"
                alt="Radiant Hospital Training Institute"
                className={`${isScrolled ? 'h-12 xl:h-14' : 'h-14 xl:h-16'} w-auto max-w-[240px] object-contain transition-all duration-500`}
              />
            </a>
            
            <div className="flex-1 flex items-center justify-between h-full">
              {/* Central Nav Container with background tray */}
              <div className="hidden lg:flex items-center justify-center bg-light h-[65%] px-6 xl:px-9 rounded-[10px] mx-auto border border-dark/5 relative overflow-hidden group/nav">
                {/* nav-shaps-1 equivalent */}
                <div className="absolute top-0 right-0 bottom-0 w-[40px] bg-dark skew-x-18 translate-x-4 transition-transform group-hover/nav:translate-x-0"></div>
                <div className="flex items-center gap-5 xl:gap-7 relative z-10 mr-4">
                  <NavLink href="#home" active>Home</NavLink>
                  <NavLink href="#about">About</NavLink>
                  <NavLink href="#programs">Programs</NavLink>
                  <NavLink href="#gallery">Gallery</NavLink>
                  <NavLink href="#graduations">Graduations</NavLink>
                  <NavLink href="#contact">Contact</NavLink>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <button className="w-10 h-10 flex items-center justify-center bg-primary text-white skew-18 hover:bg-dark transition-all group shadow-lg shadow-primary/20">
                  <span className="unskew-18"><Search size={18} /></span>
                </button>
                <a href="/login" className="h-12 flex items-center px-8 bg-primary text-white font-display text-lg uppercase tracking-widest skew-18 hover:bg-dark transition-all active:scale-95 shadow-xl shadow-primary/30 ml-2">
                  <span className="unskew-18">Student Portal</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-[50px] md:pt-[60px] lg:pt-[156px]">
        {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 z-[100] bg-dark/95 backdrop-blur-md"
          >
            <div className="flex flex-col h-full">
              <div className="p-8 flex justify-between items-center border-b border-white/5">
                <img
                  src="/logo/rhti-logo.png"
                  alt="Radiant Hospital Training Institute"
                  className="h-12 w-auto max-w-[220px] object-contain"
                />
                <button onClick={() => setIsMenuOpen(false)} className="text-white p-2 bg-primary/20 rounded-lg">
                  <X size={32} />
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-6 p-8 md:p-12 overflow-y-auto">
                {['Home', 'About', 'Programs', 'Gallery', 'Graduations', 'Contact'].map((item) => (
                  <a 
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-3xl md:text-4xl font-display font-black text-white hover:text-primary transition-colors uppercase italic"
                  >
                    {item}
                  </a>
                ))}
                <div className="mt-8 flex flex-col gap-4">
                  <a 
                    href="#apply" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="bg-primary text-white text-center py-4 px-6 font-display text-xl uppercase tracking-widest"
                  >
                    Apply Now
                  </a>
                  <a 
                    href="/login" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="border border-white/20 text-white text-center py-4 px-6 font-display text-xl uppercase tracking-widest"
                  >
                    Student Portal
                  </a>
                  <div className="flex flex-wrap justify-center gap-5 mt-4">
                    {socialLinks.map(({ name, href, Icon }) => (
                      <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`RHTI on ${name}`} className="text-primary hover:text-white transition-colors">
                        <Icon size={24} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - Editorial Slideshow */}
      <section id="home" className="snap-section hero-section z-10 overflow-hidden bg-dark">
        <div className="absolute inset-y-0 left-0 z-20 hidden w-[64%] bg-white lg:block [clip-path:ellipse(74%_96%_at_8%_50%)]">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(24,40,72,0.035)_25%,transparent_25%),linear-gradient(225deg,rgba(24,40,72,0.035)_25%,transparent_25%),linear-gradient(45deg,rgba(24,40,72,0.035)_25%,transparent_25%),linear-gradient(315deg,rgba(24,40,72,0.035)_25%,#ffffff_25%)] bg-[size:36px_36px]"></div>
        </div>
        <div className="absolute inset-0 z-0 bg-white lg:hidden"></div>

        <div className="absolute inset-y-0 right-0 z-10 hidden w-[58%] overflow-hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hero-image-${currentSlide}`}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.1 }}
              className="absolute inset-0"
            >
              <img 
                src={heroSlides[currentSlide].src} 
                alt={heroSlides[currentSlide].caption} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-dark/15 via-transparent to-white/5"></div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="absolute inset-x-0 top-0 z-10 h-52 lg:hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={`mobile-hero-image-${currentSlide}`}
              src={heroSlides[currentSlide].src}
              alt={heroSlides[currentSlide].caption}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        </div>

        <div className="absolute left-0 top-0 z-40 hidden h-full w-2 bg-primary lg:block"></div>

        <div className="content-container relative z-30 flex flex-1 items-center border-l-4 border-primary pb-44 pt-52 lg:border-l-0 lg:pb-40 lg:pt-8">
          <div className="w-full lg:w-[50%] xl:w-[48%]">
            <div className="mb-5 flex items-center gap-2">
              {announcements.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlide(i)}
                  aria-label={`Show announcement ${i + 1}`}
                  className={`h-1.5 transition-all duration-500 ${i === currentSlide ? 'w-14 bg-primary' : 'w-5 bg-dark/20 hover:bg-primary/50'}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-copy-${currentSlide}`}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.55 }}
                className="max-w-full overflow-hidden pr-2 lg:pr-6"
              >
                <div className="mb-4 inline-flex border-l-4 border-primary bg-white px-4 py-2 shadow-[0_12px_30px_rgba(24,40,72,0.08)]">
                  <span className="font-black uppercase tracking-[0.28em] text-primary text-xs">
                    {announcements[currentSlide].type}
                  </span>
                </div>

                <h2 className="mb-4 max-w-full break-words text-3xl font-black leading-[0.96] tracking-tight text-dark sm:text-4xl md:text-5xl xl:text-6xl">
                  {announcements[currentSlide].title}
                </h2>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-primary">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <Calendar size={14} />
                    {announcements[currentSlide].date}
                  </span>
                  <span className="h-4 w-px bg-primary/30"></span>
                  <span className="text-xs font-black uppercase tracking-widest">
                    {announcements[currentSlide].category}
                  </span>
                </div>

                <p className="mb-7 max-w-full text-base font-medium leading-relaxed text-primary md:text-lg xl:text-xl">
                  {announcements[currentSlide].description}
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href="#apply" className="inline-flex items-center justify-center gap-3 rounded-none border-l-4 border-primary bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-dark shadow-[0_18px_45px_rgba(24,40,72,0.12)] transition-colors hover:bg-primary hover:text-white">
                    Apply Now <ChevronRight size={18} />
                  </a>
                  <a href="/more/ADMISSION%20REQUIREMENTS.pdf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 rounded-none border border-dark/10 bg-dark px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-primary">
                    Click Here For More
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`caption-${currentSlide}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-36 right-8 z-40 hidden max-w-sm text-right lg:block"
          >
            <p className="font-display text-lg font-bold uppercase leading-tight tracking-wider text-primary drop-shadow-[0_3px_8px_rgba(0,0,0,0.55)]">
              "{heroSlides[currentSlide].caption}"
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-0 left-1/2 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 bg-[#e7e7e7] shadow-[0_-18px_50px_rgba(24,40,72,0.12)]">
          <div className="grid grid-cols-1 divide-y divide-dark/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {heroHighlights.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setCurrentSlide(i % announcements.length)}
                className="group flex min-h-[108px] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white"
              >
                <span className="text-dark transition-colors group-hover:text-primary">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-dark/35">
                    {item.eyebrow}
                  </span>
                  <span className="block font-display text-xl font-bold uppercase leading-none tracking-wide text-dark">
                    {item.title}
                  </span>
                  <span className="mt-3 block text-sm italic text-dark/60">
                    {item.note}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="snap-section z-20 min-h-screen pt-20 pb-8 md:pt-24 md:pb-12 bg-white">
        <div className="content-container py-4 md:py-6">
          <SectionHeading subtitle="Current Programs" title="Excellence in Medical Training" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {programs.map((item, idx) => (
              <motion.a
                key={item.id}
                href={item.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${item.title} PDF details`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative block bg-accent/30 p-8 md:p-10 border-b-8 border-primary/20 hover:border-primary hover:bg-white hover:shadow-[0_20px_50px_rgba(24,40,72,0.15)] transition-all duration-500 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              >
                <div className="absolute top-0 right-0 p-4 font-display text-5xl text-primary/5 font-black group-hover:text-primary/10 transition-colors">
                  0{idx + 1}
                </div>
                <div className="bg-primary w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-white mb-6 md:mb-8 transform -skew-x-12 group-hover:skew-x-0 transition-transform">
                  <div className="transform skew-x-12 group-hover:skew-x-0 transition-transform">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-2xl md:text-3xl text-dark mb-4 md:mb-6 min-h-[3rem] md:min-h-[3.5rem] leading-tight font-black uppercase">{item.title}</h3>
                
                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-primary" />
                    <p className="text-xs md:text-sm font-bold text-dark/70 m-0 uppercase tracking-widest">Duration: {item.duration}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star size={18} className="text-primary shrink-0 mt-1" />
                    <p className="text-xs md:text-sm font-semibold text-dark/80 m-0 leading-snug tracking-tight">Entry Requirements: {item.requirements}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-primary" />
                    <p className="text-xs md:text-sm font-bold text-dark/70 m-0 uppercase tracking-widest">Tuition: {item.tuition}</p>
                  </div>
                </div>

                <div className="h-[2px] bg-dark/10 w-full mb-6 md:mb-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary transform -translateX-full group-hover:translateX-0 transition-transform duration-500"></div>
                </div>

                <div className="mt-auto">
                  <span className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs group-hover:gap-4 transition-all">
                    Full Details
                    <ChevronRight size={16} className="transition-transform" />
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Study With Us */}
      <section id="about" className="snap-section z-30 min-h-screen pt-20 pb-8 md:pt-24 md:pb-12 bg-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-[-400px] w-full lg:w-[70%] h-full bg-primary skew-x-28 z-0"></div>
        <div className="content-container py-4 md:py-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative order-2 lg:order-1"
            >
              <div className="relative group">
                <img src="/images/web/about-training.webp" className="rounded-none border-8 border-white/10 w-full object-cover" alt="Student training at Radiant Hospital Training Institute" />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply group-hover:bg-transparent transition-all duration-700"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary -z-10 skew-x-12"></div>
              </div>
            </motion.div>

            <div className="space-y-6 md:space-y-8 order-1 lg:order-2">
              <div>
                <h4 className="text-white font-display text-lg md:text-xl uppercase tracking-widest mb-2 px-4 border-l-4 border-white">About RHTI</h4>
                <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-black text-white uppercase mb-4 leading-[0.9] tracking-tighter">Educating Hearts and Minds for Health</h1>
                <p className="text-white/80 text-sm md:text-base font-medium max-w-xl">Established in January 2023, RHTI equips students with the knowledge, skills, and practical experience needed to succeed in healthcare through modern theoretical instruction, interactive training, and after-school support.</p>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                {[
                  { label: "01", title: "Our Mission", desc: "To cultivate a culture of learning by imparting the knowledge, skills, and qualities essential for quality patient care.", icon: <Rocket /> },
                  { label: "02", title: "Our Vision", desc: "To be a leading academic health center producing highly skilled graduates who drive excellence in healthcare.", icon: <Star /> },
                  { label: "03", title: "Modern Facilities", desc: "Students learn with qualified trainers, a modern library, technology centre, and well-resourced training labs.", icon: <GraduationCap /> },
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                  >
                    <div className="flex gap-4 items-center bg-white/5 p-4 md:p-6 border-l-4 border-primary hover:bg-white hover:text-dark transition-all duration-500 transform skew-18">
                      <div className="unskew-18 flex gap-6 items-center w-full">
                        <div className="text-primary">{item.icon}</div>
                        <div>
                          <h3 className="font-display text-xl uppercase font-black m-0">{item.title}</h3>
                          <p className="text-xs md:text-sm m-0 opacity-70 group-hover:opacity-100">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {coreValues.map((value) => (
                  <span key={value} className="bg-white/10 text-white/80 border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest">
                    {value}
                  </span>
                ))}
              </div>

              <div className="pt-6">
                <button className="bg-white text-dark py-4 px-10 font-display text-xl uppercase tracking-widest skew-18 hover:bg-primary hover:text-white transition-all">
                  <span className="unskew-18">View All Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Graduations Section */}
      <section id="graduations" className="snap-section z-40 min-h-screen pt-20 pb-8 md:pt-24 md:pb-12 bg-[#f8f8f0]">
        <div className="content-container py-4 md:py-8 text-center">
          <SectionHeading subtitle="Success Records" title="Our Graduation Legacy" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {[
              { year: "1st Graduation", desc: "Setting the foundation of excellence in nursing training.", img: "/images/web/graduation-01.webp" },
              { year: "2nd Graduation", desc: "Growth and expansion of our HRIT and Dental programs.", img: "/images/web/graduation-02.webp" },
              { year: "3rd Graduation", desc: "A milestone of 500+ professionals joining the local workforce.", img: "/images/web/graduation-03.webp" },
            ].map((g, idx) => (
              <motion.div key={idx} className="group relative overflow-hidden bg-white p-4 shadow-lg active:scale-95 transition-all">
                <div className="h-48 md:h-64 overflow-hidden mb-6 relative">
                  <img src={g.img} alt={g.year} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-dark/40 group-hover:bg-primary/20 transition-all"></div>
                </div>
                <h4 className="text-xl md:text-2xl text-primary mb-2 m-0 p-0 leading-none">{g.year}</h4>
                <p className="text-dark/70 text-xs md:text-sm font-semibold p-0 mt-2">{g.desc}</p>
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
                  <GraduationCap className="text-primary" size={40} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Gallery Section */}
      <section id="gallery" className="snap-section z-50 min-h-screen relative bg-dark pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 pointer-events-none"></div>
        <div className="content-container relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="text-left">
              <h4 className="text-primary font-display text-xl uppercase tracking-[0.3em] mb-2 px-4 border-l-4 border-primary">Our Gallery</h4>
              <h1 className="text-4xl md:text-7xl font-display font-black text-white uppercase leading-[0.85] tracking-tighter">Campus & Hospital Life</h1>
            </div>
            <p className="text-white/50 max-w-sm text-sm md:text-base font-medium uppercase tracking-tighter text-right">A glimpse into the daily excellence and practical training at Radiant Hospital Training Institute.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { src: "/images/web/gallery-01.webp", label: "Clinical Training" },
              { src: "/images/web/gallery-02.webp", label: "Patient Care" },
              { src: "/images/web/gallery-03.webp", label: "Clinical Equipment" },
              { src: "/images/web/gallery-04.webp", label: "Care Practice" },
              { src: "/images/web/gallery-05.webp", label: "Modern Labs" },
              { src: "/images/web/gallery-06.webp", label: "Hospital Training" },
            ].slice(0, showAllGallery ? 6 : 4).map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group overflow-hidden aspect-[4/3] border-2 border-white/5 bg-white/5"
              >
                <img 
                  src={img.src} 
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-dark/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white font-display text-lg uppercase tracking-widest mb-0">{img.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button 
              onClick={() => setShowAllGallery(!showAllGallery)}
              className="bg-primary text-white py-4 px-10 font-display text-xl uppercase tracking-[0.2em] transform -skew-x-12 hover:bg-white hover:text-dark transition-all"
            >
              <span className="inline-block transform skew-x-12">{showAllGallery ? 'View Less' : 'View More Photos'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="snap-section z-[60] min-h-screen pt-24 pb-8 md:pt-32 md:pb-12 bg-[#f8f8f0]">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
        <div className="content-container relative z-10 py-4 md:py-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="space-y-6 md:space-y-10">
              <div className="relative">
                <div className="absolute -left-12 top-0 bottom-0 w-2 bg-primary"></div>
                <motion.h4 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-primary font-display text-lg md:text-xl uppercase tracking-[0.3em] mb-2"
                >
                  Join Radiant Hospital Today
                </motion.h4>
                <motion.h2 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-3xl md:text-6xl font-display font-black text-dark uppercase leading-[0.8] mb-6"
                >
                  Online Admission <br className="hidden md:block" /><span className="text-primary">Application Form</span>
                </motion.h2>
                <p className="text-dark/60 font-medium mb-10 max-w-lg">Take the first step towards a rewarding medical career. Our application process is fast, simple, and secure.</p>
                <div className="space-y-6">
                  <div className="flex gap-4 md:gap-6 items-start">
                    <div className="bg-white w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center text-primary shadow-xl">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-dark font-display text-lg md:text-xl uppercase mb-1">Easy Process</h4>
                      <p className="text-dark/70 text-xs md:text-sm leading-relaxed font-medium m-0">Fill in your details and our team will get back to you within 24 hours.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-6 items-start">
                    <div className="bg-white w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center text-primary shadow-xl">
                      <Star size={20} />
                    </div>
                    <div>
                      <h4 className="text-dark font-display text-lg md:text-xl uppercase mb-1">Qualified Trainers</h4>
                      <p className="text-dark/70 text-xs md:text-sm leading-relaxed font-medium m-0">Learn from experienced medical professionals in a real hospital environment.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-6 md:p-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-t-8 border-primary relative"
            >
              <div className="flex mb-8 md:mb-12 gap-2">
                {[1, 2, 3].map(step => (
                  <div key={step} className={`h-1 flex-1 transition-all duration-500 ${step <= formStep ? 'bg-primary' : 'bg-dark/10'}`}></div>
                ))}
              </div>

              <form className="space-y-6 md:space-y-8" onSubmit={(e) => { e.preventDefault(); if(formStep < 3) setFormStep(formStep + 1); }}>
                {formStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                    <h3 className="text-2xl md:text-3xl font-display font-black text-dark uppercase mb-4 md:mb-8 text-center sm:text-left">Personal Information</h3>
                    <div className="grid sm:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-dark/80 ml-1">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-dark/80 ml-1">Email Address</label>
                        <input type="email" placeholder="john@example.com" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-dark/80 ml-1">Phone Number</label>
                        <input type="tel" placeholder="0700 000 000" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-dark/80 ml-1">Date of Birth</label>
                        <input type="date" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                      </div>
                    </div>
                  </motion.div>
                )}

                {formStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 md:space-y-8">
                    <h3 className="text-2xl md:text-3xl font-display font-black text-dark uppercase mb-4 md:mb-8 text-center sm:text-left">Program & Education</h3>
                    <div className="space-y-4 md:space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-dark/40 ml-1">Select Program</label>
                        <select className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-bold text-dark text-sm md:text-base" required>
                          <option value="">Choose a certificate program...</option>
                          <option value="cna">Certificate in Nursing Assistant (CNA)</option>
                          <option value="hrit">Certificate in Health Records (HRIT)</option>
                          <option value="dental">Certificate in Dental Assistant</option>
                        </select>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-dark/40 ml-1">KCSE Mean Grade</label>
                          <input type="text" placeholder="e.g. C-" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-dark/40 ml-1">KCSE Year</label>
                          <input type="number" placeholder="2023" className="w-full bg-accent/20 border-b-2 border-dark/10 p-4 focus:border-primary outline-none transition-all font-medium text-sm md:text-base" required />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {formStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center py-6 md:py-10 space-y-4 md:space-y-6">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-primary/10 text-primary mx-auto flex items-center justify-center rounded-full mb-4 md:mb-8">
                      <Users size={32} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-display font-black text-dark uppercase">Application Ready!</h3>
                    <p className="text-dark/50 font-medium max-w-sm mx-auto uppercase tracking-tighter text-xs md:text-sm">Your information has been validated. By clicking submit below, you agree to our admission policies.</p>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-10 border-t border-dark/5">
                  {formStep > 1 && (
                    <button type="button" onClick={() => setFormStep(formStep - 1)} className="flex-1 border-2 border-dark/10 py-4 md:py-5 font-display text-lg md:text-xl uppercase tracking-widest hover:border-primary hover:text-primary transition-all skew-18">
                      <span className="unskew-18">Back</span>
                    </button>
                  )}
                  <button type="submit" className="flex-[2] bg-primary text-white py-4 md:py-5 font-display text-lg md:text-xl uppercase tracking-widest hover:bg-dark transition-all transform skew-18 block">
                    <span className="unskew-18">{formStep === 3 ? 'Submit Application' : 'Next Step'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      </main>

      {/* Footer / Contact */}
      <footer id="contact" className="snap-section z-[70] min-h-screen bg-dark text-white pt-20 md:pt-32 pb-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-dark/95 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/web/footer-bg.webp')] bg-cover bg-center mix-blend-multiply opacity-20"></div>
        <div className="absolute -bottom-20 -left-20 text-white/5 pointer-events-none opacity-5">
          <Heart size={600} />
        </div>

        <div className="flex-1 flex flex-col pt-20 pb-8">
          <div className="content-container mb-4 md:mb-6">
            <h4 className="text-primary font-display text-base md:text-lg uppercase tracking-widest mb-2">Get In Touch</h4>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase leading-tight">Contact RHTI</h1>
          </div>

          <div className="content-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 relative z-10">
          <div className="flex flex-col gap-6 md:gap-8">
            <a href="#" className="flex items-center gap-3">
              <div className="bg-primary p-2 transform -skew-x-12">
                <Heart className="text-white transform skew-x-12" size={32} fill="white" />
              </div>
              <h1 className="text-2xl font-display font-black text-white leading-none">RADIANT <span className="text-primary">HOSPITAL</span></h1>
            </a>
            <p className="text-white/70 leading-relaxed font-medium">A premier healthcare training institution blending modern instruction, interactive training, certified trainers, and practical hospital experience.</p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map(({ name, href, Icon }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`RHTI on ${name}`} className="bg-white/10 w-12 h-12 flex items-center justify-center hover:bg-primary transition-all text-white/60 hover:text-white">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white text-2xl mb-8">Quick Links</h4>
            <ul className="space-y-4 font-display text-white/70 uppercase tracking-[0.2em] text-sm">
              <li><a href="#" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-all" /> Home</a></li>
              <li><a href="#about" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-all" /> About RHTI</a></li>
              <li><a href="#programs" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-all" /> Professional Programs</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors flex items-center gap-2 group"><ChevronRight size={14} className="group-hover:translate-x-1 transition-all" /> Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-2xl mb-8">Contact Info</h4>
            <div className="space-y-8">
              <div className="flex gap-4">
                <MapPin className="text-primary shrink-0 mt-1" size={24} />
                <p className="text-sm text-white/80 font-semibold uppercase leading-loose m-0">
                  <strong>Address:</strong> P.O Box 63683 - 00607, Kasarani, Nairobi, Kenya<br />
                  <strong>Location:</strong> Radiant Hospital - Kasarani Sportsview Branch, Kasarani, Nairobi
                </p>
              </div>
              <div className="flex gap-4">
                <Phone className="text-primary shrink-0" size={24} />
                <p className="text-lg text-white font-black m-0 tracking-widest">0712 588 588</p>
              </div>
              <div className="flex gap-4">
                <Mail className="text-primary shrink-0" size={24} />
                <p className="text-sm text-white/80 font-semibold leading-loose m-0">
                  radianthospitaltraininginstltd@gmail.com<br />
                  rhti@radianthospitals.org
                </p>
              </div>
            </div>
          </div>

          <div>
             <h4 className="text-white text-2xl mb-8">Our Intakes</h4>
             <div className="bg-white/5 p-8 border-l-4 border-primary">
                <p className="text-white/70 italic text-lg leading-relaxed m-0 font-medium">"RHTI admits students in January, March, June, and September. The CNA program admits new students every month."</p>
                <p className="text-primary font-display uppercase tracking-widest text-sm mt-6 m-0">Flexible fee payment plans available</p>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-white/50 text-xs font-bold uppercase tracking-[0.3em] order-2 md:order-1">© 2026 Radiant Hospital Training Institute. All Rights Reserved.</p>
          <div className="flex gap-12 font-display text-white/70 uppercase tracking-widest text-xs order-1 md:order-2">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

      {/* WhatsApp admissions agent */}
      <a
        href="https://wa.me/254712588588?text=Hello%20RHTI%2C%20I%20would%20like%20to%20ask%20about%20admissions%20and%20programs."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 md:right-8 z-[120] flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-4 text-white shadow-2xl transition-colors hover:bg-dark"
        aria-label="Chat with RHTI admissions on WhatsApp"
      >
        <Phone size={22} />
        <span className="hidden text-sm font-black uppercase tracking-widest sm:inline">WhatsApp RHTI</span>
      </a>

      {/* Back to top */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-10 right-10 p-5 bg-primary text-white shadow-2xl transition-all z-50 transform -skew-x-12 hover:-rotate-12 ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <ChevronRight className="-rotate-90 transform skew-x-12" size={24} />
      </button>
    </div>
  );
}
