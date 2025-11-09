// components/Footer.tsx

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-om-navy text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/OMU.JO.svg"
              alt="Old Mutual Logo"
              width={100}
              height={107}
              className="h-8 w-auto filter brightness-0 invert"
            />
            <div className="h-6 w-px bg-white/30"></div>
            <div>
              <p className="text-sm font-bold">LifeCompass</p>
              <p className="text-xs text-white/70">
                Tech Innovation Hackathon 2025
              </p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-white font-bold">Built by Buffr</p>
            <p className="text-xs text-white mt-1 font-bold">
              George Nekwaya (B.Eng, NUST 🇳🇦, MBA, Brandeis University 🇺🇸) &
              Etuna Nekwaya (B.Eng, Bohai University 🇨🇳)
            </p>
          </div>
          <p className="text-sm text-white/70">
            LifeCompass by Old Mutual Namibia
          </p>
        </div>
      </div>
    </footer>
  );
}
