import { LandingHeader } from './components/LandingHeader'
import { HeroSection } from './components/HeroSection'
import { ProblemsSection } from './components/ProblemsSection'
import { FeaturesSection } from './components/FeaturesSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { SocialProofSection } from './components/SocialProofSection'
import { FinalCtaSection } from './components/FinalCtaSection'
import { LandingFooter } from './components/LandingFooter'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  )
}
