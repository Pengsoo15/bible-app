/**
 * Fetch all 66 KJV Bible books from GitHub (aruljohn/Bible-kjv)
 * Each book is a single JSON file — no per-chapter requests needed.
 * Source: https://github.com/aruljohn/Bible-kjv (public domain)
 * Saves each book as a JSON file in src/data/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Book name in our app → filename on GitHub repo
const BOOKS = [
    { name: "Genesis", github: "Genesis" },
    { name: "Exodus", github: "Exodus" },
    { name: "Leviticus", github: "Leviticus" },
    { name: "Numbers", github: "Numbers" },
    { name: "Deuteronomy", github: "Deuteronomy" },
    { name: "Joshua", github: "Joshua" },
    { name: "Judges", github: "Judges" },
    { name: "Ruth", github: "Ruth" },
    { name: "1 Samuel", github: "1Samuel" },
    { name: "2 Samuel", github: "2Samuel" },
    { name: "1 Kings", github: "1Kings" },
    { name: "2 Kings", github: "2Kings" },
    { name: "1 Chronicles", github: "1Chronicles" },
    { name: "2 Chronicles", github: "2Chronicles" },
    { name: "Ezra", github: "Ezra" },
    { name: "Nehemiah", github: "Nehemiah" },
    { name: "Esther", github: "Esther" },
    { name: "Job", github: "Job" },
    { name: "Psalms", github: "Psalms" },
    { name: "Proverbs", github: "Proverbs" },
    { name: "Ecclesiastes", github: "Ecclesiastes" },
    { name: "Song of Solomon", github: "SongofSolomon" },
    { name: "Isaiah", github: "Isaiah" },
    { name: "Jeremiah", github: "Jeremiah" },
    { name: "Lamentations", github: "Lamentations" },
    { name: "Ezekiel", github: "Ezekiel" },
    { name: "Daniel", github: "Daniel" },
    { name: "Hosea", github: "Hosea" },
    { name: "Joel", github: "Joel" },
    { name: "Amos", github: "Amos" },
    { name: "Obadiah", github: "Obadiah" },
    { name: "Jonah", github: "Jonah" },
    { name: "Micah", github: "Micah" },
    { name: "Nahum", github: "Nahum" },
    { name: "Habakkuk", github: "Habakkuk" },
    { name: "Zephaniah", github: "Zephaniah" },
    { name: "Haggai", github: "Haggai" },
    { name: "Zechariah", github: "Zechariah" },
    { name: "Malachi", github: "Malachi" },
    { name: "Matthew", github: "Matthew" },
    { name: "Mark", github: "Mark" },
    { name: "Luke", github: "Luke" },
    { name: "John", github: "John" },
    { name: "Acts", github: "Acts" },
    { name: "Romans", github: "Romans" },
    { name: "1 Corinthians", github: "1Corinthians" },
    { name: "2 Corinthians", github: "2Corinthians" },
    { name: "Galatians", github: "Galatians" },
    { name: "Ephesians", github: "Ephesians" },
    { name: "Philippians", github: "Philippians" },
    { name: "Colossians", github: "Colossians" },
    { name: "1 Thessalonians", github: "1Thessalonians" },
    { name: "2 Thessalonians", github: "2Thessalonians" },
    { name: "1 Timothy", github: "1Timothy" },
    { name: "2 Timothy", github: "2Timothy" },
    { name: "Titus", github: "Titus" },
    { name: "Philemon", github: "Philemon" },
    { name: "Hebrews", github: "Hebrews" },
    { name: "James", github: "James" },
    { name: "1 Peter", github: "1Peter" },
    { name: "2 Peter", github: "2Peter" },
    { name: "1 John", github: "1John" },
    { name: "2 John", github: "2John" },
    { name: "3 John", github: "3John" },
    { name: "Jude", github: "Jude" },
    { name: "Revelation", github: "Revelation" },
];

const DATA_DIR = path.join(__dirname, 'src', 'data');
const BASE_URL = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master';

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toFileName(bookName) {
    return bookName.toLowerCase().replace(/\s+/g, '_') + '.json';
}

/**
 * Convert GitHub JSON format to our app format:
 *   From: { book, chapters: [{ chapter: "1", verses: [{ verse: "1", text: "..." }] }] }
 *   To:   { book, chapters: [{ ch: 1, verses: [{ v: 1, t: "..." }] }] }
 */
