
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Briefcase, Handshake, Lightbulb, Users, FaFacebook, FaTwitter, FaLinkedin, FaTiktok, FaYoutube, FaInstagram, Heart, Rss } from 'lucide-react';
import { FaBullseye, FaEye, FaVideo, FaBullhorn, FaUsers as FaUsersIcon, FaStar, FaHandshake, FaGraduationCap, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';


const values = [
  { title: "Professionalism", description: "We deliver high-quality, respectful performances." },
  { title: "Creativity", description: "We value originality and artistic expression." },
  { title: "Teamwork", description: "We grow and perform together as one co-op family." },
  { title: "Empowerment", description: "We transform young lives through skills and opportunities." },
  { title: "Integrity", description: "We honor commitments and uphold moral standards." },
];

const services = [
  { icon: FaVideo, title: "Video Production", description: "Professional video content creation for marketing, education, and entertainment purposes" },
  { icon: FaBullhorn, title: "Digital Marketing", description: "Strategic social media campaigns and brand promotion across multiple platforms" },
  { icon: FaUsersIcon, title: "Youth Training", description: "Skills development programs for unemployed youth in media production and marketing" },
  { icon: FaStar, title: "Talent Development", description: "Identifying and nurturing creative talent in drama, content creation, and digital arts" },
  { icon: FaHandshake, title: "Brand Partnerships", description: "Collaborative marketing solutions that benefit both brands and our creative community" },
  { icon: FaGraduationCap, title: "Educational Content", description: "Creating informative and inspiring content that educates and empowers communities" },
];

const team = [
  {
    name: "John Njuguna Maina",
    title: "Chairperson",
    image: "/images/chairperson.jpg",
    bio: "Njuguna is a passionate and visionary leader dedicated to youth empowerment through creative arts and cooperative enterprise. With over 10 years of experience in theatre performance, creative facilitation, and youth mobilization, he has trained and mentored numerous young talents across Kenya. He is professionally trained in theatre arts and has practiced performance and youth-based art for both educational and entertainment purposes. As a cooperator by profession, John combines his expertise in cooperative management with his deep commitment to nurturing youth potential—helping them transform their talents into sustainable livelihoods. Under his leadership, Chipukizi VOD has grown into a vibrant platform for talent development, brand promotion, and youth engagement.",
  },
  {
    name: "Vincent Ogonji",
    title: "Treasurer",
    image: "/images/treasurer.jpg",
    bio: "Vincent is a results-driven and visionary leader passionate about youth empowerment, financial accountability, and cooperative development. With over 5 years of experience in finance, community leadership, and creative arts, he brings a unique blend of financial expertise and youth-focused innovation to every initiative he supports. He holds a Master of Business Administration (MBA) and a Bachelor of Commerce in Finance from the Cooperative University of Kenya, where he also served in several student leadership roles. His academic research on “Bookkeeping Skills and Financial Performance of SMEs in Kajiado County” reflects his commitment to strengthening financial literacy in underserved communities. As the Treasurer of Chipukizi VOD, Vincent oversees all financial operations, including budgeting, reporting, and resource mobilization. His strategic financial leadership has enabled the platform to expand its reach, achieving a 20% increase in audience engagement through well-managed theatre programs and youth outreach. Vincent combines his professional financial background with a strong passion for talent development and community upliftment. Under his financial stewardship, Chipukizi VOD has grown into a thriving platform for youth mentorship, brand promotion, and social impact through the arts.",
  },
  {
    name: "Felix Odhiambo",
    title: "IT Technician",
    image: "/images/fel.png",
    bio: "Felix is the digital engine behind Chipukizi VOD. With a BSc in IT from the Cooperative University of Kenya and a passion for youth and tech, he powers everything from system uptime to virtual stage lights. His focus on tech for social impact has helped increase digital engagement by 20%—proving that tech-savvy can spark real change. Whether solving glitches or mentoring creatives, Felix makes innovation feel personal.",
  },
];

const contactDetails = [
    { icon: FaEnvelope, title: "Email", content: <a href="mailto:voiceofdramacoop@gmail.com" className="hover:text-primary">voiceofdramacoop@gmail.com</a> },
    { icon: FaPhone, title: "Phone", content: <><a href="tel:0725710350" className="hover:text-primary">0725710350</a> / <a href="tel:0782909349" className="hover:text-primary">0782909349</a></> },
    { icon: FaClock, title: "Business Hours", content: "Mon - Fri: 8:00 AM - 6:00 PM | Sat: 9:00 AM - 4:00 PM" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[400px] bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/web,11.jpg')" }}>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">About Chipukizi VOD</h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">Empowering Youth Through Creative Excellence</p>
        </div>
      </section>

      <main className="container py-12 md:py-16">
        {/* Our Story */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <h2 className="text-3xl font-bold font-headline text-foreground mb-4">Our Story</h2>
              <p>Established as a pioneering force in Kenya's entertainment and digital marketing landscape, Chipukizi VOD (Voice of Drama) Cooperative Society Limited is the region's premier choice for creative content production, digital marketing, and youth empowerment initiatives. We are a registered cooperative society under the Kenyan Cooperative Act, fully licensed and insured, providing comprehensive entertainment and marketing solutions to clients across East Africa.</p>
              <p>As one of Kenya's most innovative youth-driven cooperatives, we are the local experts in video production, social media marketing, brand promotion, and talent development. We provide content creation, marketing campaigns, and training services for individuals, businesses, and organizations throughout Kenya and beyond. Our creative hub, training facilities, and well-equipped production studio are strategically located in Kenya, enabling us to provide fast, professional services to clients across the region.</p>
              <p>We regularly collaborate with numerous well-known brands, local businesses, NGOs, educational institutions, government agencies, and international organizations. These partners count on Chipukizi VOD Cooperative Society for their digital marketing and entertainment needs, and you can too!</p>
            </div>
            <div className="relative h-80 md:h-full rounded-lg overflow-hidden shadow-lg">
              <Image src="/images/w1eb.jpg" alt="Chipukizi VOD Team" fill objectFit="cover" data-ai-hint="team photo" />
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="text-center">
                    <CardHeader>
                        <FaBullseye className="mx-auto text-4xl text-primary mb-4" />
                        <CardTitle className="font-headline text-2xl">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">To inform, entertain, and promote societal values by empowering youth through professional and decent creative performances that inspire, educate, and uplift.</p>
                    </CardContent>
                </Card>
                <Card className="text-center">
                    <CardHeader>
                        <FaEye className="mx-auto text-4xl text-primary mb-4" />
                        <CardTitle className="font-headline text-2xl">Our Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">To be the leading youth-powered entertainment and brand-promotion cooperative in Kenya, recognized for excellence, creativity, and transformative impact.</p>
                    </CardContent>
                </Card>
            </div>
        </section>

        {/* Core Values */}
        <section className="mb-16 text-center">
            <h2 className="text-3xl font-bold font-headline mb-8">Our Core Values</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                {values.map(value => (
                    <div key={value.title}>
                        <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* What We Do */}
        <section className="mb-16 text-center">
            <h2 className="text-3xl font-bold font-headline mb-8">What We Do</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map(service => (
                    <Card key={service.title}>
                        <CardHeader>
                            <service.icon className="mx-auto text-3xl text-primary mb-3" />
                            <CardTitle className="text-xl">{service.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{service.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>

        {/* Leadership Team */}
        <section className="mb-16">
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Leadership Team</h2>
            <div className="space-y-12">
                {team.map((member, index) => (
                    <Card key={member.name} className="overflow-hidden">
                        <div className={`grid md:grid-cols-3 items-start`}>
                            <div className={`relative h-96 w-full md:h-auto md:aspect-[4/5] ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                                <Image src={member.image} alt={member.name} fill objectFit="cover" />
                            </div>
                            <div className={`md:col-span-2 p-8 flex flex-col justify-center ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                                <h3 className="text-2xl font-bold font-headline">{member.name}</h3>
                                <p className="text-primary font-semibold text-lg mb-4">{member.title}</p>
                                <p className="text-muted-foreground">{member.bio}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>

        {/* Contact Info */}
        <section>
            <h2 className="text-3xl font-bold font-headline text-center mb-8">Get In Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 grid sm:grid-cols-2 gap-8">
                    {contactDetails.map(detail => (
                        <Card key={detail.title}>
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <detail.icon className="text-2xl text-primary"/>
                                <CardTitle className="text-xl">{detail.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-muted-foreground">
                                {detail.content}
                            </CardContent>
                        </Card>
                    ))}
                     <Card className="sm:col-span-2">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <FaMapMarkerAlt className="text-2xl text-primary"/>
                            <CardTitle className="text-xl">Office Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground">The Co-operative University of Kenya, Karen<br />About 20km from Nairobi CBD, off Lang'ata Road</p>
                            <a href="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.6833763739523!2d36.725379174965795!3d-1.366653998620414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMjEnNjAuMCJTIDM2wrA0Myc0MC42IkU!5e0!3m2!1sen!2ske!4v1753279855967!5m2!1sen!2ske" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-2 inline-block">
                                View on Google Maps
                            </a>
                        </CardContent>
                    </Card>
                </div>
                <div className="w-full h-80 md:h-full rounded-lg overflow-hidden shadow-lg">
                    <iframe
                    src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3988.6833763739523!2d36.725379174965795!3d-1.366653998620414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwMjEnNjAuMCJTIDM2wrA0Myc0MC42IkU!5e0!3m2!1sen!2ske!4v1753279855967!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
            </div>
        </section>
      </main>
    </>
  );
}
