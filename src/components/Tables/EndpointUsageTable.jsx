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
  Chip,
} from '@mui/material';

function formatNumber(value) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

const columns = [
  { id: 'endpoint', label: '엔드포인트', sortable: true },
  { id: 'requests', label: '요청 수', sortable: true, align: 'right' },
  { id: 'avg_ms', label: '평균 응답(ms)', sortable: true, align: 'right' },
];

const EndpointUsageTable = ({ rows }) => {
  const [orderBy, setOrderBy] = useState('requests');
  const [order, setOrder] = useState('desc');

  const sortedRows = useMemo(() => {
    const comparator = (a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    };
    return [...rows].sort(comparator);
  }, [rows, orderBy, order]);

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
            <TableRow key={row.endpoint} hover>
              <TableCell>
                <Chip label={row.endpoint} size="small" variant="outlined" />
              </TableCell>
              <TableCell align="right">{formatNumber(row.requests)}</TableCell>
              <TableCell align="right">{row.avg_ms ?? '-'}</TableCell>
            </TableRow>
          ))}
          {sortedRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
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

export default EndpointUsageTable;



