import { ContentSection } from '../components/content-section';
import { ProfileForm } from './profile-form';

export function Profile() {
  return (
    <ContentSection title="Profil" desc="Bu senin profilin.">
      <ProfileForm />
    </ContentSection>
  );
}
