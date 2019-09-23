import 'dotenv/config';
import { Postman } from './src/postman';

/*
.env
ADMISSION=2019XXXX
BIRTH=9XXXXX
NAME=XXX
*/

const admission = process.env.ADMISSION;
const birth = process.env.BIRTH;
const name = process.env.NAME;

const main = async () => {
    const postman = new Postman();
    await postman.waitUntilInitialized();

    const found = await postman.setArmy(admission, birth, name);
    if (found) {
        console.log(`Found ${name}`);
        await postman.tryLogin('kt', '010-4430-0727');
    }
}

main();