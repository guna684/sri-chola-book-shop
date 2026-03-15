import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = 'C:\\Users\\Lenovo\\.gemini\\antigravity\\brain\\d0caa1c7-efc7-4aaf-b063-29cc2393a11c';
const uploadsDir = path.join(__dirname, '..', 'uploads', 'book-covers');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Map the generated artifacts to beautiful names
const mapping = {
    'wings_of_fire': 'Wings of Fire',
    'diary_young_girl': 'The Diary of a Young Girl',
    'long_walk_freedom': 'Long Walk to Freedom',
    'experiments_with_truth': 'The Story of My Experiments with Truth',
    'steve_jobs': 'Steve Jobs',
    'becoming': 'Becoming',
    'einstein': 'Einstein: His Life and Universe',
    'my_life': 'My Life',
    'playing_it_my_way': 'Playing It My Way',
    'elon_musk': 'Elon Musk',
    'sapiens': 'Sapiens: A Brief History of Humankind',
    'guns_germs_steel': 'Guns, Germs, and Steel',
    'silk_roads': 'The Silk Roads',
    'india_after_gandhi': 'India After Gandhi',
    'discovery_of_india': 'The Discovery of India',
    'peoples_history': "A People's History of the United States"
};

const artifactFiles = fs.readdirSync(artifactsDir);

const mappedFiles = {};

for (const file of artifactFiles) {
    if (file.endsWith('.png')) {
        for (const [key, title] of Object.entries(mapping)) {
            if (file.startsWith(key)) {
                const destPath = path.join(uploadsDir, file);
                fs.copyFileSync(path.join(artifactsDir, file), destPath);
                mappedFiles[title] = `/uploads/book-covers/${file}`;
                console.log(`Copied ${file} for ${title}`);
            }
        }
    }
}

fs.writeFileSync(path.join(__dirname, 'generated_covers.json'), JSON.stringify(mappedFiles, null, 2));
console.log('Done mapping.');
