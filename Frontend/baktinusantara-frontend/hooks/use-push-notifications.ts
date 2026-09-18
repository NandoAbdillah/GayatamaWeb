'use client';

import { useState, useEffect, useCallback } from 'react';
import pushNotificationService from '@/lib/services/push-notification.service';
import { useAuth } from '@/context/AuthContext';

export function usePushNotifications() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [activeSubscription, setActiveSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async () => {
    const supported = pushNotificationService.isSupported();
    setIsSupported(supported);

    if (!supported) {
      setIsLoading(false);
      return;
    }

    const currentPermission = pushNotificationService.getPermissionState();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      const subscription = await pushNotificationService.getSubscription();
      setIsSubscribed(!!subscription);
      setActiveSubscription(subscription);
    } else {
      setIsSubscribed(false);
      setActiveSubscription(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkStatus();

    // Register service worker in background if supported
    if (pushNotificationService.isSupported()) {
      pushNotificationService.registerServiceWorker();
    }
  }, [checkStatus]);

  const requestPermission = async () => {
    setIsLoading(true);
    setError(null);
    const perm = await pushNotificationService.requestPermission();
    setPermission(perm);
    setIsLoading(false);
    return perm;
  };

  const subscribe = async () => {
    const effectiveUserId = user?.id || 0;
    const effectiveUserRole = user?.role || 'visitor';

    setIsLoading(true);
    setError(null);

    const result = await pushNotificationService.subscribeUser(effectiveUserId, effectiveUserRole);

    const currentPerm = pushNotificationService.getPermissionState();
    setPermission(currentPerm);

    if (result.success && result.subscription) {
      setIsSubscribed(true);
      setActiveSubscription(result.subscription);
      setIsLoading(false);
      return { success: true, permission: currentPerm, subscription: result.subscription };
    } else {
      const errMsg = result.error || 'Gagal mengaktifkan notifikasi.';
      setError(errMsg);
      setIsLoading(false);
      return { success: false, permission: currentPerm, error: errMsg };
    }
  };

  const unsubscribe = async () => {
    const effectiveUserId = user?.id || 101;

    setIsLoading(true);
    setError(null);

    const result = await pushNotificationService.unsubscribeUser(effectiveUserId);
    if (result.success) {
      setIsSubscribed(false);
      setActiveSubscription(null);
    } else {
      setError(result.error || 'Gagal menonaktifkan notifikasi.');
    }
    setIsLoading(false);
    return result.success;
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    activeSubscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    refreshStatus: checkStatus,
  };
}

export default usePushNotifications;
