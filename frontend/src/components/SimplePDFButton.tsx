import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import reportService from '../services/reportService';

interface SimplePDFButtonProps {
  studentId: number;
  consultationId?: number;
  studentName?: string;
}

const SimplePDFButton: React.FC<SimplePDFButtonProps> = ({ 
  studentId, 
  consultationId,
  studentName 
}) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateAndDownload = async () => {
    setLoading(true);
    
    try {
      console.log('🎯 Starting PDF generation...');
      console.log('Student ID:', studentId);
      console.log('Student Name:', studentName);
      console.log('Consultation ID:', consultationId);
      
      // 1. 먼저 PDF 보고서 생성
      console.log('📤 Calling generateReport API...');
      const generateResult = await reportService.generateReport({
        student_id: studentId,
        template_code: 'consultation_comprehensive',
        language: 'ko'
      });
      
      console.log('✅ PDF generated successfully:', generateResult);
      
      // 2. 생성된 보고서 다운로드 (백엔드 응답 구조에 맞게 수정)
      const reportId = generateResult?.report_id;
      
      if (reportId) {
        console.log('📥 Downloading report with ID:', reportId);
        await reportService.downloadAndSaveReport(
          reportId,
          `${studentName || `student_${studentId}`}_report_${Date.now()}.pdf`
        );
        console.log('✅ PDF downloaded successfully');
      } else {
        console.error('❌ Report ID not found in response:', generateResult);
        throw new Error('보고서 생성에 실패했습니다. (report_id 없음)');
      }
    } catch (error: any) {
      console.error('PDF generation/download error:', error);
      const errorMessage = error.response?.data?.message_ko || 
                          error.response?.data?.message || 
                          error.message ||
                          'PDF 다운로드 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title="PDF 보고서 다운로드">
      <IconButton
        size="small"
        color="primary"
        onClick={handleGenerateAndDownload}
        disabled={loading}
      >
        {loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
      </IconButton>
    </Tooltip>
  );
};

export default SimplePDFButton;