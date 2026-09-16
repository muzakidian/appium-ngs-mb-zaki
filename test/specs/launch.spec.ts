import { browser, expect } from '@wdio/globals';
import { androidTarget } from '../config/android-target.js';

describe('Mobile Banking - Application Launch', () => {
    it('MBN-001 - Launch Mobile Banking', async () => {
        // Appium launches the configured activity when the runner creates the session.
        // Poll the foreground package instead of sleeping for a fixed duration.
        await browser.waitUntil(
            async () => await browser.getCurrentPackage() === androidTarget.packageName,
            {
                timeout: 15000,
                interval: 500,
                timeoutMsg: `MBN-001: expected ${androidTarget.packageName} in the foreground within 15 seconds`,
            },
        );

        const currentPackage = await browser.getCurrentPackage();
        await expect(currentPackage).toBe(androidTarget.packageName);
    });
});
