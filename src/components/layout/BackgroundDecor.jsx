export default function BackgroundDecor() {
  return (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Soft Orbs */}
      <div className="orb w-96 h-96 bg-secondary-container top-[-100px] left-[-100px] opacity-30 mix-blend-multiply"></div>
      <div className="orb w-[500px] h-[500px] bg-primary-fixed-dim top-1/4 left-1/2 -translate-x-1/2 opacity-20"></div>
      <div className="orb w-[400px] h-[400px] bg-secondary-fixed top-1/3 left-[-50px] opacity-20"></div>
      <div className="orb w-[300px] h-[300px] bg-secondary-fixed-dim top-20 right-[-50px] opacity-30 mix-blend-multiply"></div>
      <div className="orb w-[600px] h-[600px] bg-primary-fixed bottom-40 right-[-100px] opacity-20"></div>
      
      {/* Upper Left Dotted Grid & Pathways */}
      <svg className="absolute top-0 left-0 w-1/3 h-1/3 opacity-20" viewBox="0 0 200 200">
        <pattern height="20" id="dots" patternUnits="userSpaceOnUse" width="20">
          <circle cx="2" cy="2" fill="#006a63" r="1.5"></circle>
        </pattern>
        <rect fill="url(#dots)" height="100%" width="100%"></rect>
        <path className="dotted-path" d="M-50,100 C50,120 80,180 150,250" fill="none" stroke="#006a63" strokeWidth="2"></path>
      </svg>
      
      {/* Upper Right Circular Arcs */}
      <svg className="absolute top-0 right-0 w-1/2 h-1/2 opacity-15" viewBox="0 0 400 400">
        <circle className="dotted-path" cx="400" cy="0" fill="none" r="300" stroke="#12355b" strokeWidth="2"></circle>
        <circle className="dotted-path" cx="400" cy="0" fill="none" r="200" stroke="#12355b" strokeWidth="1"></circle>
        <circle className="dotted-path" cx="400" cy="0" fill="none" r="100" stroke="#006a63" strokeWidth="1.5"></circle>
      </svg>
      
      {/* Main Global Pathways */}
      <svg className="absolute top-0 left-0 w-full h-[1200px] opacity-30 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1440 1200">
        <path className="dotted-path" d="M-100,500 C150,450 300,700 700,650" fill="none" stroke="#006a63" strokeWidth="2.5"></path>
        <path className="dotted-path" d="M650,650 C800,600 1000,800 1500,700" fill="none" stroke="#12355b" strokeWidth="2.5"></path>
        <path className="dotted-path" d="M100,800 C400,900 600,800 900,1000" fill="none" stroke="#f7ba83" strokeWidth="1.5"></path>
        <path className="dotted-path" d="M1000,400 C1200,300 1300,500 1500,600" fill="none" stroke="#006a63" strokeWidth="2"></path>
        
        {/* Nodes */}
        <circle cx="200" cy="510" fill="#006a63" r="4"></circle>
        <circle cx="1100" cy="690" fill="#12355b" r="5"></circle>
        <circle cx="500" cy="850" fill="#f7ba83" r="4"></circle>
      </svg>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F8FAFC]/30"></div>
    </div>
  );
}