function convertFormat(raw) {
    return {
        book: raw.book,
        chapters: raw.chapters.map(ch => ({
            ch: parseInt(ch.chapter, 10),
            verses: ch.verses.map(v => ({
                v: parseInt(v.verse, 10),
                t: v.text,
            })),
        })),
    };
}

async function fetchBook(book) {
    const fileName = toFileName(book.name);
    const filePath = path.join(DATA_DIR, fileName);

    // Skip if already downloaded with at least 1 chapter
    if (fs.existsSync(filePath)) {
        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (existing.chapters && existing.chapters.length > 0) {
                console.log(`SKIP ${book.name} (already has ${existing.chapters.length} chapters)`);
                return;
            }
        } catch { }
    }

    const url = `${BASE_URL}/${encodeURIComponent(book.github)}.json`;
    console.log(`Fetching ${book.name}...`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} for ${url}`);
        }
        const raw = await res.json();
        const bookData = convertFormat(raw);
        const totalVerses = bookData.chapters.reduce((s, c) => s + c.verses.length, 0);
        fs.writeFileSync(filePath, JSON.stringify(bookData, null, 2), 'utf-8');
        console.log(`  ✓ ${fileName} — ${bookData.chapters.length} chapters, ${totalVerses} verses`);
    } catch (err) {
        console.error(`  ERROR: ${book.name}: ${err.message}`);
        // Retry once after a delay
        await sleep(2000);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const raw = await res.json();
            const bookData = convertFormat(raw);
            const totalVerses = bookData.chapters.reduce((s, c) => s + c.verses.length, 0);
            fs.writeFileSync(filePath, JSON.stringify(bookData, null, 2), 'utf-8');
            console.log(`  ✓ RETRY OK: ${fileName} — ${bookData.chapters.length} chapters, ${totalVerses} verses`);
        } catch (retryErr) {
            console.error(`  RETRY FAILED: ${book.name}: ${retryErr.message}`);
        }
    }
}

function generateImportMap() {
    const imports = BOOKS.map(b => {
        const varName = b.name.replace(/\s+/g, '').replace(/^(\d)/, '_$1');
        const fileName = toFileName(b.name);
        return `import ${varName}Data from './${fileName}';`;
    });

    const mapEntries = BOOKS.map(b => {
        const varName = b.name.replace(/\s+/g, '').replace(/^(\d)/, '_$1');
        return `  "${b.name}": ${varName}Data,`;
    });

    const content = `// Auto-generated: Maps all 66 book names to their JSON data
${imports.join('\n')}

const BOOK_DATA = {
${mapEntries.join('\n')}
};

export default BOOK_DATA;
`;

    fs.writeFileSync(path.join(DATA_DIR, 'bookData.js'), content, 'utf-8');
    console.log('\n✓ Generated bookData.js import map');
}

async function main() {
    console.log('╔══════════════════════════════════════════╗');
    console.log('║   66 Books KJV Bible Fetcher             ║');
    console.log('║   Source: aruljohn/Bible-kjv (GitHub)     ║');
    console.log('╚══════════════════════════════════════════╝\n');

    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let completed = 0;
    for (const book of BOOKS) {
        await fetchBook(book);
        completed++;
        // Small delay between downloads to be nice
        await sleep(300);
        if (completed % 10 === 0) {
            console.log(`--- Progress: ${completed}/${BOOKS.length} books ---`);
        }
    }

    generateImportMap();
    console.log(`\n=== ALL DONE: ${BOOKS.length} books fetched! ===`);
}

main().catch(console.error);
