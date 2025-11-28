import bcrypt from 'bcrypt';
import db from './config/database.js';

async function testPassword() {
  try {
    // Obtener el admin de la BD
    const [admins] = await db.query('SELECT * FROM administradores WHERE usuario = ?', ['admin']);
    
    if (admins.length === 0) {
      console.log('❌ No se encontró el usuario admin');
      process.exit(1);
    }

    const admin = admins[0];
    console.log('\n📋 Información del Admin:');
    console.log('Usuario:', admin.usuario);
    console.log('Hash en BD:', admin.password);
    console.log('Longitud del hash:', admin.password.length);

    // Probar contraseña
    const password = 'admin123';
    console.log('\n🔐 Probando contraseña:', password);
    
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('¿Es válida?:', isValid ? '✅ SÍ' : '❌ NO');

    // Generar nuevo hash
    console.log('\n🔄 Generando nuevo hash para "admin123"...');
    const newHash = await bcrypt.hash('admin123', 10);
    console.log('Nuevo hash:', newHash);

    // Probar el nuevo hash
    const isValidNew = await bcrypt.compare('admin123', newHash);
    console.log('¿El nuevo hash funciona?:', isValidNew ? '✅ SÍ' : '❌ NO');

    // Actualizar en la BD
    console.log('\n💾 ¿Quieres actualizar el hash en la BD? (ejecuta manualmente):');
    console.log(`UPDATE administradores SET password = '${newHash}' WHERE usuario = 'admin';`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPassword();
