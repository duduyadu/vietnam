const db = require('./config/database');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    // admin@vsms.com 사용자의 비밀번호를 admin123으로 재설정
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db('users')
      .where('email', 'admin@vsms.com')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date()
      });
    
    if (result > 0) {
      console.log('✅ admin@vsms.com 비밀번호가 admin123으로 재설정되었습니다.');
    } else {
      console.log('❌ admin@vsms.com 사용자를 찾을 수 없습니다.');
      
      // 새 관리자 계정 생성
      console.log('새 관리자 계정을 생성합니다...');
      const [userId] = await db('users').insert({
        email: 'admin@vsms.com',
        password_hash: hashedPassword,
        full_name: '시스템 관리자',
        role: 'admin',
        agency_name: 'VSMS 본부',
        phone: '010-1234-5678',
        is_active: true
      });
      
      console.log('✅ 새 관리자 계정 생성 완료!');
      console.log('Email: admin@vsms.com');
      console.log('Password: admin123');
      console.log('User ID:', userId);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();