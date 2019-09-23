const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
import { Browser, Page } from 'puppeteer';
import { PostmanStatus, MobileCareer } from './types';
import { wait } from '../utils';

export class Postman {
    private browser: Browser | null;
    private page: Page | null;
    private status: PostmanStatus = 'none';
    private armyLoaded: boolean = false;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        this.status = 'booting';
        try {
            puppeteer.use(StealthPlugin());
            this.browser = await puppeteer.launch({
                headless: false,
                executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            });
            this.page = await this.browser.newPage();
            await this.page.setViewport({
                width: 1920,
                height: 1080
            });
            this.status = 'initialized';
        } catch (e) {
            console.log('Postman failed to initialize', e);
            this.status = 'initializeFailed';
        }
    }

    public async waitUntilInitialized(): Promise<PostmanStatus> {
        while (this.status === 'booting' || this.status === 'none') {
            await wait(1000);
        }
        return this.status;
    }

    public screenshot() {
        return this.page.screenshot({ path: 'screenshot.png' });
    }

    public content() {
        return this.page.content();
    }

    public async setArmy(admissionDay: string, birthDay: string, name: string): Promise<boolean> {
        this.armyLoaded = false;

        // Make URL and redirect to
        const b64Admission = Buffer.from(admissionDay).toString('base64');
        const b64Birth = Buffer.from(birthDay).toString('base64');
        const encodedMame = encodeURIComponent(name);
        const url = `http://www.katc.mil.kr/katc/community/children.jsp?search:search_key1:child_search=etc_char8&search:search_key2:child_search=etc_char9&search:search_key3:child_search=etc_char1&search_val1=${b64Admission}&search_val2=${b64Birth}&birthDay=${birthDay}&search_val3=${encodedMame}`
        await this.page.goto(url);

        // Validate
        await wait(1000);
        const table = await this.page.$('table#searchTable');
        const searchJson = await (await table.getProperty('textContent')).jsonValue() as string;
        this.armyLoaded = searchJson.includes(name);

        return this.armyLoaded
    }

    public async waitLogin() {
        await this.page.click('a#childInfo1');
        await this.page.click('a#letterBtn');

        let messagePageLoaded = false
        this.page.on('framenavigated', e => {
            console.log(e, 'framenavigated')
            messagePageLoaded = e.url().includes('http://www.katc.mil.kr/katc/corner/c25/letter.jsp');
        });
        while (!messagePageLoaded) {
            await wait(500);
        }
    }
}