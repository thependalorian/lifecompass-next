// Script to download real professional headshots for advisors
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const avatarsDir = path.join(__dirname, '../public/avatars');

// Ensure directory exists
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Professional headshot URLs from free stock photo services (Pexels, Unsplash, etc.)
// These are curated professional business portraits
const professionalHeadshots = [
  // Real professional portraits from free stock photo services
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182974/pexels-photo-2182974.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182975/pexels-photo-2182975.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182976/pexels-photo-2182976.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182977/pexels-photo-2182977.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182978/pexels-photo-2182978.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2182979/pexels-photo-2182979.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379007/pexels-photo-2379007.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379008/pexels-photo-2379008.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379009/pexels-photo-2379009.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379010/pexels-photo-2379010.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379011/pexels-photo-2379011.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379012/pexels-photo-2379012.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  'https://images.pexels.com/photos/2379013/pexels-photo-2379013.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
];

// Function to download image
function downloadImage(url, fileName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(avatarsDir, fileName);
    const file = fs.createWriteStream(filePath);
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          return downloadImage(response.headers.location, fileName)
            .then(resolve)
            .catch(reject);
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${fileName}`);
          resolve(fileName);
        });
      } else {
        file.close();
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Alternative: Use Unsplash Source API for professional portraits
async function downloadFromUnsplash(index) {
  const fileName = `advisor-${String(index + 1).padStart(2, '0')}.jpg`;
  const filePath = path.join(avatarsDir, fileName);
  
  // Unsplash Source API - professional portraits
  // Using different search terms for diversity
  const searchTerms = [
    'professional-woman-portrait',
    'professional-man-portrait',
    'business-woman-headshot',
    'business-man-headshot',
    'professional-african-woman',
    'professional-african-man',
    'business-portrait-woman',
    'business-portrait-man',
    'professional-headshot-woman',
    'professional-headshot-man',
    'executive-portrait',
    'business-professional',
    'corporate-portrait',
    'professional-portrait',
    'business-headshot',
    'executive-headshot',
    'professional-woman',
    'professional-man',
    'business-woman',
    'business-man'
  ];
  
  const term = searchTerms[index % searchTerms.length];
  const url = `https://source.unsplash.com/400x400/?${term}&sig=${index}`;
  
  return downloadImage(url, fileName);
}

// Download all avatars
async function downloadAllAvatars() {
  console.log('Downloading 20 real professional advisor headshots from Unsplash...\n');
  console.log('Note: These are real professional portraits from free stock photo services\n');
  
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(
      downloadFromUnsplash(i)
        .catch(err => {
          console.error(`✗ Error downloading advisor-${String(i + 1).padStart(2, '0')}:`, err.message);
          return null;
        })
    );
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  const results = await Promise.all(promises);
  const successful = results.filter(r => r !== null).length;
  
  console.log(`\n✓ Successfully downloaded ${successful}/20 professional headshots`);
  console.log(`✓ Headshots saved to: ${avatarsDir}`);
}

downloadAllAvatars();

