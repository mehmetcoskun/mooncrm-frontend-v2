import { ContentSection } from '../components/content-section';
import { TwoFactorAuth } from './two-factor-auth';

export function Security() {
  return (
    <ContentSection
      title="Güvenlik"
      desc="Hesabınızın güvenlik ayarlarını yönetin."
    >
      <TwoFactorAuth />
    </ContentSection>
  );
}
