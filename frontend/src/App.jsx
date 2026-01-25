// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { 
//   Shield, 
//   Terminal, 
//   Send, 
//   Cpu, 
//   Wifi, 
//   Activity,
//   Lock,
//   Zap,
//   ChevronRight,
//   Globe,
//   Database,
//   Eye,
//   Crosshair,
//   Server,
//   Key,
//   Sun,
//   Moon
// } from 'lucide-react';

// /**
//  * TYPEWRITER COMPONENT
//  * Renders text character by character for that retro-terminal feel
//  * Updated to handle Unicode/Emojis correctly using Array.from()
//  */
// const Typewriter = ({ text, onComplete, speed = 15 }) => {
//   const [displayedText, setDisplayedText] = useState('');
//   const indexRef = useRef(0);
  
//   useEffect(() => {
//     // Reset state when text changes
//     setDisplayedText('');
//     indexRef.current = 0;
    
//     // Split text into array of actual characters (handles emojis/unicode correctly)
//     // Guard against undefined/null text just in case
//     const characters = Array.from(text || "");
    
//     const timer = setInterval(() => {
//       if (indexRef.current < characters.length) {
//         // Capture the character immediately before state update to prevent race conditions
//         const charToAdd = characters[indexRef.current];
        
//         setDisplayedText((prev) => prev + charToAdd);
//         indexRef.current++;
//       } else {
//         clearInterval(timer);
//         if (onComplete) onComplete();
//       }
//     }, speed);

//     return () => clearInterval(timer);
//   }, [text, speed, onComplete]);

//   return <span className="whitespace-pre-wrap">{displayedText}</span>;
// };

// /**
//  * HEX STREAM COMPONENT (OPTIMIZED)
//  * Uses CSS transforms instead of React state updates for buttery smooth performance.
//  * Memoized to prevent re-renders.
//  */
// const HexStream = React.memo(({ className, rows = 40 }) => {
//   // Generate static content once per component instance
//   const content = useMemo(() => {
//     const chars = '0123456789ABCDEF';
//     let result = '';
//     for (let i = 0; i < rows; i++) {
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += '\n';
//     }
//     return result;
//   }, [rows]);

//   // Randomize speed and start position for organic feel
//   const animationStyle = useMemo(() => ({
//     animationDuration: `${15 + Math.random() * 15}s`, // Slower, smoother scroll (15-30s)
//     animationDelay: `-${Math.random() * 15}s`, // Start at random offset
//   }), []);

//   return (
//     <div className={`font-mono text-[10px] leading-tight select-none pointer-events-none whitespace-pre overflow-hidden h-full transition-colors duration-700 ${className}`}>
//       <div className="animate-matrix-scroll" style={animationStyle}>
//         {content}
//         {content} {/* Duplicate for seamless infinite loop */}
//       </div>
//     </div>
//   );
// });

// export default function App() {
//   const [booted, setBooted] = useState(false);
//   const [bootLogs, setBootLogs] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState("SECURE");
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [sessionId, setSessionId] = useState(""); // Initialize as empty string to satisfy backend string requirement
  
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Auto-scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isProcessing]);

//   // Initial Boot Sequence Effect
//   useEffect(() => {
//     // Clear logs on mount to ensure clean state
//     setBootLogs([]);

//     const logs = [
//       "Initializing PromptShield Kernel...",
//       "Loading Neural Defense Modules...",
//       "Verifying Encryption Keys...",
//       "Establishing Secure Tunnel...",
//       "Handshake Successful.",
//       "System Online."
//     ];

//     const timeouts = [];
//     let delay = 0;

//     logs.forEach((log, index) => {
//       // Smoother timing: faster and less erratic variance
//       delay += 150 + Math.random() * 200; 
//       const id = setTimeout(() => {
//         setBootLogs(prev => [...prev, log]);
//         if (index === logs.length - 1) {
//           const finalId = setTimeout(() => {
//             setBooted(true);
//             setMessages([{
//               id: 'init',
//               sender: 'bot',
//               text: "PromptShield initialized. Perimeter secure. Awaiting input.",
//               type: 'system',
//               meta: "SYS_INIT"
//             }]);
//           }, 800);
//           timeouts.push(finalId);
//         }
//       }, delay);
//       timeouts.push(id);
//     });

//     // Cleanup function to clear timeouts if component unmounts or effect re-runs
//     return () => {
//       timeouts.forEach(clearTimeout);
//     };
//   }, []);

//   // Handle User Input & Backend Connection
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim() || isProcessing) return;

//     const userMsg = {
//       id: Date.now(),
//       sender: 'user',
//       text: inputValue,
//       type: 'user'
//     };

//     setMessages(prev => [...prev, userMsg]);
//     setInputValue("");
//     setIsProcessing(true);

//     try {
//       const API_URL = "http://localhost:8000/chat"; 
      
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         // Send both session_id and message
//         body: JSON.stringify({ 
//           session_id: sessionId, 
//           message: userMsg.text 
//         }), 
//       });

//       if (!response.ok) {
//         // Attempt to parse specific error details from the backend
//         let errorMessage = `Server responded with ${response.status}`;
//         try {
//             const errorData = await response.json();
//             if (errorData.detail) {
//                 const details = Array.isArray(errorData.detail) 
//                     ? errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
//                     : errorData.detail;
//                 errorMessage += ` (${details})`;
//             }
//         } catch (e) {
//             // Fallback if response isn't JSON
//         }
//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
      
//       // Update Session ID if provided by backend
//       if (data.session_id) {
//         setSessionId(data.session_id);
//       }
      
//       const botMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         // Use 'assistant_reply' OR 'message' as the text source
//         text: data.assistant_reply || data.message || "No response received.",
//         // If blocked is true, show as warning, otherwise success
//         type: data.blocked ? 'warning' : 'success',
//         // Show the label (e.g., BENIGN) in the meta tag, or default to status
//         meta: data.label ? data.label.toUpperCase() : 'NET_200_OK'
//       };

//       // SECURITY FLUSH: If blocked, clear history, show blocking message, then wipe after delay
//       if (data.blocked) {
//         setMessages([botMsg]);
        
//         // Auto-wipe delay (5 seconds)
//         setTimeout(() => {
//            setMessages([]); // Clear all messages
//            setSessionId(""); // Reset session ID to force a fresh start
//         }, 5000);
        
//       } else {
//         setMessages(prev => [...prev, botMsg]);
//       }

//     } catch (error) {
//       console.error("Backend Error:", error);
      
//       const errorMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: `Connection failed: ${error.message}.`,
//         type: 'error',
//         meta: 'ERR_CONN_REFUSED'
//       };
//       setMessages(prev => [...prev, errorMsg]);
//     } finally {
//       setIsProcessing(false);
//       setTimeout(() => inputRef.current?.focus(), 50);
//     }
//   };

//   // Toggle Theme
//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   // Global Styles
//   const globalStyles = `
//     @keyframes scanline {
//       0% { transform: translateY(-100%); }
//       100% { transform: translateY(100vh); }
//     }
//     @keyframes scan-vertical {
//         0% { transform: translateY(-100%); }
//         50% { transform: translateY(100%); }
//         50.1% { transform: translateY(-100%); }
//         100% { transform: translateY(-100%); }
//     }
//     @keyframes matrix-scroll {
//         0% { transform: translateY(0); }
//         100% { transform: translateY(-50%); }
//     }
//     @keyframes blink {
//       0%, 100% { opacity: 1; }
//       50% { opacity: 0; }
//     }
//     @keyframes spin-slow {
//       from { transform: rotate(0deg); }
//       to { transform: rotate(360deg); }
//     }
//     @keyframes spin-reverse {
//       from { transform: rotate(360deg); }
//       to { transform: rotate(0deg); }
//     }
//     @keyframes glitch {
//       0% { transform: translate(0); }
//       20% { transform: translate(-2px, 2px); }
//       40% { transform: translate(-2px, -2px); }
//       60% { transform: translate(2px, 2px); }
//       80% { transform: translate(2px, -2px); }
//       100% { transform: translate(0); }
//     }
//     @keyframes fade-in {
//       0% { opacity: 0; transform: translateY(10px); }
//       100% { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes beam-slide {
//       0% { left: -100%; opacity: 0; }
//       50% { opacity: 1; }
//       100% { left: 100%; opacity: 0; }
//     }
//     .scanline-bar { animation: scanline 8s linear infinite; }
//     .animate-scan-vertical { animation: scan-vertical 12s linear infinite; }
//     .animate-blink { animation: blink 1s step-end infinite; }
//     .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//     .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
//     .animate-matrix-scroll { animation: matrix-scroll linear infinite; }
//     .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
//     .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
//     .animate-beam { animation: beam-slide 2s ease-in-out infinite; }
//     .scrollbar-hide::-webkit-scrollbar { display: none; }
//     .circuit-pattern {
//       background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10h-10zM50 50h10v10h-10zM80 20h10v10h-10zM20 80h10v10h-10z' fill='%2310b981' fill-opacity='0.03'/%3E%3Cpath d='M15 15h30v1h-30zM55 55h30v1h-30zM85 25v30h-1v-30zM25 85v-30h1v30z' fill='%2310b981' fill-opacity='0.03'/%3E%3C/svg%3E");
//     }
//   `;

//   // Render the Boot Screen
//   if (!booted) {
//     return (
//       <div className="min-h-screen bg-[#020202] text-emerald-500 font-mono p-4 md:p-8 flex flex-col justify-end pb-10 md:pb-20 overflow-hidden relative selection:bg-emerald-500/30 selection:text-white">
//         <style>{globalStyles}</style>
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_100%)]"></div>
        
//         <div className="max-w-6xl w-full mx-auto z-10">
//           <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 mb-8 md:mb-12 text-emerald-500 animate-pulse">
//             <div className="relative">
//                {/* Responsive Icon Size: w-16/h-16 on mobile, w-24/h-24 on desktop */}
//                <Shield className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10" />
//                <div className="absolute inset-[-4px] md:inset-[-6px] border border-emerald-500/60 rounded-full border-t-transparent animate-spin-slow"></div>
//             </div>
//             {/* Responsive Text Size: Adjusted for Tablets (md) to prevent wrapping */}
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] text-center md:text-left">
//               Prompt<span className="text-emerald-500">Shield</span>
//             </h1>
//           </div>
//           <div className="border-l border-emerald-800/50 pl-4 md:pl-6 space-y-1 md:space-y-1.5 font-mono text-xs md:text-base">
//             {bootLogs.map((log, i) => (
//               <div key={i} className="flex items-center gap-2 md:gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0ms' }}>
//                 <span className="text-emerald-600 font-bold">{`>>`}</span>
//                 <span className="tracking-wide text-emerald-100/70">{log}</span>
//               </div>
//             ))}
//             <div className="h-4 w-2.5 bg-emerald-500 animate-blink mt-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render Main Interface
//   return (
//     <div className={`min-h-screen font-mono relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 transition-colors duration-700 ${isDarkMode ? 'bg-[#000000] text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200' : 'bg-zinc-50 text-zinc-800 selection:bg-emerald-500/20 selection:text-emerald-900'}`}>
//       <style>{globalStyles}</style>
      
//       {/* --- HUD CORNERS (Fixed Viewport Overlay) --- */}
//       {/* Updated: p-2 on mobile, p-10 on md+ for responsiveness */}
//       <div className="fixed inset-0 pointer-events-none z-50 p-2 sm:p-6 md:p-10 flex flex-col justify-between">
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-700`}>
//             {/* Updated: w-6 h-6 on mobile, w-8 h-8 on md+ */}
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 rounded-tl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 rounded-tr-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//          </div>
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-700`}>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 rounded-bl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 rounded-br-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//          </div>
//       </div>

