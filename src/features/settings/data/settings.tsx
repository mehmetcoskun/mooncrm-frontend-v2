import {
  Mail,
  MessageSquare,
  MessageCircle,
  UserPlus,
  MessageSquareText,
  Bell,
  FileText,
  ShoppingCart,
  MailCheck,
  Stethoscope,
  Building,
  Wrench,
  CircleDot,
  Plane,
  Users,
  Tag,
  Folder,
  Phone,
  Facebook,
} from 'lucide-react';
import { DailyReportSettingsSidebar } from '../components/daily-report-settings-sidebar';
import { EmailSettingsSidebar } from '../components/email-settings-sidebar';
import { FacebookSettingsSidebar } from '../components/facebook-settings-sidebar';
import { LeadAssignmentSettingsSidebar } from '../components/lead-assignment-settings-sidebar';
import { SalesEmailSettingsSidebar } from '../components/sales-email-settings-sidebar';
import { SalesNotificationSettingsSidebar } from '../components/sales-notification-settings-sidebar';
import { SmsSettingsSidebar } from '../components/sms-settings-sidebar';
import { UserNotificationSettingsSidebar } from '../components/user-notification-settings-sidebar';
import { VapiSettingsSidebar } from '../components/vapi-settings-sidebar';
import { WelcomeMessageSettingsSidebar } from '../components/welcome-message-settings-sidebar';
import { WhatsappSettingsSidebar } from '../components/whatsapp-settings-sidebar';

export const settings = [
  {
    name: 'E-Posta Ayarları',
    logo: <Mail />,
    desc: 'E-posta sunucu ve şablon ayarlarını yapılandırın.',
    component: EmailSettingsSidebar,
    permission: 'setting_Mail',
  },
  {
    name: 'SMS Ayarları',
    logo: <MessageSquare />,
    desc: 'SMS entegrasyonu ve şablon ayarlarını yönetin.',
    component: SmsSettingsSidebar,
    permission: 'setting_Sms',
  },
  {
    name: 'WhatsApp Ayarları',
    logo: <MessageCircle />,
    desc: 'WhatsApp entegrasyon ve mesaj ayarlarını düzenleyin.',
    component: WhatsappSettingsSidebar,
    permission: 'setting_Whatsapp',
  },
  {
    name: 'Facebook Ayarları',
    logo: <Facebook />,
    desc: 'Facebook hesabınızı bağlayın ve sayfalarınızı yönetin.',
    component: FacebookSettingsSidebar,
    permission: 'setting_Facebook',
  },
  {
    name: 'VAPI AI Ayarları',
    logo: <Phone />,
    desc: 'VAPI AI ses asistanı entegrasyonu için ayarlar.',
    component: VapiSettingsSidebar,
    permission: 'setting_Vapi',
  },
  {
    name: 'Lead Atama Strateji Ayarları',
    logo: <UserPlus />,
    desc: 'Lead dağıtım ve atama stratejilerini belirleyin.',
    component: LeadAssignmentSettingsSidebar,
    permission: 'setting_LeadAssignment',
  },
  {
    name: 'Karşılama Mesaj Ayarları',
    logo: <MessageSquareText />,
    desc: 'Otomatik karşılama mesajlarını yapılandırın.',
    component: WelcomeMessageSettingsSidebar,
    permission: 'setting_WelcomeMessage',
  },
  {
    name: 'Kullanıcı Bildirim Ayarları',
    logo: <Bell />,
    desc: 'Kullanıcı bildirim tercihlerini yönetin.',
    component: UserNotificationSettingsSidebar,
    permission: 'setting_UserNotification',
  },
  {
    name: 'Günlük Rapor Ayarları',
    logo: <FileText />,
    desc: 'Günlük rapor formatı ve gönderim ayarları.',
    component: DailyReportSettingsSidebar,
    permission: 'setting_DailyReport',
  },
  {
    name: 'Satış Bildirim Ayarları',
    logo: <ShoppingCart />,
    desc: 'Satış ile ilgili bildirimleri yapılandırın.',
    component: SalesNotificationSettingsSidebar,
    permission: 'setting_SalesNotification',
  },
  {
    name: 'Satış E-Posta Ayarları',
    logo: <MailCheck />,
    desc: 'Satış sürecine özel e-posta şablonları.',
    component: SalesEmailSettingsSidebar,
    permission: 'setting_SalesMail',
  },
  {
    name: 'E-Posta Şablonları',
    logo: <Mail />,
    desc: 'E-posta şablonlarını oluşturun ve yönetin.',
    route: '/email-templates',
    permission: 'email_template_Access',
  },
  {
    name: 'SMS Şablonları',
    logo: <MessageSquare />,
    desc: 'SMS şablonlarını oluşturun ve yönetin.',
    route: '/sms-templates',
    permission: 'sms_template_Access',
  },
  {
    name: 'WhatsApp Şablonları',
    logo: <MessageCircle />,
    desc: 'WhatsApp şablonlarını oluşturun ve yönetin.',
    route: '/whatsapp-templates',
    permission: 'whatsapp_template_Access',
  },
  {
    name: 'WhatsApp Oturumları',
    logo: <Users />,
    desc: 'WhatsApp oturumlarını yönetin.',
    route: '/whatsapp-sessions',
    permission: 'whatsapp_session_Access',
  },
  {
    name: 'Web Formları',
    logo: <FileText />,
    desc: 'Web formlarını yönetin.',
    route: '/web-forms',
    permission: 'web_form_Access',
  },
  {
    name: 'Otel Yönetimi',
    logo: <Building />,
    desc: 'Otel listesini oluşturun ve yönetin.',
    route: '/hotels',
    permission: 'partner_hotel_Access',
  },
  {
    name: 'Transfer Yönetimi',
    logo: <Plane />,
    desc: 'Transfer listesini oluşturun ve yönetin.',
    route: '/transfers',
    permission: 'partner_transfer_Access',
  },
  {
    name: 'Kategori Yönetimi',
    logo: <Folder />,
    desc: 'Kategori listesini oluşturun ve yönetin.',
    route: '/categories',
    permission: 'category_Access',
  },
  {
    name: 'Etiket Yönetimi',
    logo: <Tag />,
    desc: 'Etiket listesini oluşturun ve yönetin.',
    route: '/tags',
    permission: 'tag_Access',
  },
  {
    name: 'Durum Yönetimi',
    logo: <CircleDot />,
    desc: 'Durum listesini oluşturun ve yönetin.',
    route: '/statuses',
    permission: 'status_Access',
  },
  {
    name: 'Hizmet Yönetimi',
    logo: <Wrench />,
    desc: 'Hizmet listesini oluşturun ve yönetin.',
    route: '/services',
    permission: 'service_Access',
  },
  {
    name: 'Doktor Yönetimi',
    logo: <Stethoscope />,
    desc: 'Doktor listesini oluşturun ve yönetin.',
    route: '/doctors',
    permission: 'doctor_Access',
  },
];
