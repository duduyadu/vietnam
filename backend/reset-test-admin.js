const bcrypt = require('bcrypt');
const db = require('./config/database');

async function resetTestAdmin() {
  try {
    console.log('🔐 admin@system.com 비밀번호 재설정 중...');
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const result = await db('users')
      .where('email', 'admin@system.com')
      .update({
        password_hash: hashedPassword
      });
    
    if (result) {
      console.log('✅ 비밀번호가 성공적으로 재설정되었습니다.');
      console.log('이메일: admin@system.com');
      console.log('비밀번호: test123');
    } else {
      console.log('❌ 사용자를 찾을 수 없습니다.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

resetTestAdmin();