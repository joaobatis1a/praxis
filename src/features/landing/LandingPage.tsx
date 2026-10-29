import { LandingHeader } from './components/LandingHeader'
import { HeroSection } from './components/HeroSection'
import { Manifesto } from './components/Manifesto'
import { ModulesSection } from './components/ModulesSection'
import { InsideSection } from './components/InsideSection'
import { FirstDaySection } from './components/FirstDaySection'
import { ClosingSection } from './components/ClosingSection'
import { LandingFooter } from './components/LandingFooter'

// Sections are sheets that alternate dark and light, each sliding up over the
// one before it with rounded shoulders.
export function LandingPage() {
  return (
    <div className="dark relative min-h-screen overflow-x-clip bg-[#06080d]">
      <LandingHeader />
      <main>
        <HeroSection />
        <Manifesto />
        <ModulesSection />
        <InsideSection />
        <FirstDaySection />
        <ClosingSection />
      </main>
      <LandingFooter />
    </div>
  )
}
