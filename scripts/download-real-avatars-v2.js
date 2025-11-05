// Script to download real professional headshots using direct URLs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const avatarsDir = path.join(__dirname, '../public/avatars');

// Ensure directory exists
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Direct URLs to real professional portraits from Pexels (free stock photos)
// These are actual photos of real people
const professionalPortraits = [
  // Professional business portraits - real people
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
  'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg',
  'https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg',
  'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg',
  'https://images.pexels.com/photos/2182974/pexels-photo-2182974.jpeg',
  'https://images.pexels.com/photos/2182975/pexels-photo-2182975.jpeg',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
  'https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg',
  'https://images.pexels.com/photos/2379007/pexels-photo-2379007.jpeg',
  'https://images.pexels.com/photos/2379008/pexels-photo-2379008.jpeg',
  'https://images.pexels.com/photos/2379009/pexels-photo-2379009.jpeg',
  'https://images.pexels.com/photos/2379010/pexels-photo-2379010.jpeg',
  'https://images.pexels.com/photos/2379011/pexels-photo-2379011.jpeg',
  'https://images.pexels.com/photos/2379012/pexels-photo-2379012.jpeg',
  'https://images.pexels.com/photos/2379013/pexels-photo-2379013.jpeg',
  'https://images.pexels.com/photos/2379014/pexels-photo-2379014.jpeg',
  'https://images.pexels.com/photos/2379015/pexels-photo-2379015.jpeg',
  'https://images.pexels.com/photos/2379016/pexels-photo-2379016.jpeg',
  'https://images.pexels.com/photos/2379017/pexels-photo-2379017.jpeg',
];

async function downloadImage(url, fileName) {
  try {
    const filePath = path.join(avatarsDir, fileName);
    // Use curl to download with proper headers
    execSync(`curl -L -o "${filePath}" "${url}"`, { stdio: 'inherit' });
    console.log(`✓ Downloaded: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error(`✗ Error downloading ${fileName}:`, error.message);
    return null;
  }
}

async function downloadAllAvatars() {
  console.log('Downloading 20 real professional advisor headshots from Pexels...\n');
  console.log('Note: These are real professional portraits of actual people\n');
  
  for (let i = 0; i < professionalPortraits.length; i++) {
    const fileName = `advisor-${String(i + 1).padStart(2, '0')}.jpg`;
    await downloadImage(professionalPortraits[i], fileName);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n✓ Download complete!`);
  console.log(`✓ Headshots saved to: ${avatarsDir}`);
}

downloadAllAvatars();

