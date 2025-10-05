const Waves = ({ 
    height = 200, 
    colors = ["rgba(255,255,255,0.4)", "rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"],
    className = "",
    style = {} 
  }) => {
    const waves = [
      { y: height * 0.6, amp: 40, duration: 10, phase: 0 },
      { y: height * 0.8, amp: 60, duration: 15, phase: 1 },
      { y: height * 0.9, amp: 30, duration: 20, phase: 2 }
    ];
    return (
        <div 
          className={`relative w-full overflow-hidden ${className}`}
          style={{ height: `${height}px`, ...style }}
        >
          {waves.map((wave, i) => (
            <div
              key={i}
              className="absolute inset-0"
              style={{
                zIndex: waves.length - i,
                animation: `wave-${i} ${wave.duration}s ease-in-out infinite`,
                animationDelay: `${wave.phase * -2}s`
              }}
            >
              <svg
                className="absolute w-[200%] h-full"
                style={{ left: '-50%' }}
                viewBox={`0 0 1440 ${height}`}
                preserveAspectRatio="none"
              >
                <path
                  d={`M0,${wave.y} 
                      C360,${wave.y - wave.amp} 
                        1080,${wave.y + wave.amp} 
                        1440,${wave.y}
                      L1440,${height} L0,${height} Z`}
                  fill={colors[i] || colors[colors.length - 1]}
                />
              </svg>
            </div>
          ))}
    
          <style jsx>{`
            @keyframes wave-0 {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-25%); }
            }
            @keyframes wave-1 {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-50%); }
            }
            @keyframes wave-2 {
              0%, 100% { transform: translateX(0); }
              50% { transform: translateX(-75%); }
            }
          `}</style>
        </div>
      );
    };
    return (
        <div>
  {/* Section avec vagues colorées */}
  <section className="bg-gradient-to-b from-emerald-500 to-emerald-600 text-white relative">
  <Waves 
    height={80}
    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.15)"]}
    className="absolute top-0 left-0 right-0 transform rotate-180"
  />
  
  <div className="container mx-auto px-6 py-20 pt-32 text-center">
    <h2 className="text-3xl font-bold mb-4">Prêt à utiliser</h2>
    <p className="text-emerald-100 max-w-xl mx-auto">
      Copiez le composant dans votre projet et commencez à créer 
      des interfaces élégantes avec des effets de vagues.
    </p>
  </div>
</section>

</div>
    )  
    