
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function generateRandomContent() {
    const paragraphs = Math.floor(Math.random() * 5) + 1;
    let content = '';
    for (let i = 0; i < paragraphs; i++) {
        const words = Math.floor(Math.random() * 100) + 50;
        const paragraph = generateRandomString(words);
        content += paragraph + '\n\n';
    }
    return content;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFiles() {
    const outputDir = path.join(__dirname, 'generated');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Generate 1000 files
    for (let i = 0; i < 1000; i++) {
        const fileName = `${generateRandomString(10)}.txt`;
        const filePath = path.join(outputDir, fileName);
        const content = generateRandomContent();

        try {
            await fs.promises.writeFile(filePath, content);
            console.log(`Generated file: ${fileName}`);
        } catch (error) {
            console.error(`Error generating file ${fileName}:`, error);
        }
    }

    console.log('File generation complete!');
}

generateFiles().catch(console.error);

