// Native Platform Bridge Service for Capacitor
// Provides unified access to all native capabilities

import { Preferences } from '@capacitor/preferences';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { SplashScreen } from '@capacitor/splash-screen';

// Check if running in Capacitor native context
const isNative = (): boolean => {
    return typeof window !== 'undefined' && 'Capacitor' in window;
};

// ==================== STORAGE SERVICE ====================
export const NativeStorage = {
    async set(key: string, value: string): Promise<void> {
        if (!isNative()) {
            localStorage.setItem(key, value);
            return;
        }
        await Preferences.set({ key, value });
    },

    async get(key: string): Promise<string | null> {
        if (!isNative()) {
            return localStorage.getItem(key);
        }
        const { value } = await Preferences.get({ key });
        return value;
    },

    async remove(key: string): Promise<void> {
        if (!isNative()) {
            localStorage.removeItem(key);
            return;
        }
        await Preferences.remove({ key });
    }
};

// ==================== PUSH NOTIFICATIONS ====================
export const NativePush = {
    async register(): Promise<string | null> {
        if (!isNative()) {
            console.log('[NativePush] Not in native context');
            return null;
        }

        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
            console.warn('[NativePush] Permission not granted');
            return null;
        }

        await PushNotifications.register();

        return new Promise((resolve) => {
            PushNotifications.addListener('registration', (token) => {
                console.log('[NativePush] Token:', token.value);
                resolve(token.value);
            });

            PushNotifications.addListener('registrationError', (err) => {
                console.error('[NativePush] Registration error:', err);
                resolve(null);
            });
        });
    },

    onNotification(callback: (notification: any) => void): void {
        if (!isNative()) return;

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            callback(notification);
        });
    }
};

// ==================== LOCAL NOTIFICATIONS ====================
export const NativeLocalNotifications = {
    async schedule(title: string, body: string, id: number = Date.now()): Promise<void> {
        if (!isNative()) {
            console.log('[LocalNotification]', title, body);
            return;
        }

        await LocalNotifications.schedule({
            notifications: [{
                id,
                title,
                body,
                sound: 'notification.wav',
                smallIcon: 'ic_stat_icon_config_sample',
                iconColor: '#006633'
            }]
        });
    }
};

// ==================== FILE SYSTEM ====================
export const NativeFilesystem = {
    async downloadFile(url: string, filename: string): Promise<string | null> {
        if (!isNative()) {
            console.log('[Filesystem] Download in web - using direct URL');
            return url;
        }

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const base64 = await this.blobToBase64(blob);

            const result = await Filesystem.writeFile({
                path: `downloads/${filename}`,
                data: base64,
                directory: Directory.Cache
            });

            return result.uri;
        } catch (error) {
            console.error('[Filesystem] Download error:', error);
            return null;
        }
    },

    blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async getCacheSize(): Promise<number> {
        if (!isNative()) return 0;

        try {
            const result = await Filesystem.readdir({
                path: 'downloads',
                directory: Directory.Cache
            });

            let totalSize = 0;
            for (const file of result.files) {
                if (file.size) totalSize += file.size;
            }
            return totalSize;
        } catch {
            return 0;
        }
    },

    async clearOldCache(maxSizeMB: number = 500): Promise<void> {
        if (!isNative()) return;

        const currentSize = await this.getCacheSize();
        const maxBytes = maxSizeMB * 1024 * 1024;

        if (currentSize > maxBytes) {
            console.log('[Filesystem] Cache exceeds limit, cleaning...');
            await Filesystem.rmdir({
                path: 'downloads',
                directory: Directory.Cache,
                recursive: true
            });
        }
    }
};

// ==================== BROWSER ====================
export const NativeBrowser = {
    async open(url: string): Promise<void> {
        if (!isNative()) {
            window.open(url, '_blank');
            return;
        }
        await Browser.open({ url, toolbarColor: '#006633' });
    }
};

// ==================== GEOLOCATION ====================
export const NativeGeolocation = {
    async getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
        if (!isNative()) {
            return new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => resolve(null)
                );
            });
        }

        try {
            const pos = await Geolocation.getCurrentPosition();
            return { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch {
            return null;
        }
    }
};

// ==================== SHARE ====================
export const NativeShare = {
    async share(title: string, text: string, url?: string): Promise<void> {
        if (!isNative()) {
            if (navigator.share) {
                await navigator.share({ title, text, url });
            } else {
                await navigator.clipboard.writeText(url || text);
            }
            return;
        }
        await Share.share({ title, text, url });
    }
};

// ==================== DEVICE INFO ====================
export const NativeDevice = {
    async getInfo() {
        if (!isNative()) {
            return { platform: 'web', model: navigator.userAgent };
        }
        return Device.getInfo();
    }
};

// ==================== NETWORK ====================
export const NativeNetwork = {
    async isOnline(): Promise<boolean> {
        if (!isNative()) return navigator.onLine;
        const status = await Network.getStatus();
        return status.connected;
    },

    onStatusChange(callback: (connected: boolean) => void): void {
        if (!isNative()) {
            window.addEventListener('online', () => callback(true));
            window.addEventListener('offline', () => callback(false));
            return;
        }
        Network.addListener('networkStatusChange', (status) => {
            callback(status.connected);
        });
    }
};

// ==================== STATUS BAR ====================
export const NativeStatusBar = {
    async setDarkMode(isDark: boolean): Promise<void> {
        if (!isNative()) return;

        await StatusBar.setStyle({
            style: isDark ? Style.Dark : Style.Light
        });
        await StatusBar.setBackgroundColor({
            color: isDark ? '#1C1C1E' : '#FFFFFF'
        });
    },

    async setKenyaGreen(): Promise<void> {
        if (!isNative()) return;
        await StatusBar.setBackgroundColor({ color: '#006633' });
        await StatusBar.setStyle({ style: Style.Dark });
    }
};

// ==================== KEYBOARD ====================
export const NativeKeyboard = {
    async hide(): Promise<void> {
        if (!isNative()) return;
        await Keyboard.hide();
    },

    onShow(callback: () => void): void {
        if (!isNative()) return;
        Keyboard.addListener('keyboardWillShow', callback);
    },

    onHide(callback: () => void): void {
        if (!isNative()) return;
        Keyboard.addListener('keyboardWillHide', callback);
    }
};

// ==================== HAPTICS ====================
export const NativeHaptics = {
    async impact(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
        if (!isNative()) return;
        const styleMap = {
            light: ImpactStyle.Light,
            medium: ImpactStyle.Medium,
            heavy: ImpactStyle.Heavy
        };
        await Haptics.impact({ style: styleMap[style] });
    },

    async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
        if (!isNative()) return;
        const typeMap = {
            success: NotificationType.Success,
            warning: NotificationType.Warning,
            error: NotificationType.Error
        };
        await Haptics.notification({ type: typeMap[type] });
    }
};

// ==================== SPLASH SCREEN ====================
export const NativeSplashScreen = {
    async hide(): Promise<void> {
        if (!isNative()) return;
        await SplashScreen.hide();
    }
};

// Export unified bridge
export const NativeBridge = {
    isNative,
    storage: NativeStorage,
    push: NativePush,
    localNotifications: NativeLocalNotifications,
    filesystem: NativeFilesystem,
    browser: NativeBrowser,
    geolocation: NativeGeolocation,
    share: NativeShare,
    device: NativeDevice,
    network: NativeNetwork,
    statusBar: NativeStatusBar,
    keyboard: NativeKeyboard,
    haptics: NativeHaptics,
    splashScreen: NativeSplashScreen
};

export default NativeBridge;
