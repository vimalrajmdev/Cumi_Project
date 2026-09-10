import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { getProductionEntries, saveProductionEntry, getWorkOrders, getEmployees } from '../../services/productionApi';

const ProductionEntry = () => {
  const [form, setForm] = useState({ wo_id: '', wo_number: '', pdf_number: '', completed_qty: 0, operator_id: '', operator_name: '' });
  const [woData, setWoData] = useState({ order_qty: 0, balance_qty: 0, status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [workOrders, setWorkOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [prodEntries, setProdEntries] = useState([]);

  const fetchData = async () => {
    try {
      const [woRes, empRes, prodRes] = await Promise.allSettled([
        getWorkOrders(),
        getEmployees(),
        getProductionEntries()
      ]);

      if (woRes.status === 'fulfilled') setWorkOrders(woRes.value.data || []);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data || []);
      if (prodRes.status === 'fulfilled') setProdEntries(prodRes.value.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError('Failed to fetch required data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleWoChange = (e) => {
    const selectedId = e.target.value;
    const wo = workOrders.find(w => w.id === parseInt(selectedId));
    if (wo) {
      setForm(prev => ({ ...prev, wo_id: wo.id, wo_number: wo.wo_number }));
      setWoData({ order_qty: wo.order_qty, balance_qty: wo.balance_qty, status: wo.status });
    }
  };

  const handleEmpChange = (e) => {
    const selectedId = e.target.value;
    const emp = employees.find(em => (em.id ?? em.Empid) === parseInt(selectedId));
    if (emp) {
      const empName = emp.FirstName
        ? `${emp.FirstName} ${emp.LastName || ''}`.trim()
        : emp.employeename || 'Unknown';
      setForm(prev => ({ ...prev, operator_id: emp.id ?? emp.Empid, operator_name: empName }));
    }
  };

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.wo_id || !form.pdf_number || !form.completed_qty || !form.operator_id) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    try {
      const res = await saveProductionEntry(form);
      setSuccess(res.data.message || 'Production Entry saved successfully!');
      setForm({ wo_id: '', wo_number: '', pdf_number: '', completed_qty: 0, operator_id: '', operator_name: '' });
      setWoData({ order_qty: 0, balance_qty: 0, status: '' });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save production entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Production Entry</h3>
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>WO Number</Form.Label>
                  <Form.Select value={form.wo_id} onChange={handleWoChange} required>
                    <option value="">Select WO Number</option>
                    {workOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>{wo.wo_number}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>PDF Number</Form.Label>
                  <Form.Control name="pdf_number" value={form.pdf_number} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Operator Name</Form.Label>
                  <Form.Select value={form.operator_id} onChange={handleEmpChange} required>
                    <option value="">Select Operator</option>
                    {employees.map(emp => (
                      <option key={emp.id ?? emp.Empid} value={emp.id ?? emp.Empid}>
                        {emp.FirstName ? `${emp.FirstName} ${emp.LastName || ''}`.trim() : emp.employeename || 'Unknown'}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Order Qty</Form.Label>
                  <Form.Control value={woData.order_qty} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Balance Qty</Form.Label>
                  <Form.Control value={woData.balance_qty} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Completed Qty</Form.Label>
                  <Form.Control type="number" name="completed_qty" value={form.completed_qty} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Save'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header>Production Entries</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>S.No</th>
                <th>WO Number</th>
                <th>PDF Number</th>
                <th>Completed Qty</th>
                <th>Operator Name</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {prodEntries && prodEntries.length > 0 ? (
                prodEntries.map((pe, index) => (
                  <tr key={pe.id}>
                    <td>{index + 1}</td>
                    <td>{pe.wo_number}</td>
                    <td>{pe.pdf_number}</td>
                    <td>{pe.completed_qty}</td>
                    <td>{pe.operator_name}</td>
                    <td>{new Date(pe.created_at).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">No Production Entries Found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductionEntry;