/**
 * Script to generate Open Graph image (1200x630px)
 * Uses Canvas to create the image with the logo
 *
 * Usage: node scripts/create-og-image.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

// Check if sharp is available (optional dependency)
let sharp;
try {
  sharp = require('sharp');
} catch {
  console.log('⚠️  Sharp not installed. Install it with: npm install sharp');
  console.log('📝 Alternative: Open scripts/generate-og-image.html in your browser');
  console.log('   and save the image manually as og-image.png in the public folder.');
  process.exit(1);
}

const WIDTH = 1200;
const HEIGHT = 630;

async function createOGImage() {
  try {
    console.log('🎨 Creating Open Graph image...');

    // Read the logo
    const logoPath = path.join(__dirname, '../public/logo.png');
    if (!fs.existsSync(logoPath)) {
      throw new Error('Logo not found at public/logo.png');
    }

    // Create SVG with gradient background and text
    const svg = `
      <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a4d2e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#2d5f3f;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a4d2e;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grad)"/>
        
        <!-- Decorative circles -->
        <circle cx="1000" cy="150" r="300" fill="rgba(255,255,255,0.05)"/>
        <circle cx="200" cy="500" r="250" fill="rgba(255,255,255,0.03)"/>
        
        <!-- Logo placeholder (will be composited) -->
        <rect x="510" y="120" width="180" height="180" rx="20" fill="white" opacity="0.95"/>
        
        <!-- Text content -->
        <text x="600" y="360" font-family="Montserrat, Arial, sans-serif" font-size="64" font-weight="700" fill="white" text-anchor="middle">
          STE-SCPB
        </text>
        
        <text x="600" y="420" font-family="Montserrat, Arial, sans-serif" font-size="32" font-weight="600" fill="#f0f0f0" text-anchor="middle">
          Export Cacao &amp; Café Cameroun
        </text>
        
        <text x="600" y="480" font-family="Montserrat, Arial, sans-serif" font-size="20" font-weight="400" fill="#e0e0e0" text-anchor="middle">
          Exportateur camerounais de cacao premium, café vert et produits agricoles certifiés
        </text>
        
        <!-- Badges -->
        <rect x="350" y="520" width="160" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <text x="430" y="552" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">
          🌍 Export
        </text>
        
        <rect x="520" y="520" width="160" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <text x="600" y="552" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">
          ✓ Certifié
        </text>
        
        <rect x="690" y="520" width="160" height="50" rx="25" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <text x="770" y="552" font-family="Montserrat, Arial, sans-serif" font-size="18" font-weight="600" fill="white" text-anchor="middle">
          📦 Devis 24h
        </text>
      </svg>
    `;

    // Create base image from SVG
    const baseImage = await sharp(Buffer.from(svg)).png().toBuffer();

    // Resize logo to fit in the white box
    const logo = await sharp(logoPath)
      .resize(140, 140, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();

    // Composite logo onto the base image
    const finalImage = await sharp(baseImage)
      .composite([
        {
          input: logo,
          top: 140,
          left: 530,
        },
      ])
      .png()
      .toBuffer();

    // Save the final image
    const outputPath = path.join(__dirname, '../public/og-image.png');
    fs.writeFileSync(outputPath, finalImage);

    console.log('✅ Open Graph image created successfully!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`📐 Dimensions: ${WIDTH}x${HEIGHT}px`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Commit the new og-image.png file');
    console.log('   2. Push to your repository');
    console.log('   3. Deploy to production');
    console.log('   4. Test by sharing your URL on WhatsApp/Twitter');
  } catch (error) {
    console.error('❌ Error creating OG image:', error.message);
    console.log('');
    console.log('📝 Alternative method:');
    console.log('   1. Open scripts/generate-og-image.html in your browser');
    console.log('   2. Take a screenshot (1200x630px)');
    console.log('   3. Save as og-image.png in the public folder');
    process.exit(1);
  }
}

createOGImage();
