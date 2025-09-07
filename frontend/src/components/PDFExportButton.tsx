import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Typography,
  Alert,
  Box,
  IconButton
} from '@mui/material';
import {
  PictureAsPdf,
  Preview,
  Print,
  School,
  AccountBalance,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { pdfAPI } from '../services/api';

interface PDFExportButtonProps {
  consultationId: number;
  studentId: number;
  studentName?: string;
  consultations?: Array<{
    consultation_id: number;
    consultation_date: string;
    has_evaluation?: boolean;
  }>;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  consultationId,
  studentId,
  studentName,
  consultations = [],
  variant = 'contained',
  size = 'medium'
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [officialDialog, setOfficialDialog] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<'visa' | 'university'>('visa');
  const [selectedConsultations, setSelectedConsultations] = useState<number[]>([consultationId]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // 단일 상담 보고서 생성
  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      handleClose();
      pdfAPI.generateConsultationReport(consultationId, studentId);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  // 미리보기
  const handlePreview = () => {
    handleClose();
    pdfAPI.previewConsultationReport(consultationId, studentId);
  };

  // 공식 보고서 다이얼로그 열기
  const handleOpenOfficialDialog = () => {
    handleClose();
    // 현재 상담만 기본 선택
    setSelectedConsultations([consultationId]);
    setOfficialDialog(true);
  };

  // 공식 보고서 생성
  const handleGenerateOfficialReport = async () => {
    try {
      setLoading(true);
      await pdfAPI.generateOfficialReport({
        studentId,
        consultationIds: selectedConsultations,
        purpose: selectedPurpose
      });
      setOfficialDialog(false);
    } catch (error) {
      console.error('Failed to generate official report:', error);
      alert('공식 보고서 생성에 실패했습니다. 상담사 평가가 모두 작성되었는지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 상담 선택 토글
  const handleToggleConsultation = (consultationId: number) => {
    setSelectedConsultations(prev => {
      if (prev.includes(consultationId)) {
        return prev.filter(id => id !== consultationId);
      } else {
        return [...prev, consultationId];
      }
    });
  };

  return (
    <>
      <Tooltip title="PDF 보고서 생성">
        <Button
          variant={variant}
          size={size}
          color="primary"
          startIcon={loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
          onClick={handleClick}
          disabled={loading}
        >
          PDF 보고서
        </Button>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={handleGenerateReport}>
          <ListItemIcon>
            <PictureAsPdf fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="상담 보고서 다운로드" 
            secondary="현재 상담 기록 PDF 생성"
          />
        </MenuItem>

        <MenuItem onClick={handlePreview}>
          <ListItemIcon>
            <Preview fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary="미리보기" 
            secondary="브라우저에서 미리보기"
          />
        </MenuItem>

        <MenuItem onClick={handleOpenOfficialDialog}>
          <ListItemIcon>
            <AccountBalance fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="공식 보고서 생성" 
            secondary="비자/대학 제출용"
          />
        </MenuItem>
      </Menu>

      {/* 공식 보고서 생성 다이얼로그 */}
      <Dialog
        open={officialDialog}
        onClose={() => setOfficialDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          공식 보고서 생성
          {studentName && (
            <Typography variant="subtitle2" color="text.secondary">
              학생: {studentName}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            공식 보고서에는 상담사 평가가 필수로 포함되어야 합니다.
            선택한 모든 상담에 상담사 평가가 작성되어 있는지 확인해주세요.
          </Alert>

          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              제출 목적
            </Typography>
            <RadioGroup
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value as 'visa' | 'university')}
            >
              <FormControlLabel 
                value="visa" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">비자 신청용</Typography>
                    <Typography variant="caption" color="text.secondary">
                      대사관/영사관 제출용 공식 문서
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="university" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">대학 입학용</Typography>
                    <Typography variant="caption" color="text.secondary">
                      대학교 입학처 제출용 공식 문서
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {consultations.length > 0 && (
            <FormControl component="fieldset">
              <Typography variant="subtitle1" gutterBottom>
                포함할 상담 기록 선택
              </Typography>
              <FormGroup>
                {consultations.map(consultation => (
                  <FormControlLabel
                    key={consultation.consultation_id}
                    control={
                      <Checkbox
                        checked={selectedConsultations.includes(consultation.consultation_id)}
                        onChange={() => handleToggleConsultation(consultation.consultation_id)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {new Date(consultation.consultation_date).toLocaleDateString('ko-KR')}
                        </Typography>
                        {consultation.has_evaluation ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Warning color="warning" fontSize="small" />
                        )}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                <CheckCircle color="success" fontSize="small" sx={{ verticalAlign: 'middle' }} /> 상담사 평가 작성됨
                <Warning color="warning" fontSize="small" sx={{ ml: 2, verticalAlign: 'middle' }} /> 상담사 평가 필요
              </Typography>
            </FormControl>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOfficialDialog(false)}>
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleGenerateOfficialReport}
            disabled={loading || selectedConsultations.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <School />}
          >
            공식 보고서 생성
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// 간단한 PDF 다운로드 버튼 (아이콘만)
export const PDFDownloadIcon: React.FC<{
  consultationId: number;
  studentId: number;
}> = ({ consultationId, studentId }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      pdfAPI.generateConsultationReport(consultationId, studentId);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setTimeout(() => setLoading(false), 2000); // 2초 후 로딩 해제
    }
  };

  return (
    <Tooltip title="PDF 다운로드">
      <span>
        <IconButton
          onClick={handleDownload}
          disabled={loading}
          color="primary"
          size="small"
        >
          {loading ? <CircularProgress size={20} /> : <PictureAsPdf />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default PDFExportButton;