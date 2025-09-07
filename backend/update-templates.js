/**
 * 보고서 템플릿 업데이트 스크립트
 */

const db = require('./config/database');

async function updateTemplates() {
  console.log('🔧 보고서 템플릿 업데이트 시작...');
  
  try {
    // consultation_comprehensive 템플릿이 있는지 확인
    const comprehensiveTemplate = await db('report_templates')
      .where('template_code', 'consultation_comprehensive')
      .first();
    
    if (!comprehensiveTemplate) {
      // 기존 템플릿 중 첫 번째를 consultation_comprehensive로 업데이트
      const firstTemplate = await db('report_templates')
        .orderBy('template_id')
        .first();
      
      if (firstTemplate) {
        await db('report_templates')
          .where('template_id', firstTemplate.template_id)
          .update({
            template_name: '종합 상담 보고서',
            template_code: 'consultation_comprehensive',
            description: '학생의 전체 상담 내역과 성장 과정을 포함한 종합 보고서',
            report_type: 'comprehensive',
            allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
            is_active: true,
            display_order: 1
          });
        console.log('✅ 종합 상담 보고서 템플릿 업데이트 완료');
      }
    } else {
      console.log('ℹ️ 종합 상담 보고서 템플릿이 이미 존재합니다');
    }
    
    // academic_progress 템플릿 확인 및 업데이트
    const progressTemplate = await db('report_templates')
      .where('template_code', 'academic_progress')
      .first();
    
    if (progressTemplate) {
      await db('report_templates')
        .where('template_code', 'academic_progress')
        .update({
          template_name: '학업 진도 보고서',
          description: '학업 진행 상황과 TOPIK 성적을 포함한 보고서',
          report_type: 'academic_progress',
          allowed_roles: JSON.stringify(['admin', 'teacher', 'branch'])
        });
      console.log('✅ 학업 진도 보고서 템플릿 업데이트 완료');
    }
    
    // performance_analysis 템플릿 확인 및 업데이트
    const performanceTemplate = await db('report_templates')
      .where('template_code', 'performance_analysis')
      .first();
    
    if (performanceTemplate) {
      await db('report_templates')
        .where('template_code', 'performance_analysis')
        .update({
          template_name: '성적 분석 보고서',
          description: 'TOPIK 모의고사 성적 분석 및 향상 계획 보고서',
          report_type: 'performance_analysis',
          allowed_roles: JSON.stringify(['admin', 'teacher', 'branch'])
        });
      console.log('✅ 성적 분석 보고서 템플릿 업데이트 완료');
    }
    
    // 확인
    const newTemplates = await db('report_templates').select('*');
    console.log('\n📊 업데이트된 템플릿 목록:');
    newTemplates.forEach(t => {
      console.log(`  - ${t.template_name} (${t.template_code})`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    process.exit();
  }
}

// 실행
updateTemplates();