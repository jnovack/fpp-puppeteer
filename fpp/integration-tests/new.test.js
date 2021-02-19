const iterations = 100;
const hostname = "fpp.local";

//////////////////////////////////////////

const assert = require('assert')
const puppeteer = require('puppeteer')

let browser
let page

before(async () => {
    browser = await puppeteer.launch({
        args: [
            // Required for Docker version of Puppeteer
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // This will write shared memory files into /tmp instead of /dev/shm,
            // because Docker’s default for /dev/shm is 64MB
            '--disable-dev-shm-usage'
        ]
    })

    const browserVersion = await browser.version();
    console.log("testing " + iterations + " iterations on settings-all.php");
})

beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({
        width: 1200,
        height: 800,
    });
})

afterEach(async () => {
    await page.close()
})

after(async () => {
    await browser.close()
})

const handleTiming = function (time) {
    before(function () {
        time.start = Date.now();
    });

    after(function () {
        const totalTimeMillis = Date.now() - time.start;
        console.log("settings-all.php renders (avg ms) ", totalTimeMillis / iterations);
    });
}

describe('settings-all.php', () => {
    let time = { start: null };
    handleTiming(time);
    for (let i = 0; i < iterations; i++) {
        it('renders' + i, async () => {
            const response = await page.goto('http://' + hostname + '/settings-all.php',
                {
                    waitUntil: 'domcontentloaded',
                }
            );
            await page.waitForSelector('#blankBetweenSequences', { visible: true });
            await page.click('#settings-email-tab');
            await page.waitForSelector('#blankBetweenSequences', { hidden: true });
            await page.waitForSelector('#emailguser', { visible: true });
            assert(response.ok());
            // await page.screenshot({ path: `/screenshots/app.png` })
        }).timeout(7500);
    }
});