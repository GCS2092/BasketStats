import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Page racine - redirige vers la locale par défaut
// Cette page ne devrait jamais être atteinte si le middleware fonctionne correctement
// mais elle sert de fallback pour garantir la redirection
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}

