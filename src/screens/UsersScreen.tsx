import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { formatDate, maskEmail } from '../utils';
import { User } from '../types';

const UsersScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock 사용자 데이터
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@realcaptcha.com',
      name: '관리자',
      role: 'admin',
      createdAt: '2025-01-15T09:00:00Z',
      lastLoginAt: '2025-01-26T14:30:00Z',
    },
    {
      id: '2',
      email: 'user1@example.com',
      name: '김철수',
      role: 'user',
      createdAt: '2025-01-20T10:15:00Z',
      lastLoginAt: '2025-01-26T11:20:00Z',
    },
    {
      id: '3',
      email: 'user2@example.com',
      name: '이영희',
      role: 'user',
      createdAt: '2025-01-22T16:45:00Z',
      lastLoginAt: '2025-01-25T09:10:00Z',
    },
    {
      id: '4',
      email: 'user3@example.com',
      name: '박동현',
      role: 'user',
      createdAt: '2025-01-24T13:20:00Z',
      lastLoginAt: '2025-01-26T16:05:00Z',
    },
  ];

  const filteredUsers = mockUsers.filter(
    user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleChip = (role: string) => {
    return role === 'admin' ? (
      <Chip label="관리자" color="error" size="small" />
    ) : (
      <Chip label="사용자" color="default" size="small" />
    );
  };

  const handleEdit = (userId: string) => {
    console.log('사용자 편집:', userId);
    // TODO: 사용자 편집 모달 열기
  };

  const handleDelete = (userId: string) => {
    console.log('사용자 삭제:', userId);
    // TODO: 사용자 삭제 확인 대화상자
  };

  const handleAddUser = () => {
    console.log('사용자 추가');
    // TODO: 사용자 추가 모달 열기
  };

  return (
    <Box>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            사용자 관리
          </Typography>
          <Typography variant="body1" color="text.secondary">
            대시보드 사용자 계정 관리
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAddUser}
        >
          사용자 추가
        </Button>
      </Box>

      <Card>
        <CardContent>
          {/* 검색 */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="사용자 이름 또는 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* 사용자 테이블 */}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>이메일</TableCell>
                  <TableCell>역할</TableCell>
                  <TableCell>가입일</TableCell>
                  <TableCell>마지막 로그인</TableCell>
                  <TableCell align="center">작업</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{maskEmail(user.email)}</TableCell>
                    <TableCell>{getRoleChip(user.role)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user.id)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                        color="error"
                        disabled={user.role === 'admin'} // 관리자는 삭제 불가
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                검색 결과가 없습니다.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UsersScreen;