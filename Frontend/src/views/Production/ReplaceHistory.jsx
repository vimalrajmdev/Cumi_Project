import React, { useContext, useEffect } from 'react';
import {
  CCard, CCardBody, CCardHeader, CTable, CTableHead, CTableRow,
  CTableHeaderCell, CTableBody, CTableDataCell, CSpinner,
} from '@coreui/react';
import { ProductionContext } from '../../context/ProductionContext';

const ReplaceHistory = () => {
  const { productionEntries, loading, refreshProductionEntries } = useContext(ProductionContext);

  useEffect(() => {
    refreshProductionEntries(); // no woNo = fetch all
  }, [refreshProductionEntries]);

  return (
    <CCard>
      <CCardHeader>Production History</CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center py-4"><CSpinner /></div>
        ) : (
          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>WO No</CTableHeaderCell>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Produced</CTableHeaderCell>
                <CTableHeaderCell>Rejected</CTableHeaderCell>
                <CTableHeaderCell>Remarks</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {productionEntries.map((e) => (
                <CTableRow key={e.id}>
                  <CTableDataCell>{e.woNo}</CTableDataCell>
                  <CTableDataCell>{new Date(e.createdDate).toLocaleString()}</CTableDataCell>
                  <CTableDataCell>{e.producedQty}</CTableDataCell>
                  <CTableDataCell>{e.rejectedQty}</CTableDataCell>
                  <CTableDataCell>{e.remarks}</CTableDataCell>
                </CTableRow>
              ))}
              {productionEntries.length === 0 && (
                <CTableRow>
                  <CTableDataCell colSpan={5} className="text-center text-muted">
                    No history yet
                  </CTableDataCell>
                </CTableRow>
              )}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  );
};

export default ReplaceHistory;