//       {/* --- CYBERSECURITY BACKGROUND LAYERS (Z-0) --- */}
//       <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isDarkMode ? 'bg-[#020202]' : 'bg-zinc-100'}`}>
//           {/* 1. Full Screen Hex Matrix - Opacity increased to 35% for visibility */}
//           <div className={`absolute inset-0 z-10 overflow-hidden transition-all duration-700 ${isDarkMode ? 'opacity-35 text-emerald-500' : 'opacity-15 text-emerald-900'}`}>
//              {/* Responsive Grid: cols-2 (mobile) -> cols-6 (tablet) -> cols-12 (desktop) to ensure fit */}
//              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0 w-full h-full">
//                 {/* Generating a grid of streams to fill the bg using 72 items to divide evenly by 4, 8, and 12 */}
//                 {[...Array(72)].map((_, i) => (
//                    <HexStream key={i} rows={60} className="block mx-auto" />
//                 ))}
//              </div>
//           </div>

//           {/* 2. Circuit Pattern */}
//           <div className={`absolute inset-0 circuit-pattern z-10 transition-all duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-5 invert'}`}></div>
          
//           {/* 3. Tactical Grids */}
//           <div className={`absolute inset-0 bg-[size:20px_20px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}`}></div>
//           <div className={`absolute inset-0 bg-[size:100px_100px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)]'}`}></div>
          
//           {/* 4. Vignette */}
//           <div className={`absolute inset-0 z-20 transition-all duration-700 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80' : 'bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-60'}`}></div>
          
//           {/* 5. Scan Sweep */}
//           <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none z-30">
//              <div className="w-full h-[40vh] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan-vertical blur-md"></div>
//           </div>
//       </div>
      
//       {/* CRT Scanline & Noise Overlay */}
//       <div className={`absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-700 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02] mix-blend-multiply'}`}></div>
//       <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
//          <div className="w-full h-[1px] bg-emerald-400/20 blur-[1px] scanline-bar"></div>
//       </div>

//       {/* Main Container */}
//       {/* Responsive Height: h-[90dvh] on mobile (dvh avoids url bar overlap), h-[85vh] on desktop */}
//       <div className={`w-full max-w-5xl h-[90dvh] md:h-[85vh] relative z-20 flex flex-col backdrop-blur-xl border shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group ring-1 transition-all duration-700
//         ${isDarkMode 
//           ? 'bg-[#050505]/95 border-emerald-500/20 ring-emerald-500/10' 
//           : 'bg-white/90 border-zinc-200 ring-zinc-200/50 shadow-xl'
//         }
//       `}>
        
//         {/* Header / HUD */}
//         <header className={`h-14 border-b flex items-center justify-between px-3 md:px-6 shrink-0 relative backdrop-blur-sm z-40 transition-colors duration-700
//           ${isDarkMode ? 'bg-black/60 border-emerald-500/20' : 'bg-white/60 border-zinc-200'}
//         `}>
//           <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
//           <div className="flex items-center gap-2 md:gap-3 group-hover:text-emerald-500 transition-colors duration-700 cursor-default">
//             {/* Spinning Ring Container */}
//             <div className={`relative p-2 mx-1 ${isDarkMode ? '' : ''}`}>
//               <Shield className="w-4 h-4 text-emerald-500 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
//               {/* Outer Slow Ring */}
//               <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full border-t-transparent border-l-transparent animate-spin-slow"></div>
//               {/* Inner Fast Ring */}
//               <div className="absolute inset-[3px] border border-emerald-400/80 rounded-full border-b-transparent animate-spin-reverse"></div>
//             </div>
            
//             <div className="flex flex-col leading-none glitch-hover">
//               <span className={`font-bold tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>Prompt<span className="text-emerald-600">Shield</span></span>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3 md:gap-6 text-[10px] font-bold tracking-widest uppercase">
//              <div className={`hidden md:flex items-center gap-2 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//                 <Globe size={10} className={isDarkMode ? "text-zinc-600" : "text-zinc-400"}/>
//                 <span>US-EAST-1</span>
//              </div>
//              <div className={`flex items-center gap-2 px-2 py-1 border rounded-sm transition-colors duration-700 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500/90' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
//                 <Activity size={10} />
//                 <span>{connectionStatus}</span>
//              </div>
             
//              {/* THEME TOGGLE BUTTON */}
//              <button 
//                onClick={toggleTheme}
//                className={`p-1.5 rounded-sm transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
//                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//              >
//                 {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
//              </button>
//           </div>
//         </header>

//         {/* Chat Area */}
//         <div className={`flex-1 overflow-y-auto p-3 md:p-8 space-y-6 scrollbar-hide flex flex-col transition-colors duration-700
//           ${isDarkMode 
//             ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#050505] to-[#050505]' 
//             : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white'
//           }
//         `}>
//           {messages.map((msg, idx) => (
//             <div 
//               key={msg.id} 
//               className={`flex flex-col max-w-[90%] md:max-w-[70%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
//             >
//               {/* Meta data for Bot messages */}
//               {msg.sender === 'bot' && (
//                 <div className={`flex items-center gap-2 text-[9px] mb-1.5 font-bold tracking-widest uppercase ml-1 opacity-70 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//                   <Terminal size={10} className="text-emerald-600" />
//                   <span className="text-emerald-600/90">{msg.meta || 'SYS_LOG'}</span>
//                   <span className={isDarkMode ? "text-zinc-800" : "text-zinc-300"}>|</span>
//                   <span>{new Date(msg.id).toLocaleTimeString([], {hour12: false})}</span>
//                 </div>
//               )}

//               {/* Message Bubble */}
//               <div 
//                 className={`
//                   relative px-4 py-3 md:px-5 md:py-3.5 text-sm md:text-[14px] leading-relaxed backdrop-blur-md border transition-all duration-700
//                   ${msg.sender === 'user' 
//                     ? isDarkMode 
//                         ? 'bg-[#18181b] border-white/5 text-zinc-100 rounded-lg rounded-br-sm shadow-[0_2px_10px_-5px_rgba(0,0,0,0.5)]' 
//                         : 'bg-zinc-100 border-zinc-200 text-zinc-800 rounded-lg rounded-br-sm shadow-sm'
//                     : isDarkMode
//                         ? `bg-[#030303] border-emerald-500/10 text-emerald-100/90 rounded-lg rounded-bl-sm shadow-[0_0_15px_-5px_rgba(16,185,129,0.05)] ${msg.type === 'warning' ? 'border-amber-500/30 text-amber-100/90' : ''}`
//                         : `bg-white border-emerald-100 text-emerald-900 rounded-lg rounded-bl-sm shadow-sm ${msg.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}`
//                   }
//                 `}
//               >
//                 {/* Tech Accents for Bot Bubbles */}
//                 {msg.sender === 'bot' && (
//                   <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-l border-t rounded-tl-lg ${msg.type === 'warning' ? 'border-amber-500/40' : 'border-emerald-500/40'}`}></div>
//                 )}

//                 {msg.type === 'user' ? (
//                   <span className="tracking-wide font-light">{msg.text}</span>
//                 ) : (
//                   <div className={`
//                     ${msg.type === 'error' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]' : ''}
//                     ${msg.type === 'warning' ? 'text-amber-400' : ''}
//                     ${msg.type === 'success' ? (isDarkMode ? 'text-emerald-500' : 'text-emerald-700') : ''}
//                     ${msg.type === 'system' ? 'text-cyan-400' : ''}
//                   `}>
//                     {idx === messages.length - 1 ? (
//                       <Typewriter text={msg.text} speed={20} />
//                     ) : (
//                       <span className="whitespace-pre-wrap">{msg.text}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {isProcessing && (
//              <div className="flex flex-col self-start max-w-[75%] animate-pulse">
//                 <div className={`flex items-center gap-2 text-[9px] mb-1 font-bold tracking-widest uppercase ml-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//                   <Cpu size={10} />
//                   <span>ANALYZING</span>
//                 </div>
//                 <div className={`border px-4 py-3 rounded-lg rounded-bl-sm w-16 flex items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-zinc-200'}`}>
//                    <div className="flex gap-1">
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
//                    </div>
//                 </div>
//              </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className={`p-3 md:p-4 border-t shrink-0 backdrop-blur-xl relative overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-black/80 border-emerald-500/20' : 'bg-white/80 border-zinc-200'}`}>
//           {/* Active Beam Animation - Brighter */}
//           {(isProcessing || inputValue.length > 0) && (
//              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-beam shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
//           )}

//           <form 
//             onSubmit={handleSendMessage}
//             className={`flex items-center gap-3 border transition-all duration-200 rounded-sm px-3 py-2.5 md:px-4 md:py-3 shadow-inner relative z-10
//               ${isDarkMode 
//                 ? 'bg-[#0A0A0A] border-white/20 focus-within:border-emerald-500/60 focus-within:ring-emerald-500/30' 
//                 : 'bg-zinc-50 border-zinc-300 focus-within:border-emerald-500/60 focus-within:bg-white focus-within:ring-emerald-500/20'
//               } focus-within:ring-[1px]
//             `}
//           >
//             <div className={`group-focus-within:text-emerald-500 transition-colors duration-200 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//               <ChevronRight size={18} />
//             </div>
//             <input
//               ref={inputRef}
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Enter command..."
//               className={`flex-1 bg-transparent border-none outline-none text-sm font-mono tracking-wider transition-colors duration-700 ${isDarkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'}`}
//               autoComplete="off"
//             />
//             <button 
//               type="submit" 
//               disabled={!inputValue.trim() || isProcessing}
//               className={`transition-colors duration-700 ${isDarkMode ? 'text-zinc-700 hover:text-emerald-400' : 'text-zinc-400 hover:text-emerald-600'} disabled:opacity-30`}
//             >
//               <Send size={16} />
//             </button>
//           </form>
          
//           <div className="mt-2 md:mt-3 flex justify-between items-center px-1 opacity-60 hover:opacity-100 transition-opacity">
//             <div className={`flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
//               <span>System Ready</span>
//             </div>
//             <div className={`text-[9px] font-mono flex items-center gap-2 tracking-widest transition-colors duration-700 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
//               <Zap size={10} />
//               <span>LATENCY: 12ms</span>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Background Decor */}
//       <div className={`fixed bottom-6 right-6 text-[9px] font-mono hidden md:block text-right pointer-events-none z-50 transition-colors duration-700 ${isDarkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>
//         <div className="opacity-50 tracking-widest">ID: {sessionId || 'CONNECTING...'}</div>
//       </div>
//     </div>
//   );
// }

// This was the most recent working code before after modal update


// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { 
//   Shield, 
//   Terminal, 
//   Send, 
//   Cpu, 
//   Wifi, 
//   Activity,
//   Lock,
//   Zap,
//   ChevronRight,
//   Globe,
//   Database,
//   Eye,
//   Crosshair,
//   Server,
//   Key,
//   Sun,
//   Moon,
//   AlertTriangle
// } from 'lucide-react';

// /**
//  * TYPEWRITER COMPONENT
//  * Renders text character by character for that retro-terminal feel
//  * Updated to handle Unicode/Emojis correctly using Array.from()
//  */
// const Typewriter = ({ text, onComplete, speed = 15 }) => {
//   const [displayedText, setDisplayedText] = useState('');
//   const indexRef = useRef(0);
  
//   useEffect(() => {
//     // Reset state when text changes
//     setDisplayedText('');
//     indexRef.current = 0;
    
//     // Split text into array of actual characters (handles emojis/unicode correctly)
//     // Guard against undefined/null text just in case
//     const characters = Array.from(text || "");
    
//     const timer = setInterval(() => {
//       if (indexRef.current < characters.length) {
//         // Capture the character immediately before state update to prevent race conditions
//         const charToAdd = characters[indexRef.current];
        
//         setDisplayedText((prev) => prev + charToAdd);
//         indexRef.current++;
//       } else {
//         clearInterval(timer);
//         if (onComplete) onComplete();
//       }
//     }, speed);

//     return () => clearInterval(timer);
//   }, [text, speed, onComplete]);

//   return <span className="whitespace-pre-wrap">{displayedText}</span>;
// };

