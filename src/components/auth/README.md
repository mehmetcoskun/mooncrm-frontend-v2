# Yetkilendirme ve Erişim Kontrol Modülü

Bu modül, kullanıcı yetkilerini, rollerini ve organizasyon erişimini kontrol etmek için gerekli bileşenleri ve yardımcı fonksiyonları içerir. Kullanıcının sahip olduğu rollere, yetkilere ve seçili organizasyona dayalı olarak UI bileşenlerini veya sayfa içeriğini koşullu olarak gösterebilir veya gizleyebilirsiniz.

## Yetki Kontrolü

### 1. Bileşenlerde Yetki Kontrolü

`PermissionGuard` bileşeni, belirli bir içeriği kullanıcının yetkilerine göre koşullu olarak göstermek için kullanılabilir:

```tsx
import { PermissionGuard } from '@/components/auth/permission-guard';

// Tek bir yetki kontrolü
<PermissionGuard permission="customer_Create">
  <button>Yeni Müşteri Ekle</button>
</PermissionGuard>

// Çoklu yetki kontrolü (tümüne sahip olmalı)
<PermissionGuard permissions={["customer_Edit", "customer_Delete"]}>
  <div>İçerik</div>
</PermissionGuard>

// En az bir yetkiye sahip olma kontrolü
<PermissionGuard anyPermission={["customer_BulkDelete", "customer_BulkUpdate"]}>
  <div>İçerik</div>
</PermissionGuard>

// Rol ID kontrolü
<PermissionGuard roleId={2}>
  <div>Admin İçeriği</div>
</PermissionGuard>

// Çoklu rol ID kontrolü
<PermissionGuard roleIds={[2, 3]}>
  <div>Admin ve Manager İçeriği</div>
</PermissionGuard>

// En az bir rol ID kontrolü
<PermissionGuard anyRoleId={[1, 2]}>
  <div>Developer veya Admin İçeriği</div>
</PermissionGuard>

// Alternatif içerik (fallback) ile
<PermissionGuard
  permission="dashboard_Admin"
  fallback={<p>Erişiminiz yok</p>}
>
  <div>Yönetici Kontrol Paneli</div>
</PermissionGuard>
```

### 2. Hook Kullanımı

`usePermissions` hook'u, bileşenlerinizde daha esnek yetki kontrolü yapmanıza olanak tanır:

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const {
    hasPermission,
    hasRole, // Rol ID'ye göre kontrol eder
    hasAnyPermission,
    hasAnyRole, // Rol ID listesine göre kontrol eder
    hasAllPermissions,
    hasAllRoles, // Rol ID listesine göre kontrol eder
    getAllPermissions,
    getPermissionsByCategory,
    hasPermissionInCategory,
    isSuperUser, // Süper kullanıcı veya süper rol kontrolü
  } = usePermissions();

  // Süper kullanıcı veya süper rol kontrolü
  const isSuper = isSuperUser(); // ID'si 1 olan kullanıcı veya Developer rolü (ID: 1)

  // Tek bir yetki kontrolü
  const canCreateCustomer = hasPermission('customer_Create');

  // Çoklu yetki kontrolü
  const canManageCustomers = hasAllPermissions([
    'customer_Edit',
    'customer_Delete',
  ]);

  // En az bir yetkiye sahip olma kontrolü
  const canBulkManage = hasAnyPermission([
    'customer_BulkDelete',
    'customer_BulkUpdate',
  ]);

  // Rol ID kontrolü
  const isAdmin = hasRole(2); // ID'si 2 olan rol (Admin)

  // Kategori kontrolü
  const hasCustomerPermissions = hasPermissionInCategory('customer_');

  return (
    <div>
      {canCreateCustomer && <button>Yeni Müşteri Ekle</button>}

      {canManageCustomers && <div>Müşteri Yönetimi İçeriği</div>}

      {canBulkManage && <button>Toplu İşlemler</button>}

      {isAdmin && <div>Yönetici İçeriği</div>}

      {isSuper && <div>Süper Kullanıcı İçeriği</div>}
    </div>
  );
}
```

### 3. Menülerde Yetki Kontrolü

Menü öğelerini tanımlarken yetki ve rol gereksinimlerini belirtebilirsiniz:

```tsx
const menuItems: NavMenuItems = {
  items: [
    {
      title: 'Kontrol Paneli',
      url: '/',
      icon: IconLayoutDashboard,
      permission: 'dashboard_Access', // Yalnızca bu yetkiye sahip kullanıcılara göster
    },
    {
      title: 'Müşteriler',
      icon: IconUsers,
      // Kategorideki herhangi bir yetkiye sahip olanlar görebilir
      anyPermission: ['customer_Access', 'customer_Create', 'customer_Edit'],
      items: [
        {
          title: 'Müşteriler Listesi',
          url: '/customers',
          icon: IconUser,
          permission: 'customer_Access', // Alt öğeler için ayrı yetki kontrolü
        },
        {
          title: 'Yeni Müşteri',
          url: '/customers/new',
          icon: IconPlus,
          permission: 'customer_Create',
        },
      ],
    },
    {
      title: 'Yönetim',
      icon: IconSettings,
      roleId: 2, // Yalnızca ID'si 2 olan role (Admin) sahip kullanıcılara göster
      items: [
        {
          title: 'Kullanıcılar',
          url: '/users',
          icon: IconUser,
        },
        {
          title: 'Roller',
          url: '/roles',
          icon: IconShield,
          roleId: 1, // Yalnızca Developer rolü (ID: 1) görebilir
        },
        {
          title: 'İzinler',
          url: '/permissions',
          icon: IconLock,
          roleIds: [1, 2], // Hem Developer hem de Admin görebilir
        },
      ],
    },
  ],
};
```

## Organizasyon Koruma

Bazı sayfalar veya içerikler, kullanıcının bir organizasyon (firma) seçmesini gerektirebilir. Organizasyon koruması, kullanıcının organizasyon seçimi yapmadan belirli içerikleri görüntülemesini engeller.

### 1. Sayfa İçeriğinde Organizasyon Koruması

`OrganizationGuard` bileşeni, belirli bir içeriği organizasyon seçimine göre koşullu olarak göstermek için kullanılabilir:

```tsx
import { OrganizationGuard } from '@/components/auth/organization-guard';

// İçeriği organizasyon seçimine göre koruma
<OrganizationGuard>
  <div>
    Bu içerik yalnızca organizasyon seçildikten sonra görüntülenecektir.
  </div>
</OrganizationGuard>;
```

### 2. Bir Bileşeni Organizasyon Koruması ile Sarmak

`withOrganizationRequired` HOC (Higher Order Component), bir bileşeni organizasyon koruması ile sarmalamak için kullanılabilir:

```tsx
import { withOrganizationRequired } from '@/components/auth/with-organization-required';

// Normal bileşen
function CustomerPage() {
  // ...
}

// Organizasyon korumalı bileşen
const ProtectedCustomerPage = withOrganizationRequired(CustomerPage);

// Rotada kullanımı
export const Route = createFileRoute('/customers')({
  component: ProtectedCustomerPage,
});
```

### 3. Programatik Olarak Organizasyon Kontrolü

Bileşenlerinizde programatik olarak organizasyon kontrolü yapmak için doğrudan `useAuthStore` kullanabilirsiniz:

```tsx
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  // Kullanıcı bilgisini ve organizasyon seçimini kontrol et
  const { user } = useAuthStore();
  const hasOrganization = !!user?.organization_id;

  // Organizasyon seçilmemişse özel mesaj göster
  if (!hasOrganization) {
    return <p>Lütfen önce bir firma seçin</p>;
  }

  return (
    <div>
      <h1>İçerik</h1>
      {/* ... */}
    </div>
  );
}
```

## Süper Kullanıcı ve Süper Rol

Sistemde iki tür süper erişim bulunur:

1. **Süper Kullanıcı**: ID'si 1 olan kullanıcı, otomatik olarak tüm yetkilere ve rollere erişime sahiptir.

2. **Süper Rol**: ID'si 1 olan rol (Developer rolü), otomatik olarak tüm yetkilere erişime sahiptir.

Süper kullanıcı veya süper role sahip kullanıcılar, tüm yetki ve rol kontrollerini otomatik olarak geçer.

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function AdminPanel() {
  const { isSuperUser } = usePermissions();

  // Süper kullanıcı veya süper rol kontrolü
  const isSuper = isSuperUser();

  if (isSuper) {
    return <div>Tam Yetkili Yönetici Paneli</div>;
  }

  return <div>Sınırlı Yönetici Paneli</div>;
}
```

## Yardımcı Fonksiyonlar

Direkt kullanım için yardımcı fonksiyonlar da mevcuttur:

```tsx
import { User } from '@/types/auth';
import {
  hasPermission,
  hasRoleById,
  // Rol ID'ye göre kontrol eder
  hasAnyPermission,
  hasAnyRoleById,
  // Rol ID listesine göre kontrol eder
  hasAllPermissions,
  hasAllRolesById,
  // Rol ID listesine göre kontrol eder
  getAllUserPermissions,
  getUserPermissionsByCategory,
  hasPermissionInCategory,
  isSuperUser, // Süper kullanıcı veya süper rol kontrolü
} from '@/utils/permissions';

// Kullanıcı verisine direkt erişiminiz varsa:
function checkUserAccess(user: User) {
  // Süper kullanıcı veya süper rol kontrolü
  const isSuper = isSuperUser(user);

  const canAccessDashboard = hasPermission(user, 'dashboard_Access');
  const isAdmin = hasRoleById(user, 2); // ID'si 2 olan rol (Admin)
  const customerPermissions = getUserPermissionsByCategory(user, 'customer_');

  // ...
}
```
