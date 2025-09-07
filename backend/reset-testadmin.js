const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetTestAdminPassword() {
  try {
    // testadmin@example.com 사용자의 비밀번호를 admin123으로 재설정
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db('users')
      .where('email', 'testadmin@example.com')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date()
      });
    
    if (result > 0) {
      console.log('✅ testadmin@example.com 비밀번호가 admin123으로 재설정되었습니다.');
    } else {
      console.log('❌ testadmin@example.com 사용자를 찾을 수 없습니다.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetTestAdminPassword();