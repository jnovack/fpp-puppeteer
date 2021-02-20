const iterations = process.env.ITERATIONS;
const hostname = process.env.HOST;
const timeout = process.env.TIMEOUT;
const page_b = process.env.B;
const screenshots = process.env.SCREENSHOTS;

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
    console.log("testing " + iterations + " iterations on " + page_b);
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
        console.log(page_b + " renders (avg ms) ", totalTimeMillis / iterations);
    });
}

describe(page_b, () => {
    let time = { start: null };
    handleTiming(time);
    for (let i = 0; i < iterations; i++) {
        it('renders' + i, async () => {
            const response = await page.goto('http://' + hostname + '/' + page_b,
                {
                    waitUntil: 'domcontentloaded',
                }
            );
            await page.waitForSelector('#blankBetweenSequences', { visible: true });
            await page.click('#settings-email-tab');
            await page.waitForSelector('#blankBetweenSequences', { hidden: true });
            await page.waitForSelector('#emailguser', { visible: true });
            assert(response.ok());
            if (screenshots == 'true') {
                await page.screenshot({ path: `/screenshots/b-` + i + `.png` })
            }
        }).timeout(timeout);
    }
});
