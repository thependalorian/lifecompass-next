// Script to download 20 diverse professional avatars for advisors
const fs = require('fs');
const path = require('path');
const https = require('https');

const avatarsDir = path.join(__dirname, '../public/avatars');

// Ensure directory exists
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Diverse professional names for avatar generation
const advisorNames = [
  'Thomas Shikongo',
  'Helvi Bezuidenhout',
  'David Ndjavera',
  'Fatima Isaacks',
  'John-Paul !Gaeb',
  'Maria Shikongo',
  'Petrus van der Merwe',
  'Amina Nangombe',
  'Christoph Müller',
  'Lydia Geingob',
  'Francois Coetzee',
  'Selma Katjijere',
  'Willem Botha',
  'Hilma Shikwambi',
  'Pieter Swart',
  'Esther Mwandingi',
  'Andreas Fischer',
  'Rebecca Katjimune',
  'Stephanus Groenewaldt',
  'Joyce Nakale'
];

// Function to download avatar from UI Avatars
function downloadAvatar(name, index) {
  return new Promise((resolve, reject) => {
    const fileName = `advisor-${String(index + 1).padStart(2, '0')}.png`;
    const filePath = path.join(avatarsDir, fileName);
    
    // UI Avatars API with professional styling
    const url = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=256&background=009677&color=ffffff&bold=true&font-size=0.6&rounded=true`;
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${fileName} (${name})`);
          resolve(fileName);
        });
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed to download ${name}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download all avatars
async function downloadAllAvatars() {
  console.log('Downloading 20 professional advisor avatars...\n');
  
  const promises = advisorNames.map((name, index) => 
    downloadAvatar(name, index).catch(err => {
      console.error(`✗ Error downloading ${name}:`, err.message);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r !== null).length;
  
  console.log(`\n✓ Successfully downloaded ${successful}/20 avatars`);
  console.log(`✓ Avatars saved to: ${avatarsDir}`);
}

downloadAllAvatars();

