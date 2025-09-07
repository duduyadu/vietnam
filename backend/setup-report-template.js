const db = require('./config/database');
const fs = require('fs').promises;
const path = require('path');

async function setupReportTemplate() {
  console.log('Setting up report template...');
  
  try {
    // Check if template exists
    const existing = await db('report_templates')
      .where('template_code', 'STUDENT_RECORD')
      .first();
    
    if (existing) {
      console.log('Template already exists, updating...');
      
      // Read template file
      const templatePath = path.join(__dirname, 'templates', 'student-record-template.html');
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      await db('report_templates')
        .where('template_code', 'STUDENT_RECORD')
        .update({
          html_template: templateContent,
          updated_at: new Date()
        });
      
      console.log('✅ Template updated');
    } else {
      // Read template file
      const templatePath = path.join(__dirname, 'templates', 'student-record-template.html');
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Create new template
      await db('report_templates').insert({
        template_name: '학생 생활기록부',
        template_code: 'STUDENT_RECORD',
        description: '학생의 전체 정보를 포함한 생활기록부',
        report_type: 'student',
        html_template: templateContent,
        allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
        is_active: true,
        display_order: 1,
        created_at: new Date()
      });
      
      console.log('✅ Template created');
    }
    
    // Create another template for consultations
    const consultationTemplate = await db('report_templates')
      .where('template_code', 'CONSULTATION_REPORT')
      .first();
    
    if (!consultationTemplate) {
      await db('report_templates').insert({
        template_name: '상담 기록 보고서',
        template_code: 'CONSULTATION_REPORT',
        description: '학생 상담 기록 상세 보고서',
        report_type: 'consultation',
        html_template: '<html><body><h1>상담 기록</h1>{{content}}</body></html>',
        allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
        is_active: true,
        display_order: 2,
        created_at: new Date()
      });
      
      console.log('✅ Consultation template created');
    }
    
    // Create exam result template
    const examTemplate = await db('report_templates')
      .where('template_code', 'EXAM_RESULT')
      .first();
    
    if (!examTemplate) {
      await db('report_templates').insert({
        template_name: '시험 성적 보고서',
        template_code: 'EXAM_RESULT',
        description: 'TOPIK 시험 성적 분석 보고서',
        report_type: 'exam',
        html_template: '<html><body><h1>시험 성적</h1>{{content}}</body></html>',
        allowed_roles: JSON.stringify(['admin', 'teacher', 'branch']),
        is_active: true,
        display_order: 3,
        created_at: new Date()
      });
      
      console.log('✅ Exam template created');
    }
    
    console.log('\n📋 Available report templates:');
    const templates = await db('report_templates').select('template_code', 'template_name');
    templates.forEach(t => {
      console.log(`  - ${t.template_code}: ${t.template_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupReportTemplate();