import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/category-service';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { CategoriesDialogs } from './components/categories-dialogs';
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons';
import { CategoriesProvider } from './components/categories-provider';
import { CategoriesTable } from './components/categories-table';

export function Categories() {
  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  return (
    <CategoriesProvider>
      <Header fixed>
        <div className="ms-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fluid>
        <div className="mb-2 flex flex-wrap items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Kategori Yönetimi
            </h2>
            <p className="text-muted-foreground">
              Kategorileri buradan yönetebilirsiniz.
            </p>
          </div>
          <CategoriesPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <CategoriesTable data={categories} isLoading={isLoading} />
        </div>
      </Main>

      <CategoriesDialogs onSuccess={() => refetch()} />
    </CategoriesProvider>
  );
}
