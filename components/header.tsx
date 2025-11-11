"use client";

interface HeaderProps {
  nickname?: string;
}

const Header: React.FC<HeaderProps> = ({ nickname }) => {
  return (
    <header className="fixed top-10 left-1/2 transform -translate-x-1/2 z-99999 flex flex-col items-center gap-2">
<a
  href="/"
  className="text-2xl text-white opacity-90 hover:opacity-100 transition cursor-pointer animate-bounce mix-blend-difference drop-shadow-[0_0_2px_black]"
>
  w4tchme!
</a>
      {nickname && (
        <span className="text-white text-xs font-light tracking-[0.2em] uppercase opacity-50 mix-blend-difference">
          {nickname}
        </span>
      )}
    </header>
  );
};

export default Header;
