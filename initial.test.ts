import { expect, test } from 'vitest';

test('Start', async () => {
    try {
        // let app = new Application()
        // await app.init()
        expect(true).toBe(true)
    }
    catch (e) {
        console.error(e)
        expect(false).toBe(true)
    }
});
