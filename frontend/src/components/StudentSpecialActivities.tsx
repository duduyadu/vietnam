import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Checkbox,
  Rating
} from '@mui/material';
import { Grid } from './GridCompat';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  Groups as GroupsIcon,
  VolunteerActivism as VolunteerIcon,
  WorkspacePremium as AwardIcon
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';

interface SpecialActivity {
  id?: number;
  student_id: number;
  activity_type: string;
  activity_name: string;
  activity_name_vi?: string;
  start_date: string;
  end_date?: string;
  is_ongoing: boolean;
  description: string;
  description_vi?: string;
  achievement?: string;
  hours_participated?: number;
  teacher_evaluation?: string;
  impact_score?: number;
}

interface StudentSpecialActivitiesProps {
  studentId: number;
  studentName: string;
}

const activityTypes = [
  { value: 'club', label: '동아리 활동', icon: <GroupsIcon /> },
  { value: 'volunteer', label: '봉사 활동', icon: <VolunteerIcon /> },
  { value: 'award', label: '수상 경력', icon: <TrophyIcon /> },
  { value: 'portfolio', label: '포트폴리오', icon: <AwardIcon /> },
  { value: 'other', label: '기타', icon: null }
];

const StudentSpecialActivities: React.FC<StudentSpecialActivitiesProps> = ({
  studentId,
  studentName
}) => {
  const [activities, setActivities] = useState<SpecialActivity[]>([]);
  const [currentActivity, setCurrentActivity] = useState<SpecialActivity>({
    student_id: studentId,
    activity_type: 'club',
    activity_name: '',
    start_date: new Date().toISOString().split('T')[0],
    is_ongoing: false,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [studentId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/special-activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { student_id: studentId }
        }
      );
      setActivities(response.data);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      
      if (isEditing && currentActivity.id) {
        // 수정
        await axios.put(
          `${API_URL}/api/special-activities/${currentActivity.id}`,
          currentActivity,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('활동이 수정되었습니다');
      } else {
        // 생성
        await axios.post(
          `${API_URL}/api/special-activities`,
          currentActivity,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('활동이 추가되었습니다');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchActivities();
    } catch (err: any) {
      setError(err.response?.data?.error || '저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/special-activities/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('활동이 삭제되었습니다');
      fetchActivities();
    } catch (err) {
      setError('삭제 실패');
    }
  };

  const handleEdit = (activity: SpecialActivity) => {
    setCurrentActivity(activity);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setCurrentActivity({
      student_id: studentId,
      activity_type: 'club',
      activity_name: '',
      start_date: new Date().toISOString().split('T')[0],
      is_ongoing: false,
      description: ''
    });
    setIsEditing(false);
  };

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity?.icon || null;
  };

  const getActivityLabel = (type: string) => {
    const activity = activityTypes.find(a => a.value === type);
    return activity?.label || type;
  };

  return (
    <>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              <TrophyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              특별 활동
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
            >
              활동 추가
            </Button>
          </Box>

          {loading && <CircularProgress />}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <List>
            {activities.map((activity) => (
              <Card key={activity.id} sx={{ mb: 2 }}>
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      {getActivityIcon(activity.activity_type)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {activity.activity_name}
                          </Typography>
                          <Chip 
                            label={getActivityLabel(activity.activity_type)} 
                            size="small" 
                            color="primary"
                          />
                          {activity.is_ongoing && (
                            <Chip label="진행중" size="small" color="success" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            기간: {activity.start_date} ~ {activity.end_date || '진행중'}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {activity.description}
                          </Typography>
                          {activity.achievement && (
                            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                              성과: {activity.achievement}
                            </Typography>
                          )}
                          {activity.hours_participated && (
                            <Typography variant="body2" color="text.secondary">
                              참여시간: {activity.hours_participated}시간
                            </Typography>
                          )}
                          {activity.impact_score && (
                            <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                영향력:
                              </Typography>
                              <Rating value={activity.impact_score} readOnly size="small" />
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </Box>
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit(activity)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(activity.id!)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Card>
            ))}
          </List>

          {activities.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              등록된 특별활동이 없습니다
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 활동 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? '특별활동 수정' : '특별활동 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>활동 유형</InputLabel>
                <Select
                  value={currentActivity.activity_type}
                  onChange={(e) => setCurrentActivity({ 
                    ...currentActivity, 
                    activity_type: e.target.value 
                  })}
                  label="활동 유형"
                >
                  {activityTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="활동명"
                value={currentActivity.activity_name}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  activity_name: e.target.value 
                })}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="활동명 (베트남어)"
                value={currentActivity.activity_name_vi}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  activity_name_vi: e.target.value 
                })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="시작일"
                type="date"
                value={currentActivity.start_date}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  start_date: e.target.value 
                })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label="종료일"
                type="date"
                value={currentActivity.end_date || ''}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  end_date: e.target.value 
                })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={currentActivity.is_ongoing}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentActivity.is_ongoing}
                    onChange={(e) => setCurrentActivity({ 
                      ...currentActivity, 
                      is_ongoing: e.target.checked,
                      end_date: e.target.checked ? undefined : currentActivity.end_date
                    })}
                  />
                }
                label="현재 진행중"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="활동 설명"
                value={currentActivity.description}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  description: e.target.value 
                })}
                fullWidth
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="활동 설명 (베트남어)"
                value={currentActivity.description_vi}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  description_vi: e.target.value 
                })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="성과 및 수상내역"
                value={currentActivity.achievement}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  achievement: e.target.value 
                })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="참여 시간"
                type="number"
                value={currentActivity.hours_participated || ''}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  hours_participated: parseInt(e.target.value) || undefined
                })}
                fullWidth
                InputProps={{ endAdornment: '시간' }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography component="legend">영향력 점수</Typography>
              <Rating
                value={currentActivity.impact_score || 0}
                onChange={(_, value) => setCurrentActivity({ 
                  ...currentActivity, 
                  impact_score: value || undefined
                })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="교사 평가"
                value={currentActivity.teacher_evaluation}
                onChange={(e) => setCurrentActivity({ 
                  ...currentActivity, 
                  teacher_evaluation: e.target.value 
                })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {isEditing ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StudentSpecialActivities;