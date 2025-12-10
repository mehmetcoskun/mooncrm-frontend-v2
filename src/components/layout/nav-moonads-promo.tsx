import { Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function NavMoonAdsPromo() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <SidebarGroup className="mt-auto px-2 pb-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <a
            href="https://moonads.ai"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group relative flex items-center gap-3 overflow-hidden rounded-xl p-3 transition-all duration-300',
              'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600',
              'hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500',
              'hover:shadow-lg hover:shadow-purple-500/30',
              'hover:scale-[1.02] active:scale-[0.98]',
              isCollapsed && 'justify-center p-2'
            )}
          >
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-1 left-1/4 h-2 w-2 animate-pulse rounded-full bg-white/40" />
              <div
                className="absolute top-1/2 left-3/4 h-1.5 w-1.5 animate-pulse rounded-full bg-white/30"
                style={{ animationDelay: '0.5s' }}
              />
              <div
                className="absolute bottom-2 left-1/3 h-1 w-1 animate-pulse rounded-full bg-white/50"
                style={{ animationDelay: '1s' }}
              />
              <div
                className="absolute top-3 right-1/4 h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-200/40"
                style={{ animationDelay: '0.3s' }}
              />
              <div
                className="absolute right-1/3 bottom-1 h-2 w-2 animate-pulse rounded-full bg-cyan-200/30"
                style={{ animationDelay: '0.7s' }}
              />
            </div>

            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Icon */}
            <div
              className={cn(
                'relative z-10 flex items-center justify-center rounded-lg bg-white/20 p-1.5 backdrop-blur-sm',
                'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12'
              )}
            >
              <Sparkles className="h-4 w-4 text-white drop-shadow-sm" />
            </div>

            {/* Text content */}
            {!isCollapsed && (
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white drop-shadow-sm">
                    MoonADS.ai
                  </span>
                  <span className="rounded-full bg-yellow-400/90 px-1.5 py-0.5 text-[9px] font-bold text-yellow-900 shadow-sm">
                    YENİ
                  </span>
                </div>
                <span className="text-[10px] text-white/80">
                  Yapay Zeka ile İşinizi Dönüştürün
                </span>
              </div>
            )}

            {/* External link icon */}
            {!isCollapsed && (
              <ExternalLink className="relative z-10 h-3.5 w-3.5 text-white/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white" />
            )}

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-400/20 via-purple-400/20 to-indigo-400/20 blur-xl" />
            </div>
          </a>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
