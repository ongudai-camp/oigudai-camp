'use client';

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();

  return (
    <footer className="bg-[#0C4A6E] text-white py-16 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black mb-6 tracking-tighter">
              ONGUDAI<span className="text-orange-500">CAMP</span>
            </h3>
            <p className="text-sky-500/70 leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('navigation')}</h4>
            <ul className="space-y-4 text-sky-600/60">
                <li><Link href={`/${locale}`} className="hover:text-sky-700 transition-colors">{t('navigation_home')}</Link></li>
                <li><Link href={`/${locale}/calendar`} className="hover:text-sky-700 transition-colors">Calendar</Link></li>
                <li><Link href={`/${locale}/hotels`} className="hover:text-sky-700 transition-colors">{t('navigation_hotels')}</Link></li>
                <li><Link href={`/${locale}/tours`} className="hover:text-sky-700 transition-colors">{t('navigation_tours')}</Link></li>
                <li><Link href={`/${locale}/activities`} className="hover:text-sky-700 transition-colors">{t('navigation_activities')}</Link></li>
              </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('support')}</h4>
            <ul className="space-y-4 text-sky-600/60">
                <li><Link href={`/${locale}/about`} className="hover:text-sky-700 transition-colors">{t('support_about')}</Link></li>
                <li><Link href={`/${locale}/privacy-policy`} className="hover:text-sky-700 transition-colors">{t('support_policy')}</Link></li>
                <li><Link href={`/${locale}/terms`} className="hover:text-sky-700 transition-colors">{t('support_terms')}</Link></li>
              </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">{t('contacts')}</h4>
            <div className="space-y-4 text-sky-600/60">
                <p>📍 {t('contacts_address')}</p>
                <p>📞 {t('contacts_phone')}</p>
                <p>✉️ {t('contacts_email')}</p>
              </div>
          </div>
        </div>

        <div className="border-t border-sky-800/50 mt-16 pt-8 text-center text-sky-500/40 text-sm">
           <p>&copy; 2026 Reg Griffin Ecosystems rgacademy.spave</p>
        </div>
      </div>
    </footer>
  );
}
