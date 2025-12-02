import { ContentSection } from '../components/content-section';
import { AppearanceForm } from './appearance-form';

export function Appearance() {
  return (
    <ContentSection
      title="Görünüm"
      desc="Uygulamanın görünümünü özelleştirin. Gündüz ve gece temaları arasında otomatik olarak geçiş yapın."
    >
      <AppearanceForm />
    </ContentSection>
  );
}
