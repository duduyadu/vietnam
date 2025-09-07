import api from './api';

export interface ReportTemplate {
  template_id: number;
  template_name: string;
  template_code: string;
  description: string;
  report_type: string;
  allowed_roles: string[];
}

export interface GeneratedReport {
  report_id: number;
  student_id: number;
  student_code: string;
  student_name: string;
  template_id: number;
  template_name: string;
  report_type: string;
  report_title: string;
  report_date: string;
  period_start?: string;
  period_end?: string;
  status: 'generating' | 'completed' | 'failed' | 'archived';
  pdf_path?: string;
  html_path?: string;
  file_size?: number;
  generation_time_ms?: number;
  generated_by: number;
  generated_by_name: string;
  generated_at: string;
  last_accessed_at?: string;
  access_count: number;
  error_message?: string;
}

export interface GenerateReportRequest {
  student_id: number;
  template_code: string;
  date_range?: {
    start?: string;
    end?: string;
  };
  language?: 'ko' | 'vi';
}

export interface ExamResult {
  exam_id?: number;
  student_id: number;
  exam_name: string;
  exam_type: string;
  subject?: string;
  exam_date: string;
  semester?: string;
  score: number;
  max_score: number;
  percentage?: number;
  grade?: string;
  rank?: number;
  total_students?: number;
  notes?: string;
}

export interface LearningProgress {
  progress_id?: number;
  student_id: number;
  subject: string;
  course_name?: string;
  level?: string;
  record_date: string;
  semester?: string;
  total_lessons?: number;
  completed_lessons?: number;
  completion_percentage?: number;
  attendance_count?: number;
  absence_count?: number;
  attendance_rate?: number;
  quiz_average?: number;
  assignment_average?: number;
  participation_score?: number;
  strengths?: string;
  weaknesses?: string;
  improvement_areas?: string;
  monthly_goals?: string;
  action_plan?: string;
  target_completion_date?: string;
  overall_performance?: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  teacher_comments?: string;
  skill_assessment?: {
    speaking?: number;
    listening?: number;
    reading?: number;
    writing?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ReportListParams extends PaginationParams {
  student_id?: number;
  status?: string;
}

class ReportService {
  // 보고서 템플릿 목록 조회
  async getTemplates(): Promise<ReportTemplate[]> {
    try {
      const response = await api.get('/reports/templates');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get report templates:', error);
      throw error;
    }
  }

  // 보고서 생성
  async generateReport(request: GenerateReportRequest): Promise<{
    report_id: number;
    pdf_path: string;
    html_path: string;
    generation_time: number;
  }> {
    try {
      console.log('📡 Sending generate request to:', '/reports/generate');
      console.log('📦 Request payload:', request);
      const response = await api.post('/reports/generate', request);
      console.log('✅ Generate response:', response.data);
      
      // 백엔드가 {success: true, data: {...}} 형식으로 반환
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // 혹시 다른 형식일 경우 대비
      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to generate report:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error;
    }
  }

  // 생성된 보고서 목록 조회
  async getReports(params: ReportListParams = {}): Promise<{
    data: GeneratedReport[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get reports:', error);
      throw error;
    }
  }

  // 특정 보고서 조회
  async getReport(reportId: number): Promise<GeneratedReport> {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get report:', error);
      throw error;
    }
  }

  // 보고서 PDF 다운로드
  async downloadReport(reportId: number): Promise<Blob> {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download report:', error);
      throw error;
    }
  }

  // 보고서 삭제 (관리자만)
  async deleteReport(reportId: number): Promise<void> {
    try {
      await api.delete(`/reports/${reportId}`);
    } catch (error) {
      console.error('Failed to delete report:', error);
      throw error;
    }
  }

  // 시험 성적 추가
  async addExamResult(examResult: ExamResult): Promise<{ exam_id: number }> {
    try {
      const response = await api.post('/reports/exam-results', examResult);
      return response.data.data;
    } catch (error) {
      console.error('Failed to add exam result:', error);
      throw error;
    }
  }

  // 학습 진도 추가
  async addLearningProgress(progress: LearningProgress): Promise<{ progress_id: number }> {
    try {
      const response = await api.post('/reports/learning-progress', progress);
      return response.data.data;
    } catch (error) {
      console.error('Failed to add learning progress:', error);
      throw error;
    }
  }

  // 보고서 다운로드 헬퍼 (파일 저장)
  async downloadAndSaveReport(reportId: number, fileName?: string): Promise<void> {
    try {
      const blob = await this.downloadReport(reportId);
      
      // Blob URL 생성
      const url = window.URL.createObjectURL(blob);
      
      // 가상의 a 태그 생성하여 다운로드 트리거
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download and save report:', error);
      throw error;
    }
  }

  // 날짜 범위 검증
  validateDateRange(start?: string, end?: string): { isValid: boolean; error?: string } {
    if (!start && !end) {
      return { isValid: true };
    }

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (startDate > endDate) {
        return { 
          isValid: false, 
          error: '시작일이 종료일보다 늦을 수 없습니다.' 
        };
      }
      
      if (endDate > new Date()) {
        return { 
          isValid: false, 
          error: '종료일은 현재 날짜보다 늦을 수 없습니다.' 
        };
      }
    }

    return { isValid: true };
  }

  // 보고서 상태 텍스트 변환
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'generating': '생성 중',
      'completed': '완료',
      'failed': '실패',
      'archived': '보관됨'
    };
    return statusMap[status] || status;
  }

  // 보고서 상태 색상 반환
  getStatusColor(status: string): 'primary' | 'success' | 'error' | 'warning' | 'info' {
    const colorMap: { [key: string]: 'primary' | 'success' | 'error' | 'warning' | 'info' } = {
      'generating': 'info',
      'completed': 'success',
      'failed': 'error',
      'archived': 'warning'
    };
    return colorMap[status] || 'primary';
  }

  // 파일 크기 포맷팅
  formatFileSize(bytes?: number): string {
    if (!bytes) return 'N/A';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // 생성 시간 포맷팅
  formatGenerationTime(ms?: number): string {
    if (!ms) return 'N/A';
    
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}초`;
    return `${(ms / 60000).toFixed(1)}분`;
  }
}

export default new ReportService();