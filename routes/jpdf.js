const express = require('express')
    , router = express.Router()
    , puppeteer = require('puppeteer')
;
let browser, page;
const template = {
    format: 'A4',
    displayHeaderFooter: true,
    printBackground: true,
    footerTemplate: '<div style="font-family: \'Malgun Gothic\', \'Nanum Gothic\', NanumGothic, dotum, Gulim, tahoma, sans-serif;width:100%;font-size:9px;font-weight:bold;text-align:center;font-style:italic;">Page <span class="pageNumber"></span>/<span class="totalPages"></span></div>',
    headerTemplate: '<span>&nbsp;<span>',
    margin: {top: '1cm', left: '1cm', bottom: '1cm', right: '1cm'}
};

(async () => {
    try {
        browser = await puppeteer.launch({headless: true, defaultViewport: null,args: ['--start-maximized']});
        page = await browser.newPage();
        await page.setCacheEnabled(false);
    } catch (e) {
        console.error(e.message);
        res.status(500).end();
    }
})();


/**
 * HTML to PDF
 */
router.post('/html/to/pdf', function (req, res, next) {
    (async () => {
        try {
            await page.setCacheEnabled(false);
            await page.setContent(await req.body.html)
            await page.evaluateHandle('document.fonts.ready');
            const buffer = await page.pdf(template)
            res.contentType("application/pdf");
            res.send(buffer);
        } catch (e) {
            console.error(e.message);
            res.status(500).end();
        }
    })();
});

/**
 * HTML to PNG
 */
router.post('/html/to/png', function (req, res, next) {
    (async () => {
        try {
            await page.setCacheEnabled(false);
            await page.setContent(await req.body.html)
            await page.evaluateHandle('document.fonts.ready');
            await page.evaluateHandle('document.ready');
            const buffer = await page.screenshot({'fullPage':true});
            res.contentType("image/png");
            res.send(buffer);
        } catch (e) {
            console.error(e.message);
            res.status(500).end();
        }
    })();
});

/**
 * URL to PDF
 */
router.get('/url/to/pdf', function (req, res, next) {
    (async () => {
        try {
            await page.setCacheEnabled(false);
            await page.goto(await req.query.url, {
                waitUtil: 'networkidle0',
            });

            await page.on('load', () => {
                console.log('Page loaded!');
            });

            await page.waitFor(1500);

            await page.evaluateHandle('document.ready');

            const buffer = await page.pdf(template)
            res.contentType("application/pdf");
            res.send(buffer);
        } catch (e) {
            console.error(e.message);
            res.status(500).end();
        }
    })();
});

/**
 * URL to PNG
 */
router.get('/url/to/png', function (req, res, next) {
    (async () => {
        try {
            await page.setCacheEnabled(false);
            await page.goto(await req.query.url, {
                // waitUtil: 'load',
                // waitUtil: 'domcontentloaded',
                waitUtil: 'networkidle0',
                // waitUtil: 'networkidle2',
            });

            // await page.on('load', () => {
            //     console.log('Page loaded!');
            // });

            await page.waitFor(1500);

            await page.evaluateHandle('document.ready');
            const buffer = await page.screenshot({'fullPage':true});
            res.contentType("image/png");
            res.send(buffer);
        } catch (e) {
            console.log(e.toString());
            console.error(e.message);
            res.status(500).end();
        }
    })();
});

module.exports = router;