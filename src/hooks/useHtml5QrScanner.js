import { useCallback, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function useHtml5QrScanner() {
  const generatedId = useId();
  const readerDomId = generatedId.replace(/:/g, '_');
  const instanceRef = useRef(null);
  const scanningRef = useRef(false);
  const [isScanning, setIsScanning] = useState(false);

  const waitForElement = useCallback(
    () =>
      new Promise((resolve) => {
        const attempt = () => {
          const element = document.getElementById(readerDomId);
          if (element) resolve(element);
          else requestAnimationFrame(attempt);
        };
        attempt();
      }),
    [readerDomId]
  );

  const getScanner = useCallback(async () => {
    if (!instanceRef.current) {
      await waitForElement();
      instanceRef.current = new Html5Qrcode(readerDomId);
    }
    return instanceRef.current;
  }, [readerDomId, waitForElement]);

  const start = useCallback(
    async (onSuccess, onError) => {
      if (isScanning) return;
      const scanner = await getScanner();

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        (decodedText) => {
          if (decodedText) {
            onSuccess?.(decodedText);
          }
        },
        (scanError) => {
          if (
            scanError?.name &&
            scanError.name !== 'NotFoundException' &&
            scanError.name !== 'ChecksumException'
          ) {
            onError?.(scanError);
          }
        }
      );
      scanningRef.current = true;
      setIsScanning(true);
    },
    [getScanner, isScanning]
  );

  const stop = useCallback(async () => {
    const scanner = instanceRef.current;
    if (!scanner || !scanningRef.current) return;

    try {
      await scanner.stop();
    } catch {
      // ignore
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  }, []);

  return {
    readerDomId,
    isScanning,
    start,
    stop,
  };
}

