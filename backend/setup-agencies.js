// 유학원 테이블 설정 스크립트
const db = require('./config/database');

async function setupAgencies() {
  try {
    // 유학원 테이블 생성
    await db.schema.createTable('agencies', (table) => {
      table.increments('agency_id').primary();
      table.string('agency_name', 100).notNullable();
      table.string('agency_code', 20).unique().notNullable();
      table.string('contact_person', 100);
      table.string('phone', 20);
      table.string('email', 100);
      table.text('address');
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.integer('created_by').references('user_id').inTable('users');
    }).catch(err => {
      console.log('Agencies table already exists or error:', err.message);
    });

    // 기본 유학원 데이터 추가
    const existingAgencies = await db('agencies').select('agency_code');
    const existingCodes = existingAgencies.map(a => a.agency_code);

    const defaultAgencies = [
      {
        agency_name: '하노이 유학원',
        agency_code: 'HANOI001',
        contact_person: '김철수',
        phone: '024-1234-5678',
        email: 'hanoi@edu.vn',
        address: '하노이시 동다구',
        created_by: 1
      },
      {
        agency_name: '호치민 유학원',
        agency_code: 'HCMC001',
        contact_person: '이영희',
        phone: '028-9876-5432',
        email: 'hcmc@edu.vn',
        address: '호치민시 1군',
        created_by: 1
      },
      {
        agency_name: '다낭 유학원',
        agency_code: 'DANANG001',
        contact_person: '박민수',
        phone: '0236-456-7890',
        email: 'danang@edu.vn',
        address: '다낭시 해안구',
        created_by: 1
      }
    ];

    for (const agency of defaultAgencies) {
      if (!existingCodes.includes(agency.agency_code)) {
        await db('agencies').insert(agency);
        console.log(`✅ Added agency: ${agency.agency_name}`);
      }
    }

    console.log('✅ Agencies table setup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up agencies:', error);
    process.exit(1);
  }
}

setupAgencies();