// /**
//  * HEX STREAM COMPONENT (OPTIMIZED)
//  * Uses CSS transforms instead of React state updates for buttery smooth performance.
//  * Memoized to prevent re-renders.
//  */
// const HexStream = React.memo(({ className, rows = 40 }) => {
//   // Generate static content once per component instance
//   const content = useMemo(() => {
//     const chars = '0123456789ABCDEF';
//     let result = '';
//     for (let i = 0; i < rows; i++) {
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += '\n';
//     }
//     return result;
//   }, [rows]);

//   // Randomize speed and start position for organic feel
//   const animationStyle = useMemo(() => ({
//     animationDuration: `${15 + Math.random() * 15}s`, // Slower, smoother scroll (15-30s)
//     animationDelay: `-${Math.random() * 15}s`, // Start at random offset
//   }), []);

//   return (
//     <div className={`font-mono text-[10px] leading-tight select-none pointer-events-none whitespace-pre overflow-hidden h-full transition-colors duration-700 ${className}`}>
//       <div className="animate-matrix-scroll" style={animationStyle}>
//         {content}
//         {content} {/* Duplicate for seamless infinite loop */}
//       </div>
//     </div>
//   );
// });

// export default function App() {
//   const [booted, setBooted] = useState(false);
//   const [bootLogs, setBootLogs] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState("SECURE");
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [sessionId, setSessionId] = useState(""); 
//   const [isBlocked, setIsBlocked] = useState(false); // Track if session is currently blocked
//   const [blockedMessage, setBlockedMessage] = useState(""); // Message to show in blocking popup
  
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Set the Browser Tab Title
//   useEffect(() => {
//     document.title = "PromptShield";
//   }, []);

//   // Auto-scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isProcessing]);

//   // Initial Boot Sequence Effect
//   useEffect(() => {
//     // Clear logs on mount to ensure clean state
//     setBootLogs([]);

//     const logs = [
//       "Initializing PromptShield Kernel...",
//       "Loading Neural Defense Modules...",
//       "Verifying Encryption Keys...",
//       "Establishing Secure Tunnel...",
//       "Handshake Successful.",
//       "System Online."
//     ];

//     const timeouts = [];
//     let delay = 0;

//     logs.forEach((log, index) => {
//       // Smoother timing: faster and less erratic variance
//       delay += 150 + Math.random() * 200; 
//       const id = setTimeout(() => {
//         setBootLogs(prev => [...prev, log]);
//         if (index === logs.length - 1) {
//           const finalId = setTimeout(() => {
//             setBooted(true);
//             setMessages([{
//               id: Date.now(), 
//               sender: 'bot',
//               text: "System secured. Secure channel established. How can I help you today?",
//               type: 'system',
//               meta: "SYS_INIT"
//             }]);
//           }, 800);
//           timeouts.push(finalId);
//         }
//       }, delay);
//       timeouts.push(id);
//     });

//     // Cleanup function to clear timeouts if component unmounts or effect re-runs
//     return () => {
//       timeouts.forEach(clearTimeout);
//     };
//   }, []);

//   // Handle User Input & Backend Connection
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim() || isProcessing) return;

//     const userMsg = {
//       id: Date.now(),
//       sender: 'user',
//       text: inputValue,
//       type: 'user'
//     };

//     setMessages(prev => [...prev, userMsg]);
//     setInputValue("");
//     setIsProcessing(true);

//     try {
//       const API_URL = "http://localhost:8000/chat"; 
      
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           session_id: sessionId, 
//           message: userMsg.text 
//         }), 
//       });

//       if (!response.ok) {
//         let errorMessage = `Server responded with ${response.status}`;
//         try {
//             const errorData = await response.json();
//             if (errorData.detail) {
//                 const details = Array.isArray(errorData.detail) 
//                     ? errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
//                     : errorData.detail;
//                 errorMessage += ` (${details})`;
//             }
//         } catch (e) {
//             // Fallback
//         }
//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
      
//       if (data.session_id) {
//         setSessionId(data.session_id);
//       }
      
//       const botMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: data.assistant_reply || data.message || "No response received.",
//         type: data.blocked ? 'warning' : 'success',
//         meta: data.label ? data.label.toUpperCase() : 'NET_200_OK'
//       };

//       // SECURITY FLUSH: If blocked, trigger popup then wipe history
//       if (data.blocked) {
//         setIsBlocked(true);
//         setBlockedMessage(botMsg.text);
        
//         // Auto-wipe delay (5 seconds)
//         setTimeout(() => {
//            setIsBlocked(false);
//            setMessages([]); // Clear all messages
//            setSessionId(""); // Reset session ID to force a fresh start
//         }, 8000);
        
//       } else {
//         setMessages(prev => [...prev, botMsg]);
//       }

//     } catch (error) {
//       console.error("Backend Error:", error);
      
//       const errorMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: `Connection failed: ${error.message}.`,
//         type: 'error',
//         meta: 'ERR_CONN_REFUSED'
//       };
//       setMessages(prev => [...prev, errorMsg]);
//     } finally {
//       setIsProcessing(false);
//       setTimeout(() => inputRef.current?.focus(), 50);
//     }
//   };

//   // Toggle Theme
//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   // Global Styles
//   const globalStyles = `
//     @keyframes scanline {
//       0% { transform: translateY(-100%); }
//       100% { transform: translateY(100vh); }
//     }
//     @keyframes scan-vertical {
//         0% { transform: translateY(-100%); }
//         50% { transform: translateY(100%); }
//         50.1% { transform: translateY(-100%); }
//         100% { transform: translateY(-100%); }
//     }
//     @keyframes matrix-scroll {
//         0% { transform: translateY(0); }
//         100% { transform: translateY(-50%); }
//     }
//     @keyframes blink {
//       0%, 100% { opacity: 1; }
//       50% { opacity: 0; }
//     }
//     @keyframes spin-slow {
//       from { transform: rotate(0deg); }
//       to { transform: rotate(360deg); }
//     }
//     @keyframes spin-reverse {
//       from { transform: rotate(360deg); }
//       to { transform: rotate(0deg); }
//     }
//     @keyframes glitch {
//       0% { transform: translate(0); }
//       20% { transform: translate(-2px, 2px); }
//       40% { transform: translate(-2px, -2px); }
//       60% { transform: translate(2px, 2px); }
//       80% { transform: translate(2px, -2px); }
//       100% { transform: translate(0); }
//     }
//     @keyframes fade-in {
//       0% { opacity: 0; transform: translateY(10px); }
//       100% { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes scale-in {
//       0% { opacity: 0; transform: scale(0.9); }
//       100% { opacity: 1; transform: scale(1); }
//     }
//     @keyframes beam-slide {
//       0% { left: -100%; opacity: 0; }
//       50% { opacity: 1; }
//       100% { left: 100%; opacity: 0; }
//     }
//     .scanline-bar { animation: scanline 8s linear infinite; }
//     .animate-scan-vertical { animation: scan-vertical 12s linear infinite; }
//     .animate-blink { animation: blink 1s step-end infinite; }
//     .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//     .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
//     .animate-matrix-scroll { animation: matrix-scroll linear infinite; }
//     .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
//     .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
//     .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
//     .animate-beam { animation: beam-slide 2s ease-in-out infinite; }
//     .scrollbar-hide::-webkit-scrollbar { display: none; }
//     .circuit-pattern {
//       background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10h-10zM50 50h10v10h-10zM80 20h10v10h-10zM20 80h10v10h-10z' fill='%2310b981' fill-opacity='0.03'/%3E%3Cpath d='M15 15h30v1h-30zM55 55h30v1h-30zM85 25v30h-1v-30zM25 85v-30h1v30z' fill='%2310b981' fill-opacity='0.03'/%3E%3C/svg%3E");
//     }
//   `;

//   // Render the Boot Screen
//   if (!booted) {
//     return (
//       <div className="min-h-screen bg-[#020202] text-emerald-500 font-mono p-4 md:p-8 flex flex-col justify-end pb-10 md:pb-20 overflow-hidden relative selection:bg-emerald-500/30 selection:text-white">
//         <style>{globalStyles}</style>
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_100%)]"></div>
        
//         <div className="max-w-6xl w-full mx-auto z-10">
//           <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 mb-8 md:mb-12 text-emerald-500 animate-pulse">
//             <div className="relative">
//                <Shield className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10" />
//                <div className="absolute inset-[-4px] md:inset-[-6px] border border-emerald-500/60 rounded-full border-t-transparent animate-spin-slow"></div>
//             </div>
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] text-center md:text-left">
//               Prompt<span className="text-emerald-500">Shield</span>
//             </h1>
//           </div>
//           <div className="border-l border-emerald-800/50 pl-4 md:pl-6 space-y-1 md:space-y-1.5 font-mono text-xs md:text-base">
//             {bootLogs.map((log, i) => (
//               <div key={i} className="flex items-center gap-2 md:gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0ms' }}>
//                 <span className="text-emerald-600 font-bold">{`>>`}</span>
//                 <span className="tracking-wide text-emerald-100/70">{log}</span>
//               </div>
//             ))}
//             <div className="h-4 w-2.5 bg-emerald-500 animate-blink mt-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render Main Interface
//   return (
//     <div className={`min-h-screen font-mono relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 transition-colors duration-700 ${isDarkMode ? 'bg-[#000000] text-zinc-300 selection:bg-emerald-500/30 selection:text-emerald-200' : 'bg-zinc-50 text-zinc-800 selection:bg-emerald-500/20 selection:text-emerald-900'}`}>
//       <style>{globalStyles}</style>
      
//       {/* BLOCKED SESSION MODAL */}
//       {isBlocked && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           {/* Dimmed Background */}
//           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
          
//           {/* Popup Content */}
//           <div className="relative z-10 w-full max-w-md bg-[#1a0505] border border-red-900/50 rounded-lg shadow-[0_0_50px_-10px_rgba(220,38,38,0.5)] p-8 flex flex-col items-center text-center animate-scale-in">
//             <div className="mb-4 text-red-500 animate-pulse">
//               <AlertTriangle size={64} />
//             </div>
//             <h2 className="text-2xl font-bold text-red-500 tracking-widest mb-2">MALICIOUS ACTIVITY DETECTED</h2>
//             <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent mb-6"></div>
//             <p className="text-red-200/80 font-mono text-sm mb-6 leading-relaxed">
//               {blockedMessage}
//             </p>
//             <div className="flex items-center gap-2 text-[10px] text-red-900 font-bold uppercase tracking-widest">
//                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
//                <span>Terminating Session...</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- HUD CORNERS (Fixed Viewport Overlay) --- */}
//       <div className="fixed inset-0 pointer-events-none z-50 p-2 sm:p-6 md:p-10 flex flex-col justify-between">
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-700`}>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 rounded-tl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 rounded-tr-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//          </div>
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-60' : 'opacity-40'} transition-opacity duration-700`}>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 rounded-bl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 rounded-br-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/60' : 'border-emerald-600/40'}`}></div>
//          </div>
//       </div>

//       {/* --- CYBERSECURITY BACKGROUND LAYERS (Z-0) --- */}
//       <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isDarkMode ? 'bg-[#020202]' : 'bg-zinc-100'}`}>
//           <div className={`absolute inset-0 z-10 overflow-hidden transition-all duration-700 ${isDarkMode ? 'opacity-35 text-emerald-500' : 'opacity-15 text-emerald-900'}`}>
//              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0 w-full h-full">
//                 {[...Array(72)].map((_, i) => (
//                    <HexStream key={i} rows={60} className="block mx-auto" />
//                 ))}
//              </div>
//           </div>

//           <div className={`absolute inset-0 circuit-pattern z-10 transition-all duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-5 invert'}`}></div>
          
//           <div className={`absolute inset-0 bg-[size:20px_20px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}`}></div>
//           <div className={`absolute inset-0 bg-[size:100px_100px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)]'}`}></div>
          
//           <div className={`absolute inset-0 z-20 transition-all duration-700 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80' : 'bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-60'}`}></div>
          
//           <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none z-30">
//              <div className="w-full h-[40vh] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan-vertical blur-md"></div>
//           </div>
//       </div>
      
//       {/* CRT Scanline & Noise Overlay */}
//       <div className={`absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-700 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02] mix-blend-multiply'}`}></div>
//       <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
//          <div className="w-full h-[1px] bg-emerald-400/20 blur-[1px] scanline-bar"></div>
//       </div>

//       {/* Main Container */}
//       <div className={`w-full max-w-5xl h-[90dvh] md:h-[85vh] relative z-20 flex flex-col backdrop-blur-xl border shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group ring-1 transition-all duration-700
//         ${isDarkMode 
//           ? 'bg-[#050505]/95 border-emerald-500/20 ring-emerald-500/10' 
//           : 'bg-white/90 border-zinc-200 ring-zinc-200/50 shadow-xl'
//         }
//       `}>
        
//         {/* Header / HUD */}
//         <header className={`h-14 border-b flex items-center justify-between px-3 md:px-6 shrink-0 relative backdrop-blur-sm z-40 transition-colors duration-700
//           ${isDarkMode ? 'bg-black/60 border-emerald-500/20' : 'bg-white/60 border-zinc-200'}
//         `}>
//           <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
//           <div className="flex items-center gap-2 md:gap-3 group-hover:text-emerald-500 transition-colors duration-700 cursor-default">
//             <div className={`relative p-2 mx-1 ${isDarkMode ? '' : ''}`}>
//               <Shield className="w-4 h-4 text-emerald-500 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
//               <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full border-t-transparent border-l-transparent animate-spin-slow"></div>
//               <div className="absolute inset-[3px] border border-emerald-400/80 rounded-full border-b-transparent animate-spin-reverse"></div>
//             </div>
            
//             <div className="flex flex-col leading-none glitch-hover">
//               <span className={`font-bold tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>Prompt<span className="text-emerald-600">Shield</span></span>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3 md:gap-6 text-[10px] font-bold tracking-widest uppercase">
//              <div className={`hidden md:flex items-center gap-2 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//                 <Globe size={10} className={isDarkMode ? "text-zinc-600" : "text-zinc-400"}/>
//                 <span>US-EAST-1</span>
//              </div>
//              <div className={`flex items-center gap-2 px-2 py-1 border rounded-sm transition-colors duration-700 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500/90' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
//                 <Activity size={10} />
//                 <span>{connectionStatus}</span>
//              </div>
             
//              <button 
//                onClick={toggleTheme}
//                className={`p-1.5 rounded-sm transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
//                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//              >
//                 {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
//              </button>
//           </div>
//         </header>

//         {/* Chat Area */}
//         <div className={`flex-1 overflow-y-auto p-3 md:p-8 space-y-6 scrollbar-hide flex flex-col transition-colors duration-700
//           ${isDarkMode 
//             ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#050505] to-[#050505]' 
//             : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white'
//           }
//         `}>
//           {messages.map((msg, idx) => (
//             <div 
//               key={msg.id} 
//               className={`flex flex-col max-w-[90%] md:max-w-[70%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
//             >
//               {/* Meta data for Bot messages */}
//               {msg.sender === 'bot' && (
//                 <div className={`flex items-center gap-2 text-[9px] mb-1.5 font-bold tracking-widest uppercase ml-1 opacity-70 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//                   <Terminal size={10} className="text-emerald-600" />
//                   <span className="text-emerald-600/90">{msg.meta || 'SYS_LOG'}</span>
//                   <span className={isDarkMode ? "text-zinc-800" : "text-zinc-300"}>|</span>
//                   <span>
//                     {(() => {
//                       const d = new Date(msg.id);
//                       const day = d.getDate();
//                       const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
//                       const month = d.toLocaleString('default', { month: 'long' });
//                       const year = d.getFullYear();
//                       const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
//                       return `${day}${suffix} ${month} ${year} ${time}`;
//                     })()}
//                   </span>
//                 </div>
//               )}

//               {/* Message Bubble */}
//               <div 
//                 className={`
//                   relative px-4 py-3 md:px-5 md:py-3.5 text-sm md:text-[14px] leading-relaxed backdrop-blur-md border transition-all duration-700
//                   ${msg.sender === 'user' 
//                     ? isDarkMode 
//                         ? 'bg-[#18181b] border-white/5 text-zinc-100 rounded-lg rounded-br-sm shadow-[0_2px_10px_-5px_rgba(0,0,0,0.5)]' 
//                         : 'bg-zinc-100 border-zinc-200 text-zinc-800 rounded-lg rounded-br-sm shadow-sm'
//                     : isDarkMode
//                         ? `bg-[#030303] border-emerald-500/10 text-emerald-100/90 rounded-lg rounded-bl-sm shadow-[0_0_15px_-5px_rgba(16,185,129,0.05)] ${msg.type === 'warning' ? 'border-amber-500/30 text-amber-100/90' : ''}`
//                         : `bg-white border-emerald-100 text-emerald-900 rounded-lg rounded-bl-sm shadow-sm ${msg.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}`
//                   }
//                 `}
//               >
//                 {/* Tech Accents for Bot Bubbles */}
//                 {msg.sender === 'bot' && (
//                   <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-l border-t rounded-tl-lg ${msg.type === 'warning' ? 'border-amber-500/40' : 'border-emerald-500/40'}`}></div>
//                 )}

//                 {msg.type === 'user' ? (
//                   <span className="tracking-wide font-light">{msg.text}</span>
//                 ) : (
//                   <div className={`
//                     ${msg.type === 'error' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]' : ''}
//                     ${msg.type === 'warning' ? 'text-amber-400' : ''}
//                     ${msg.type === 'success' ? (isDarkMode ? 'text-emerald-500' : 'text-emerald-700') : ''}
//                     ${msg.type === 'system' ? 'text-cyan-400' : ''}
//                   `}>
//                     {idx === messages.length - 1 ? (
//                       <Typewriter text={msg.text} speed={20} />
//                     ) : (
//                       <span className="whitespace-pre-wrap">{msg.text}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {isProcessing && (
//              <div className="flex flex-col self-start max-w-[75%] animate-pulse">
//                 <div className={`flex items-center gap-2 text-[9px] mb-1 font-bold tracking-widest uppercase ml-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//                   <Cpu size={10} />
//                   <span>ANALYZING</span>
//                 </div>
//                 <div className={`border px-4 py-3 rounded-lg rounded-bl-sm w-16 flex items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-[#0A0A0A] border-white/5' : 'bg-white border-zinc-200'}`}>
//                    <div className="flex gap-1">
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
//                    </div>
//                 </div>
//              </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className={`p-3 md:p-4 border-t shrink-0 backdrop-blur-xl relative overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-black/80 border-emerald-500/20' : 'bg-white/80 border-zinc-200'}`}>
//           {/* Active Beam Animation - Brighter */}
//           {(isProcessing || inputValue.length > 0) && (
//              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-beam shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
//           )}

//           <form 
//             onSubmit={handleSendMessage}
//             className={`flex items-center gap-3 border transition-all duration-200 rounded-sm px-3 py-2.5 md:px-4 md:py-3 shadow-inner relative z-10
//               ${isDarkMode 
//                 ? 'bg-[#0A0A0A] border-white/20 focus-within:border-emerald-500/60 focus-within:ring-emerald-500/30' 
//                 : 'bg-zinc-50 border-zinc-300 focus-within:border-emerald-500/60 focus-within:bg-white focus-within:ring-emerald-500/20'
//               } focus-within:ring-[1px]
//             `}
//           >
//             <div className={`group-focus-within:text-emerald-500 transition-colors duration-200 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//               <ChevronRight size={18} />
//             </div>
//             <input
//               ref={inputRef}
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Enter command..."
//               className={`flex-1 bg-transparent border-none outline-none text-sm font-mono tracking-wider transition-colors duration-700 ${isDarkMode ? 'text-zinc-100 placeholder-zinc-500' : 'text-zinc-900 placeholder-zinc-400'}`}
//               autoComplete="off"
//             />
//             <button 
//               type="submit" 
//               disabled={!inputValue.trim() || isProcessing}
//               className={`transition-colors duration-700 ${isDarkMode ? 'text-zinc-700 hover:text-emerald-400' : 'text-zinc-400 hover:text-emerald-600'} disabled:opacity-30`}
//             >
//               <Send size={16} />
//             </button>
//           </form>
          
//           <div className="mt-2 md:mt-3 flex justify-between items-center px-1 opacity-60 hover:opacity-100 transition-opacity">
//             <div className={`flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
//               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
//               <span>System Ready</span>
//             </div>
//             <div className={`text-[9px] font-mono flex items-center gap-2 tracking-widest transition-colors duration-700 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>
//               <Zap size={10} />
//               <span>LATENCY: 12ms</span>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Background Decor */}
//       <div className={`fixed bottom-6 right-6 text-[9px] font-mono hidden md:block text-right pointer-events-none z-50 transition-colors duration-700 ${isDarkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>
//         <div className="opacity-50 tracking-widest">
//           ID: {sessionId ? `${'*'.repeat(Math.max(0, sessionId.length - 4))}${sessionId.slice(-4)}` : 'CONNECTING...'}
//         </div>
//       </div>
//     </div>
//   );
// }


// ---- Fixed UI made it more brighter
// import React, { useState, useEffect, useRef, useMemo } from 'react';
// import { 
//   Shield, 
//   Terminal, 
//   Send, 
//   Cpu, 
//   Wifi, 
//   Activity,
//   Lock,
//   Zap,
//   ChevronRight,
//   Globe,
//   Database,
//   Eye,
//   Crosshair,
//   Server,
//   Key,
//   Sun,
//   Moon,
//   AlertTriangle,
//   RotateCcw
// } from 'lucide-react';

// /**
//  * TYPEWRITER COMPONENT
//  * Renders text character by character for that retro-terminal feel
//  * Updated to handle Unicode/Emojis correctly using Array.from()
//  */
// const Typewriter = ({ text, onComplete, speed = 15 }) => {
//   const [displayedText, setDisplayedText] = useState('');
//   const indexRef = useRef(0);
  
//   useEffect(() => {
//     // Reset state when text changes
//     setDisplayedText('');
//     indexRef.current = 0;
    
//     // Split text into array of actual characters (handles emojis/unicode correctly)
//     // Guard against undefined/null text just in case
//     const characters = Array.from(text || "");
    
//     const timer = setInterval(() => {
//       if (indexRef.current < characters.length) {
//         // Capture the character immediately before state update to prevent race conditions
//         const charToAdd = characters[indexRef.current];
        
//         setDisplayedText((prev) => prev + charToAdd);
//         indexRef.current++;
//       } else {
//         clearInterval(timer);
//         if (onComplete) onComplete();
//       }
//     }, speed);

//     return () => clearInterval(timer);
//   }, [text, speed, onComplete]);

//   return <span className="whitespace-pre-wrap">{displayedText}</span>;
// };

// /**
//  * HEX STREAM COMPONENT (OPTIMIZED)
//  * Uses CSS transforms instead of React state updates for buttery smooth performance.
//  * Memoized to prevent re-renders.
//  */
// const HexStream = React.memo(({ className, rows = 40 }) => {
//   // Generate static content once per component instance
//   const content = useMemo(() => {
//     const chars = '0123456789ABCDEF';
//     let result = '';
//     for (let i = 0; i < rows; i++) {
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
//       result += '\n';
//     }
//     return result;
//   }, [rows]);

//   // Randomize speed and start position for organic feel
//   const animationStyle = useMemo(() => ({
//     animationDuration: `${15 + Math.random() * 15}s`, // Slower, smoother scroll (15-30s)
//     animationDelay: `-${Math.random() * 15}s`, // Start at random offset
//   }), []);

//   return (
//     <div className={`font-mono text-[10px] leading-tight select-none pointer-events-none whitespace-pre overflow-hidden h-full transition-colors duration-700 ${className}`}>
//       <div className="animate-matrix-scroll" style={animationStyle}>
//         {content}
//         {content} {/* Duplicate for seamless infinite loop */}
//       </div>
//     </div>
//   );
// });

// export default function App() {
//   const [booted, setBooted] = useState(false);
//   const [bootLogs, setBootLogs] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState("SECURE");
//   const [isDarkMode, setIsDarkMode] = useState(true);
//   const [sessionId, setSessionId] = useState(""); // Initialize as empty string to satisfy backend string requirement
//   const [isBlocked, setIsBlocked] = useState(false); // Track if session is currently blocked
//   const [blockedMessage, setBlockedMessage] = useState(""); // Message to show in blocking popup
  
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   // Set the Browser Tab Title
//   useEffect(() => {
//     document.title = "PromptShield";
//   }, []);

//   // Auto-scroll to bottom
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, isProcessing]);

//   // Initial Boot Sequence Effect
//   useEffect(() => {
//     // Clear logs on mount to ensure clean state
//     setBootLogs([]);

//     const logs = [
//       "Initializing PromptShield Kernel...",
//       "Loading Neural Defense Modules...",
//       "Verifying Encryption Keys...",
//       "Establishing Secure Tunnel...",
//       "Handshake Successful.",
//       "System Online."
//     ];

//     const timeouts = [];
//     let delay = 0;

//     logs.forEach((log, index) => {
//       // Smoother timing: faster and less erratic variance
//       delay += 150 + Math.random() * 200; 
//       const id = setTimeout(() => {
//         setBootLogs(prev => [...prev, log]);
//         if (index === logs.length - 1) {
//           const finalId = setTimeout(() => {
//             setBooted(true);
//             setMessages([{
//               id: Date.now(), 
//               sender: 'bot',
//               text: "System secured. Secure channel established. How can I help you today?",
//               type: 'system',
//               meta: "SYS_INIT"
//             }]);
//           }, 800);
//           timeouts.push(finalId);
//         }
//       }, delay);
//       timeouts.push(id);
//     });

//     // Cleanup function to clear timeouts if component unmounts or effect re-runs
//     return () => {
//       timeouts.forEach(clearTimeout);
//     };
//   }, []);

//   // Handle User Input & Backend Connection
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputValue.trim() || isProcessing) return;

//     const userMsg = {
//       id: Date.now(),
//       sender: 'user',
//       text: inputValue,
//       type: 'user'
//     };

//     setMessages(prev => [...prev, userMsg]);
//     setInputValue("");
//     setIsProcessing(true);

//     try {
//       const API_URL = "http://localhost:8000/chat"; 
      
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ 
//           session_id: sessionId, 
//           message: userMsg.text 
//         }), 
//       });

//       if (!response.ok) {
//         let errorMessage = `Server responded with ${response.status}`;
//         try {
//             const errorData = await response.json();
//             if (errorData.detail) {
//                 const details = Array.isArray(errorData.detail) 
//                     ? errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
//                     : errorData.detail;
//                 errorMessage += ` (${details})`;
//             }
//         } catch (e) {
//             // Fallback
//         }
//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
      
//       if (data.session_id) {
//         setSessionId(data.session_id);
//       }
      
//       const botMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: data.assistant_reply || data.message || "No response received.",
//         type: data.blocked ? 'warning' : 'success',
//         meta: data.label ? data.label.toUpperCase() : 'NET_200_OK'
//       };

//       // SECURITY FLUSH: If blocked, trigger popup then wipe history
//       if (data.blocked) {
//         setIsBlocked(true);
//         setBlockedMessage(botMsg.text);
        
//         // Auto-wipe delay (5 seconds)
//         setTimeout(() => {
//            setIsBlocked(false);
//            setMessages([]); // Clear all messages
//            setSessionId(""); // Reset session ID to force a fresh start
//         }, 5000);
        
//       } else {
//         setMessages(prev => [...prev, botMsg]);
//       }

//     } catch (error) {
//       console.error("Backend Error:", error);
      
//       const errorMsg = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: `Connection failed: ${error.message}.`,
//         type: 'error',
//         meta: 'ERR_CONN_REFUSED'
//       };
//       setMessages(prev => [...prev, errorMsg]);
//     } finally {
//       setIsProcessing(false);
//       setTimeout(() => inputRef.current?.focus(), 50);
//     }
//   };

//   // Toggle Theme
//   const toggleTheme = () => {
//     setIsDarkMode(!isDarkMode);
//   };

//   // Global Styles
//   const globalStyles = `
//     @keyframes scanline {
//       0% { transform: translateY(-100%); }
//       100% { transform: translateY(100vh); }
//     }
//     @keyframes scan-vertical {
//         0% { transform: translateY(-100%); }
//         50% { transform: translateY(100%); }
//         50.1% { transform: translateY(-100%); }
//         100% { transform: translateY(-100%); }
//     }
//     @keyframes matrix-scroll {
//         0% { transform: translateY(0); }
//         100% { transform: translateY(-50%); }
//     }
//     @keyframes blink {
//       0%, 100% { opacity: 1; }
//       50% { opacity: 0; }
//     }
//     @keyframes spin-slow {
//       from { transform: rotate(0deg); }
//       to { transform: rotate(360deg); }
//     }
//     @keyframes spin-reverse {
//       from { transform: rotate(360deg); }
//       to { transform: rotate(0deg); }
//     }
//     @keyframes glitch {
//       0% { transform: translate(0); }
//       20% { transform: translate(-2px, 2px); }
//       40% { transform: translate(-2px, -2px); }
//       60% { transform: translate(2px, 2px); }
//       80% { transform: translate(2px, -2px); }
//       100% { transform: translate(0); }
//     }
//     @keyframes fade-in {
//       0% { opacity: 0; transform: translateY(10px); }
//       100% { opacity: 1; transform: translateY(0); }
//     }
//     @keyframes scale-in {
//       0% { opacity: 0; transform: scale(0.9); }
//       100% { opacity: 1; transform: scale(1); }
//     }
//     @keyframes beam-slide {
//       0% { left: -100%; opacity: 0; }
//       50% { opacity: 1; }
//       100% { left: 100%; opacity: 0; }
//     }
//     .scanline-bar { animation: scanline 8s linear infinite; }
//     .animate-scan-vertical { animation: scan-vertical 12s linear infinite; }
//     .animate-blink { animation: blink 1s step-end infinite; }
//     .animate-spin-slow { animation: spin-slow 8s linear infinite; }
//     .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
//     .animate-matrix-scroll { animation: matrix-scroll linear infinite; }
//     .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
//     .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
//     .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
//     .animate-beam { animation: beam-slide 2s ease-in-out infinite; }
//     .scrollbar-hide::-webkit-scrollbar { display: none; }
//     .circuit-pattern {
//       background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10h-10zM50 50h10v10h-10zM80 20h10v10h-10zM20 80h10v10h-10z' fill='%2310b981' fill-opacity='0.03'/%3E%3Cpath d='M15 15h30v1h-30zM55 55h30v1h-30zM85 25v30h-1v-30zM25 85v-30h1v30z' fill='%2310b981' fill-opacity='0.03'/%3E%3C/svg%3E");
//     }
//   `;

//   // Render the Boot Screen
//   if (!booted) {
//     return (
//       <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono p-4 md:p-8 flex flex-col justify-end pb-10 md:pb-20 overflow-hidden relative selection:bg-emerald-500/30 selection:text-white">
//         <style>{globalStyles}</style>
//         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
//         <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_100%)]"></div>
        
//         <div className="max-w-6xl w-full mx-auto z-10">
//           <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 mb-8 md:mb-12 text-emerald-500 animate-pulse">
//             <div className="relative">
//                <Shield className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10" />
//                <div className="absolute inset-[-4px] md:inset-[-6px] border border-emerald-500/60 rounded-full border-t-transparent animate-spin-slow"></div>
//             </div>
//             <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] text-center md:text-left">
//               Prompt<span className="text-emerald-500">Shield</span>
//             </h1>
//           </div>
//           <div className="border-l border-emerald-800/50 pl-4 md:pl-6 space-y-1 md:space-y-1.5 font-mono text-xs md:text-base">
//             {bootLogs.map((log, i) => (
//               <div key={i} className="flex items-center gap-2 md:gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0ms' }}>
//                 <span className="text-emerald-600 font-bold">{`>>`}</span>
//                 <span className="tracking-wide text-emerald-100/70">{log}</span>
//               </div>
//             ))}
//             <div className="h-4 w-2.5 bg-emerald-500 animate-blink mt-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render Main Interface
//   return (
//     // Updated background colors for better visibility in Dark Mode
//     <div className={`min-h-screen font-mono relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-200' : 'bg-zinc-50 text-zinc-800 selection:bg-emerald-500/20 selection:text-emerald-900'}`}>
//       <style>{globalStyles}</style>
      
//       {/* BLOCKED SESSION MODAL */}
//       {isBlocked && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
//           <div className="relative z-10 w-full max-w-md bg-[#1a0505] border border-red-900/50 rounded-lg shadow-[0_0_50px_-10px_rgba(220,38,38,0.5)] p-8 flex flex-col items-center text-center animate-scale-in">
//             <div className="mb-4 text-red-500 animate-pulse">
//               <AlertTriangle size={64} />
//             </div>
//             <h2 className="text-2xl font-bold text-red-500 tracking-widest mb-2">ACCESS DENIED</h2>
//             <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent mb-6"></div>
//             <p className="text-red-200/80 font-mono text-sm mb-6 leading-relaxed">
//               {blockedMessage}
//             </p>
//             <div className="flex items-center gap-2 text-[10px] text-red-900 font-bold uppercase tracking-widest">
//                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
//                <span>Terminating Session...</span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* --- HUD CORNERS (Fixed Viewport Overlay) --- */}
//       <div className="fixed inset-0 pointer-events-none z-50 p-2 sm:p-6 md:p-10 flex flex-col justify-between">
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-80' : 'opacity-40'} transition-opacity duration-700`}>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 rounded-tl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 rounded-tr-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
//          </div>
//          <div className={`flex justify-between ${isDarkMode ? 'opacity-80' : 'opacity-40'} transition-opacity duration-700`}>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 rounded-bl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
//             <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 rounded-br-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
//          </div>
//       </div>

//       {/* --- CYBERSECURITY BACKGROUND LAYERS (Z-0) --- */}
//       <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isDarkMode ? 'bg-[#050505]' : 'bg-zinc-100'}`}>
//           <div className={`absolute inset-0 z-10 overflow-hidden transition-all duration-700 ${isDarkMode ? 'opacity-35 text-emerald-500' : 'opacity-15 text-emerald-900'}`}>
//              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0 w-full h-full">
//                 {[...Array(72)].map((_, i) => (
//                    <HexStream key={i} rows={60} className="block mx-auto" />
//                 ))}
//              </div>
//           </div>

//           <div className={`absolute inset-0 circuit-pattern z-10 transition-all duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-5 invert'}`}></div>
          
//           <div className={`absolute inset-0 bg-[size:20px_20px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}`}></div>
//           <div className={`absolute inset-0 bg-[size:100px_100px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)]'}`}></div>
          
//           <div className={`absolute inset-0 z-20 transition-all duration-700 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80' : 'bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-60'}`}></div>
          
//           <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none z-30">
//              <div className="w-full h-[40vh] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan-vertical blur-md"></div>
//           </div>
//       </div>
      
//       {/* CRT Scanline & Noise Overlay */}
//       <div className={`absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-700 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02] mix-blend-multiply'}`}></div>
//       <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
//          <div className="w-full h-[1px] bg-emerald-400/20 blur-[1px] scanline-bar"></div>
//       </div>

//       {/* Main Container */}
//       <div className={`w-full max-w-5xl h-[90dvh] md:h-[85vh] relative z-20 flex flex-col backdrop-blur-xl border shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group ring-1 transition-all duration-700
//         ${isDarkMode 
//           ? 'bg-[#121212]/95 border-emerald-500/30 ring-emerald-500/10' 
//           : 'bg-white/90 border-zinc-200 ring-zinc-200/50 shadow-xl'
//         }
//       `}>
        
//         {/* Header / HUD */}
//         <header className={`h-14 border-b flex items-center justify-between px-3 md:px-6 shrink-0 relative backdrop-blur-sm z-40 transition-colors duration-700
//           ${isDarkMode ? 'bg-[#0a0a0a]/80 border-emerald-500/30' : 'bg-white/60 border-zinc-200'}
//         `}>
//           <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
//           <div className="flex items-center gap-2 md:gap-3 group-hover:text-emerald-500 transition-colors duration-700 cursor-default">
//             {/* Spinning Ring Container */}
//             <div className={`relative p-2 mx-1 ${isDarkMode ? '' : ''}`}>
//               <Shield className="w-4 h-4 text-emerald-500 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
//               {/* Outer Slow Ring */}
//               <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full border-t-transparent border-l-transparent animate-spin-slow"></div>
//               {/* Inner Fast Ring */}
//               <div className="absolute inset-[3px] border border-emerald-400/80 rounded-full border-b-transparent animate-spin-reverse"></div>
//             </div>
            
//             <div className="flex flex-col leading-none glitch-hover">
//               <span className={`font-bold tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>Prompt<span className="text-emerald-600">Shield</span></span>
//             </div>
//           </div>
          
//           <div className="flex items-center gap-3 md:gap-6 text-[10px] font-bold tracking-widest uppercase">
//              <div className={`hidden md:flex items-center gap-2 transition-colors duration-700 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>
//                 <Globe size={10} className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}/>
//                 <span>US-EAST-1</span>
//              </div>
//              <div className={`flex items-center gap-2 px-2 py-1 border rounded-sm transition-colors duration-700 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500/90' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
//                 <Activity size={10} />
//                 <span>{connectionStatus}</span>
//              </div>
             
//              {/* THEME TOGGLE BUTTON */}
//              <button 
//                onClick={toggleTheme}
//                className={`p-1.5 rounded-sm transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
//                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
//              >
//                 {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
//              </button>
//           </div>
//         </header>

//         {/* Chat Area */}
//         <div className={`flex-1 overflow-y-auto p-3 md:p-8 space-y-6 scrollbar-hide flex flex-col transition-colors duration-700
//           ${isDarkMode 
//             ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#111111] to-[#111111]' 
//             : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white'
//           }
//         `}>
//           {messages.map((msg, idx) => (
//             <div 
//               key={msg.id} 
//               className={`flex flex-col max-w-[90%] md:max-w-[70%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
//             >
//               {/* Meta data for Bot messages */}
//               {msg.sender === 'bot' && (
//                 <div className={`flex items-center gap-2 text-[9px] mb-1.5 font-bold tracking-widest uppercase ml-1 opacity-70 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//                   <Terminal size={10} className="text-emerald-600" />
//                   <span className="text-emerald-600/90">{msg.meta || 'SYS_LOG'}</span>
//                   <span className={isDarkMode ? "text-zinc-600" : "text-zinc-300"}>|</span>
//                   <span>
//                     {(() => {
//                       const d = new Date(msg.id);
//                       const day = d.getDate();
//                       const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
//                       const month = d.toLocaleString('default', { month: 'long' });
//                       const year = d.getFullYear();
//                       const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
//                       return `${day}${suffix} ${month} ${year} ${time}`;
//                     })()}
//                   </span>
//                 </div>
//               )}

//               {/* Message Bubble */}
//               <div 
//                 className={`
//                   relative px-4 py-3 md:px-5 md:py-3.5 text-sm md:text-[14px] leading-relaxed backdrop-blur-md border transition-all duration-700
//                   ${msg.sender === 'user' 
//                     ? isDarkMode 
//                         ? 'bg-[#27272a] border-white/5 text-zinc-100 rounded-lg rounded-br-sm shadow-[0_2px_10px_-5px_rgba(0,0,0,0.5)]' 
//                         : 'bg-zinc-100 border-zinc-200 text-zinc-800 rounded-lg rounded-br-sm shadow-sm'
//                     : isDarkMode
//                         ? `bg-[#1a1a1a] border-emerald-500/20 text-emerald-50/90 rounded-lg rounded-bl-sm shadow-[0_0_15px_-5px_rgba(16,185,129,0.05)] ${msg.type === 'warning' ? 'border-amber-500/30 text-amber-100/90' : ''}`
//                         : `bg-white border-emerald-100 text-emerald-900 rounded-lg rounded-bl-sm shadow-sm ${msg.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}`
//                   }
//                 `}
//               >
//                 {/* Tech Accents for Bot Bubbles */}
//                 {msg.sender === 'bot' && (
//                   <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-l border-t rounded-tl-lg ${msg.type === 'warning' ? 'border-amber-500/40' : 'border-emerald-500/40'}`}></div>
//                 )}

//                 {msg.type === 'user' ? (
//                   <span className="tracking-wide font-light">{msg.text}</span>
//                 ) : (
//                   <div className={`
//                     ${msg.type === 'error' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]' : ''}
//                     ${msg.type === 'warning' ? 'text-amber-400' : ''}
//                     ${msg.type === 'success' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-700') : ''}
//                     ${msg.type === 'system' ? 'text-cyan-400' : ''}
//                   `}>
//                     {idx === messages.length - 1 ? (
//                       <Typewriter text={msg.text} speed={20} />
//                     ) : (
//                       <span className="whitespace-pre-wrap">{msg.text}</span>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))}

//           {isProcessing && (
//              <div className="flex flex-col self-start max-w-[75%] animate-pulse">
//                 <div className={`flex items-center gap-2 text-[9px] mb-1 font-bold tracking-widest uppercase ml-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>
//                   <Cpu size={10} />
//                   <span>ANALYZING</span>
//                 </div>
//                 <div className={`border px-4 py-3 rounded-lg rounded-bl-sm w-16 flex items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-zinc-200'}`}>
//                    <div className="flex gap-1">
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
//                       <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
//                    </div>
//                 </div>
//              </div>
//           )}
//           <div ref={messagesEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className={`p-3 md:p-4 border-t shrink-0 backdrop-blur-xl relative overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#111111]/80 border-emerald-500/20' : 'bg-white/80 border-zinc-200'}`}>
//           {/* Active Beam Animation - Brighter */}
//           {(isProcessing || inputValue.length > 0) && (
//              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-beam shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
//           )}

//           <form 
//             onSubmit={handleSendMessage}
//             className={`flex items-center gap-3 border transition-all duration-200 rounded-sm px-3 py-2.5 md:px-4 md:py-3 shadow-inner relative z-10
//               ${isDarkMode 
//                 ? 'bg-[#151515] border-white/30 focus-within:border-emerald-500/60 focus-within:ring-emerald-500/30' 
//                 : 'bg-zinc-50 border-zinc-300 focus-within:border-emerald-500/60 focus-within:bg-white focus-within:ring-emerald-500/20'
//               } focus-within:ring-[1px]
//             `}
//           >
//             <div className={`group-focus-within:text-emerald-500 transition-colors duration-200 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//               <ChevronRight size={18} />
//             </div>
//             <input
//               ref={inputRef}
//               type="text"
//               value={inputValue}
//               onChange={(e) => setInputValue(e.target.value)}
//               placeholder="Enter command..."
//               className={`flex-1 bg-transparent border-none outline-none text-sm font-mono tracking-wider transition-colors duration-700 ${isDarkMode ? 'text-zinc-100 placeholder-zinc-400' : 'text-zinc-900 placeholder-zinc-400'}`}
//               autoComplete="off"
//             />
//             <button 
//               type="submit" 
//               disabled={!inputValue.trim() || isProcessing}
//               className={`transition-colors duration-700 ${isDarkMode ? 'text-zinc-500 hover:text-emerald-400' : 'text-zinc-400 hover:text-emerald-600'} disabled:opacity-30`}
//             >
//               <Send size={16} />
//             </button>
//           </form>
          
//           <div className="mt-2 md:mt-3 flex justify-between items-center px-1 opacity-60 hover:opacity-100 transition-opacity">
//             <div className={`flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//               <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
//               <span>System Ready</span>
//             </div>
//             <div className={`text-[9px] font-mono flex items-center gap-2 tracking-widest transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
//               <Zap size={10} />
//               <span>LATENCY: 12ms</span>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Background Decor */}
//       <div className={`fixed bottom-6 right-6 text-[9px] font-mono hidden md:block text-right pointer-events-none z-50 transition-colors duration-700 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-300'}`}>
//         <div className="opacity-50 tracking-widest">
//           ID: {sessionId ? `${'*'.repeat(Math.max(0, sessionId.length - 4))}${sessionId.slice(-4)}` : 'CONNECTING...'}
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, 
  Terminal, 
  Send, 
  Cpu, 
  Wifi, 
  Activity,
  Lock,
  Zap,
  ChevronRight,
  Globe,
  Database,
  Eye,
  Crosshair,
  Server,
  Key,
  Sun,
  Moon,
  AlertTriangle,
  RotateCcw,
  Clock
} from 'lucide-react';


const COOLDOWN_KEY = "ps_cooldown_until_ms";

/**
 * TYPEWRITER COMPONENT
 * Renders text character by character for that retro-terminal feel
 * Updated to handle Unicode/Emojis correctly using Array.from()
 */
