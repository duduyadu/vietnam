import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add,
  Delete,
  VpnKey,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { usersAPI, authAPI, agenciesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

interface User {
  user_id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'korean_branch';
  agency_name?: string;
  branch_name?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

interface Agency {
  agency_id: number;
  agency_name: string;
  agency_code: string;
}

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 새 사용자 폼 데이터
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'teacher' as 'admin' | 'teacher' | 'korean_branch',
    agency_id: '',
    agency_name: '',
    branch_name: '',
    phone: ''
  });

  // 비밀번호 변경 폼
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
    loadAgencies();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      setError(extractErrorMessage(error, '사용자 목록을 불러오는데 실패했습니다.'));
    } finally {
      setLoading(false);
    }
  };

  const loadAgencies = async () => {
    try {
      const response = await agenciesAPI.getAll();
      setAgencies(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to load agencies:', error);
      // 유학원 목록 로드 실패는 에러 메시지를 표시하지 않음 (선택적 기능)
    }
  };

  const handleAddUser = async () => {
    try {
      setError('');
      
      // 유효성 검사
      if (!formData.email || !formData.password || !formData.full_name) {
        setError('필수 항목을 모두 입력해주세요.');
        return;
      }

      // 교사인 경우 agency_id 또는 agency_name 필수
      if (formData.role === 'teacher') {
        if (!formData.agency_id && !formData.agency_name) {
          setError('교사 계정은 유학원을 선택하거나 새 유학원 이름을 입력해야 합니다.');
          return;
        }
        // agency_id가 선택된 경우 해당 유학원 이름으로 설정
        if (formData.agency_id) {
          const selectedAgency = agencies.find(a => a.agency_id.toString() === formData.agency_id);
          if (selectedAgency) {
            formData.agency_name = selectedAgency.agency_name;
          }
        }
      }

      // 한국 지점인 경우 branch_name 필수
      if (formData.role === 'korean_branch' && !formData.branch_name) {
        setError('한국 지점 계정은 지점 이름이 필수입니다.');
        return;
      }

      const response = await authAPI.register(formData);
      
      if (response.data.success) {
        setSuccess('사용자가 성공적으로 등록되었습니다.');
        setIsAddDialogOpen(false);
        loadUsers();
        // 폼 초기화
        setFormData({
          email: '',
          password: '',
          full_name: '',
          role: 'teacher',
          agency_id: '',
          agency_name: '',
          branch_name: '',
          phone: ''
        });
      }
    } catch (error: any) {
      console.error('Failed to add user:', error);
      setError(extractErrorMessage(error, '사용자 등록에 실패했습니다.'));
    }
  };

  const handlePasswordReset = async () => {
    try {
      if (!selectedUser || !newPassword) {
        setError('새 비밀번호를 입력해주세요.');
        return;
      }

      if (newPassword.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }

      // API 호출하여 비밀번호 변경
      await usersAPI.resetPassword(selectedUser.user_id, newPassword);
      
      setSuccess(`${selectedUser.full_name}님의 비밀번호가 변경되었습니다.`);
      setIsPasswordDialogOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      setError(extractErrorMessage(error, '비밀번호 변경에 실패했습니다.'));
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`정말로 ${user.full_name}(${user.email}) 계정을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await usersAPI.delete(user.user_id);
      setSuccess(`${user.full_name}님의 계정이 삭제되었습니다.`);
      await loadUsers();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setError(extractErrorMessage(error, '사용자 삭제에 실패했습니다.'));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'teacher':
        return 'primary';
      case 'korean_branch':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '관리자';
      case 'teacher':
        return '유학원 교사';
      case 'korean_branch':
        return '한국 지점';
      default:
        return role;
    }
  };

  // 관리자만 접근 가능
  if (currentUser?.role !== 'admin') {
    return (
      <Layout>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Alert severity="error">
            관리자만 접근 가능한 페이지입니다.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            사용자 관리
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            새 사용자 추가
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이메일</TableCell>
                <TableCell>이름</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>소속</TableCell>
                <TableCell>마지막 로그인</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    로딩 중...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    등록된 사용자가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        color={getRoleColor(user.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.agency_name || user.branch_name || '-'}
                    </TableCell>
                    <TableCell>
                      {user.last_login ? 
                        new Date(user.last_login).toLocaleString('ko-KR') : 
                        '없음'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsPasswordDialogOpen(true);
                        }}
                        title="비밀번호 변경"
                      >
                        <VpnKey />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteUser(user)}
                        title="삭제"
                        disabled={user.user_id === currentUser?.user_id || user.role === 'admin'}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 새 사용자 추가 다이얼로그 */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>새 사용자 추가</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                helperText="최소 6자 이상"
              />
              <TextField
                label="이름"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                fullWidth
              />
              <FormControl fullWidth required>
                <InputLabel>역할</InputLabel>
                <Select
                  value={formData.role}
                  label="역할"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <MenuItem value="admin">관리자</MenuItem>
                  <MenuItem value="teacher">유학원 교사</MenuItem>
                  <MenuItem value="korean_branch">한국 지점</MenuItem>
                </Select>
              </FormControl>
              {formData.role === 'teacher' && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>유학원 선택</InputLabel>
                    <Select
                      value={formData.agency_id}
                      label="유학원 선택"
                      onChange={(e) => setFormData({ ...formData, agency_id: e.target.value })}
                    >
                      <MenuItem value="">-- 직접 입력 --</MenuItem>
                      {agencies.map((agency) => (
                        <MenuItem key={agency.agency_id} value={agency.agency_id.toString()}>
                          {agency.agency_name} ({agency.agency_code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {!formData.agency_id && (
                    <TextField
                      label="새 유학원 이름"
                      value={formData.agency_name}
                      onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
                      required={!formData.agency_id}
                      fullWidth
                      helperText="기존 유학원이 목록에 없는 경우 새 이름을 입력하세요"
                    />
                  )}
                </>
              )}
              {formData.role === 'korean_branch' && (
                <TextField
                  label="지점 이름"
                  value={formData.branch_name}
                  onChange={(e) => setFormData({ ...formData, branch_name: e.target.value })}
                  required
                  fullWidth
                />
              )}
              <TextField
                label="전화번호"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAddDialogOpen(false)}>취소</Button>
            <Button onClick={handleAddUser} variant="contained">추가</Button>
          </DialogActions>
        </Dialog>

        {/* 비밀번호 변경 다이얼로그 */}
        <Dialog open={isPasswordDialogOpen} onClose={() => setIsPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>비밀번호 변경</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedUser?.full_name} ({selectedUser?.email})
              </Typography>
              <TextField
                label="새 비밀번호"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  )
                }}
                helperText="최소 6자 이상"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsPasswordDialogOpen(false);
              setNewPassword('');
              setSelectedUser(null);
            }}>취소</Button>
            <Button onClick={handlePasswordReset} variant="contained">변경</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default UserManagement;