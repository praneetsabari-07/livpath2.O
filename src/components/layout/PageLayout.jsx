import Header from './Header';
import BackgroundDecor from './BackgroundDecor';
import BottomWaves from './BottomWaves';

export default function PageLayout({ children }) {
  return (
    <div className="bg-[#F8FAFC] text-on-surface font-body-md overflow-x-hidden relative min-h-screen flex flex-col bg-soft-gradient">
      <BackgroundDecor />
      <Header />
      {/* We add mt-20 to push content below fixed header, but Stitch uses pt-32 on main. We will let the pages handle their top padding or add it to main here.
          The Stitch HTML uses: <main class="flex-grow pt-32 pb-40 px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col items-center justify-center text-center">
          So we just make main flex-grow and z-10 here.
       */}
      <main className="flex-grow relative z-10 flex flex-col">
        {children}
      </main>
      <BottomWaves />
    </div>
  );
}