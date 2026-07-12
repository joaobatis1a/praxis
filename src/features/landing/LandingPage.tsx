import { LandingHeader } from './components/LandingHeader'
import { LandingBackground } from './components/LandingBackground'
import { HeroSection } from './components/HeroSection'
import { NarrativeSection } from './components/NarrativeSection'
import { ProductTourSection } from './components/ProductTourSection'
import { RolesSection } from './components/RolesSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { FinalCtaSection } from './components/FinalCtaSection'
import { LandingFooter } from './components/LandingFooter'
import { ScrollProgressBar } from './components/ScrollProgressBar'
import { BackToTopButton } from './components/BackToTopButton'

export function LandingPage() {
  return (
    <div id="top" className="dark relative min-h-screen overflow-x-clip">
      <LandingBackground />
      <ScrollProgressBar />
      <LandingHeader />
      <main className="relative z-10">
        <HeroSection />
        <NarrativeSection />
        <ProductTourSection />
        <RolesSection />
        <HowItWorksSection />
        <FinalCtaSection />
      </main>
      <LandingFooter className="relative z-10" />
      <BackToTopButton />
    </div>
  )
}
