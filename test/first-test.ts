import { remote } from 'webdriverio';

const capabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:udid': 'RRCY205453P',
    'appium:deviceName': 'Samsung SM-A556E',
    'appium:appPackage': 'com.dwidasa.bwk.mb.android',
    'appium:noReset': true
};

const options = {
    hostname: '127.0.0.1',
    port: 4723,
    logLevel: 'info' as const,
    capabilities
};
async function runTest() {
    const driver = await remote(options);
    try {
        console.log('Mobile Banking berhasil dibuka');
        await driver.pause(3000);
        const currentPackage = await driver.getCurrentPackage();
        console.log(`Current package: ${currentPackage}`);
        if (currentPackage !== 'com.dwidasa.bwk.mb.android') {
            throw new Error(
                `Aplikasi yang terbuka salah. Current package: ${currentPackage}`
            );
        }
        console.log('PASS - Mobile Banking berhasil dibuka');
    } finally {
        await driver.deleteSession();
    }
}
runTest().catch((error) => {
    console.error('TEST FAILED');
    console.error(error);
    process.exit(1);
});