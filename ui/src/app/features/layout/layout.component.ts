import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  label: string;
  exact: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', exact: true },
  { path: '/orders', label: 'Orders', exact: false },
  { path: '/inventory', label: 'Inventory', exact: false },
  { path: '/deliveries', label: 'Deliveries', exact: false },
];

@Component({
  selector: 'app-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="drawer lg:drawer-open min-h-screen">
      <input id="main-drawer" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        <!-- Navbar -->
        <nav class="navbar bg-base-200 border-b border-base-300 lg:hidden">
          <div class="flex-none">
            <label for="main-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block h-6 w-6 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </label>
          </div>
          <div class="flex-1">
            <span class="text-base font-bold px-2">Spring Cloud Demo</span>
          </div>
        </nav>
        <!-- Page content -->
        <main class="flex-1 p-6 bg-base-100">
          <router-outlet />
        </main>
      </div>
      <!-- Sidebar -->
      <div class="drawer-side">
        <label for="main-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        <aside class="bg-base-200 min-h-full w-56 flex flex-col">
          <div class="px-4 py-5 border-b border-base-300 hidden lg:block">
            <span class="text-base font-bold text-base-content">Spring Cloud Demo</span>
          </div>
          <ul class="menu p-3 gap-1 flex-1">
            @for (item of navItems; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-primary text-primary-content"
                  [routerLinkActiveOptions]="{ exact: item.exact }"
                  class="flex items-center gap-3 text-sm font-medium"
                >
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </aside>
      </div>
    </div>
  `,
})
export class LayoutComponent {
  navItems = NAV_ITEMS;
}
