import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import { getLocale, getMessages } from "@/lib/i18n/locale";
import { localizeHref } from "@/lib/i18n/href";

export default async function Topbar() {
  const [locale, t] = await Promise.all([getLocale(), getMessages()]);
  const homeHref = localizeHref(locale, "/");

  return (
    <div className="bg-white border-b border-line">
      <div className="wrap grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-6 min-h-[64px] sm:min-h-[84px] py-2.5 sm:py-0 sm:h-[84px]">
        <Link href={homeHref} className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-[52px] sm:h-[52px] rounded-full overflow-hidden relative shrink-0 bg-white">
            <Image
              src="/logos/logo-dnpec-clean.png"
              alt={t.header.logoDnpec}
              fill
              sizes="52px"
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="sm:hidden text-sm font-bold text-navy leading-tight">DNPEC</div>
            <div className="hidden sm:block text-[16.5px] font-bold text-navy leading-tight">
              {t.header.dnpecLine1}
              <br />
              {t.header.dnpecLine2}
            </div>
            <div className="mini-flag max-w-[120px] sm:max-w-[220px]" />
            <div className="text-[10px] sm:text-[11.5px] text-muted tracking-wide">{t.header.republic}</div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center justify-center gap-[28px] text-[13.5px] text-navy font-medium">
          <span>infos@dnpec.gov.gn</span>
          <div className="w-px h-[18px] bg-line" />
          <span>(+224) 662 46 45 67</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
          <LanguageSwitcher />
          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden relative shrink-0 bg-white">
            <Image
              src="/logos/logo-mefb-clean.png"
              alt={t.header.logoMefb}
              fill
              sizes="48px"
              className="object-contain"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-[11.5px] font-bold text-navy">
              {t.header.mefbLine1}
              <br />
              {t.header.mefbLine2}
            </div>
            <div className="mini-flag" />
            <div className="text-[10px] text-muted">{t.header.republic}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
