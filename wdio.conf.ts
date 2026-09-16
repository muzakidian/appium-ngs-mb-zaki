import { androidTarget } from './test/config/android-target.js';

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './tsconfig.json',

    // Connect to the existing, externally started Appium server.
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    services: [],

    // The generated web demo (*.e2e.ts) and standalone proof of concept stay inactive.
    specs: ['./test/specs/**/*.spec.ts'],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:udid': androidTarget.udid,
        'appium:deviceName': androidTarget.deviceName,
        'appium:appPackage': androidTarget.packageName,
        'appium:appActivity': androidTarget.launcherActivity,
        'appium:appWaitPackage': androidTarget.packageName,
        // Splash may hand off to the internal home activity; only the splash is launched.
        'appium:appWaitActivity': [
            androidTarget.launcherActivity,
            'com.ccb.overseas.home.view.HKHomeActivity',
        ].join(','),
        'appium:noReset': true,
        // Restart for a real launch check while preserving app data/device binding.
        'appium:forceAppLaunch': true,
    }],

    logLevel: 'warn',
    waitforTimeout: 15000,
    waitforInterval: 500,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 0,
    framework: 'mocha',
    reporters: [['spec', {
        symbols: { passed: 'PASS', failed: 'FAIL', skipped: 'SKIP' },
    }]],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
    },
};
