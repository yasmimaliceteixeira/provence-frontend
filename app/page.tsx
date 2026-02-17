import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import About from "@/components/about"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import Testimonials from "@/components/testimonials"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8DCF4] via-white to-[#AED7ED]/20">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <About />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
