export default function Topbar() {
  return (
    <div className="bg-white border-b border-line">
      <div className="wrap flex items-center justify-between h-[84px]">
        <div className="flex items-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-full bg-navy text-yellow border-2 border-yellow flex items-center justify-center font-heading font-bold text-[16px]">
            DN
          </div>
          <div>
            <div className="text-[16.5px] font-bold text-navy leading-tight">
              DIRECTION NATIONALE DES PRÉVISIONS
              <br />
              ÉCONOMIQUES ET DE LA CONJONCTURE
            </div>
            <div className="mini-flag" />
            <div className="text-[11.5px] text-muted tracking-wide">RÉPUBLIQUE DE GUINÉE</div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-[22px] text-[13.5px] text-navy font-medium">
          <span>infos@dnpec.gov.gn</span>
          <div className="w-px h-[18px] bg-line" />
          <span>(+224) 662 46 45 67</span>
          <div className="w-px h-[18px] bg-line" />
          <span className="text-red font-bold text-[12.5px]">Certifiée ISO 9001-2015</span>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-paper border-2 border-navy flex items-center justify-center text-[10px] text-navy font-bold text-center">
            MEFB
          </div>
          <div className="hidden md:block">
            <div className="text-[11.5px] font-bold text-navy">
              MINISTÈRE DE L&apos;ÉCONOMIE,
              <br />
              DES FINANCES ET DU BUDGET
            </div>
            <div className="mini-flag" />
            <div className="text-[10px] text-muted">RÉPUBLIQUE DE GUINÉE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
