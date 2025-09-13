import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import agencyService from '../services/agencyService';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Stack,
  CircularProgress,
  Avatar,
  IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';

interface StudentAddModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (studentData: any) => void;
}

const StudentAddModal: React.FC<StudentAddModalProps> = ({ open, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  useEffect(() => {
    // 유학원 목록 가져오기 (캐싱 서비스 사용)
    if (open) {
      fetchAgencies();
    }
  }, [open]);
  
  const fetchAgencies = async () => {
    try {
      setLoading(true);
      // 캐싱 서비스를 통해 유학원 데이터 가져오기
      const agencyData = await agencyService.getAgencies();
      setAgencies(agencyData);
    } catch (error) {
      console.error('Failed to fetch agencies:', error);
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: '',
    phone: '',
    email: '',
    address_vietnam: '',
    address_korea: '',
    parent_name: '',
    parent_phone: '',
    parent_income: '',
    high_school: '',
    gpa: '',
    desired_major: '',
    desired_university: '',
    visa_type: '',
    visa_expiry: '',
    alien_registration: '',
    agency_id: '',
    agency_enrollment_date: '',
    profile_image: null as File | null
  });

  const handleChange = (field: string) => (event: any) => {
    let value = event.target.value;
    
    // 생년월일 입력 시 자동 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
    if (field === 'birth_date') {
      // 숫자만 추출
      value = value.replace(/\D/g, '');
      
      // 8자리까지만 입력 가능
      if (value.length > 8) {
        value = value.slice(0, 8);
      }
      
      // 자동 하이픈 삽입
      if (value.length >= 4 && value.length <= 6) {
        value = value.slice(0, 4) + '-' + value.slice(4);
      } else if (value.length > 6) {
        value = value.slice(0, 4) + '-' + value.slice(4, 6) + '-' + value.slice(6, 8);
      }
    }
    
    // 유학원 등록 년월 자동 포맷팅 (YYYYMM -> YYYY-MM)
    if (field === 'agency_enrollment_date') {
      // 숫자만 추출
      value = value.replace(/\D/g, '');
      
      // 6자리까지만 입력 가능
      if (value.length > 6) {
        value = value.slice(0, 6);
      }
      
      // 4자리 이상이면 하이픈 자동 삽입
      if (value.length >= 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
      }
    }
    
    // 비자 만료일 자동 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
    if (field === 'visa_expiry' && !value.includes('-')) {
      // 숫자만 추출
      const numbers = value.replace(/\D/g, '');
      
      if (numbers.length === 8) {
        value = numbers.slice(0, 4) + '-' + numbers.slice(4, 6) + '-' + numbers.slice(6, 8);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // 기본 유효성 검사
    if (!formData.name || !formData.birth_date || !formData.phone || !formData.agency_id) {
      alert('이름, 생년월일, 연락처, 소속 유학원은 필수 입력 항목입니다.');
      setSubmitting(false);
      return;
    }
    
    setSubmitting(true);

    // 생년월일 유효성 검사 (이미 하이픈이 포함되어 있음)
    const birthDate = formData.birth_date.replace(/-/g, '');
    
    // 8자리 숫자인지 확인
    if (birthDate.length !== 8) {
      alert('생년월일을 8자리 숫자로 입력해주세요. (예: 20050815)');
      return;
    }
    
    const year = parseInt(birthDate.slice(0, 4));
    const month = parseInt(birthDate.slice(4, 6));
    const day = parseInt(birthDate.slice(6, 8));
    
    // 날짜 유효성 검사
    if (month < 1 || month > 12) {
      alert('월은 01~12 사이의 값이어야 합니다.');
      return;
    }
    
    if (day < 1 || day > 31) {
      alert('일은 01~31 사이의 값이어야 합니다.');
      return;
    }
    
    if (year < 1900 || year > new Date().getFullYear()) {
      alert('올바른 년도를 입력해주세요.');
      return;
    }

    try {
      // FormData 객체 생성
      const submitData = new FormData();

      // 모든 텍스트 필드 추가
      Object.keys(formData).forEach(key => {
        if (key !== 'profile_image' && formData[key as keyof typeof formData]) {
          submitData.append(key, formData[key as keyof typeof formData] as string);
        }
      });

      // 추가 필드 설정
      submitData.append('name_ko', formData.name);
      submitData.append('name_vi', formData.name);

      // 이미지 파일 추가
      if (profileImage) {
        submitData.append('profile_image', profileImage);
      }

      await onSubmit(submitData);
      
      // 폼 초기화
      setFormData({
        name: '',
        birth_date: '',
        gender: '',
        phone: '',
        email: '',
        address_vietnam: '',
        address_korea: '',
        parent_name: '',
        parent_phone: '',
        parent_income: '',
        high_school: '',
        gpa: '',
        desired_major: '',
        desired_university: '',
        visa_type: '',
        visa_expiry: '',
        alien_registration: '',
        agency_id: '',
        agency_enrollment_date: '',
        profile_image: null
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // 폼 초기화
    setFormData({
      name: '',
      birth_date: '',
      gender: '',
      phone: '',
      email: '',
      address_vietnam: '',
      address_korea: '',
      parent_name: '',
      parent_phone: '',
      parent_income: '',
      high_school: '',
      gpa: '',
      desired_major: '',
      desired_university: '',
      visa_type: '',
      visa_expiry: '',
      alien_registration: '',
      agency_id: '',
      agency_enrollment_date: '',
      profile_image: null
    });
    setProfileImage(null);
    setImagePreview('');
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB 이하로 제한됩니다.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>학생 추가</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* 학생 사진 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={imagePreview}
              sx={{ width: 100, height: 100, mr: 2 }}
            />
            <Box>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="photo-upload">
                <IconButton color="primary" aria-label="upload picture" component="span">
                  <PhotoCamera />
                </IconButton>
              </label>
              <Typography variant="caption" display="block">
                학생 사진 업로드 (5MB 이하)
              </Typography>
            </Box>
          </Box>

          {/* 기본 정보 */}
          <Typography variant="h6" gutterBottom color="primary">
            기본 정보
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="이름 *"
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
              <TextField
                fullWidth
                label="생년월일 *"
                value={formData.birth_date}
                onChange={handleChange('birth_date')}
                placeholder="20050815"
                inputProps={{ maxLength: 10 }}
                helperText="숫자만 입력 (예: 20050815 → 2005-08-15)"
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="agency-select-label">소속 유학원</InputLabel>
                <Select
                  labelId="agency-select-label"
                  value={formData.agency_id || ''}
                  label="소속 유학원"
                  onChange={handleChange('agency_id')}
                  disabled={loading}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>선택 안함</em>
                  </MenuItem>
                  {loading ? (
                    <MenuItem disabled>
                      유학원 목록을 불러오는 중...
                    </MenuItem>
                  ) : (
                    agencies.map((agency) => (
                      <MenuItem key={agency.agency_id} value={agency.agency_id}>
                        {agency.agency_name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="유학원 등록 년월"
                value={formData.agency_enrollment_date}
                onChange={handleChange('agency_enrollment_date')}
                placeholder="202501"
                helperText="숫자만 입력 (예: 202501 → 2025-01)"
                inputProps={{ maxLength: 7 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>성별</InputLabel>
                <Select
                  value={formData.gender}
                  label="성별"
                  onChange={handleChange('gender')}
                >
                  <MenuItem value="남성">남성</MenuItem>
                  <MenuItem value="여성">여성</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="연락처 *"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="이메일"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
              />
              <TextField
                fullWidth
                label="베트남 주소"
                value={formData.address_vietnam}
                onChange={handleChange('address_vietnam')}
              />
            </Box>
            <TextField
              fullWidth
              label="한국 주소"
              value={formData.address_korea}
              onChange={handleChange('address_korea')}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* 가족 정보 */}
          <Typography variant="h6" gutterBottom color="primary">
            가족 정보
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="부모님 성함"
                value={formData.parent_name}
                onChange={handleChange('parent_name')}
              />
              <TextField
                fullWidth
                label="부모님 연락처"
                value={formData.parent_phone}
                onChange={handleChange('parent_phone')}
              />
            </Box>
            <TextField
              fullWidth
              label="가족 연소득 (민감정보)"
              value={formData.parent_income}
              onChange={handleChange('parent_income')}
              placeholder="예: 50,000,000 원"
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* 학업 정보 */}
          <Typography variant="h6" gutterBottom color="primary">
            학업 정보
          </Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="출신 고등학교"
                value={formData.high_school}
                onChange={handleChange('high_school')}
              />
              <TextField
                fullWidth
                label="고등학교 성적 (GPA)"
                type="number"
                value={formData.gpa}
                onChange={handleChange('gpa')}
                inputProps={{ min: 0, max: 10, step: 0.1 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="희망 전공"
                value={formData.desired_major}
                onChange={handleChange('desired_major')}
              />
              <TextField
                fullWidth
                label="희망 대학"
                value={formData.desired_university}
                onChange={handleChange('desired_university')}
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* 비자 정보 */}
          <Typography variant="h6" gutterBottom color="primary">
            비자 정보
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>비자 종류</InputLabel>
                <Select
                  value={formData.visa_type}
                  label="비자 종류"
                  onChange={handleChange('visa_type')}
                >
                  <MenuItem value="D-2">D-2 (정규학위과정)</MenuItem>
                  <MenuItem value="D-4-1">D-4-1 (한국어연수)</MenuItem>
                  <MenuItem value="D-4-7">D-4-7 (어학연수)</MenuItem>
                  <MenuItem value="기타">기타</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="비자 만료일"
                value={formData.visa_expiry}
                onChange={handleChange('visa_expiry')}
                placeholder="20250131"
                helperText="숫자만 입력 (예: 20250131 → 2025-01-31)"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              fullWidth
              label="외국인등록번호 (민감정보)"
              value={formData.alien_registration}
              onChange={handleChange('alien_registration')}
              placeholder="123456-1234567"
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" disabled={submitting}>
          취소
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={submitting || loading}
          startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {submitting ? '처리 중...' : '학생 추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudentAddModal;