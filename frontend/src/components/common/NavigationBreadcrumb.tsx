'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface NavigationBreadcrumbProps {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export default function NavigationBreadcrumb({
  items,
  showBackButton = true,
  backButtonText = 'Retour',
  backButtonHref
}: NavigationBreadcrumbProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backButtonHref) {
      router.push(backButtonHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-white border-b border-neutral-200 py-4">
      <div className="container-custom">
        <div className="flex items-center gap-4">
          {/* Bouton retour */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors touch-target"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">{backButtonText}</span>
            </button>
          )}

          {/* Séparateur */}
          {showBackButton && items.length > 0 && (
            <div className="w-px h-6 bg-neutral-300"></div>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 text-neutral-600 hover:text-primary transition-colors"
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 text-neutral-800 font-medium">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </span>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