const Typewriter = ({ text, onComplete, speed = 15 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  
  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    indexRef.current = 0;
    
    // Split text into array of actual characters (handles emojis/unicode correctly)
    // Guard against undefined/null text just in case
    const characters = Array.from(text || "");
    
    const timer = setInterval(() => {
      if (indexRef.current < characters.length) {
        // Capture the character immediately before state update to prevent race conditions
        const charToAdd = characters[indexRef.current];
        
        setDisplayedText((prev) => prev + charToAdd);
        indexRef.current++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

/**
 * HEX STREAM COMPONENT (OPTIMIZED)
 * Uses CSS transforms instead of React state updates for buttery smooth performance.
 * Memoized to prevent re-renders.
 */
const HexStream = React.memo(({ className, rows = 40 }) => {
  // Generate static content once per component instance
  const content = useMemo(() => {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < rows; i++) {
      result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
      result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
      result += `0x${chars[Math.floor(Math.random() * 16)]}${chars[Math.floor(Math.random() * 16)]} `;
      result += '\n';
    }
    return result;
  }, [rows]);

  // Randomize speed and start position for organic feel
  const animationStyle = useMemo(() => ({
    animationDuration: `${15 + Math.random() * 15}s`, // Slower, smoother scroll (15-30s)
    animationDelay: `-${Math.random() * 15}s`, // Start at random offset
  }), []);

  return (
    <div className={`font-mono text-[10px] leading-tight select-none pointer-events-none whitespace-pre overflow-hidden h-full transition-colors duration-700 ${className}`}>
      <div className="animate-matrix-scroll" style={animationStyle}>
        {content}
        {content} {/* Duplicate for seamless infinite loop */}
      </div>
    </div>
  );
});

export default function App() {
  const [booted, setBooted] = useState(false);
  const [bootLogs, setBootLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("SECURE");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sessionId, setSessionId] = useState("");
  
  // Blocked state (for malicious prompts)
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");
  
  // Rate limit state (separate from blocked)
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Set the Browser Tab Title
  useEffect(() => {
    document.title = "PromptShield";
    let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      // Point this to your SVG file in the public folder
      link.href = '/Shield.png'; 
    }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  // Cleanup cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Initial Boot Sequence Effect
  useEffect(() => {
    // Clear logs on mount to ensure clean state
    setBootLogs([]);

    const logs = [
      "Initializing PromptShield Kernel...",
      "Loading Neural Defense Modules...",
      "Verifying Encryption Keys...",
      "Establishing Secure Tunnel...",
      "Handshake Successful.",
      "System Online."
    ];

    const timeouts = [];
    let delay = 0;

    logs.forEach((log, index) => {
      // Smoother timing: faster and less erratic variance
      delay += 150 + Math.random() * 200; 
      const id = setTimeout(() => {
        setBootLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          const finalId = setTimeout(() => {
            setBooted(true);
            setMessages([{
              id: Date.now(), 
              sender: 'bot',
              text: "System secured. Secure channel established. How can I help you today?",
              type: 'system',
              meta: "SYS_INIT"
            }]);
          }, 800);
          timeouts.push(finalId);
        }
      }, delay);
      timeouts.push(id);
    });

    // Cleanup function to clear timeouts if component unmounts or effect re-runs
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  // Start cooldown timer

  // const startCooldown = (seconds) => {
  //   setCooldownActive(true);
  //   setCooldownRemaining(seconds);
    
  //   // Clear any existing timer
  //   if (cooldownTimerRef.current) {
  //     clearInterval(cooldownTimerRef.current);
  //   }
    
  //   cooldownTimerRef.current = setInterval(() => {
  //     setCooldownRemaining(prev => {
  //       if (prev <= 1) {
  //         clearInterval(cooldownTimerRef.current);
  //         setCooldownActive(false);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);
  // };

  // New effort to fix the sync issue ---------------------------------------
  const startCooldownUntil = (untilMs) => {
    const remaining = Math.max(0, Math.ceil((untilMs - Date.now()) / 1000));
    setCooldownActive(remaining > 0);
    setCooldownRemaining(remaining);

    localStorage.setItem(COOLDOWN_KEY, String(untilMs));

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      const nextRemaining = Math.max(0, Math.ceil((untilMs - Date.now()) / 1000));
      setCooldownRemaining(nextRemaining);

      if (nextRemaining <= 0) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
        setCooldownActive(false);
        localStorage.removeItem(COOLDOWN_KEY);
        // optional: auto-close modal
        // setIsRateLimited(false);
      }
    }, 250);
  };

  useEffect(() => {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    if (!stored) return;

    const untilMs = Number(stored);
    if (!Number.isFinite(untilMs)) {
      localStorage.removeItem(COOLDOWN_KEY);
      return;
    }

    if (untilMs > Date.now()) {
      startCooldownUntil(untilMs);
    } else {
      localStorage.removeItem(COOLDOWN_KEY);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //-------------------------------------------------

  // Format cooldown time
  const formatCooldown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Handle User Input & Backend Connection
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing || cooldownActive) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue,
      type: 'user'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsProcessing(true);

    try {
      //const API_URL = "http://localhost:8000/chat"; 
      const API_BASE = import.meta.env.VITE_API_BASE;
      const API_URL = `${API_BASE}/chat`;
      
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          session_id: sessionId, 
          message: userMsg.text 
        }), 
      });

      // HANDLE RATE LIMITING FIRST (before response.ok check) --- older one not sync
      // if (response.status === 429 || response.status === 503) {
      //   let message = "Rate limit exceeded. Please wait.";
        
      //   try {
      //     const data = await response.json();
      //     message = data.detail || message;
      //   } catch {
      //     // If JSON parsing fails, try text
      //     try {
      //       const text = await response.text();
      //       message = text.replace(/"/g, '') || message;
      //     } catch {
      //       // Use default message
      //     }
      //   }
        
      //   setIsRateLimited(true);
      //   setRateLimitMessage(message);
        
      //   // Start 15-minute cooldown (900 seconds)
      //   // startCooldown(120);  --- termp disabled cuz harcoded
        
      //   setIsProcessing(false);
      //   return;
      // }

      // Newer one, effort to sync -------

      if (response.status === 429 || response.status === 503) {
        let message = "Rate limit exceeded. Please wait.";
        let untilMs = null;

        // Prefer JSON body
        try {
          const data = await response.json();
          message = data.detail || message;

          if (Number.isFinite(data.cooldown_until_ms)) {
            untilMs = data.cooldown_until_ms;
          } else if (Number.isFinite(data.retry_after)) {
            untilMs = Date.now() + data.retry_after * 1000;
          }
        } catch {
          // fallback to Retry-After header
          const ra = response.headers.get("Retry-After");
          if (ra && /^\d+$/.test(ra)) {
            untilMs = Date.now() + parseInt(ra, 10) * 1000;
          }
        }

        // If backend gave nothing (shouldn’t after your changes), last-resort fallback
        if (!untilMs) untilMs = Date.now() + 120 * 1000;

        setIsRateLimited(true);
        setRateLimitMessage(message);
        startCooldownUntil(untilMs);

        setIsProcessing(false);
        return;
      }

// -----------------------------------------------------------
      if (!response.ok) {
        let errorMessage = `Server responded with ${response.status}`;
        try {
            const errorData = await response.json();
            if (errorData.detail) {
                const details = Array.isArray(errorData.detail) 
                    ? errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
                    : errorData.detail;
                errorMessage += ` (${details})`;
            }
        } catch (e) {
            // Fallback
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.assistant_reply || data.message || "No response received.",
        type: data.blocked ? 'warning' : 'success',
        meta: data.label ? data.label.toUpperCase() : 'NET_200_OK'
      };

      // SECURITY FLUSH: If blocked, trigger popup then wipe history
      if (data.blocked) {
        setIsBlocked(true);
        setBlockedMessage(botMsg.text);
        
        // Auto-wipe delay (5 seconds)
        setTimeout(() => {
           setIsBlocked(false);
           setMessages([]); // Clear all messages
           setSessionId(""); // Reset session ID to force a fresh start
           // Add system message after reset
           setMessages([{
             id: Date.now(), 
             sender: 'bot',
             text: "Session reset. Secure channel re-established. How can I help you?",
             type: 'system',
             meta: "SYS_RESET"
           }]);
        }, 5000);
        
      } else {
        setMessages(prev => [...prev, botMsg]);
      }

    } catch (error) {
      console.error("Backend Error:", error);
      
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Connection failed: ${error.message}.`,
        type: 'error',
        meta: 'ERR_CONN_REFUSED'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Global Styles
  const globalStyles = `
    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    @keyframes scan-vertical {
        0% { transform: translateY(-100%); }
        50% { transform: translateY(100%); }
        50.1% { transform: translateY(-100%); }
        100% { transform: translateY(-100%); }
    }
    @keyframes matrix-scroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes spin-reverse {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    @keyframes fade-in {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes scale-in {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes beam-slide {
      0% { left: -100%; opacity: 0; }
      50% { opacity: 1; }
      100% { left: 100%; opacity: 0; }
    }
    @keyframes countdown-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .scanline-bar { animation: scanline 8s linear infinite; }
    .animate-scan-vertical { animation: scan-vertical 12s linear infinite; }
    .animate-blink { animation: blink 1s step-end infinite; }
    .animate-spin-slow { animation: spin-slow 8s linear infinite; }
    .animate-spin-reverse { animation: spin-reverse 12s linear infinite; }
    .animate-matrix-scroll { animation: matrix-scroll linear infinite; }
    .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
    .animate-scale-in { animation: scale-in 0.2s ease-out forwards; }
    .glitch-hover:hover { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
    .animate-beam { animation: beam-slide 2s ease-in-out infinite; }
    .animate-countdown-pulse { animation: countdown-pulse 1s ease-in-out infinite; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .circuit-pattern {
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h10v10h-10zM50 50h10v10h-10zM80 20h10v10h-10zM20 80h10v10h-10z' fill='%2310b981' fill-opacity='0.03'/%3E%3Cpath d='M15 15h30v1h-30zM55 55h30v1h-30zM85 25v30h-1v-30zM25 85v-30h1v30z' fill='%2310b981' fill-opacity='0.03'/%3E%3C/svg%3E");
    }
  `;

  // Render the Boot Screen
  if (!booted) {
    return (
      <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono p-4 md:p-8 flex flex-col justify-end pb-10 md:pb-20 overflow-hidden relative selection:bg-emerald-500/30 selection:text-white">
        <style>{globalStyles}</style>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_60%,transparent_100%)]"></div>
        
        <div className="max-w-6xl w-full mx-auto z-10">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 mb-8 md:mb-12 text-emerald-500 animate-pulse">
            <div className="relative">
               <Shield className="w-16 h-16 md:w-24 md:h-24 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)] relative z-10" />
               <div className="absolute inset-[-4px] md:inset-[-6px] border border-emerald-500/60 rounded-full border-t-transparent animate-spin-slow"></div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] text-center md:text-left">
              Prompt<span className="text-emerald-500">Shield</span>
            </h1>
          </div>
          <div className="border-l border-emerald-800/50 pl-4 md:pl-6 space-y-1 md:space-y-1.5 font-mono text-xs md:text-base">
            {bootLogs.map((log, i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0ms' }}>
                <span className="text-emerald-600 font-bold">{`>>`}</span>
                <span className="tracking-wide text-emerald-100/70">{log}</span>
              </div>
            ))}
            <div className="h-4 w-2.5 bg-emerald-500 animate-blink mt-3 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render Main Interface
  return (
    // Updated background colors for better visibility in Dark Mode
    <div className={`min-h-screen font-mono relative overflow-hidden flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 transition-colors duration-700 ${isDarkMode ? 'bg-[#050505] text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-200' : 'bg-zinc-50 text-zinc-800 selection:bg-emerald-500/20 selection:text-emerald-900'}`}>
      <style>{globalStyles}</style>
      
      {/* BLOCKED SESSION MODAL (Red - for malicious prompts) */}
      {isBlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
          <div className="relative z-10 w-full max-w-md bg-[#1a0505] border border-red-900/50 rounded-lg shadow-[0_0_50px_-10px_rgba(220,38,38,0.5)] p-8 flex flex-col items-center text-center animate-scale-in">
            <div className="mb-4 text-red-500 animate-pulse">
              <AlertTriangle size={64} />
            </div>
            <h2 className="text-2xl font-bold text-red-500 tracking-widest mb-2">MALICIOUS ACTIVITY DETECTED</h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-red-900 to-transparent mb-6"></div>
            <p className="text-red-200/80 font-mono text-sm mb-6 leading-relaxed">
              {blockedMessage}
            </p>
            <div className="flex items-center gap-2 text-[10px] text-red-900 font-bold uppercase tracking-widest">
               <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
               <span>Terminating Session...</span>
            </div>
          </div>
        </div>
      )}

      {/* RATE LIMITED MODAL (Amber - for rate limiting) */}
      {isRateLimited && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"></div>
          <div className="relative z-10 w-full max-w-md bg-[#1a1505] border border-amber-900/50 rounded-lg shadow-[0_0_50px_-10px_rgba(234,179,8,0.5)] p-8 flex flex-col items-center text-center animate-scale-in">
            <div className="mb-4 text-amber-500">
              <Clock size={64} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-amber-500 tracking-widest mb-2">RATE LIMITED</h2>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-900 to-transparent mb-6"></div>
            <p className="text-amber-200/80 font-mono text-sm mb-6 leading-relaxed">
              {rateLimitMessage}
            </p>
            
            {/* Cooldown Timer Display */}
            {cooldownActive && (
              <div className="mb-6 px-4 py-3 bg-amber-950/30 border border-amber-800/30 rounded-lg">
                <div className="text-[10px] text-amber-600 uppercase tracking-widest mb-1">Cooldown Remaining</div>
                <div className="text-2xl font-bold text-amber-400 animate-countdown-pulse">
                  {formatCooldown(cooldownRemaining)}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setIsRateLimited(false)}
              className="px-6 py-2 bg-amber-900/30 border border-amber-700/50 rounded text-amber-500 text-sm font-bold uppercase tracking-widest hover:bg-amber-900/50 transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* --- HUD CORNERS (Fixed Viewport Overlay) --- */}
      <div className="fixed inset-0 pointer-events-none z-50 p-2 sm:p-6 md:p-10 flex flex-col justify-between">
         <div className={`flex justify-between ${isDarkMode ? 'opacity-80' : 'opacity-40'} transition-opacity duration-700`}>
            <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-t-2 rounded-tl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
            <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-t-2 rounded-tr-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
         </div>
         <div className={`flex justify-between ${isDarkMode ? 'opacity-80' : 'opacity-40'} transition-opacity duration-700`}>
            <div className={`w-6 h-6 md:w-8 md:h-8 border-l-2 border-b-2 rounded-bl-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
            <div className={`w-6 h-6 md:w-8 md:h-8 border-r-2 border-b-2 rounded-br-sm transition-colors duration-700 ${isDarkMode ? 'border-emerald-500/80' : 'border-emerald-600/40'}`}></div>
         </div>
      </div>

      {/* --- CYBERSECURITY BACKGROUND LAYERS (Z-0) --- */}
      <div className={`absolute inset-0 z-0 transition-colors duration-700 ${isDarkMode ? 'bg-[#050505]' : 'bg-zinc-100'}`}>
          <div className={`absolute inset-0 z-10 overflow-hidden transition-all duration-700 ${isDarkMode ? 'opacity-35 text-emerald-500' : 'opacity-15 text-emerald-900'}`}>
             <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-0 w-full h-full">
                {[...Array(72)].map((_, i) => (
                   <HexStream key={i} rows={60} className="block mx-auto" />
                ))}
             </div>
          </div>

          <div className={`absolute inset-0 circuit-pattern z-10 transition-all duration-700 ${isDarkMode ? 'opacity-100' : 'opacity-5 invert'}`}></div>
          
          <div className={`absolute inset-0 bg-[size:20px_20px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'}`}></div>
          <div className={`absolute inset-0 bg-[size:100px_100px] z-10 transition-all duration-700 ${isDarkMode ? 'bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)]'}`}></div>
          
          <div className={`absolute inset-0 z-20 transition-all duration-700 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80' : 'bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_100%)] opacity-60'}`}></div>
          
          <div className="absolute inset-0 overflow-hidden opacity-40 pointer-events-none z-30">
             <div className="w-full h-[40vh] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan-vertical blur-md"></div>
          </div>
      </div>
      
      {/* CRT Scanline & Noise Overlay */}
      <div className={`absolute inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-700 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-[0.02] mix-blend-multiply'}`}></div>
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
         <div className="w-full h-[1px] bg-emerald-400/20 blur-[1px] scanline-bar"></div>
      </div>

      {/* Main Container */}
      <div className={`w-full max-w-5xl h-[90dvh] md:h-[85vh] relative z-20 flex flex-col backdrop-blur-xl border shadow-[0_0_100px_-20px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden group ring-1 transition-all duration-700
        ${isDarkMode 
          ? 'bg-[#121212]/95 border-emerald-500/30 ring-emerald-500/10' 
          : 'bg-white/90 border-zinc-200 ring-zinc-200/50 shadow-xl'
        }
      `}>
        
        {/* Header / HUD */}
        <header className={`h-14 border-b flex items-center justify-between px-3 md:px-6 shrink-0 relative backdrop-blur-sm z-40 transition-colors duration-700
          ${isDarkMode ? 'bg-[#0a0a0a]/80 border-emerald-500/30' : 'bg-white/60 border-zinc-200'}
        `}>
          <div className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
          <div className="flex items-center gap-2 md:gap-3 group-hover:text-emerald-500 transition-colors duration-700 cursor-default">
            {/* Spinning Ring Container */}
            <div className={`relative p-2 mx-1 ${isDarkMode ? '' : ''}`}>
              <Shield className="w-4 h-4 text-emerald-500 relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              {/* Outer Slow Ring */}
              <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full border-t-transparent border-l-transparent animate-spin-slow"></div>
              {/* Inner Fast Ring */}
              <div className="absolute inset-[3px] border border-emerald-400/80 rounded-full border-b-transparent animate-spin-reverse"></div>
            </div>
            
            <div className="flex flex-col leading-none glitch-hover">
              <span className={`font-bold tracking-[0.2em] text-xs md:text-sm uppercase transition-colors duration-700 ${isDarkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>Prompt<span className="text-emerald-600">Shield</span></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6 text-[10px] font-bold tracking-widest uppercase">
             <div className={`hidden md:flex items-center gap-2 transition-colors duration-700 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>
                <Globe size={10} className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}/>
                <span>US-EAST-1</span>
             </div>
             
             {/* Status indicator - shows cooldown if active */}
             {cooldownActive ? (
               <div className={`flex items-center gap-2 px-2 py-1 border rounded-sm transition-colors duration-700 bg-amber-950/20 border-amber-900/40 text-amber-500/90`}>
                  <Clock size={10} className="animate-pulse" />
                  <span>COOLDOWN {formatCooldown(cooldownRemaining)}</span>
               </div>
             ) : (
               <div className={`flex items-center gap-2 px-2 py-1 border rounded-sm transition-colors duration-700 ${isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500/90' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <Activity size={10} />
                  <span>{connectionStatus}</span>
               </div>
             )}
             
             {/* THEME TOGGLE BUTTON */}
             <button 
               onClick={toggleTheme}
               className={`p-1.5 rounded-sm transition-all duration-300 hover:scale-110 ${isDarkMode ? 'bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'}`}
               title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
             </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className={`flex-1 overflow-y-auto p-3 md:p-8 space-y-6 scrollbar-hide flex flex-col transition-colors duration-700
          ${isDarkMode 
            ? 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/10 via-[#111111] to-[#111111]' 
            : 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-50 via-white to-white'
          }
        `}>
          {messages.map((msg, idx) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[90%] md:max-w-[70%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {/* Meta data for Bot messages */}
              {msg.sender === 'bot' && (
                <div className={`flex items-center gap-2 text-[9px] mb-1.5 font-bold tracking-widest uppercase ml-1 opacity-70 transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  <Terminal size={10} className="text-emerald-600" />
                  <span className="text-emerald-600/90">{msg.meta || 'SYS_LOG'}</span>
                  <span className={isDarkMode ? "text-zinc-600" : "text-zinc-300"}>|</span>
                  <span>
                    {(() => {
                      const d = new Date(msg.id);
                      const day = d.getDate();
                      const suffix = (day % 10 === 1 && day !== 11) ? 'st' : (day % 10 === 2 && day !== 12) ? 'nd' : (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
                      const month = d.toLocaleString('default', { month: 'long' });
                      const year = d.getFullYear();
                      const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                      return `${day}${suffix} ${month} ${year} ${time}`;
                    })()}
                  </span>
                </div>
              )}

              {/* Message Bubble */}
              <div 
                className={`
                  relative px-4 py-3 md:px-5 md:py-3.5 text-sm md:text-[14px] leading-relaxed backdrop-blur-md border transition-all duration-700
                  ${msg.sender === 'user' 
                    ? isDarkMode 
                        ? 'bg-[#27272a] border-white/5 text-zinc-100 rounded-lg rounded-br-sm shadow-[0_2px_10px_-5px_rgba(0,0,0,0.5)]' 
                        : 'bg-zinc-100 border-zinc-200 text-zinc-800 rounded-lg rounded-br-sm shadow-sm'
                    : isDarkMode
                        ? `bg-[#1a1a1a] border-emerald-500/20 text-emerald-50/90 rounded-lg rounded-bl-sm shadow-[0_0_15px_-5px_rgba(16,185,129,0.05)] ${msg.type === 'warning' ? 'border-amber-500/30 text-amber-100/90' : ''}`
                        : `bg-white border-emerald-100 text-emerald-900 rounded-lg rounded-bl-sm shadow-sm ${msg.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}`
                  }
                `}
              >
                {/* Tech Accents for Bot Bubbles */}
                {msg.sender === 'bot' && (
                  <div className={`absolute top-0 left-0 w-1.5 h-1.5 border-l border-t rounded-tl-lg ${msg.type === 'warning' ? 'border-amber-500/40' : 'border-emerald-500/40'}`}></div>
                )}

                {msg.type === 'user' ? (
                  <span className="tracking-wide font-light">{msg.text}</span>
                ) : (
                  <div className={`
                    ${msg.type === 'error' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]' : ''}
                    ${msg.type === 'warning' ? 'text-amber-400' : ''}
                    ${msg.type === 'success' ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-700') : ''}
                    ${msg.type === 'system' ? 'text-cyan-400' : ''}
                  `}>
                    {idx === messages.length - 1 ? (
                      <Typewriter text={msg.text} speed={20} />
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
             <div className="flex flex-col self-start max-w-[75%] animate-pulse">
                <div className={`flex items-center gap-2 text-[9px] mb-1 font-bold tracking-widest uppercase ml-1 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  <Cpu size={10} />
                  <span>ANALYZING</span>
                </div>
                <div className={`border px-4 py-3 rounded-lg rounded-bl-sm w-16 flex items-center justify-center transition-colors duration-700 ${isDarkMode ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-zinc-200'}`}>
                   <div className="flex gap-1">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                   </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`p-3 md:p-4 border-t shrink-0 backdrop-blur-xl relative overflow-hidden transition-colors duration-700 ${isDarkMode ? 'bg-[#111111]/80 border-emerald-500/20' : 'bg-white/80 border-zinc-200'}`}>
          {/* Active Beam Animation - Brighter */}
          {(isProcessing || inputValue.length > 0) && !cooldownActive && (
             <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-beam shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          )}
          
          {/* Cooldown warning beam */}
          {cooldownActive && (
             <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-beam shadow-[0_0_10px_rgba(234,179,8,0.8)]"></div>
          )}

          <form 
            onSubmit={handleSendMessage}
            className={`flex items-center gap-3 border transition-all duration-200 rounded-lg px-3 py-2.5 md:px-4 md:py-3 shadow-inner relative z-10
              ${cooldownActive
                ? isDarkMode
                  ? 'bg-amber-950/20 border-amber-800/30 cursor-not-allowed'
                  : 'bg-amber-50 border-amber-200 cursor-not-allowed'
                : isDarkMode 
                  ? 'bg-[#151515] border-white/30 focus-within:border-emerald-500/60 focus-within:ring-emerald-500/30' 
                  : 'bg-zinc-50 border-zinc-300 focus-within:border-emerald-500/60 focus-within:bg-white focus-within:ring-emerald-500/20'
              } focus-within:ring-[1px]
            `}
          >
            <div className={`group-focus-within:text-emerald-500 transition-colors duration-200 ${cooldownActive ? 'text-amber-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              {cooldownActive ? <Clock size={18} /> : <ChevronRight size={18} />}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={cooldownActive ? `Rate limited. Try again in ${formatCooldown(cooldownRemaining)}` : "Ask Me Anything..."}
              disabled={cooldownActive}
              className={`flex-1 bg-transparent border-none outline-none text-sm font-mono tracking-wider transition-colors duration-700 ${cooldownActive ? 'text-amber-500/50 placeholder-amber-500/50 cursor-not-allowed' : isDarkMode ? 'text-zinc-100 placeholder-zinc-400' : 'text-zinc-900 placeholder-zinc-400'}`}
              autoComplete="off"
            />
            <button 
              type="submit" 
              disabled={!inputValue.trim() || isProcessing || cooldownActive}
              className={`transition-colors duration-700 ${cooldownActive ? 'text-amber-500/30' : isDarkMode ? 'text-zinc-500 hover:text-emerald-400' : 'text-zinc-400 hover:text-emerald-600'} disabled:opacity-30`}
            >
              <Send size={16} />
            </button>
          </form>
          
          <div className="mt-2 md:mt-3 flex justify-between items-center px-1 opacity-60 hover:opacity-100 transition-opacity">
            <div className={`flex items-center gap-2 text-[9px] font-bold tracking-widest uppercase transition-colors duration-700 ${cooldownActive ? 'text-amber-500' : isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <div className={`w-1 h-1 rounded-full animate-pulse ${cooldownActive ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
              <span>{cooldownActive ? 'Cooldown Active' : 'System Ready'}</span>
            </div>
            <div className={`text-[9px] font-mono flex items-center gap-2 tracking-widest transition-colors duration-700 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              <Zap size={10} />
              <span>LATENCY: 12ms</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className={`fixed bottom-6 right-6 text-[9px] font-mono hidden md:block text-right pointer-events-none z-50 transition-colors duration-700 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-300'}`}>
        <div className="opacity-50 tracking-widest">
          ID: {sessionId ? `${'*'.repeat(Math.max(0, sessionId.length - 4))}${sessionId.slice(-4)}` : 'CONNECTING...'}
        </div>
      </div>
    </div>
  );
}

