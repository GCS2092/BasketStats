const fs = require('fs');
const path = require('path');

// Fonction pour remplacer les imports et usages de QuickNavigation
function updateQuickNavigation(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remplacer l'import
    if (content.includes("import QuickNavigation from '@/components/common/QuickNavigation';")) {
      content = content.replace(
        "import QuickNavigation from '@/components/common/QuickNavigation';",
        "import ElegantQuickNavigation from '@/components/common/ElegantQuickNavigation';"
      );
      modified = true;
    }

    // Remplacer l'usage du composant
    if (content.includes('<QuickNavigation')) {
      content = content.replace(/<QuickNavigation/g, '<ElegantQuickNavigation');
      modified = true;
    }

    if (content.includes('</QuickNavigation>')) {
      content = content.replace(/<\/QuickNavigation>/g, '</ElegantQuickNavigation>');
      modified = true;
    }

    // Remplacer les commentaires
    if (content.includes('Navigation rapide')) {
      content = content.replace(/Navigation rapide/g, 'Navigation rapide élégante');
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Fonction pour parcourir récursivement les dossiers
function walkDirectory(dir, fileExtensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Ignorer node_modules et .next
      if (!['node_modules', '.next', '.git'].includes(file)) {
        updatedCount += walkDirectory(filePath, fileExtensions);
      }
    } else if (fileExtensions.some(ext => file.endsWith(ext))) {
      if (updateQuickNavigation(filePath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

// Exécuter le script
console.log('🚀 Mise à jour des composants QuickNavigation...\n');

const srcDir = path.join(__dirname, '../src');
const updatedCount = walkDirectory(srcDir);

console.log(`\n🎉 Mise à jour terminée ! ${updatedCount} fichiers modifiés.`);
