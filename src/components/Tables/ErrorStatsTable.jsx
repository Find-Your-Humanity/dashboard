import React, { useMemo, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Chip,
} from '@mui/material';

const STATUS_LABELS = {
  200: 'OK',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function getStatusColor(code) {
  if (code >= 500) return 'error';
  if (code >= 400) return 'warning';
  return 'success';
}

const columns = [
  { id: 'status_code', label: '상태 코드', sortable: true },
  { id: 'label', label: '설명', sortable: false },
  { id: 'count', label: '횟수', sortable: true, align: 'right' },
  { id: 'percent', label: '비율', sortable: true, align: 'right' },
];

const ErrorStatsTable = ({ rows }) => {
  const [orderBy, setOrderBy] = useState('count');
  const [order, setOrder] = useState('desc');

  const total = useMemo(() => rows.reduce((sum, r) => sum + (r.count || 0), 0), [rows]);

  const enrichedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        label: STATUS_LABELS[r.status_code] || '-',
        percent: total > 0 ? (r.count * 100) / total : 0,
      })),
    [rows, total]
  );

  const sortedRows = useMemo(() => {
    const comparator = (a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    };
    return [...enrichedRows].sort(comparator);
  }, [enrichedRows, orderBy, order]);

  const handleSort = (columnId) => {
    if (!columns.find((c) => c.id === columnId)?.sortable) return;
    if (orderBy === columnId) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(columnId);
      setOrder('desc');
    }
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align}
                sortDirection={orderBy === col.id ? order : false}
              >
                {col.sortable ? (
                  <TableSortLabel
                    active={orderBy === col.id}
                    direction={orderBy === col.id ? order : 'asc'}
                    onClick={() => handleSort(col.id)}
                  >
                    {col.label}
                  </TableSortLabel>
                ) : (
                  col.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRows.map((row) => (
            <TableRow key={row.status_code} hover>
              <TableCell>
                <Chip
                  label={row.status_code}
                  size="small"
                  color={getStatusColor(row.status_code)}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">{row.label}</Typography>
              </TableCell>
              <TableCell align="right">{formatNumber(row.count)}</TableCell>
              <TableCell align="right">{row.percent.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
          {sortedRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  데이터가 없습니다.
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ErrorStatsTable;



