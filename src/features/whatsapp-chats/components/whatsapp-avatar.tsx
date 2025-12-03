import { useState, useEffect } from 'react';
import { getProfilePicture } from '@/services/whatsapp-service';
import whatsappAvatar from '@/assets/whatsapp-avatar.png';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type WhatsAppAvatarProps = {
  session: string;
  phone: string;
};

export function WhatsAppAvatar({ session, phone }: WhatsAppAvatarProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        // Telefon numarasını WhatsApp formatına çevir (@c.us)
        const cleanPhone = phone.replace(/\D/g, '').replace(/^(\+)|^0/g, '');
        const contactId = `${cleanPhone}@c.us`;
        const result = await getProfilePicture(session, contactId);
        if (result?.profilePictureURL) {
          setProfilePicture(result.profilePictureURL);
        }
      } catch (_error) {
        // Profil fotoğrafı bulunamazsa fallback'e düş
      }
    };

    if (session && phone) {
      fetchProfilePicture();
    }
  }, [session, phone]);

  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      <AvatarImage
        src={profilePicture || whatsappAvatar}
        alt={session}
        onError={() => setProfilePicture(null)}
      />
      <AvatarFallback>
        <img
          src={whatsappAvatar}
          alt={session}
          className="h-full w-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  );
}
