import bcrypt from 'bcrypt';
import db from './config/database.js';

async function testPracticantePassword() {
  try {
    console.log('\n🔍 PROBANDO CONTRASEÑAS DE PRACTICANTES\n');
    console.log('='.repeat(60));

    // Obtener practicantes de la BD
    const [practicantes] = await db.query('SELECT * FROM practicantes WHERE codigo IN (?, ?, ?)', 
      ['PRACT-001', 'PRACT-002', 'PRACT-003']
    );
    
    if (practicantes.length === 0) {
      console.log('❌ No se encontraron practicantes');
      process.exit(1);
    }

    console.log(`\n📋 Se encontraron ${practicantes.length} practicantes\n`);

    // Probar cada practicante
    const password = '123456';
    for (const pract of practicantes) {
      console.log(`\n👤 Practicante: ${pract.codigo}`);
      console.log(`   Usuario: ${pract.usuario}`);
      console.log(`   Hash en BD: ${pract.password}`);
      console.log(`   Longitud: ${pract.password.length}`);
      
      const isValid = await bcrypt.compare(password, pract.password);
      console.log(`   ¿Contraseña "${password}" válida?: ${isValid ? '✅ SÍ' : '❌ NO'}`);
    }

    // Generar NUEVO hash válido para "123456"
    console.log('\n' + '='.repeat(60));
    console.log('\n🔄 GENERANDO NUEVO HASH PARA "123456"...\n');
    
    const newHash = await bcrypt.hash('123456', 10);
    console.log(`Nuevo hash generado: ${newHash}`);
    console.log(`Longitud: ${newHash.length}`);
    
    // Verificar que el nuevo hash funciona
    const testNew = await bcrypt.compare('123456', newHash);
    console.log(`¿El nuevo hash funciona?: ${testNew ? '✅ SÍ' : '❌ NO'}`);

    // Generar script SQL
    console.log('\n' + '='.repeat(60));
    console.log('\n💾 SCRIPT SQL PARA ACTUALIZAR:\n');
    console.log('-- Copiar y ejecutar en phpMyAdmin:');
    console.log('USE asistencia_qr;');
    console.log(`UPDATE practicantes SET password = '${newHash}' WHERE codigo IN ('PRACT-001', 'PRACT-002', 'PRACT-003');`);
    console.log('SELECT "Contraseñas de practicantes actualizadas" as mensaje;');
    console.log('\n' + '='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPracticantePassword();
