import { useEffect, useState } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone app mode
    const isRunningStandalone =
      (typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches) ||
      (typeof window !== 'undefined' && (window.navigator as any)?.standalone === true);

    if (isRunningStandalone) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed recently (within last 24h)
    try {
      const dismissedTime = localStorage.getItem('smartdoor_pwa_dismissed');
      if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    } catch (_) {}

    // Check for iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(ua);
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    if (isAppleDevice && isSafari && !isRunningStandalone) {
      setIsIOS(true);
    }

    // Listen for beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('[PWA] Installation prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('smartdoor_pwa_dismissed', Date.now().toString());
    } catch (_) {}
  };

  if (isStandalone || isDismissed || (!deferredPrompt && !isIOS)) {
    return null;
  }

  return (
    <aside
      className="pwa-install-banner fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50 animate-reveal-up"
      role="region"
      aria-label="Install mobile application"
    >
      <div className="bg-white/95 backdrop-blur-md border border-[#e2e8db] rounded-2xl p-3.5 shadow-xl shadow-[#2d3e2a]/10 flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#57765d] flex-shrink-0 flex items-center justify-center text-white shadow-sm">
            <Smartphone size={20} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[#26352b] tracking-tight leading-tight">
              Install SmartDoor App
            </h4>
            <p className="text-[11px] text-[#778075] truncate mt-0.5">
              {isIOS ? (
                <span className="flex items-center gap-1">
                  Tap <Share size={11} className="inline flex-shrink-0" /> then &ldquo;Add to Home Screen&rdquo;
                </span>
              ) : (
                'Instant access & native mobile experience'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-[#57765d] hover:bg-[#47624c] active:scale-95 text-white text-[11px] font-medium transition-all shadow-sm flex items-center gap-1 min-h-0"
              aria-label="Install app now"
            >
              <Download size={12} strokeWidth={2} />
              <span>Install</span>
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg text-[#8c9483] hover:text-[#26352b] hover:bg-[#f0f4ec] flex items-center justify-center transition-colors min-h-0"
            aria-label="Dismiss installation prompt"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
export default PwaInstallBanner;
