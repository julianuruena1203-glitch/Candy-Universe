import { useState, useEffect, useRef } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateSuccessNotice, setUpdateSuccessNotice] = useState(false);
  const updateFunctionRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    try {
      const updateSW = registerSW({
        immediate: true,
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          console.log('PWA lista para trabajar sin conexión.');
        },
        onRegistered(registration) {
          if (registration) {
            registrationRef.current = registration;

            // Check for updates periodically (every 5 minutes)
            const intervalId = setInterval(() => {
              registration.update().catch(() => {});
            }, 5 * 60 * 1000);

            // Also check for updates when window gains focus (user comes back to desktop app)
            const onFocus = () => {
              registration.update().catch(() => {});
            };

            window.addEventListener('focus', onFocus);
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState === 'visible') {
                registration.update().catch(() => {});
              }
            });

            return () => {
              clearInterval(intervalId);
              window.removeEventListener('focus', onFocus);
            };
          }
        },
      });

      updateFunctionRef.current = updateSW;
    } catch (err) {
      console.warn('PWA service worker registration notice:', err);
    }
  }, []);

  const updateApp = async () => {
    if (updateFunctionRef.current) {
      await updateFunctionRef.current(true);
    } else {
      window.location.reload();
    }
  };

  const checkForUpdate = async (): Promise<boolean> => {
    setIsCheckingUpdate(true);
    try {
      if (registrationRef.current) {
        await registrationRef.current.update();
      }
      // Brief timeout to let service worker update lifecycle respond
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (!needRefresh) {
        setUpdateSuccessNotice(true);
        setTimeout(() => setUpdateSuccessNotice(false), 3500);
      }
      return needRefresh;
    } catch (err) {
      console.warn('Check update notice:', err);
      return false;
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const dismissUpdate = () => {
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    isCheckingUpdate,
    updateSuccessNotice,
    updateApp,
    checkForUpdate,
    dismissUpdate,
  };
}
